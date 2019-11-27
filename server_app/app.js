'use strict';

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const expressValidator = require('express-validator');
const passport = require('passport');
// const compression = require('compression');
// const minify = require('express-minify');
const hpp = require('hpp');
const cloudinary = require('cloudinary');
const favicon = require('serve-favicon');
const redisConfig = require('./lib/configs/redis.config');
const messageConfig = require('./lib/configs/message.config');
const applicationConfig = require('./lib/configs/application.config');
// const cloudinaryController = require('./lib/modules/cloudinary/cloudinary.setting.server.controller');
const errorLogController = require('./lib/modules/error-logs/error-logs.controller');
const logWriter = require('./lib/helpers/application-log-writer.helper.js');
const router = require('./lib/routes/index');
const commonHelper = require('./lib/common/common-helper-function');
const redisHelper = require('./lib/helpers/redis.helper');
const useragent = require('useragent');
const requestIp = require('request-ip');
const device = require('express-device');
// const geoip2 = require('geoip2');
const app = express();
require('dotenv').config({path: path.join(__dirname, ".env")});  // Without setting the config path it could not find the value set in the .env
const HTTPStatus = require('http-status');
const cors = require('cors');
const tokenAuthMiddleware = require('./lib/middlewares/token-auth.middleware');
const locationHelper = require('./lib/helpers/location-helper');

app.use(cors());
app.options('*', cors());


const configureAppSecurity = require('./lib/security-configs/security.config');
const dbConnector = require('./lib/helpers/database.helper');
const helpers = require('./lib/helpers/handlebar.helpers');
let redisStoreOpts = {};

dbConnector.init(app);
redisHelper.init(app);

// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(device.capture());

// Middleware for checking the logged in status
app.use((req, res, next) => {
  if(app.locals.db){
    req.db = app.locals.db;
  }
  if(app.locals.redis_cache_db){
    req.redis_cache_db = app.locals.redis_cache_db
  }
  req.root_dir = __dirname;
  req.client_ip_address = requestIp.getClientIp(req);
  req.client_device = req.device.type + ' ' + req.device.name;

  next();
});

// app.use('/api',async (req, res, next) => {
//     const locationRes = await locationHelper.getUserLocationObject(req);
//     if((locationRes && Object.keys(locationRes).length > 0 && locationRes.country === 'VN') && (req.originalUrl === "/api/imp/applicant/data" || req.originalUrl === "/api/user/data" || req.originalUrl === "/api/imp/applicant/verification/request")) {
//         res.status(HTTPStatus.BAD_REQUEST);
//         res.json({
//             message: 'IMP registration and verification process from the country is temporarily suspended.'
//         });
//     }else{
//         next();
//     }
// })
app.set('root_dir', __dirname);
// Add content compression middleware
// app.use(compression());

//fetch live from the remote servers to keep useragent upto date
useragent(true);
logWriter.init(app);
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PATCH, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Authorization,x-access-token,Accept');
  // Set cache control header to eliminate cookies from cache
  res.setHeader('Cache-Control', 'no-cache="Set-Cookie, Set-Cookie2"');

  next();
});

//set up the view engine-Handelbars
app.set('views', path.join(__dirname, '/lib/views'));
const hbs = exphbs.create({
  defaultLayout: 'main-layout',
  layoutsDir: __dirname + '/lib/views/layouts',
  partialsDir: __dirname + '/lib/views/partials',
  extname: '.hbs',
  helpers: helpers
});
app.engine('hbs', hbs.engine);
app.engine('html', hbs.engine);
app.set('view engine', 'hbs');


// end handlebar setup

// Static path setup for Client App

if (app.get('env') === "development" ) {
  console.log('development environment');
  redisStoreOpts = {
    host: redisConfig.development.host,
    port: redisConfig.development.port,
    ttl: (20 * 60), // TTL of 20 minutes represented in seconds
    db: redisConfig.development.db,
    pass: redisConfig.development.pass
  };
  // app.use("/", express.static(__dirname + '/public/'));
  app.use("/private-uploads", express.static(__dirname + '/private-uploads/'));

}
else if (app.get('env') === "production" || app.get('env') === "test") {
  console.log('production environment');
  redisStoreOpts = {
    host: redisConfig.production.host,
    port: redisConfig.production.port,
    ttl: (20 * 60), // TTL of 20 minutes represented in seconds
    db: redisConfig.production.db,
    pass: redisConfig.production.pass
  };
  // app.use(minify());
  // app.enable('view cache');
  // app.use("/", express.static(path.join(__dirname, '/public/'), {maxAge: 86400000}));
  app.use("/private-uploads", express.static(__dirname + '/private-uploads/'));

}
///  End of Static path setup for Client app


app.set('cloudinaryextension', 'png');
app.set('rate_limit', 100);

// create application/x-www-form-urlencoded parser
app.use(bodyParser.urlencoded({extended: true}));
// create application/json parser
app.use(bodyParser.json());
app.use(hpp());

app.use(expressValidator({
  errorFormatter: function (param, msg, value) {
    var namespace = param.split('.'),
      root = namespace.shift(),
      formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }

}));

const sessionOpts = {
  store: new RedisStore(redisStoreOpts),//if in production environment, uncomment it
  name: 'id', // <-- a generic name for the session id
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  maxAge: 1200000,//20 minutes
  cookie: {
    // domain: 'secure.example.com' // limit the cookie exposure
    secure: true, // set the cookie only to be served with HTTPS
    path: '/',
    httpOnly: true, // Mitigate XSS
    maxAge: null
  }
};

app.use(cookieParser(process.env.COOKIE_SECRET));

// if server behind proxy, then below should be uncommented
app.set('trust proxy', 1) // trust first proxy
app.use(session(sessionOpts));
app.use(passport.initialize());

configureAppSecurity.init(app);


//Map the Routes
router.init(app);
app.get('/', (req, res, next) => {
  res.send('XcelTrip Application...')
});
// development and production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  console.log('global err',err)
  if (err) {
    // console.log("\x1b[41m", err);
    errorLogController.postErrorLogs(err, req, next);
  }
    console.log("================================================================================================================================================");
    console.log("================================================================================================================================================");
    console.log("================================================================================================================================================");
    console.log(
      'res.headersSent',
      res.headersSent
    );
    console.log("================================================================================================================================================");
    console.log("================================================================================================================================================");
    console.log("================================================================================================================================================");
  if(!res.headersSent) {
      return commonHelper.sendResponseData(res, {
          status: HTTPStatus.INTERNAL_SERVER_ERROR,
          message: (app.get('env') === 'development') ? err : messageConfig.errorMessage.internalServerError
      });
  }
});


module.exports = app;
