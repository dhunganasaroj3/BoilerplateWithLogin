const userConfirmationTokenController = (() => {
    'use strict';

    const HTTPStatus = require('http-status');
    const uuidv1 = require('uuid/v1');
    const userAgent = require('useragent');
    const commonHelper = require('../../common/common-helper-function');
    const moduleConfig = require('./user-confirmation.config');
    const appMessageConfig = require('../../configs/message.config');
    const emailModuleConfig = require('../email-template/email-template.config');
    const emailTemplateConfigs = require('../../configs/email-template.config');
    const utilityHelper = require('../../helpers/utilities.helper');
    const emailHelper = require('../../helpers/email-service.helper');
    const hasher = require('../../auth/hasher');
    const emailTemplateController = require('../email-template/email-template.controller');
    const appConfig = require('../../configs/application.config');
    const notificationController = require('../notifications/notifications.controller');
    const jwtTokenGeneratorHelper = require('../../helpers/jwt-token-generator.helper');
    const authTokenController = require('../auth-token/auth-token-controller');
    const tokenConfigs = require('../../configs/token.config');
    const emailTemplateContentConfigs = require('../../configs/email-template.content.config');
    const pushNotificationController = require('../push-notification/push-notification.controller');
    // const impConfig = require('../agent-registration/agent-registration.config');
    const roleConfig = require('../../configs/role.config');
    const impStatus = require('../../configs/agent-status.config');
    // const impHelper = require('../agent-registration/imp-registration-helper');
    // const zohoCrmContactHelper = require('../../zoho-helper/crm/ContactHelper');

    const projectionFields = {
        '_id': 1,
        'user_id': 1,
        'token': 1,
        'added_on': 1,
        'expires': 1,
        'confirmed': 1,
        'used': 1,
        'resentEmail': 1
    };

    function UserConfirmModule() {
    }

    const _p = UserConfirmModule.prototype;

    _p.checkTokenExpiryStatus = async (req, next) => {
        try {
            if (req.params && req.params.token) {
                const queryOpts = {
                    token: req.params.token,
                    confirmed: false
                };
                //check to see if the token exists in the collection with specified query parameters
                const tokenInfo = await req.db.collection('UserRegistrationConfirmToken').findOne(queryOpts, { projection: projectionFields});
                if (tokenInfo && !tokenInfo.used) {
                    //check to see if the unblock token is already expired or not.
                    // Expiration time is certain hours from the creation of token

                    const user_id = (tokenInfo.user_id) ? tokenInfo.user_id : '';
                    //if the token expiry date is less or equal than current date, then token is expired
                    //if token is not expired, then find the user associated with the token


                    if (new Date(tokenInfo.expires) <= new Date()) {
                        //user_id is needed here to send email later for obtaining user information
                        return {
                            expired: true,
                            user_id: user_id,
                            used: true
                        };
                    } else {
                        const userObj = await req.db.collection('User').findOne({
                            _id: user_id,
                            deleted: false
                        });
                        //check to see if the user exists with the provided unblocked token
                        //if exists do further processing

                        if (userObj && !userObj.confirmed) {
                            return {
                                userDetail: userObj,
                                resentEmail: tokenInfo.resentEmail,
                                used: false
                            };
                        }
                    }
                } else {
                    return {
                        used: true,
                        user_id: (tokenInfo && tokenInfo.user_id) ? tokenInfo.user_id : ""
                    };
                }
            }
            return null;
        } catch (err) {
            return next(err);
        }
    };

    _p.confirmUserRegistration = async (req, res, next) => {
        try {
            const tokenInfo = await _p.checkTokenExpiryStatus(req, next);
            //if we get token info object, then do further processing, else respond with unblock token not found message
            if (tokenInfo && tokenInfo.used) {
                if (tokenInfo.expired) {
                    // if token is expired then, return the json object having expired vendor to true and then resend the unblock email
                    //it the token is already expired, then resend the new unblock email to the user
                    if (tokenInfo.user_id !== "") {
                        const userObj = await req.db.collection('User').findOne({
                            _id: tokenInfo.user_id,
                            deleted: false
                        });
                        const emailRes = await  _p.sendEmailToUser(req, res, userObj, next);
                        return commonHelper.sendDataManipulationMessage(res, {
                            used: true,
                            resend_email: (emailRes && Object.keys(emailRes).length > 0) ? true : false
                        }, moduleConfig.message.usedToken, HTTPStatus.GONE);
                    }
                }
                return commonHelper.sendDataManipulationMessage(res, {used: true}, moduleConfig.message.usedToken, HTTPStatus.GONE);
            } else {

                if (tokenInfo && (tokenInfo.userDetail && tokenInfo.userDetail._id) || (tokenInfo && tokenInfo.user_id)) {
                    const user_id = (tokenInfo.user_id) ? tokenInfo.user_id : tokenInfo.userDetail._id;
                    //if the token is not expired, then update the User block status
                    if (!tokenInfo.expired) {
                        const modelInfo = utilityHelper.sanitizeUserInput(req, next);
                        const userObj = await req.db.collection('User').findOne({
                            _id: user_id,
                            deleted: false
                        });
                        let dataRes = {};

                        // if (userObj.imp_user === 'true' || userObj.imp_user === true) {
                        //     const global_refer_code = await hasher.generateRandomBytes(impConfig.config.token_length);
                        //
                        //     const impObj = {
                        //         _id: uuidv1(),
                        //         refer_code: userObj.refer_code,
                        //         submitted_documents: [],
                        //         imp_terms_conditions: (userObj.imp_terms_conditions === 'true' || userObj.imp_terms_conditions === true) ? true : false,
                        //         user_id: userObj._id,
                        //         reason: '',
                        //         approval_documents: [],
                        //         global_refer_code: global_refer_code,
                        //         history_agent_application: []
                        //     };
                        //
                        //     const queryOpts = {
                        //         deleted: false,
                        //         _id: userObj._id
                        //     };
                        //
                        //     const updateObj = {
                        //         confirmed: true,
                        //         active: true,
                        //         user_role: [roleConfig.enduser, roleConfig.independent_marketing_partner],
                        //         imp_status: impStatus.status.processed,
                        //         processed_on: new Date()
                        //     };
                        //     const ZohoUpdate = {
                        //         Contact_Role: utilityHelper.getZohoContactType(updateObj.user_role.toString()),
                        //         IMP_Status: updateObj.imp_status,
                        //         Verification_Proces_Applied_On: new Date(utilityHelper.getFormattedDate(updateObj.processed_on, "-", next)).toISOString().replace(/T/, ' ').replace(/\..+/, ''),
                        //         "Processed_On": new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
                        //     };
                        //     zohoCrmContactHelper.UpdateContact(req, res, next, ZohoUpdate,userObj.zoho_crm_id)
                        //     dataRes = await impHelper.handleAgentRegistration(req, res, {
                        //         ...modelInfo,
                        //         refer_code: userObj.refer_code
                        //
                        //     }, impObj, userObj, queryOpts, updateObj, queryOpts, next);
                        //
                        // } else {
                            dataRes = await req.db.collection('User').updateOne({_id: user_id }, {
                                $set: {
                                    confirmed: true,
                                    active: true
                                }
                            });
                        // }


                        if ((dataRes && dataRes.status === HTTPStatus.OK) || (dataRes && dataRes.result && dataRes.result.n > 0)) {
                            const confirmationRes = await _p.updateRegistrationConfirmationToken(req, user_id);
                            if (confirmationRes.result.n > 0) {
                                notificationController.saveNotificationInfo(req, (userObj.imp_user === 'true' || userObj.imp_user === true) ? moduleConfig.notifications.account_confirmation_imp : moduleConfig.notifications.account_confirmation, user_id);

                                let auth_token_info = {};
                                if (userObj.imp_user !== 'true' && userObj.imp_user !== true) {
                                    const invalidateRes = await authTokenController.invalidateAuthToken(req, user_id);

                                    if (invalidateRes.result.n > 0) {
                                        auth_token_info = await _p.sendAuthTokenOnResentEmailConfirmationSuccess(req, {
                                            ...userObj,
                                            confirmed: true,
                                            active: true
                                        }, next);
                                        pushNotificationController.sendPushNotificationToIndividualDevices(req, user_id, {
                                            notification: {
                                                title: moduleConfig.push_notification.title.confirmation,
                                                body: (userObj.imp_user === 'true' || userObj.imp_user === true) ? moduleConfig.notifications.account_confirmation_imp : moduleConfig.notifications.account_confirmation
                                            },
                                            data: {
                                                token: auth_token_info.token
                                            }
                                        }, next);
                                    }
                                } else {
                                    dataRes.result = {n: 1};
                                }
                                return commonHelper.sendJsonResponseMessage(res, dataRes, auth_token_info, moduleConfig.message.saveMessage);
                            }
                        }
                        return commonHelper.sendResponseData(res, {
                            status: HTTPStatus.NOT_MODIFIED,
                            message: appMessageConfig.applicationMessage.dataNotModified
                        });
                    }
                } else {
                    return commonHelper.sendResponseData(res, {
                        status: HTTPStatus.GONE,
                        message: moduleConfig.message.notFound
                    });
                }
            }
        } catch (err) {
            return next(err);
        }
    };

    _p.sendAuthTokenOnResentEmailConfirmationSuccess = async (req, userObj, next) => {
        try {
            let tokenExpiryDate;
            // if(req.mobil_detection) {
            //   const _years = utilityHelper.removeCharFromString(tokenConfigs.mobileExpires, 'y');
            //   tokenExpiryDate = new Date(new Date().getTime() + (parseInt(_years) * 365 * 24 * 60 * 60 * 1000));
            // } else {
            const _hours = utilityHelper.removeCharFromString(tokenConfigs.expires, 'h');
            tokenExpiryDate = new Date(new Date().getTime() + (parseInt(_hours) * 60 * 60 * 1000));
            // }
            const user_agent = userAgent.lookup(req.headers['user-agent']);
            const geoLocationObj = await commonHelper.getGeoLocationInfo(req.client_ip_address.toString());

            const token = await jwtTokenGeneratorHelper.generateJWTToken(req, userObj);
            const dataRes = await authTokenController.postAuthorizationTokenInfo(req, token ? token.token : '', user_agent, user_agent.family, user_agent.major, geoLocationObj ? geoLocationObj.country : '', geoLocationObj ? geoLocationObj.city : '', req.client_ip_address, tokenExpiryDate, userObj._id, next);
            return (dataRes.result.n > 0) ? token : null;
        } catch (err) {
            return null;
        }
    };

    _p.postUserConfirmationTokenData = (req, token, user_id, resentEmail) => {
        const currentDate = new Date();

        const newUserConfirmationTokens = {
            _id: uuidv1(),
            user_id: user_id,
            token: token,
            expires: new Date(currentDate.getTime() + (1000 * 60 * 60 * moduleConfig.config.token_expiry_date_in_hours)),
            added_on: currentDate,
            confirmed: false,
            used: false,
            resentEmail: resentEmail
        };
        return req.db.collection('UserRegistrationConfirmToken').insertOne(newUserConfirmationTokens);
    };


    _p.sendEmailToUser = async (req, res, dataObj, resentEmail, next) => {
        try {
            const user_id = dataObj._id;
            const userEmail = dataObj.email;

            const tokenBytes = await hasher.generateRandomBytes(moduleConfig.config.token_length);
            const dataRes = await _p.postUserConfirmationTokenData(req, tokenBytes, user_id, resentEmail);
            if (dataRes.result.n > 0) {

                req.params.templateId = emailTemplateConfigs.user_confirmation;
                if (req.params.templateId) {
                    const emailTemplateInfo = await emailTemplateController.getEmailTemplateDataByID(req);

                    const url = `${req.protocol}://${appConfig.client_app_url}${moduleConfig.config.confirm_api}${tokenBytes}`;
                    let messageBody = '';
                    if (emailTemplateInfo && emailTemplateInfo.template_content) {
                        messageBody = emailTemplateInfo.template_content;
                        if (messageBody.indexOf("%message.title%") > -1) {
                            messageBody = messageBody.replace("%message.title%", dataObj.first_name + ' ' + dataObj.last_name);
                        }

                        if (messageBody.indexOf("%message.first_name%") > -1) {
                            messageBody = messageBody.replace("%message.first_name%", dataObj.first_name);
                        }

                        if (messageBody.indexOf("%message.last_name%") > -1) {
                            messageBody = messageBody.replace("%message.last_name%", dataObj.last_name);
                        }

                        if (messageBody.indexOf("%message.url_link%") > -1) {
                            messageBody = messageBody.replace(new RegExp("%message.url_link%", 'g'), url);
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
                return null;
            }
        } catch (err) {
            return next(err);
        }
    };

    _p.updateRegistrationConfirmationToken = (req, _userID) => {
        const queryOpts = {
            token: req.params.token
        };
        const updateOpts = {
            $set: {
                confirmed: true, used: true
            }
        };
        return req.db.collection('UserRegistrationConfirmToken').updateOne(queryOpts, updateOpts);
    };

    return {
        confirmUserRegistration: _p.confirmUserRegistration,
        sendEmailToUser: _p.sendEmailToUser
    };

})();

module.exports = userConfirmationTokenController;
