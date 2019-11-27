const emailTemplateRoutes = (() => {
  'use strict';

  const HTTPStatus = require('http-status');
  const express = require('express');
  const moduleConfig = require('./email-template.config');
  const emailTemplateController = require('./email-template.controller');
  const emailTemplateRouter = express.Router();
  const fileUploadHelper = require('../../helpers/file-upload-s3.helper')(moduleConfig.config.documentFilePath, moduleConfig.config.uploadPrefix);
  const uploader = fileUploadHelper.uploader;
  const commonHelper = require('../../common/common-helper-function');
  const roleAuthMiddleware = require('../../middlewares/role-authorization.middleware');
  const redisHelper = require('../../helpers/redis.helper');
    const emailValidator = require('../../helpers/email-validator');


  //method declaration to return email template information object to the client if exists else return not found message
  const getEmailTemplates = async (req, res, next) => {
    try {
      const emailTemplates = await emailTemplateController.getEmailTemplate(req, next);
      redisHelper.setDataToCache(req, emailTemplates);
      return commonHelper.sendJsonResponse(res, emailTemplates, moduleConfig.message.notFound, HTTPStatus.OK);
    } catch (err) {
      return next(err);
    }
  };

  const getEmailTemplateById = async (req, res, next) => {
    try {
      const emailTemplateInfo = await emailTemplateController.getEmailTemplateDataByID(req);
      redisHelper.setDataToCache(req, emailTemplateInfo);
      return commonHelper.sendJsonResponse(res, emailTemplateInfo, moduleConfig.message.notFound, HTTPStatus.OK);
    } catch (err) {
      return next(err);
    }
  };

  emailTemplateRouter.route('/')
    .get( roleAuthMiddleware.authorize, redisHelper.getCachedObjectData, getEmailTemplates )
    .post( roleAuthMiddleware.authorize, uploader.array('file', 10), emailValidator.validateEmailsInMultiPartForm, emailTemplateController.postEmailTemplate)


  emailTemplateRouter.route('/:templateId')
    .get( roleAuthMiddleware.authorize, redisHelper.getCachedObjectData, getEmailTemplateById )
    .patch( roleAuthMiddleware.authorize, emailTemplateController.deleteEmailTemplate)
    .put( roleAuthMiddleware.authorize, uploader.array('file', 10), emailValidator.validateEmailsInMultiPartForm, emailTemplateController.updateEmailTemplateData)
    .delete( roleAuthMiddleware.authorize, emailTemplateController.deleteDocumentInfo);

  return emailTemplateRouter;

})();

module.exports = emailTemplateRoutes;
