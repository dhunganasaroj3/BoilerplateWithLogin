const passportAuth = (() => {
    "use strict";

    const HTTPStatus = require('http-status');
    const hasher = require('./hasher');
    const passport = require('passport');
    const Promise = require('bluebird');
    const captchaHelper = require('../helpers/recaptcha.helper');
    const LocalStrategy = require('passport-local').Strategy;
    const moduleConfig = require('../modules/login-auth/login-auth.config');
    const userController = require('../modules/user-profile/user-profile.controller');
    const loginController = require('../modules/login-auth/login-auth.controller');
    const appMessageConfig = require('../configs/message.config');
    const utilityHelper = require('../helpers/utilities.helper');
    const commonHelper = require('../common/common-helper-function');

    function LoginHandlerModule() {
    }

    const _p = LoginHandlerModule.prototype;

    // use local strategy
    passport.use('local-login', new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true
        },
        async (req, username, password, done) => {
            if (username) {
                username = username.trim().toLowerCase();
                //check to see if the user with the provided username exists in the collection or not
                const user = await userController.findUserInfoByUserName(req, username);
                //if user exists, do further operations
                //if user do not exists, then send the login failure message
                if (user) {
                    if (user.password) {
                        if (utilityHelper.containsElementInArr(user.captcha_enable_ips, req.client_ip_address, done) && !req.mobil_detection) {
                            const captchaRes = await captchaHelper.verifyHuman(req, done);

                            if (captchaRes && captchaRes.success === false) {
                                return loginController.customErrorResponse(req, req.res, {
                                    status_code: HTTPStatus.UNAUTHORIZED,
                                    message: appMessageConfig.captchaVerify.notHuman
                                }, done);
                            } else {
                                return loginController.validateLoginCredentials(req, user, username, password, done);
                            }
                        } else {

                            return loginController.validateLoginCredentials(req, user, username, password, done);
                        }
                    } else {
                        return commonHelper.sendNormalResponse(req.res, {
                            password_set: false,
                            user_id: user._id,
                            email: user.email,
                            _id:user._id,
                            first_attempt_social_login: true
                        }, HTTPStatus.OK);
                    }
                } else {
                    return loginController.customErrorResponse(req, req.res, {
                        status_code: HTTPStatus.UNAUTHORIZED,
                        message: moduleConfig.message.invalidMessage
                    }, done);
                }
            }
        }
    ));

})();

module.exports = passportAuth;
