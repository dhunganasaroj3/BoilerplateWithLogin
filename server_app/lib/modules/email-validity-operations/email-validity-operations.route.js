const emailCheckRoutes = (() => {
    'use strict';

    const express = require('express');
    const emailCheckRouter = express.Router();
    const HTTPStatus = require('http-status');
    const moduleConfig = require('./email-validity-operations.config');
    const emailCheckController = require('./email-validity-operations.controller');
    const commonHelper = require('../../common/common-helper-function');
    const tokenAuthMiddleware = require('../../middlewares/token-auth.middleware');
    const roleAuthMiddleware = require('../../middlewares/role-authorization.middleware');
    const redisHelper = require('../../helpers/redis.helper');

    const getBouncedEmails = async (req, res, next) => {
        try {
            const lstBouncedEmails = await emailCheckController.getBouncedEmails(req);
            redisHelper.setDataToCache(req, lstBouncedEmails);
            return commonHelper.sendJsonResponse(res, lstBouncedEmails, moduleConfig.message.notFound, HTTPStatus.OK);

        } catch (err) {
            return next(err);
        }
    };

    const getSuspendedEmailDomains = async (req, res, next) => {
        try {
            const lstSuspendedEmailDomains = await emailCheckController.getSuspendedEmailDomains(req);
            redisHelper.setDataToCache(req, lstSuspendedEmailDomains);
            return commonHelper.sendJsonResponse(res, lstSuspendedEmailDomains, moduleConfig.message.notFound, HTTPStatus.OK);

        } catch (err) {
            return next(err);
        }
    };

    emailCheckRouter.route('/suspend')
        .get( tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorize, getSuspendedEmailDomains )
        .post(  tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorize, emailCheckController.saveSuspendedEmailDomain );

    emailCheckRouter.route('/bounce')
        .get( tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorize, getBouncedEmails )

    emailCheckRouter.route('/bounce-rate-detector')
        .post( emailCheckController.saveBouncedEmailRecords );

    return emailCheckRouter;

})();

module.exports = emailCheckRoutes;
