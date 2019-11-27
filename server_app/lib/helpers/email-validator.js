((emailValidator) => {

    'use strict';

    const HTTPStatus = require('http-status');
    const dnsResolver = require('./dns.resolver.helper');
    const messageConfig = require('../configs/message.config');
    const commonHelper = require('../common/common-helper-function');
    const email_validator_regex = /^[a-zA-Z0-9._]*$/;

    const checkEmailValidity = (email) => {
        if(email.indexOf("@") !== -1) {
            const emailFirstPart   = email.substring(0, email.indexOf("@"));
            return email_validator_regex.test(emailFirstPart) ?  true : false;
        } else {
            return false;
        }
    };

    const getEmailContent = (req) => {
        let emailAddr = "";
        if(req.body.email) {
            emailAddr = req.body.email;
        } else if(req.body.subscriber_email) {
            emailAddr = req.body.subscriber_email;
        } else if(req.body.new_email) {
            emailAddr = req.body.new_email;
        } else if(req.body.contact_email) {
            emailAddr = req.body.contact_email;
        }
        return emailAddr;
    };

    const processEmailValidation = async (req, res, next) => {
        if(req.body && (req.body.email || req.body.subscriber_email || req.body.new_email || req.body.contact_email)) {
            const email = getEmailContent(req);
            // if(email.indexOf("xceltrip.com") !== -1) {
                const valid_email_format = checkEmailValidity(email);
                if(valid_email_format) {
                    const suspendedEmailDomainStatus = await dnsResolver.checkForTemporarySuspendedEmailDomains(email);
                    if(!suspendedEmailDomainStatus) {
                        const dnsResolveStatus = await dnsResolver.resolveMailExchangeRecords(email);
                        if (dnsResolveStatus) {
                            next();
                        } else {
                            return commonHelper.sendResponseData(res, {
                                status: HTTPStatus.BAD_REQUEST,
                                message: messageConfig.emailInvalid.message
                            });
                        }
                    } else {
                        return commonHelper.sendResponseData(res, {
                            status: HTTPStatus.BAD_REQUEST,
                            message: (email.indexOf("xceltrip.com") !== -1) ? messageConfig.emailInvalid.unauthorizedEmailDomain : messageConfig.emailInvalid.suspendedEmailDomain
                        });
                    }
                } else {
                    return commonHelper.sendResponseData(res, {
                        status: HTTPStatus.BAD_REQUEST,
                        message: messageConfig.emailInvalid.formatMessage
                    });
                }
            // } else {
            //
            // }
        } else {
            next();
        }
    };


    emailValidator.validateEmailFormat = async (req, res, next) => {
        return processEmailValidation(req, res, next);
    };

    emailValidator.validateEmailsInMultiPartForm = (req, res, next) => {
        if(req.multi_part_enctype_operation) {
            return processEmailValidation(req, res, next);
        } else {
            next();
        }
    };

    emailValidator.validateEmailBody = async (email) => {
        const valid_email_format = checkEmailValidity(email);
        if(valid_email_format) {
            const dnsResolveStatus = await dnsResolver.resolveMailExchangeRecords(email);
            if (dnsResolveStatus) {
                return true;
            }
        }
        return false;
    };

})(module.exports);
