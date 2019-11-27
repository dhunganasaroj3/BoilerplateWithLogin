const userRoutes = (() => {
    'use strict';

    const HTTPStatus = require('http-status');
    const express = require('express');
    const userRouter = express.Router();
    const moduleConfig = require('./user-profile.config');
    const userController = require('./user-profile.controller');
    const userBankAccountController = require('./bank-account.controller');
    const fileUploadHelper = require('../../helpers/file-upload-s3.helper')(moduleConfig.config.documentFilePath, moduleConfig.config.uploadPrefix);
    const uploader = fileUploadHelper.imageUploader;
    const commonHelper = require('../../common/common-helper-function');
    const tokenAuthMiddleware = require('../../middlewares/token-auth.middleware');
    const roleAuthMiddleware = require('../../middlewares/role-authorization.middleware');
    const mobileIdentifierController = require('../mobile-identiifer/mobile-identifier.controller');
    const emailValidator = require('../../helpers/email-validator');
    const rateLimiter = require('../../middlewares/rate-limiter.middleware');

    //method declaration to return user list to the client, if exists, else return not found message
    const getUsers = async (req, res, next) => {
        try {
            const userList = await userController.getAllUsers(req, next);
            return commonHelper.sendJsonResponse(res, userList, moduleConfig.message.notFound, HTTPStatus.OK);
        } catch (err) {
            return next(err);
        }
    };

    const getUserDetailInfo = async (req, res, next) => {
        try {
            const userDetailObj = await userController.getUserByID(req, next);
            return commonHelper.sendJsonResponse(res, userDetailObj, moduleConfig.message.notFound, HTTPStatus.OK);
        } catch (err) {
            return next(err);
        }
    };
    const getUserBankDetail = async (req, res, next) => {
        try {
            const userDetailObj = await userBankAccountController.getUserBankAccount(req, next);
            return commonHelper.sendJsonResponse(res, userDetailObj, moduleConfig.message.notFound, HTTPStatus.OK);
        } catch (err) {
            return next(err);
        }
    };

    const getMobileInfo = async (req, res, next) => {
        try {
            const userMobileInfo = await userController.getUserMobileInfo(req, res, next);
            if(userMobileInfo && Object.keys(userMobileInfo).length > 0) {
                userMobileInfo.sms_sent = !!userMobileInfo.sms_sent;
            }
            return commonHelper.sendJsonResponse(res, userMobileInfo, moduleConfig.message.notFound, HTTPStatus.OK);
        } catch (err) {
            return next(err);
        }
    };

    const getEmailUpdateTokenInfo = async (req, res, next) => {
        try {
            let userMobileInfo = await userController.getEmailUpdateTokenInfo(req, res, next);

            if(userMobileInfo && Object.keys(userMobileInfo).length > 0) {

                if(userMobileInfo.used===true) {
                    userMobileInfo = {
                        used: true
                    }
                } else if(new Date(userMobileInfo.expires) <= new Date()) {
                    userMobileInfo = {
                        expired: true
                    }
                }
            } else {
                userMobileInfo = {
                    invalid: true
                }
            }
            return commonHelper.sendJsonResponse(res, userMobileInfo, moduleConfig.message.notFoundTokenInfo, HTTPStatus.OK);
        } catch (err) {
            return next(err);
        }
    };

    const detectMobileDevice = async (req, res, next) => {
        try {
            if (req.query && req.query.device_identifier && req.query.unique_identifier) {
                const count = await mobileIdentifierController.checkMobileIdentifierToken(req);
                if (count > 0) {
                    req.mobil_detection = true;
                }
            }
            next();
        } catch (err) {
            return next(err);
        }
    };

    userRouter.route('/data')
        .get(tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorize, getUsers)
        .post(detectMobileDevice, userController.registerUsers);

    userRouter.route('/data/bookinguser')
        .post(userController.RegisterFromBooking);

    userRouter.route('/tour')
        .get(tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorize, userController.isTourCompleted)
        .post(tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorize, userController.completedTour);

    userRouter.route('/data/bank-account/:userId')
        .get(tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorize, getUserBankDetail)
        .put(tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorize, uploader.array('file', 4), emailValidator.validateEmailsInMultiPartForm, userBankAccountController.updateUserBankAccount);

    userRouter.route('/data/remove/bank-account/:documentId')
        .delete(tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorize, userBankAccountController.removeBankAccountDocument);

    userRouter.route('/data/:userId')
        .get(tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorize, getUserDetailInfo)
        .patch(tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorize, userController.deleteUserInformation)
        .put(tokenAuthMiddleware.authenticate, detectMobileDevice, uploader.single('file'), emailValidator.validateEmailsInMultiPartForm, userController.updateUser);//roleAuthMiddleware.authorize,

    userRouter.route('/security-settings/change-password/:userId')
        .put(tokenAuthMiddleware.authenticate, userController.changePassword);//roleAuthMiddleware.authorize,

    userRouter.route('/security-settings/modify-security-answer/:userId')
        .put(tokenAuthMiddleware.authenticate, userController.changeSecurityAnswer);//roleAuthMiddleware.authorize,

    userRouter.route('/security-settings/reset-password-link')
        .post(userController.verifyPasswordChangeRequest);

    userRouter.route('/change-password/confirm/:token')
        .post(userController.implementForgotPasswordAction);

    userRouter.route('/resend-confirm-email')
        .post(tokenAuthMiddleware.authenticate, userController.resendConfirmationEmail);//roleAuthMiddleware.authorize,

    userRouter.route('/resend-confirm-email/:userId')
        .post( rateLimiter.rateLimitByIpAddress, userController.resendConfirmationEmail);//roleAuthMiddleware.authorize,

    userRouter.route('/suspend/:userId')
        .put(tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorize, userController.suspendUser);

    userRouter.route('/sms/verification-token')
        .post(tokenAuthMiddleware.authenticate, userController.sendMobileValidationToken)//roleAuthMiddleware.authorize,


    userRouter.route('/validate/number')
        .post(tokenAuthMiddleware.authenticate, userController.validateMobileNumber);//roleAuthMiddleware.authorize,


    userRouter.route('/sms/verification-token/anonymous')
        .post( userController.sendMobileValidationTokenToAnonymousUser);

    userRouter.route('/validate/number/anonymous')
        .post( userController.validateMobileNumberForAnonymousUser);

    userRouter.route('/check/captcha')
        .get(userController.checkReCaptchaEnable);

    userRouter.route('/logout')
        .delete(detectMobileDevice, tokenAuthMiddleware.authenticate, userController.logOut);

    userRouter.route('/mobile')
        .get(tokenAuthMiddleware.authenticate, getMobileInfo)
        .patch(tokenAuthMiddleware.authenticate,  userController.removeUserMobileInfo);

    userRouter.route('/update-email/:token')
        .put(userController.updateEmailAddress)
        .get(getEmailUpdateTokenInfo);

    userRouter.route('/send/token/email-confirmation')
        .post(userController.sendEmailUpdateConfirmationToken);

    userRouter.route('/send/link/email-verification/:userId')
        .post(tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorize, userController.sendEmailUpdateVerificationLink);

    return userRouter;

})();

module.exports = userRoutes;
