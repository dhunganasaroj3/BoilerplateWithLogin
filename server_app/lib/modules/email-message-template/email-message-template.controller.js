const emailMessageTemplateController = (() => {
    'use strict';

    const HTTPStatus = require('http-status');
    const moduleConfig = require('./email-message-template.config');
    const appConfig = require('../../configs/application.config');
    const utilityHelper = require('../../helpers/utilities.helper');
    const errorHelper = require('../../helpers/error.helper');
    const uuidv1 = require('uuid/v1');
    const commonHelper = require('../../common/common-helper-function');
    const commonProvider = require('../../common/common-provider-function');
    const redisHelper = require('../../helpers/redis.helper');
    const fileOperationHelper = require('../../helpers/file-operation.helper');
    const emailHelper = require('../../helpers/email-service.helper');
    const emailTemplateContentConfigs = require('../../configs/email-template.content.config');

    const documentFields = 'case template_name variable email_subject email_from template_content active';
    const projectionFields = {
        '_id': 1,
        'case': 1,
        'template_name': 1,
        'variable': 1,
        'email_subject': 1,
        'email_from': 1,
        'template_content': 1,
        'attachments': 1,
        'active': 1,
        'added_on': 1
    };

    function EmailTemplateModule() {
    }

    const _p = EmailTemplateModule.prototype;


    _p.checkValidationErrors = async (req) => {
        req.checkBody('template_name', moduleConfig.message.validationErrMessage.template_name).notEmpty();
        req.checkBody('case', moduleConfig.message.validationErrMessage.case).notEmpty();
        req.checkBody('email_subject', moduleConfig.message.validationErrMessage.email_subject).notEmpty();
        req.checkBody('template_content', moduleConfig.message.validationErrMessage.template_content).notEmpty();
        const result = await req.getValidationResult();
        return result.array();
    };

    _p.getEmailMessageTemplate = (req, next) => {
        //  req.query.perpage = 100;
        const pagerOpts = utilityHelper.getPaginationOpts(req, next);
        const queryOpts = {
            deleted: false
        };
        const sortOpts = {
            added_on: -1
        };
        if (req.query.case && req.query.case.trim() !== '')
            queryOpts.case = req.query.case;
        if (req.query.active || req.query.active === 'true')
            queryOpts.active = true;
        return commonProvider.getPaginatedDataList(req.db.collection('EmailMessageTemplate'), queryOpts, pagerOpts, projectionFields, sortOpts);
    };
    _p.getEmailMessageTemplateDataByID = (req) => {
        const queryOpts = {
            _id: req.params.templateId,
            deleted: false
        };
        return req.db.collection('EmailMessageTemplate').findOne(queryOpts, { projection: projectionFields});
    };

    _p.postEmailMessageTemplate = async (req, res, next) => {
        try {
            const errors = await _p.checkValidationErrors(req);
            if (errors && errors.length > 0) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.BAD_REQUEST,
                    message: errorHelper.sendFormattedErrorData(errors)
                });
            } else {
                const modelInfo = utilityHelper.sanitizeUserInput(req, next);
                const queryOpts = {
                    template_name: {$regex: new RegExp('^' + modelInfo.template_name + '$', "i")},//matches anything that exactly matches the email template name, case  insensitive
                    deleted: false
                };

                const count = await req.db.collection('EmailMessageTemplate').estimatedDocumentCount(queryOpts);
                if (count > 0) {
                    return commonHelper.sendResponseData(res, {
                        status: HTTPStatus.CONFLICT,
                        message: moduleConfig.message.alreadyExists
                    });
                } else {
                    const newEmailTemplate = commonHelper.collectFormFields(req, modelInfo, documentFields, undefined);
                    if (moduleConfig.cases[newEmailTemplate.case]) {
                        newEmailTemplate.variable = moduleConfig.cases[newEmailTemplate.case].variable;
                        newEmailTemplate.template_content = req.body.template_content;
                        const documents = utilityHelper.getMultipleDocuments(req, null, next);
                        newEmailTemplate.attachments = documents;
                        const dataRes = await req.db.collection('EmailMessageTemplate').insertOne(newEmailTemplate);
                        redisHelper.clearDataCache(req);
                        commonHelper.sendResponseMessage(res, dataRes, newEmailTemplate, moduleConfig.message.saveMessage);
                    }
                    else {
                        return commonHelper.sendResponseData(res, {
                            status: HTTPStatus.NOT_ACCEPTABLE,
                            message: moduleConfig.message.invalidCase
                        });
                    }
                }
            }
        } catch (err) {
            return next(err);
        }
    };
    _p.updateEmailMessageTemplateData = async (req, res, next) => {
        try {
            const modelInfo = utilityHelper.sanitizeUserInput(req, next);
            const emailTemplateInfo = await req.db.collection('EmailMessageTemplate').findOne({_id: req.params.templateId }, { projection:projectionFields});
            const updateOpts = commonHelper.collectFormFields(req, modelInfo, documentFields, 'update');
            if (moduleConfig.cases[updateOpts.case]) {
                if (emailTemplateInfo) {
                    updateOpts.template_content = req.body.template_content;
                    updateOpts.variable = moduleConfig.cases[updateOpts.case].variable;
                    updateOpts.template_content = req.body.template_content;

                    const documents = utilityHelper.getMultipleDocuments(req, updateOpts.attachments, next);
                    updateOpts.attachments = documents;
                    const dataRes = await req.db.collection('EmailMessageTemplate').updateOne({_id: req.params.templateId }, {$set: updateOpts});
                    redisHelper.clearDataCache(req);
                    commonHelper.sendResponseMessage(res, dataRes, updateOpts, moduleConfig.message.updateMessage);
                }
            } else {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.NOT_ACCEPTABLE,
                    message: moduleConfig.message.invalidCase
                });
            }
        } catch (err) {
            return next(err);
        }
    };

    _p.sendMail = async (req, res, next) => {
        try {
            const emailRes = await  _p.sendEmailByCase(req, res, next);
            if ((emailRes && Object.keys(emailRes).length > 0)) {
                return commonHelper.sendDataManipulationMessage(res, Object.keys(emailRes), moduleConfig.message.mailSent, HTTPStatus.OK);
            } else {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.SERVICE_UNAVAILABLE,
                    message: moduleConfig.message.emailError
                });
            }
        } catch (err) {
            return next(err);
        }
    };
    _p.sendEmailByCase = async (req, res, next) => {
        try {
            const queryOpts = {
                _id: req.params.templateId,
                deleted: false
            };
            if (req.params.templateId) {
                let messageBody = '';
                const modelInfo = await utilityHelper.sanitizeUserInput(req, next);
                const userDetail = await req.db.collection('User').findOne({_id: modelInfo.userId});
                let toEmail = userDetail.email;
                if (modelInfo && modelInfo.template_content) {
                    messageBody = req.body.template_content;
                    switch (modelInfo.case) {
                        case 'adminToUser':
                            if (messageBody.indexOf("%user_first_name%") > -1) {
                                messageBody = messageBody.replace(new RegExp("%user_first_name%", 'g'), userDetail.first_name);
                            }
                            if (messageBody.indexOf("%user_last_name%") > -1) {
                                messageBody = messageBody.replace(new RegExp("%user_last_name%", 'g'), userDetail.last_name);
                            }
                            if (messageBody.indexOf("%user_email%") > -1) {
                                messageBody = messageBody.replace(new RegExp("%user_email%", 'g'), userDetail.email);
                            }
                            break;
                        case 'adminToVendor':
                            if (messageBody.indexOf("%vendor_first_name%") > -1) {
                                messageBody = messageBody.replace(new RegExp("%vendor_first_name%", 'g'), userDetail.first_name);
                            }
                            if (messageBody.indexOf("%vendor_last_name%") > -1) {
                                messageBody = messageBody.replace(new RegExp("%vendor_last_name%", 'g'), userDetail.last_name);
                            }
                            if (messageBody.indexOf("%vendor_email%") > -1) {
                                messageBody = messageBody.replace(new RegExp("%vendor_email%", 'g'), userDetail.email);
                            }
                            break;
                        case 'adminToIMP':
                            if (messageBody.indexOf("%imp_first_name%") > -1) {
                                messageBody = messageBody.replace(new RegExp("%imp_first_name%", 'g'), userDetail.first_name);
                            }
                            if (messageBody.indexOf("%imp_last_name%") > -1) {
                                messageBody = messageBody.replace(new RegExp("%imp_last_name%", 'g'), userDetail.last_name);
                            }
                            if (messageBody.indexOf("%imp_email%") > -1) {
                                messageBody = messageBody.replace(new RegExp("%imp_email%", 'g'), userDetail.email);
                            }
                            break;
                        case 'adminToImpOfVendor':
                            if (messageBody.indexOf("%vendor_first_name%") > -1) {
                                messageBody = messageBody.replace(new RegExp("%vendor_first_name%", 'g'), userDetail.first_name);
                            }
                            if (messageBody.indexOf("%vendor_last_name%") > -1) {
                                messageBody = messageBody.replace(new RegExp("%vendor_last_name%", 'g'), userDetail.last_name);
                            }
                            if (messageBody.indexOf("%vendor_email%") > -1) {
                                messageBody = messageBody.replace(new RegExp("%vendor_email%", 'g'), userDetail.email);
                            }
                            const propertyDetail = await req.db.collection('PropertyInformation').findOne({user_id: req.body.userId });
                            if (messageBody.indexOf("%vendor_name%") > -1) {
                                messageBody = messageBody.replace(new RegExp("%vendor_name%", 'g'), propertyDetail.property_name);
                            }
                            const impDetail = await req.db.collection('User').findOne({_id: propertyDetail.imp_id});
                            if (messageBody.indexOf("%imp_first_name%") > -1) {
                                messageBody = messageBody.replace(new RegExp("%imp_first_name%", 'g'), impDetail.first_name);
                            }
                            if (messageBody.indexOf("%imp_last_name%") > -1) {
                                messageBody = messageBody.replace(new RegExp("%imp_last_name%", 'g'), impDetail.last_name);
                            }
                            if (messageBody.indexOf("%imp_email%") > -1) {
                                messageBody = messageBody.replace(new RegExp("%imp_email%", 'g'), impDetail.email);
                            }
                            toEmail = impDetail.email;
                            break;
                        case 'adminToImpOfImp':
                            if (messageBody.indexOf("%referral_imp_first_name%") > -1) {
                                messageBody = messageBody.replace(new RegExp("%referral_imp_first_name%", 'g'), userDetail.first_name);
                            }
                            if (messageBody.indexOf("%referral_imp_last_name%") > -1) {
                                messageBody = messageBody.replace(new RegExp("%referral_imp_last_name%", 'g'), userDetail.last_name);
                            }
                            if (messageBody.indexOf("%referral_imp_email%") > -1) {
                                messageBody = messageBody.replace(new RegExp("%referral_imp_email%", 'g'), userDetail.email);
                            }

                            const referral = await req.db.collection('IndependentMarketingPartners').findOne({user_id: req.body.userId });
                            const referralDetail = await req.db.collection('User').findOne({_id: referral.referee_id});
                            if (messageBody.indexOf("%referee_imp_first_name%") > -1) {
                                messageBody = messageBody.replace(new RegExp("%referee_imp_first_name%", 'g'), referralDetail.first_name);
                            }
                            if (messageBody.indexOf("%referral_imp_last_name%") > -1) {
                                messageBody = messageBody.replace(new RegExp("%referee_imp_last_name%", 'g'), referralDetail.last_name);
                            }
                            if (messageBody.indexOf("%referral_imp_email%") > -1) {
                                messageBody = messageBody.replace(new RegExp("%referee_imp_email%", 'g'), referralDetail.email);
                            }
                            toEmail = referralDetail.email;
                            break;
                    }
                    let message_template = emailTemplateContentConfigs.system_emails;

                    if (message_template.indexOf("%email_content%") > -1) {
                        message_template = message_template.replace("%email_content%", messageBody);
                    }

                    const documents = utilityHelper.getMultipleDocuments(req, null, next);
                    const email_attachments = documents.map((item, index) => {
                        return {
                            filename: item.document_name,
                            path: `${appConfig.aws_s3_path}${item.document_name}`,
                            contentType: item.document_mimetype
                        };
                    });
                    modelInfo.attachments = email_attachments;
                    const mailOptions = {
                        fromEmail: modelInfo.email_from, // sender address
                        toEmail: toEmail, // list of receivers
                        subject: modelInfo.email_subject, // Subject line
                        textMessage: message_template, // plaintext body
                        htmlTemplateMessage: message_template,
                        attachments: modelInfo.attachments
                    };
                    return emailHelper.sendEmail(req, mailOptions, next);
                }
            }
            return null;
        } catch (err) {
            return next(err);
        }
    };
    _p.getCaseForEmailMessageTemplates = (req, next) => {
        return moduleConfig.cases;
    };
    return {
        getEmailMessageTemplate: _p.getEmailMessageTemplate,
        getEmailMessageTemplateDataByID: _p.getEmailMessageTemplateDataByID,
        postEmailMessageTemplate: _p.postEmailMessageTemplate,
        updateEmailMessageTemplateData: _p.updateEmailMessageTemplateData,
        sendMail: _p.sendMail,
        getCaseForEmailMessageTemplates: _p.getCaseForEmailMessageTemplates
    };

})();

module.exports = emailMessageTemplateController;
