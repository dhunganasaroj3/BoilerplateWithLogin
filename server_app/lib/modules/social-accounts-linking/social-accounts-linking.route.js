/**
 * Created by lakhe on 9/18/17.
 */

const socialAccountLinkingRoutes = (() => {
    'use strict';

    const express = require('express');
    const socialAccountLinkingController = require('./social-accounts-linking.controller');
    const socialAccountLinkingRouter = express.Router();
    const roleAuthMiddleware = require('../../middlewares/role-authorization.middleware');
    const tokenAuthMiddleware = require('../../middlewares/token-auth.middleware');
    const commonHelper = require('../../common/common-helper-function');
    const moduleConfig = require('../login-auth/login-auth.config');
    const HTTPStatus = require('http-status');
    const mobileIdentifierController = require('../mobile-identiifer/mobile-identifier.controller');

    const respondLoginMessage = (req, res, next) => {
        if (req.loginStatusMessage) {
            if(req.loginStatusMessage.success === true) {
                return commonHelper.sendJsonResponse(res, req.loginStatusMessage, '', HTTPStatus.OK);
            } else {
                return commonHelper.sendResponseData(res, {
                    status: req.loginStatusMessage ? req.loginStatusMessage.status_code : HTTPStatus.UNAUTHORIZED,
                    message: req.loginStatusMessage ? req.loginStatusMessage.message : "",
                    success: false
                });
            }
        }else{
            return commonHelper.sendResponseData(res, {
                status: HTTPStatus.UNAUTHORIZED,
                message: {
                    message: moduleConfig.message.invalidMessage,
                    success: false
                }
            });
        }
    };
    const detectMobileDevice = async (req, res, next)  => {
        try {
            if(req.query && req.query.device_identifier && req.query.unique_identifier) {
                const count = await mobileIdentifierController.checkMobileIdentifierToken(req);
                if(count > 0) {
                    req.mobil_detection = true;
                }
            }
            next();
        } catch (err) {
            return next(err);
        }
    };



    const exchangeOAuthCodeForAccessToken = async (req, res, next) => {
        if(req.mobil_detection && req.query.platform==="android") {
            const tokenInfo = await socialAccountLinkingController.exchangeOAuthCodeForAccessToken(req, res, next);
            if(tokenInfo && tokenInfo.access_token) {
                req.params.access_token = tokenInfo.access_token;
            }
        }
        next();
    };

    const exchangeOAuthCodeForLinkedInAccessToken = async (req, res, next) => {
        if(!req.mobil_detection) {
            const tokenInfo = await socialAccountLinkingController.exchangeOAuthCodeForAccessToken(req, res, next);
            if(tokenInfo && tokenInfo.access_token) {
                req.params.access_token = tokenInfo.access_token;
            }
        }
        next();
    };

    socialAccountLinkingRouter.route('/link/facebook/:access_token')
        .post( tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorize, socialAccountLinkingController.linkFacebookAccount);

    socialAccountLinkingRouter.route('/link/twitter/:access_token')
        .post( tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorize, socialAccountLinkingController.linkTwitterAccount);

    socialAccountLinkingRouter.route('/link/linkedin/:access_token')
        .post( tokenAuthMiddleware.authenticate, exchangeOAuthCodeForLinkedInAccessToken, roleAuthMiddleware.authorize, socialAccountLinkingController.linkLinkedInAccount);

    socialAccountLinkingRouter.route('/link/google/:access_token')
        .post( detectMobileDevice, exchangeOAuthCodeForAccessToken, tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorize, socialAccountLinkingController.linkGoogleAccount);


    socialAccountLinkingRouter.route('/unlink/facebook')
        .delete( tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorize, socialAccountLinkingController.unLinkFacebookAccount);

    socialAccountLinkingRouter.route('/unlink/twitter')
        .delete( tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorize, socialAccountLinkingController.unLinkTwitterAccount);

    socialAccountLinkingRouter.route('/unlink/linkedin')
        .delete( tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorize, socialAccountLinkingController.unLinkLinkedInAccount);

    socialAccountLinkingRouter.route('/unlink/google')
        .delete( tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorize, socialAccountLinkingController.unLinkGoogleAccount);


    socialAccountLinkingRouter.route('/auth/facebook/:access_token')
        .post( detectMobileDevice, socialAccountLinkingController.verifyFacebookLogin, respondLoginMessage);

    socialAccountLinkingRouter.route('/auth/twitter/:access_token')
        .post( detectMobileDevice, socialAccountLinkingController.verifyTwitterLogin, respondLoginMessage);

    socialAccountLinkingRouter.route('/auth/linkedin/:access_token')
        .post( detectMobileDevice, socialAccountLinkingController.verifyLinkedInLogin, respondLoginMessage);

    socialAccountLinkingRouter.route('/auth/google/:access_token')
        .post( detectMobileDevice, exchangeOAuthCodeForAccessToken, socialAccountLinkingController.verifyGoogleLogin, respondLoginMessage);

    socialAccountLinkingRouter.route('/accept-terms-conditions/:userId')
        .put( socialAccountLinkingController.acceptTermsAndConditions, respondLoginMessage);

    socialAccountLinkingRouter.route('/status')
        .get( tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorize, socialAccountLinkingController.checkSocialAccountLinkingStatus);

    return socialAccountLinkingRouter;

})();

module.exports = socialAccountLinkingRoutes;
