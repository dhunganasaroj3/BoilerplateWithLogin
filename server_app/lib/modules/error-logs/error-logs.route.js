const errorLogRoutes = (() => {
  'use strict';

  const HTTPStatus = require('http-status');
  const express = require('express');
  const moduleConfig = require('./error-logs.config');
  const errorLogController = require('./error-logs.controller');
  const errorLogRouter = express.Router();
  const commonHelper = require('../../common/common-helper-function');
  const roleAuthMiddleware = require('../../middlewares/role-authorization.middleware');
  const redisHelper = require('../../helpers/redis.helper');


  //method declaration to return error logs to the client, if exists, else return not found message
  const getErrorLogs = async (req, res, next) => {
    try {
      const lstErrorLogs = await errorLogController.getErrorLogs(req, next);
      redisHelper.setDataToCache(req, lstErrorLogs);
      return commonHelper.sendJsonResponse(res, lstErrorLogs, moduleConfig.message.notFound, HTTPStatus.OK);
    } catch (err) {
      return next(err);
    }
  };

  const getErrorLogById = async (req, res, next) => {
    try {
      const errorLogDetailObj = await errorLogController.getErrorLogDetailInfo(req);
      redisHelper.setDataToCache(req, errorLogDetailObj);
      return commonHelper.sendJsonResponse(res, errorLogDetailObj, moduleConfig.message.notFound, HTTPStatus.OK);
    } catch (err) {
      return next(err);
    }
  };

  errorLogRouter.route('/')
    .get( roleAuthMiddleware.authorize, redisHelper.getCachedObjectData, getErrorLogs )
    .delete( roleAuthMiddleware.authorize, errorLogController.deleteErrorLog );


  errorLogRouter.route('/:errorLogId')
    .get( roleAuthMiddleware.authorize, redisHelper.getCachedObjectData, getErrorLogById )
    .delete( roleAuthMiddleware.authorize, errorLogController.deleteErrorLog );

  return errorLogRouter;

})();

module.exports = errorLogRoutes;
