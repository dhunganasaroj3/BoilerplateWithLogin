(() => {
    'use strict';
    module.exports = {
        development: {
            // username: 'xceltripuser',
            // password: 'pwd#SXCElTripDB2017user123',
            // host: '127.0.0.1',
            // port: '27017',
            // dbName: 'prj_medicrony'

            // username: 'dbMedicronyNPUSer',
            // password: 'medicrony#userNP2019',
            // host: 'localhost',//xceltrip-server-api-mongo====172.20.0.2   xceltrip-server-api-mongo        172.20.0.3     138.197.65.200
            // port: '35417',
            // dbName: 'prj_medicrony'

            username: 'dbMedicronyNPUSer',
            password: 'medicrony#userNP2019',
            host: 'localhost',//xceltrip-server-api-mongo====172.20.0.2   xceltrip-server-api-mongo        172.20.0.3     138.197.65.200
            port: '27017',
            dbName: 'prj_medicrony'
        },
        production: {
            username: 'XcelTripTraveluser',
            password: 'pwd#XcelTripUser2017NP6313',
            host: 'ip-10-0-2-197.ec2.internal',
            port: '32637',
            dbName: 'prj_xceltrip'
        },
        test: {
            username: 'xcelTripUser',
            password: 'xcelTripUser2017#NP',
            host: 'ds143141.mlab.com',
            port: '43141',
            dbName: 'prj_xceltrip'
        }
    };
})();
