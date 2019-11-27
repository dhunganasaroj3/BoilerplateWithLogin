const emailStatusRoutes = (() => {
    'use strict';

    const HTTPStatus = require('http-status');
    const express = require('express');
    const moduleConfig = require('./email-status.config');
    const emailStatusController = require('./email-status.controller');
    const emailStatusRouter = express.Router();
    const commonHelper = require('../../common/common-helper-function');
    const roleAuthMiddleware = require('../../middlewares/role-authorization.middleware');
    const redisHelper = require('../../helpers/redis.helper');


    const getEmailStatus = async (req, res, next) => {
        try {
            const emailStatus = await emailStatusController.getEmailStatus(req, next);
            return commonHelper.sendJsonResponse(res, emailStatus, moduleConfig.message.notFound, HTTPStatus.OK);
        } catch (err) {
            return next(err);
        }
    };
    const getBlockedEmail = async (req, res, next) => {
        try {
            const emailStatus = await emailStatusController.getBlockedEmail(req, next);
            return commonHelper.sendJsonResponse(res, emailStatus, moduleConfig.message.notFound, HTTPStatus.OK);
        } catch (err) {
            return next(err);
        }
    };


    emailStatusRouter.route('/')
        .get(roleAuthMiddleware.authorize, getEmailStatus)
    emailStatusRouter.route('/block')
        .get(roleAuthMiddleware.authorize, getBlockedEmail)
        .post(roleAuthMiddleware.authorize, emailStatusController.blockEmail)

    return emailStatusRouter;

})();

module.exports = emailStatusRoutes;
