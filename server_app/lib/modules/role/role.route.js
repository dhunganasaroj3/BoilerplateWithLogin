const roleRouter = (() => {
  'use strict';

  const HTTPStatus = require('http-status');
  const express = require('express');
  const moduleConfig = require('./role.config');
  const roleController = require('./role.controller');
  const roleRouter = express.Router();
  const commonHelper = require('../../common/common-helper-function');
  const roleAuthMiddleware = require('../../middlewares/role-authorization.middleware');
  const redisHelper = require('../../helpers/redis.helper');

  //method declaration to return role data object to the client if exists else return not found message
  const getRoles = async (req, res, next) => {
    try {
      const roleData = await roleController.getRole(req);
      redisHelper.setDataToCache(req, roleData);
      return commonHelper.sendJsonResponse(res, roleData, moduleConfig.message.notFound, HTTPStatus.OK);
    } catch (err) {
      return next(err);
    }
  };


  roleRouter.route('/')
    .get(roleAuthMiddleware.authorize, redisHelper.getCachedObjectData, getRoles)
    .post( roleAuthMiddleware.authorize, roleController.postRole );

  return roleRouter;

})();

module.exports = roleRouter;
