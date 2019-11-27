/**
 * Created by lakhe on 12/11/17.
 */
const iamUserController = (() => {
    'use strict';

    const HTTPStatus = require('http-status');
    const userConfig = require('../user-profile/user-profile.config');
    const userController = require('../user-profile/user-profile.controller');
    const utilityHelper = require('../../helpers/utilities.helper');
    const errorHelper = require('../../helpers/error.helper');
    const uuidv1 = require('uuid/v1');
    const Promise = require("bluebird");
    const commonHelper = require('../../common/common-helper-function');
    const commonProvider = require('../../common/common-provider-function');
    const hasher = require('../../auth/hasher');
    const notificationController = require('../notifications/notifications.controller');
    const emailTemplateContentConfigs = require('../../configs/email-template.content.config');
    const emailTemplateConfigs = require('../../configs/email-template.config');
    const emailHelper = require('../../helpers/email-service.helper');
    const emailTemplateController = require('../email-template/email-template.controller');

    const documentFields = 'first_name last_name email gender auto_gen_password password reset_password_first_login user_role';
    const projectionFields = {
        '_id': 1,
        'first_name': 1,
        'last_name': 1,
        'email': 1,
        'gender': 1,
        'username': 1,
        'auto_gen_password': 1,
        'user_role': 1,
        'reset_password_first_login': 1,
        'parent_user_role': 1,
        'added_on': 1
    };

    function IAMUserModule() {}

    const _p = IAMUserModule.prototype;

    _p.checkValidationErrors = async (req) => {

        req.checkBody('first_name', userConfig.message.validationErrMessage.first_name).notEmpty();
        req.checkBody('last_name', userConfig.message.validationErrMessage.last_name).notEmpty();
        req.checkBody('gender', userConfig.message.validationErrMessage.gender).notEmpty();
        req.checkBody('email', userConfig.message.validationErrMessage.emailValid).isEmail();
        req.checkBody('user_role', userConfig.message.validationErrMessage.user_role).notEmpty();
        req.checkBody('password', userConfig.message.validationErrMessage.password).notEmpty();
        const result = await req.getValidationResult();
        return result.array();
    };

    _p.getAllIAMUsers = (req, next) => {
        const pagerOpts = utilityHelper.getPaginationOpts(req, next);
        let queryOpts = {};

        if (req.query.name) {
            queryOpts = {
                // Searches first_name or last_name
                // Searches first name based on whole query or first_name query
                $or: [
                    {
                        first_name: {
                            $regex: new RegExp('.*' + req.query.name, "i")
                        }
                    },
                    {
                        last_name: {
                            $regex: new RegExp('.*' + req.query.name, "i")
                        }
                    }
                ]
            };
        }
        if (req.query.email) {
            queryOpts.email = {$regex: new RegExp('.*' + req.query.email, "i")}
        }
        queryOpts.parent_id = commonHelper.getLoggedInUserId(req).toString();
        queryOpts.deleted = false;
        const sortOpts = { added_on: -1 };
        return commonProvider.getPaginatedDataList(req.db.collection('User'), queryOpts, pagerOpts, projectionFields, sortOpts);
    };


    _p.sendEmailToUser = async (req, res, dataObj, auto_gen_password, password, next) => {
        try {
            const userEmail = dataObj.email;
            req.params.templateId = emailTemplateConfigs.admin_user_registration;

            if (req.params.templateId) {
                const emailTemplateInfo = await emailTemplateController.getEmailTemplateDataByID(req);
                const parent_user = await req.db.collection('User').findOne({
                    _id: dataObj.parent_id
                });

                let messageBody = '';
                if (emailTemplateInfo && emailTemplateInfo.template_content) {
                    messageBody = emailTemplateInfo.template_content;
                    if (messageBody.indexOf("%message.name%") > -1) {
                        messageBody = messageBody.replace("%message.name%", dataObj.first_name + ' ' + dataObj.last_name);
                    }
                    if (messageBody.indexOf("%message.user_role%") > -1) {
                        messageBody = messageBody.replace("%message.user_role%", (dataObj.user_role && dataObj.user_role.length > 0) ? dataObj.user_role[0] : "");
                    }
                    if (messageBody.indexOf("%password_auto%") > -1) {
                        messageBody = messageBody.replace("%password_auto%", (auto_gen_password==='true' || auto_gen_password===true) ? `Your password has been automatically generated as ${password}. Please change the password at the earliest possible.` : "");
                    }
                    if (messageBody.indexOf("%message.parent_user%") > -1) {
                        messageBody = messageBody.replace("%message.parent_user%", parent_user ? `${parent_user.first_name} ${parent_user.last_name}` : "");
                    }
                    let message_template = emailTemplateContentConfigs.system_emails;
                    if (message_template.indexOf("%email_content%") > -1) {
                        message_template = message_template.replace("%email_content%", messageBody);
                    }
                    const mailOptions = {
                        fromEmail: emailTemplateInfo.email_from, // sender address
                        toEmail: userEmail, // list of receivers
                        subject: emailTemplateInfo.email_subject, // Subject line
                        textMessage: message_template, // plaintext body
                        htmlTemplateMessage: message_template,
                        attachments: emailTemplateInfo.attachments

                    };
                    return emailHelper.sendEmail(req, mailOptions, next);
                }
            }
        } catch(err) {
            return next(err);
        }
    };

    _p.registerIAMUser = async (req, res, next) => {
        try {
            const errors = await _p.checkValidationErrors(req);
            if (errors && errors.length > 0) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.BAD_REQUEST,
                    message: errorHelper.sendFormattedErrorData(errors)
                });
            } else {
                let password = "";
                const modelInfo = utilityHelper.sanitizeUserInput(req, next);
                if(req.body.auto_gen_password==="true" || req.body.auto_gen_password===true) {
                    password = await hasher.generateRandomBytes(8);
                } else {
                    const passwordRes = await userController.checkPasswordValidity(req, modelInfo, res, next);
                    if (passwordRes.valid === true) {
                        password=req.body.password;
                    } else {
                        return commonHelper.sendResponseData(res, {
                            status: HTTPStatus.BAD_REQUEST,
                            message: userConfig.message.weakPassword
                        });
                    }
                }
                const newUser = await userController.constructUserObj(req, res, true, modelInfo, documentFields, true, password, true, true, [req.body.user_role]);
                newUser.agree_terms_condition = true;
                newUser.parent_id = commonHelper.getLoggedInUserId(req).toString();
                newUser.parent_user_role = commonHelper.getLoggedInUserRole(req);
                const queryOpts = {
                    // Searches first name based on whole query or first_name query
                    $and: [
                        {
                            $or: [
                                {
                                    username: modelInfo.email.trim().toLowerCase()
                                },
                                {
                                    email: modelInfo.email.trim().toLowerCase()
                                }
                            ]
                        }, {
                            deleted: false
                        }
                    ]
                };
                const commonRes = await commonProvider.checkForDuplicateRecords(req.db.collection('User'), queryOpts, newUser);
                if (commonRes.exists) {
                    return commonHelper.sendResponseData(res, {
                        status: HTTPStatus.CONFLICT,
                        message: userConfig.message.alreadyExistsUsername
                    });
                } else {
                    if (commonRes.dataRes.result.n > 0) {
                        notificationController.saveNotificationInfo(req, userConfig.notifications.welcome_message, newUser._id);
                        _p.sendEmailToUser(req, res, newUser, newUser.auto_gen_password, password, next);
                        return commonHelper.sendDataManipulationMessage(res, {
                            '_id': newUser._id,
                            'first_name': newUser.first_name,
                            'last_name': newUser.last_name,
                            'email': newUser.email,
                            'gender': newUser.gender,
                            'username': newUser.username,
                            'auto_gen_password': newUser.auto_gen_password,
                            'user_role': newUser.user_role,
                            'reset_password_first_login': newUser.reset_password_first_login,
                            'parent_user_role': newUser.parent_user_role,
                            'added_on': newUser.added_on
                        }, userConfig.message.saveMessageAdminUser, HTTPStatus.OK);
                    } else {
                        return commonHelper.sendResponseData(res, {
                            status: HTTPStatus.OK,
                            message: userConfig.message.saveMessageAdminUserFailure
                        });
                    }
                }
            }
        } catch (err) {
            return next(err);
        }
    };

    _p.updateIAMUser = async (req, res, next) => {
        return userController.updateUser(req, res, next, true);
    };

    return {
        getAllIAMUsers: _p.getAllIAMUsers,
        registerIAMUser: _p.registerIAMUser,
        updateIAMUser: _p.updateIAMUser
    };

})();

module.exports = iamUserController;
