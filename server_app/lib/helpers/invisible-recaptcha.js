((invisibleRecaptchaHelper) => {
    'use strict';

    const HTTPStatus = require('http-status');
    const request = require('request');
    const rp = require('request-promise');
    const captchaConfig = require('../configs/invisible-recaptcha.config');
    const appMessageConfig = require('../configs/message.config');
    const commonHelper = require('../common/common-helper-function');

    const respondMessage = () => {
        return {
            success: false,
            status_code: HTTPStatus.FORBIDDEN,
            message: appMessageConfig.captchaVerify.notHuman
        };
    };

    invisibleRecaptchaHelper.verifyHuman = (req, res, next) => {
        try {
            const options = {
                method: 'POST',
                uri: captchaConfig.siteUrl,
                qs: {
                    secret: process.env.INVISIBLE_RECAPTCHA_SECRET,
                    response: req.body.captcha,
                    remoteip: req.client_ip_address
                },
                json: true // Automatically stringifies the body to JSON
            };
            rp(options)
            .then((response) => {
                if (!response.success) {
                  respondMessage();
                }else{
                    next();
                }
            })
        } catch (err) {
            return next(err);
        }
    };

})(module.exports);
