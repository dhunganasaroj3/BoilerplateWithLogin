/**
 * Created by lakhe on 9/4/17.
 */
const passportGoogleAuth = (() => {
    "use strict";

    const hasher = require('./hasher');
    const passport = require('passport');
    const oAuthConfig = require('../configs/oauth.config');
    const GoogleStrategy = require('passport-google-oauth2').Strategy;
    const userController = require('../modules/user-profile/user-profile.controller');
    const loginController = require('../modules/login-auth/login-auth.controller');

    // use local strategy
    passport.use('googleplus', new GoogleStrategy({
            clientID: oAuthConfig.googleplus.app_id,
            clientSecret: oAuthConfig.googleplus.app_secret,
            callbackURL: oAuthConfig.googleplus.callback_url,
            enableProof: true,
            passReqToCallback: true,
            profileFields: ['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified', 'displayName', 'photos', 'about', 'birthday']
        },
        async (req, accessToken, refreshToken, profile, done) => {
            if(profile && profile.id) {
                const userInfo = await userController.verifyOAuthLogin(req, profile.provider, profile.id);
                if(userInfo && userInfo.length > 0) {
                    const oAuthTokenInfo = await loginController.handleLoginSuccessAction(req, userInfo[0], done);
                    return done(null, {
                        profile: profile,
                        already_exists: true,
                        token_info: oAuthTokenInfo
                    });
                }
                return done(null, {
                    profile: profile,
                    already_exists: false
                });
            }
        }
    ));

})();

module.exports = passportGoogleAuth;

