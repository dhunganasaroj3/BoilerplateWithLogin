const userBankAccountController = (() => {
    'use strict';

    const HTTPStatus = require('http-status');
    const uuidv1 = require('uuid/v1');
    const commonHelper = require('../../common/common-helper-function');
    const moduleConfig = require('./user-profile.config');
    const appMessageConfig = require('../../configs/message.config');
    const emailTemplateConfigs = require('../../configs/email-template.config');
    const utilityHelper = require('../../helpers/utilities.helper');
    const emailModuleConfig = require('../email-template/email-template.config');
    const errorHelper = require('../../helpers/error.helper');
    const emailHelper = require('../../helpers/email-service.helper');
    const hasher = require('../../auth/hasher');
    const emailTemplateController = require('../email-template/email-template.controller');
    const roleConfig = require('../../configs/role.config');
    const loginController = require('../login-logs/login-logs.controller');
    const appConfig = require('../../configs/application.config');
    const Promise = require('bluebird');
    const join = Promise.join;

    const documentFields = 'user_id account_holder_name bank_name bank_account_number swift_code bank_account_type routing_number iban_ifsc_code bank_branch_address billing_address_country billing_address_city billing_address_zip_postal_code billing_address_state_region_province billing_address_address_line_1 billing_address_address_line_2';
    const projectionFields = {
        '_id': 1,
        'user_id': 1,
        'account_holder_name': 1,
        'bank_name': 1,
        'bank_account_number': 1,
        'swift_code': 1,
        'bank_account_type': 1,
        'routing_number': 1,
        'iban_ifsc_code': 1,
        'bank_branch_address': 1,
        'billing_address_country': 1,
        'billing_address_city': 1,
        'billing_address_zip_postal_code': 1,
        'billing_address_state_region_province': 1,
        'billing_address_address_line_1': 1,
        'billing_address_address_line_2': 1,
        'document': 1
    };

    function userBankAccountModule() {
    }

    const _p = userBankAccountModule.prototype;

    _p.getUserBankAccount = async (req, res, next) => {
        try {
            const queryOpts = {
                user_id: (utilityHelper.containsElementInArr(commonHelper.getLoggedInUserRole(req), roleConfig.superadmin, next)) ? req.params.userId : commonHelper.getLoggedInUserId(req),
                deleted: false
            };
            // const extraFields = JSON.parse(JSON.stringify(projectionFields));
            return req.db.collection('UserBankAccount').findOne(queryOpts, { projection: projectionFields});
        } catch (err) {
            return next(err);
        }
    };
    _p.updateUserBankAccount = async (req, res, next) => {
        try {
            req.checkBody('account_holder_name', moduleConfig.message.validationErrMessage.account_holder_name).notEmpty();
            req.checkBody('bank_account_number', moduleConfig.message.validationErrMessage.bank_account_number).notEmpty();
            req.checkBody('bank_name', moduleConfig.message.validationErrMessage.bank_name).notEmpty();
            req.checkBody('swift_code', moduleConfig.message.validationErrMessage.swift_code).notEmpty();
            if(req.body.routing_number) {
                req.checkBody('routing_number', moduleConfig.message.validationErrMessage.routing_number_valid).notEmpty();
            }
            req.checkBody('bank_branch_address', moduleConfig.message.validationErrMessage.bank_branch_address).notEmpty();
            req.checkBody('bank_account_type', moduleConfig.message.validationErrMessage.bank_account_type).notEmpty();
            req.checkBody('billing_address_country', moduleConfig.message.validationErrMessage.billing_address_country).notEmpty();
            req.checkBody('billing_address_city', moduleConfig.message.validationErrMessage.billing_address_city).notEmpty();
            req.checkBody('billing_address_zip_postal_code', moduleConfig.message.validationErrMessage.billing_address_zip_postal_code).notEmpty();
            req.checkBody('billing_address_state_region_province', moduleConfig.message.validationErrMessage.billing_address_state_region_province).notEmpty();
            req.checkBody('billing_address_address_line_1', moduleConfig.message.validationErrMessage.billing_address_address_line_1).notEmpty();
            const result = await req.getValidationResult();
            const errors = result.array();
            if (errors && errors.length > 0) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.BAD_REQUEST,
                    message: errorHelper.sendFormattedErrorData(errors)
                });
            } else {
                const bankAccountInfo = await req.db.collection('UserBankAccount').findOne({
                    user_id: commonHelper.getLoggedInUserId(req),
                    deleted: false
                });
                const roomImages = utilityHelper.getMultipleDocumentsForBank(req, bankAccountInfo ? bankAccountInfo.document : null, next);
                if(req.body._id){
                    delete req.body._id;
                }
                const modelInfo = utilityHelper.sanitizeUserInput(req, next);
                const imageListUpdated = roomImages.map((item, index) => {
                    return {
                        _id: uuidv1(),
                        ...item
                    }
                });
                modelInfo.document = imageListUpdated;
                modelInfo.user_id = commonHelper.getLoggedInUserId(req);
                let dataRes = {};
                if (bankAccountInfo && Object.keys(bankAccountInfo).length > 0) {
                    modelInfo.updated_by = commonHelper.getLoggedInUserId(req);
                    modelInfo.updated_on = new Date();
                    dataRes = await  req.db.collection('UserBankAccount').updateOne(
                        {
                            user_id: commonHelper.getLoggedInUserId(req)
                        },
                        { $set: {
                                "billing_address_country" : modelInfo.billing_address_country,
                                "account_holder_name" : modelInfo.account_holder_name,
                                "swift_code" : modelInfo.swift_code,
                                "bank_branch_address" : modelInfo.bank_branch_address,
                                "billing_address_address_line_1" : modelInfo.billing_address_address_line_1,
                                "billing_address_address_line_2" : modelInfo.billing_address_address_line_2,
                                "billing_address_city" : modelInfo.billing_address_city,
                                "billing_address_zip_postal_code" : modelInfo.billing_address_zip_postal_code,
                                "bank_name" : modelInfo.bank_name,
                                "bank_account_number" : modelInfo.bank_account_number,
                                "bank_account_type" : modelInfo.bank_account_type,
                                "routing_number" : modelInfo.routing_number,
                                "iban_ifsc_code" : modelInfo.iban_ifsc_code,
                                "billing_address_state_region_province" : modelInfo.billing_address_state_region_province,
                                "document" : [...modelInfo.document],
                            }}
                    );
                } else {
                    modelInfo._id= uuidv1();
                    modelInfo.deleted = false;
                    modelInfo.added_by = commonHelper.getLoggedInUserId(req);
                    modelInfo.added_on = new Date();
                    dataRes = await  req.db.collection('UserBankAccount').insertOne(
                        modelInfo
                    );
                }
                commonHelper.sendResponseMessage(res, dataRes,
                    {
                        ...modelInfo,
                        _id: bankAccountInfo ? bankAccountInfo._id : modelInfo._id
                    }, moduleConfig.message.bankAccountSavedSuccess
                );
            }
        } catch (err) {
            return next(err);
        }
    };

    _p.removeBankAccountDocument = async (req, res, next) => {
        try {
            const updateOpts = { _id: req.params.documentId };
            const dataRes = await req.db.collection('UserBankAccount').updateOne({
                user_id: commonHelper.getLoggedInUserId(req),
                deleted: false
            }, {
                $pull: { document: updateOpts }
            });
            return commonHelper.sendResponseMessage(res, dataRes, updateOpts, moduleConfig.message.bankAccountDocumentDeleteSuccess
            );
        } catch (err) {
            return next(err);
        }
    };

    return {
        getUserBankAccount: _p.getUserBankAccount,
        updateUserBankAccount: _p.updateUserBankAccount,
        removeBankAccountDocument: _p.removeBankAccountDocument
    };

})();

module.exports = userBankAccountController;
