const newsletterRoutes = (() => {
  'use strict';

  const HTTPStatus = require('http-status');
  const express = require('express');
  const tokenAuthMiddleware = require('../../middlewares/token-auth.middleware');
  const roleAuthMiddleware = require('../../middlewares/role-authorization.middleware');
  const moduleConfig = require('./newsletter.config');
  const newsletterController = require('./newsletter.controller');
  const commonHelper = require('../../common/common-helper-function');
  const newsletterRouter = express.Router();
  const redisHelper = require('../../helpers/redis.helper');

  const getAllNewsLetterSubscribedUsers = async (req, res, next) => {
    try {
      const emailSubscribedUsers = await newsletterController.getAllNewsLetterSubscribedUsers(req, next);
      redisHelper.setDataToCache(req, emailSubscribedUsers);
      return commonHelper.sendJsonResponse(res, emailSubscribedUsers, moduleConfig.message.notFound, HTTPStatus.OK);
    } catch (err) {
      return next(err);
    }
  };

  newsletterRouter.route('/subscribe')
    .get( tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorize, redisHelper.getCachedObjectData, getAllNewsLetterSubscribedUsers) //tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorize,
    .post( newsletterController.subscribeNewsletter );


  newsletterRouter.route('/unsubscribe/:subscription_token')
    .post( newsletterController.unSubscribeNewsletter );

  return newsletterRouter;
})();

module.exports = newsletterRoutes;
