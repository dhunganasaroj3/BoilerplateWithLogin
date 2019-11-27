/**
 * Created by lakhe on 12/11/17.
 */
const iamPoliciesController = (() => {
    'use strict';

    const HTTPStatus = require('http-status');
    const moduleConfig = require('./identity-access-management.config');
    const roleConfig = require('../../configs/role.config');
    const utilityHelper = require('../../helpers/utilities.helper');
    const errorHelper = require('../../helpers/error.helper');
    const uuidv1 = require('uuid/v1');
    const commonHelper = require('../../common/common-helper-function');
    const commonProvider = require('../../common/common-provider-function');
    const Promise = require('bluebird');

    const documentFields = 'policy_title policy_description';
    const projectionFields = {
        '_id': 1,
        'policy_title': 1,
        'policy_description': 1,
        'policy_rules': 1
    };

    function IAMPolicyModule() {}

    const _p = IAMPolicyModule.prototype;

    _p.checkValidationErrors = async (req) => {
        req.checkBody('policy_title', moduleConfig.message.validationErrMessage.policy_title).notEmpty();
        req.checkBody('policy_description', moduleConfig.message.validationErrMessage.policy_description).notEmpty();
        const result = await req.getValidationResult();
        return result.array();
    };

    _p.checkPolicyRulesValidationErrors = async (req) => {
        req.checkBody('policy_rule_title', moduleConfig.message.validationErrMessage.policy_rule_title).notEmpty();
        req.checkBody('policy_rule', moduleConfig.message.validationErrMessage.policy_rule).notEmpty();
        req.checkBody('policy_rule_http_access', moduleConfig.message.validationErrMessage.policy_rule_http_access).notEmpty();
        req.checkBody('policy_rule_description', moduleConfig.message.validationErrMessage.policy_rule_description).notEmpty();
        const result = await req.getValidationResult();
        return result.array();
    };

    _p.getAllIAMPolicies = (req, next) => {
        const pagerOpts = utilityHelper.getPaginationOpts(req, next);
        let queryOpts = {};

        if (req.query.policy_title) {
            queryOpts.policy_title = {$regex: new RegExp('.*' + req.query.policy_title, "i")}
        }

        queryOpts.deleted = false;
        const sortOpts = { added_on: -1 };
        if (req.query.applicable_role) {
            return _p.getFilteredPolicyList(req, next);
        } else {
            return commonProvider.getPaginatedDataList(req.db.collection('IAMPolicies'), queryOpts, pagerOpts, projectionFields, sortOpts);
        }
    };

    _p.getFilteredPolicyList = async (req, next) => {
        const arrData = await req.db.collection('IAMPolicies').aggregate([
            {
                $match: {
                    "deleted": false
                }
            },
            {
                $project: {
                    _id: 0,
                    policy_title: 1,
                    policy_rules: {
                        $filter: {
                            input: "$policy_rules",
                            as: "policy_rules",
                            cond: {
                                $in: [ req.query.applicable_role, "$$policy_rules.applicable_roles"]
                            }
                        }
                    },
                    rules_count: { $size: "$policy_rules" }
                }
            },
            {
                $match: {
                    "rules_count": {
                        $gt: 0
                    }
                }
            }
        ]).toArray();
        return arrData;
    };

    _p.getPolicyDetailInfo = (req) => {
        return req.db.collection('IAMPolicies').findOne({ _id: req.params.policyRuleId, deleted: false }, {
            '_id': 1,
            'policy_title': 1,
            'policy_description': 1,
        });
    };

    _p.getPolicyRuleDetailInfo = async (req) => {
        const arrData = await req.db.collection('IAMPolicies').aggregate([
            {
                $match: {
                    "_id": req.params.policyRuleId
                }
            },
            {
                $project: {
                    _id: 0,
                    policy_rules: {
                        $filter: {
                            input: "$policy_rules",
                            as: "policy_rules",
                            cond: {
                                $eq: [ "$$policy_rules._id", req.params.ruleId]
                            }
                        }
                    }
                }
            },
            {
                $unwind: "$policy_rules"
            }

        ]).toArray();

        return (arrData && arrData.length > 0) ? (arrData[0] && arrData[0].policy_rules) ? arrData[0].policy_rules : {} : {};
    };

    _p.registerIAMPolicy = async (req, res, next) => {
        try {
            const errors = await _p.checkValidationErrors(req);
            if (errors && errors.length > 0) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.BAD_REQUEST,
                    message: errorHelper.sendFormattedErrorData(errors)
                });
            } else {
                const modelInfo = utilityHelper.sanitizeUserInput(req, next);
                const count = await req.db.collection('IAMPolicies').estimatedDocumentCount({
                    policy_title: {$regex: new RegExp('.*' + modelInfo.policy_title, "i")},
                    deleted: false
                });
                if(count > 0) {
                    return commonHelper.sendResponseData(res, {
                        status: HTTPStatus.CONFLICT,
                        message: moduleConfig.message.policyAlreadyExists
                    });
                } else {
                    const newPolicy = commonHelper.collectFormFields(req, modelInfo, documentFields, undefined);
                    newPolicy.policy_rules = [];
                    // newPolicy.applicable_roles = (req.body.applicable_roles && req.body.applicable_roles.includes(","))
                    //     ? req.body.applicable_roles.split(",")
                    //     : (req.body.applicable_roles && req.body.applicable_roles.length>0) ? [req.body.applicable_roles] : [];
                    const dataRes = await req.db.collection('IAMPolicies').insertOne(newPolicy);
                    return commonHelper.sendResponseMessage(res, dataRes, newPolicy, moduleConfig.message.saveMessagePolicy);
                }
            }
        } catch (err) {
            return next(err);
        }
    };

    _p.updateIAMPolicy = async (req, res, next) => {
        try {
            const errors = await _p.checkValidationErrors(req);
            if (errors && errors.length > 0) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.BAD_REQUEST,
                    message: errorHelper.sendFormattedErrorData(errors)
                });
            } else {
                const modelInfo = utilityHelper.sanitizeUserInput(req, next);
                const policyObj = await req.db.collection('IAMPolicies').findOne({ _id: req.params.policyRuleId, deleted: false });
                if(policyObj && Object.keys(policyObj).length > 0) {
                    if (policyObj.policy_title !== modelInfo.policy_title) {
                        const count = await req.db.collection('IAMPolicies').estimatedDocumentCount({
                            policy_title: {$regex: new RegExp('.*' + modelInfo.policy_title, "i")},
                            deleted: false
                        });
                        if(count > 0) {
                            return commonHelper.sendResponseData(res, {
                                status: HTTPStatus.CONFLICT,
                                message: moduleConfig.message.policyAlreadyExists
                            });
                        } else {
                            const returnData = await _p.policyHelperFunc(req, modelInfo);
                            return commonHelper.sendResponseMessage(res, returnData.updateRes, {
                                ...returnData.dataObj
                            }, moduleConfig.message.updateMessagePolicy);
                        }
                    } else {
                        const returnData = await _p.policyHelperFunc(req, modelInfo);
                        return commonHelper.sendResponseMessage(res, returnData.updateRes, {
                            ...returnData.dataObj
                        }, moduleConfig.message.updateMessagePolicy);
                    }
                } else {
                    return commonHelper.sendResponseData(res, {
                        status: HTTPStatus.BAD_REQUEST,
                        message: moduleConfig.message.policyNotExists
                    });
                }
            }
        } catch (err) {
            return next(err);
        }
    };

    _p.policyHelperFunc = async (req, modelInfo) => {
        const dataObj = {
            'policy_title': modelInfo.policy_title,
            'policy_description': modelInfo.policy_description,
            "updated_by": commonHelper.getLoggedInUser(req),
            "updated_on": new Date()
        };
        const updateRes = await req.db.collection('IAMPolicies').updateOne({
            "_id": req.params.policyRuleId},
            {$set: {
                "policy_title": dataObj.policy_title,
                "policy_description": dataObj.policy_description,
                "updated_by": dataObj.updated_by,
                "updated_on": dataObj.updated_on
            }
        });
        return Promise.resolve({
            updateRes: updateRes,
            dataObj: dataObj
        });
    };

    _p.attachPolicyRules = async (req, res, next) => {
        try {
            const errors = await _p.checkPolicyRulesValidationErrors(req);
            if (errors && errors.length > 0) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.BAD_REQUEST,
                    message: errorHelper.sendFormattedErrorData(errors)
                });
            } else {
                const modelInfo = utilityHelper.sanitizeUserInput(req, next);
                const count = await req.db.collection('IAMPolicies').estimatedDocumentCount({
                    _id: req.params.policyRuleId,
                    policy_rules: {
                        $elemMatch: {
                            policy_rule_title: modelInfo.policy_rule_title
                        }
                    }
                });
                if(count > 0) {
                    return commonHelper.sendResponseData(res, {
                        status: HTTPStatus.CONFLICT,
                        message: moduleConfig.message.policyRuleAlreadyExists
                    });
                } else {
                    const attachObj = {
                        _id: uuidv1(),
                        policy_rule_title: modelInfo.policy_rule_title,
                        policy_rule: modelInfo.policy_rule,
                        policy_rule_http_access: modelInfo.policy_rule_http_access,
                        policy_rule_description: modelInfo.policy_rule_description,
                        applicable_roles: (req.body.applicable_roles && req.body.applicable_roles.includes(","))
                            ? req.body.applicable_roles.split(",")
                            : (req.body.applicable_roles && req.body.applicable_roles.length>0) ? [req.body.applicable_roles] : [],
                        added_by: commonHelper.getLoggedInUser(req),
                        added_on: new Date()
                    };
                    const updateRes = await req.db.collection('IAMPolicies').updateOne({ "_id": req.params.policyRuleId }, {
                        $push: {
                            policy_rules: attachObj
                        }
                    });
                    return commonHelper.sendResponseMessage(res, updateRes, attachObj, moduleConfig.message.saveMessagePolicyRule);
                }
            }
        } catch (err) {
            return next(err);
        }
    };

    _p.updatePolicyRule = async (req, res, next) => {
        try {
            const errors = await _p.checkPolicyRulesValidationErrors(req);
            if (errors && errors.length > 0) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.BAD_REQUEST,
                    message: errorHelper.sendFormattedErrorData(errors)
                });
            } else {
                const modelInfo = utilityHelper.sanitizeUserInput(req, next);
                const policyRuleInfo = await _p.getPolicyRuleDetailInfo(req);
                if ((policyRuleInfo && Object.keys(policyRuleInfo).length > 0) && policyRuleInfo.policy_rule_title.toLowerCase()===modelInfo.policy_rule_title.trim().toLowerCase()) {
                    const policyRuleObj =await _p.updateHelperFunc(req, modelInfo);
                    return commonHelper.sendResponseMessage(res, policyRuleObj.updateRes, policyRuleObj.attachObj, moduleConfig.message.updateMessagePolicyRule);
                } else  {
                    const count = await req.db.collection('IAMPolicies').estimatedDocumentCount({
                        _id: req.params.policyRuleId,
                        policy_rules: {
                            $elemMatch: {
                                policy_rule_title: modelInfo.policy_rule_title
                            }
                        }
                    });
                    if(count > 0) {
                        return commonHelper.sendResponseData(res, {
                            status: HTTPStatus.CONFLICT,
                            message: moduleConfig.message.policyRuleAlreadyExists
                        });
                    } else {
                        const policyRuleObj =await _p.updateHelperFunc(req, modelInfo);
                        return commonHelper.sendResponseMessage(res, policyRuleObj.updateRes, policyRuleObj.attachObj, moduleConfig.message.updateMessagePolicyRule);
                    }
                }
            }
        } catch (err) {
            return next(err);
        }
    };

    _p.updateHelperFunc = async (req, modelInfo) => {
        const attachObj = {
            policy_rule_title: modelInfo.policy_rule_title,
            policy_rule: modelInfo.policy_rule,
            policy_rule_http_access: modelInfo.policy_rule_http_access,
            policy_rule_description: modelInfo.policy_rule_description,
            applicable_roles: (req.body.applicable_roles && req.body.applicable_roles.includes(","))
                ? req.body.applicable_roles.split(",")
                : (req.body.applicable_roles && req.body.applicable_roles.length > 0) ? [req.body.applicable_roles] : []
        };
        const updateRes = await req.db.collection('IAMPolicies').updateOne({"_id": req.params.policyRuleId, "policy_rules._id": req.params.ruleId }, {
            $set: {
                "policy_rules.$.policy_rule_title": attachObj.policy_rule_title,
                "policy_rules.$.policy_rule": attachObj.policy_rule,
                "policy_rules.$.policy_rule_http_access": attachObj.policy_rule_http_access,
                "policy_rules.$.policy_rule_description": attachObj.policy_rule_description,
                "policy_rules.$.applicable_roles": attachObj.applicable_roles,
                "policy_rules.$.updated_by": commonHelper.getLoggedInUser(req),
                "policy_rules.$.updated_on": new Date()
            }
        });
        return Promise.resolve({
            updateRes: updateRes,
            attachObj: attachObj
        });
    };

    _p.removePolicyRule = async (req, res, next) => {
        try {
            const deleteRes = await req.db.collection('IAMPolicies').updateOne({ "_id": req.params.policyRuleId }, {
                $pull: {
                    policy_rules: {
                        _id: req.params.ruleId
                    }
                }
            });
            return commonHelper.sendResponseMessage(res, deleteRes, {
                "_id": req.params.policyRuleId,
                "rule_id": req.params.ruleId
            }, moduleConfig.message.deleteMessagePolicyRule);
        } catch (err) {
            return next(err);
        }
    };

    _p.getPolicyRulesList = async (req, res, next) => {
        const lstPolicyRules = await req.db.collection('IAMPolicies').aggregate([
            {
                $match: {
                    "_id": req.params.policyRuleId
                }
            },
            {
                $project: {
                    _id: 0,
                    policy_rules: 1
                }
            },
            {
                $unwind: "$policy_rules"
            },
            {
                $group : {
                    _id: '$_id',
                    policy_rules: { $push: "$policy_rules" }
                }
            }
        ]).toArray();
        return (lstPolicyRules && lstPolicyRules.length > 0) ? (lstPolicyRules[0] && lstPolicyRules[0].policy_rules) ? lstPolicyRules[0].policy_rules : [] : [];
    };

    return {
        getAllIAMPolicies: _p.getAllIAMPolicies,
        getPolicyRuleDetailInfo: _p.getPolicyRuleDetailInfo,
        getPolicyDetailInfo: _p.getPolicyDetailInfo,
        getPolicyRulesList: _p.getPolicyRulesList,
        registerIAMPolicy: _p.registerIAMPolicy,
        updateIAMPolicy: _p.updateIAMPolicy,
        attachPolicyRules: _p.attachPolicyRules,
        updatePolicyRule: _p.updatePolicyRule,
        removePolicyRule: _p.removePolicyRule
    };

})();

module.exports = iamPoliciesController;
