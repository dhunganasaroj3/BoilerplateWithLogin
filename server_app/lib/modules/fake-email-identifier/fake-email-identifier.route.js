/**
 * Created by lakhe on 12/29/17.
 */

const fakeEmailRoutes = (() => {
    'use strict';

    const HTTPStatus = require('http-status');
    const express = require('express');
    const fakeEmailRouter = express.Router();
    const moduleConfig = require('./fake-email-identifier.config');
    const fakeEmailController = require('./fake-email-identifier.controller');
    const commonHelper = require('../../common/common-helper-function');
    const roleAuthMiddleware = require('../../middlewares/role-authorization.middleware');

    //method declaration to return user list to the client, if exists, else return not found message
    const getFakeEmails = async (req, res, next) => {
        try {
            const lstFakeEmails = await fakeEmailController.getAllFakeEmails(req, next);
            return commonHelper.sendJsonResponse(res, lstFakeEmails, moduleConfig.message.notFoundFakeEmails, HTTPStatus.OK);
        } catch (err) {
            return next(err);
        }
    };

    fakeEmailRouter.route('/list')
        .get( roleAuthMiddleware.authorize, getFakeEmails)

    fakeEmailRouter.route('/detect')
        .post( roleAuthMiddleware.authorize, fakeEmailController.detectAndPostFakeEmail);

    return fakeEmailRouter;

})();

module.exports = fakeEmailRoutes;
