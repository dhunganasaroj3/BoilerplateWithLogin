((recaptchaHelper) => {
  'use strict';

  const HTTPStatus = require('http-status');
  const request = require('request');
  const rp = require('request-promise');
  const captchaConfig = require('../configs/recaptcha.config');
  const appMessageConfig = require('../configs/message.config');
  const commonHelper = require('../common/common-helper-function');

  const respondMessage = () => {
    return {
      success: false,
      status_code: HTTPStatus.FORBIDDEN,
      message: appMessageConfig.captchaVerify.notHuman
    };
  };

  recaptchaHelper.verifyHuman = (req, next) => {
    try {
      const options = {
        method: 'POST',
        uri: captchaConfig.siteUrl,
        qs: {
          secret: process.env.RECAPTCH_SITE_SECRET,
          response: req.body["reCaptcha"],
          remoteip: req.client_ip_address
        },
        json: true // Automatically stringifies the body to JSON
      };
      return new Promise((resolve, reject) => {
        rp(options)
          .then((response) => {
            if (!response.success) {
              resolve(respondMessage());
            }
            else {
              return resolve(Promise.resolve(true));
            }
          })
          .catch((err) => {
            resolve(respondMessage());
          });
      });
    } catch (err) {
      return next(err);
    }
  };

})(module.exports);
