const emailTemplateController = (() => {
    'use strict';

    const HTTPStatus = require('http-status');
    const moduleConfig = require('./email-template.config');
    const appConfig = require('../../configs/application.config');
    const utilityHelper = require('../../helpers/utilities.helper');
    const errorHelper = require('../../helpers/error.helper');
    const uuidv1 = require('uuid/v1');
    const commonHelper = require('../../common/common-helper-function');
    const commonProvider = require('../../common/common-provider-function');
    const redisHelper = require('../../helpers/redis.helper');
    const fileOperationHelper = require('../../helpers/file-operation.helper');
    const ObjectId = require('mongodb').ObjectID;


    const documentFields = 'template_name email_subject email_from template_content active';
    const projectionFields = {
        '_id': 1,
        'template_name': 1,
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
        req.checkBody('email_subject', moduleConfig.message.validationErrMessage.email_subject).notEmpty();
        req.checkBody('template_content', moduleConfig.message.validationErrMessage.template_content).notEmpty();
        const result = await req.getValidationResult();
        return result.array();
    };

    _p.getEmailTemplate = (req, next) => {
        req.query.perpage = 100;
        const pagerOpts = utilityHelper.getPaginationOpts(req, next);
        const queryOpts = {
            deleted: false
        };
        const sortOpts = {
            added_on: -1
        };
        return commonProvider.getPaginatedDataList(req.db.collection('EmailTemplate'), queryOpts, pagerOpts, {
            '_id': 1,
            'template_name': 1
        }, sortOpts);
    };

    _p.getEmailTemplateByTemplateName = (req) => {
        const queryOpts = {
            template_name: req.body.template_name,
            deleted: false
        };
        return req.db.collection('EmailTemplate').findOne(queryOpts, {projection: projectionFields});
    };

    _p.getEmailTemplateDataByID = (req) => {
        const queryOpts = {
            _id: ObjectId(req.params.templateId),
            deleted: false
        };

        return req.db.collection('EmailTemplate').findOne(queryOpts, {projection: projectionFields});
    };

    _p.deleteEmailTemplate = async (req, res, next) => {
        try {
            const updateOpts = {
                $set: {
                    'deleted': true,
                    'deleted_on': new Date(),
                    'deleted_by': commonHelper.getLoggedInUser(req)
                }
            };

            const dataRes = await req.db.collection('EmailTemplate').updateOne({_id: req.params.templateId}, updateOpts);

            redisHelper.clearDataCache(req);
            commonHelper.sendResponseMessage(res, dataRes, null, moduleConfig.message.deleteMessage);
        } catch (err) {
            return next(err);
        }
    };

    _p.postEmailTemplate = async (req, res, next) => {
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

                const count = await req.db.collection('EmailTemplate').estimatedDocumentCount(queryOpts);
                if (count > 0) {
                    return commonHelper.sendResponseData(res, {
                        status: HTTPStatus.CONFLICT,
                        message: moduleConfig.message.alreadyExists
                    });
                } else {
                    // const contentInfo = {
                    //   template_content: req.body.template_content
                    // };
                    // const modelHtmlInfo = utilityHelper.sanitizeUserHtmlBodyInput(contentInfo, next);

                    const newEmailTemplate = commonHelper.collectFormFields(req, modelInfo, documentFields, undefined);
                    newEmailTemplate.email_from = appConfig.noreply_email;
                    newEmailTemplate.template_content = req.body.template_content;
                    const documents = utilityHelper.getMultipleDocuments(req, null, next);
                    newEmailTemplate.attachments = documents;
                    const dataRes = await req.db.collection('EmailTemplate').insertOne(newEmailTemplate);
                    redisHelper.clearDataCache(req);
                    commonHelper.sendResponseMessage(res, dataRes, null, moduleConfig.message.saveMessage);
                }
            }
        } catch (err) {
            return next(err);
        }
    };

    _p.updateEmailTemplateData = async (req, res, next) => {
        try {
            const errors = await _p.checkValidationErrors(req);
            if (errors && errors.length > 0) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.BAD_REQUEST,
                    message: errorHelper.sendFormattedErrorData(errors)
                });
            } else {
                const modelInfo = utilityHelper.sanitizeUserInput(req, next);
                const emailTemplateInfo = await req.db.collection('EmailTemplate').findOne({_id: req.params.templateId}, {projection: projectionFields});
                if (emailTemplateInfo) {
                    // if(emailTemplateInfo.template_name.toLowerCase() !== modelInfo.template_name.toLowerCase()) {
                    //   const queryOpts = {
                    //     template_name: {$regex: new RegExp('^' + modelInfo.template_name + '$', "i")},//matches anything that exactly matches the email template name, case  insensitive
                    //     deleted: false
                    //   };
                    //   const count = await req.db.collection('EmailTemplate').count(queryOpts);
                    //   if(count > 0) {
                    //     return commonHelper.sendResponseData(res, {
                    //       status: HTTPStatus.CONFLICT,
                    //       message: moduleConfig.message.alreadyExists
                    //     });
                    //   } else {
                    //     const dataRes = await _p.updateFunc(req, res, modelInfo, emailTemplateInfo, next);
                    //     redisHelper.clearDataCache(req);
                    //     commonHelper.sendResponseMessage(res, dataRes, null, moduleConfig.message.updateMessage);
                    //   }
                    // } else {
                    const dataRes = await _p.updateFunc(req, res, modelInfo, emailTemplateInfo, next);
                    redisHelper.clearDataCache(req);
                    commonHelper.sendResponseMessage(res, dataRes, null, moduleConfig.message.updateMessage);
                    // }
                }
            }
        } catch (err) {
            return next(err);
        }
    };

    _p.updateFunc = (req, res, modelInfo, emailTemplateObj, next) => {
        // const contentInfo = {
        //   template_content: req.body.template_content
        // };
        // const modelHtmlInfo = utilityHelper.sanitizeUserHtmlBodyInput(contentInfo, next);

        const updateOpts = commonHelper.collectFormFields(req, modelInfo, documentFields, 'update');
        updateOpts.template_content = req.body.template_content;

        const documents = utilityHelper.getMultipleDocuments(req, emailTemplateObj.attachments, next);
        updateOpts.attachments = documents;
        return req.db.collection('EmailTemplate').updateOne({_id: req.params.templateId}, {$set: updateOpts});
    };

    _p.deleteDocumentInfo = async (req, res, next) => {
        try {
            const fileName = (req.query && req.query.document_original_name) ? req.query.document_original_name : '';
            if (fileName !== '') {
                const updateOpts = {
                    $pull: {
                        "attachments": {
                            "document_original_name": fileName
                        }
                    }
                };
                const dataRes = await req.db.collection('EmailTemplate').updateOne({_id: req.params.templateId}, updateOpts);
                redisHelper.clearDataCache(req);
                commonHelper.sendJsonResponseMessage(res, dataRes, {
                    document_original_name: fileName
                }, moduleConfig.message.documentRemove);
            } else {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.BAD_REQUEST,
                    message: moduleConfig.message.fileSelect
                });
            }
        } catch (err) {
            return next(err);
        }
    };

    return {
        getEmailTemplate: _p.getEmailTemplate,
        getEmailTemplateByTemplateName: _p.getEmailTemplateByTemplateName,
        getEmailTemplateDataByID: _p.getEmailTemplateDataByID,
        deleteEmailTemplate: _p.deleteEmailTemplate,
        postEmailTemplate: _p.postEmailTemplate,
        updateEmailTemplateData: _p.updateEmailTemplateData,
        deleteDocumentInfo: _p.deleteDocumentInfo
    };

})();

module.exports = emailTemplateController;
