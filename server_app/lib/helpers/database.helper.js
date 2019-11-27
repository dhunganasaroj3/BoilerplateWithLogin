((databaseHelper) => {
    'use strict';

    const Promise = require("bluebird");
    const dbConfig = require('../configs/database.config');
    const path = require('path');
    const mongodb = Promise.promisifyAll(require('mongodb'));
    const MongoClient = mongodb.MongoClient;

    databaseHelper.init = (app) => {
        let dbUrl = '';
        switch(app.get('env')) {
          case "development":
                dbUrl = `mongodb://${dbConfig.development.username}:${dbConfig.development.password}@${dbConfig.development.host}:${dbConfig.development.port}/${dbConfig.development.dbName}`;
               // dbUrl = `mongodb://${dbConfig.development.host}:${dbConfig.development.port}/${dbConfig.development.dbName}`;
              break;
          case "production":
            dbUrl = `mongodb://${dbConfig.production.username}:${dbConfig.production.password}@${dbConfig.production.host}:${dbConfig.production.port}/${dbConfig.production.dbName}`;
            break;
          case "test":
            dbUrl = `mongodb://${dbConfig.test.username}:${dbConfig.test.password}@${dbConfig.test.host}:${dbConfig.test.port}/${dbConfig.test.dbName}`;
            break;
        }

        const options = {
            promiseLibrary: Promise,
            useNewUrlParser: true
        };
        //New change for mongodb version 3.6.1
        MongoClient.connect(dbUrl, options)
            .then((client) => {
                app.locals.db = client.db(app.get('env') === "production" ? dbConfig.production.dbName : dbConfig.development.dbName);
                console.log('database connection success');
                return client;
            })
            .catch((err) => {
                console.log(err + 'database connection error');
            });
    };

})(module.exports);
