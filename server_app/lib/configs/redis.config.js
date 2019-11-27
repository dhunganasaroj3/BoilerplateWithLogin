'use strict';

module.exports = {
    development: {
        host: 'localhost',//===172.20.0.3          172.20.0.2
        port: 6379,
        db: 2,
        // pass: 'redisXCEL@XcelToken2018'
        pass: ''
    },
    production: {
        host:  '10.0.7.189',
        port: 6382,
        db: 2,
        pass:'redis#XcelTrip7ssw0rd123'
    },
    redisCacheExpires: '24'//  In hours
};
