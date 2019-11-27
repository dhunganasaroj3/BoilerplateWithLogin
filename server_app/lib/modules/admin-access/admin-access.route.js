/**
 * Created by lakhe on 6/7/17.
 */
const adminAccessRoutes = (() => {
    'use strict';

    const HTTPStatus = require('http-status');
    const express = require('express');
    const adminAccessRouter = express.Router();
    const tokenAuthMiddleware = require('../../middlewares/token-auth.middleware');
    const roleAuthMiddleware = require('../../middlewares/role-authorization.middleware');
    const moduleConfig = require('./admin-access.config');
    const adminAccessController = require('./admin-access.controller');
    const commonHelper = require('../../common/common-helper-function');

    adminAccessRouter.route('/user/:id')
        .get(roleAuthMiddleware.authorize, adminAccessController.sendUserAccessToken)

    return adminAccessRouter;

})();

module.exports = adminAccessRoutes;
