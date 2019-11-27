/**
 * Created by lakhe on 7/11/17.
 */
((pushNotificationHelper) => {
    'use strict';

    const HTTPStatus = require('http-status');
    const firebase = require('firebase/app');
    require('firebase/auth');
    require('firebase/messaging');
    const request = require('request');
    const rp = require('request-promise');
    const appMessageConfig = require('../configs/message.config');
    const commonHelper = require('../common/common-helper-function');

    pushNotificationHelper.sendPushNotificationMessage = (req, res, next) => {
        try {
            if(req.body && req.body.device_id && req.body.platform){
                if(req.body.platform === "ios" || req.body.platform === "android"){


                } else{
                    return commonHelper.sendResponseData(res, {
                        status: HTTPStatus.BAD_REQUEST,
                        message: 'Invalid Platform'
                    });
                }
            } else{
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.BAD_REQUEST,
                    message: 'Invalid parameters'
                });
            }
        } catch (err) {
            return next(err);
        }
    };

})(module.exports);
