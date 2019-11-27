const emailSender = (() => {
    'use strict';

    const uuidv1 = require('uuid/v1');
    const emailTemplateConfigs = require('../../configs/email-template.config');
    const emailTemplateController = require('../email-template/email-template.controller');
    const emailHelper = require('../../helpers/email-service.helper');
    const appConfig = require('../../configs/application.config');
    const emailTemplateContentConfigs = require('../../configs/email-template.content.config');

    function emailSenderModule() {}

    const _p = emailSenderModule.prototype;

    _p.sendEmailToAgentApplicantUser = async (req, res, dataObj, _templateId, refer_api, next) => {
        try {
            const userEmail = dataObj.email;
            req.params.templateId = _templateId;
            if (_templateId) {
                const emailTemplateInfo = await emailTemplateController.getEmailTemplateDataByID(req);

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

                    if (messageBody.indexOf("%message_admin%") > -1) {
                        messageBody = messageBody.replace("%message_admin%", req.body.reason);
                    }
                    const url = `${req.protocol}://${appConfig.client_app_url}${refer_api}${dataObj.refer_code}`;
                    if (messageBody.indexOf("%message.referral_link%") > -1) {
                        messageBody = messageBody.replace(new RegExp("%message.referral_link%", 'g'), `<a href="${url}">${url}</a>`);
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
        } catch (err) {
            return next(err);
        }
    };

    _p.sendEmail = async (req, res, dataObj, templateId, next) => {
        try {
            const userEmail = dataObj.email;
            req.params.templateId = templateId;
            if (templateId) {
                const emailTemplateInfo = await emailTemplateController.getEmailTemplateDataByID(req);

                let messageBody = '';
                if (emailTemplateInfo && emailTemplateInfo.template_content) {
                    messageBody = emailTemplateInfo.template_content;

                    if (messageBody.indexOf("%message.first_name%") > -1) {
                        messageBody = messageBody.replace("%message.first_name%", dataObj.first_name);
                    }

                    if (messageBody.indexOf("%message.last_name%") > -1) {
                        messageBody = messageBody.replace("%message.last_name%", dataObj.last_name);
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
        } catch (err) {
            return next(err);
        }
    };

    return {
        sendEmailToAgentApplicantUser: _p.sendEmailToAgentApplicantUser,
        sendEmail: _p.sendEmail
    };

})();

module.exports = emailSender;
