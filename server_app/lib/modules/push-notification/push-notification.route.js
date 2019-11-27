/**
 * Created by lakhe on 12/4/17.
 */
const pushNotificationRoutes = (() => {
    'use strict';

    const HTTPStatus = require('http-status');
    const express = require('express');
    const pushNotificationRouter = express.Router();
    const moduleConfig = require('./push-notification.config');
    const commonHelper = require('../../common/common-helper-function');
    const pushNotificationController = require('./push-notification.controller');
    const tokenAuthMiddleware = require('../../middlewares/token-auth.middleware');
    const roleAuthMiddleware = require('../../middlewares/role-authorization.middleware');

    const getAllPushNotificationDevices = async (req, res, next) => {
        try {
            const pushNotificationDevices = await pushNotificationController.getAllPushNotificationDevices(req, next);
            return commonHelper.sendJsonResponse(res, pushNotificationDevices, moduleConfig.message.deviceNotFound, HTTPStatus.OK);
        } catch (err) {
            return next(err);
        }
    };

    const createPushNotificationTopic = async (req, res, next) => {
        try {
            const topicRes = await pushNotificationController.createPushNotificationTopic(req, req.body.topic_title);
            return commonHelper.sendJsonResponse(res, topicRes, moduleConfig.message.deviceNotFound, HTTPStatus.OK);
        } catch (err) {
            return next(err);
        }
    };

    const getPushNotificationTopics = async (req, res, next) => {
        try {
            const pushNotificationTopics = await pushNotificationController.getPushNotificationTopics(req);
            return commonHelper.sendJsonResponse(res, pushNotificationTopics, moduleConfig.message.topicNotFound, HTTPStatus.OK);
        } catch (err) {
            return next(err);
        }
    };

    const getPushNotificationMessages = async (req, res, next) => {
        try {
            const pushNotificationMessages = await pushNotificationController.getAllPushNotificationMessages(req, next);
            return commonHelper.sendJsonResponse(res, pushNotificationMessages, moduleConfig.message.messageNotFound, HTTPStatus.OK);
        } catch (err) {
            return next(err);
        }
    };

    pushNotificationRouter.route('/')
        .get(tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorize, getAllPushNotificationDevices)
        .post( pushNotificationController.registerPushNotificationDevices);

    pushNotificationRouter.route('/:token/:platform')
        .put(tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorize, pushNotificationController.updatePushNotificationDeviceData);

    pushNotificationRouter.route('/custom')
        .post(tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorize, pushNotificationController.sendCustomPushNotification);

    pushNotificationRouter.route('/topics')
        .get(tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorize, getPushNotificationTopics)
        .post( createPushNotificationTopic );


    pushNotificationRouter.route('/messages')
        .get(tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorize, getPushNotificationMessages);
    pushNotificationRouter.route('/messages/:messageId')
        .patch( tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorize, pushNotificationController.deletePushNotificationMessage);


    pushNotificationRouter.route('/booking/push-notification/:platform/:token')
        .post( pushNotificationController.sendBookingPushNotificationToIndividualDevices)

    return pushNotificationRouter;

})();

module.exports = pushNotificationRoutes;
