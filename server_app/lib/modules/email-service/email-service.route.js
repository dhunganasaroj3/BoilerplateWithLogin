const transactionalEmailServiceRoutes = (() => {
  'use strict';

  const HTTPStatus = require('http-status');
  const express = require('express');
  const moduleConfig = require('./email-service.config');
  const transactionalEmailServiceController = require('./email-service.controller');
  const transactionalEmailServiceRouter = express.Router();
  const commonHelper = require('../../common/common-helper-function');
  const roleAuthMiddleware = require('../../middlewares/role-authorization.middleware');
  const redisHelper = require('../../helpers/redis.helper');

  const getMailServiceConfig = async (req, res, next) => {
    try {
      const mailServiceConfig = await transactionalEmailServiceController.getMailServiceConfig(req);
      redisHelper.setDataToCache(req, mailServiceConfig);
      return commonHelper.sendJsonResponse(res, mailServiceConfig, moduleConfig.message.notFound, HTTPStatus.OK);

    } catch (err) {
      return next(err);
    }
  };

  transactionalEmailServiceRouter.route('/')
    .get( roleAuthMiddleware.authorize, redisHelper.getCachedObjectData, getMailServiceConfig )
    .post( roleAuthMiddleware.authorize, transactionalEmailServiceController.postMailServiceConfig );


  transactionalEmailServiceRouter.route('/:emailServiceId')
    .put( roleAuthMiddleware.authorize, transactionalEmailServiceController.updateMailService );

  return transactionalEmailServiceRouter;

})();

module.exports = transactionalEmailServiceRoutes;
