((locationHelper) => {
    'use strict';

    const userAgent = require('useragent');
    const Promise = require('bluebird');
    const commonHelper = require('../common/common-helper-function');

    locationHelper.getUserLocationObject = async (req) => {
        return new Promise(async (resolve, reject) => {
            try {
                req.user_agent = userAgent.lookup(req.headers['user-agent']);
                var ip = req.headers['x-real-ip'] || req.connection.remoteAddress;
                req.user_agent.ip_address = ip; //req.client_ip_address;
                req.user_agent.loc = await commonHelper.getGeoLocationInfo(ip);
                return resolve(req.user_agent.loc);
            } catch (err) {
                return reject(err);
            }
        });
    };

})(module.exports);
