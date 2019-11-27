const emailTemplateRoutes = (() => {
    'use strict';

    const HTTPStatus = require('http-status');
    const express = require('express');
    const moduleConfig = require('./email-message-template.config');
    const emailMessageTemplateController = require('./email-message-template.controller');
    const emailMessageTemplateRouter = express.Router();
    const fileUploadHelper = require('../../helpers/file-upload-s3.helper')(moduleConfig.config.documentFilePath, moduleConfig.config.uploadPrefix);
    const uploader = fileUploadHelper.uploader;
    const commonHelper = require('../../common/common-helper-function');
    const roleAuthMiddleware = require('../../middlewares/role-authorization.middleware');
    const redisHelper = require('../../helpers/redis.helper');
    const emailValidator = require('../../helpers/email-validator');


    //method declaration to return email template information object to the client if exists else return not found message
    const getEmailMessageTemplates = async (req, res, next) => {
        try {
            const emailTemplates = await emailMessageTemplateController.getEmailMessageTemplate(req, next);
            redisHelper.setDataToCache(req, emailTemplates);
            return commonHelper.sendJsonResponse(res, emailTemplates, moduleConfig.message.notFound, HTTPStatus.OK);
        } catch (err) {
            return next(err);
        }
    };
    const getCaseForEmailMessageTemplates = async (req, res, next) => {
        try {
            const emailTemplates = await emailMessageTemplateController.getCaseForEmailMessageTemplates(req, next);
            redisHelper.setDataToCache(req, emailTemplates);
            return commonHelper.sendJsonResponse(res, emailTemplates, moduleConfig.message.notFound, HTTPStatus.OK);
        } catch (err) {
            return next(err);
        }
    };
    const getEmailMessageTemplateById = async (req, res, next) => {
        try {
            const emailTemplateInfo = await emailMessageTemplateController.getEmailMessageTemplateDataByID(req);
            redisHelper.setDataToCache(req, emailTemplateInfo);
            return commonHelper.sendJsonResponse(res, emailTemplateInfo, moduleConfig.message.notFound, HTTPStatus.OK);
        } catch (err) {
            return next(err);
        }
    };
    emailMessageTemplateRouter.route('/')
        .get(roleAuthMiddleware.authorize, redisHelper.getCachedObjectData, getEmailMessageTemplates)
        .post(roleAuthMiddleware.authorize, uploader.array('file', 3), emailValidator.validateEmailsInMultiPartForm, emailMessageTemplateController.postEmailMessageTemplate);


    emailMessageTemplateRouter.route('/case')
        .get(roleAuthMiddleware.authorize, redisHelper.getCachedObjectData, getCaseForEmailMessageTemplates)

    emailMessageTemplateRouter.route('/:templateId')
        .get(roleAuthMiddleware.authorize, redisHelper.getCachedObjectData, getEmailMessageTemplateById)
        .put(roleAuthMiddleware.authorize, uploader.array('file', 3), emailValidator.validateEmailsInMultiPartForm, emailMessageTemplateController.updateEmailMessageTemplateData)

    emailMessageTemplateRouter.route('/send-mail/:templateId')
        .put(roleAuthMiddleware.authorize, uploader.array('file', 3), emailValidator.validateEmailsInMultiPartForm, emailMessageTemplateController.sendMail);

    return emailMessageTemplateRouter;

})();

module.exports = emailTemplateRoutes;
