/**
 * Created by lakhe on 12/11/17.
 */
const iamRolesController = (() => {
    'use strict';

    const HTTPStatus = require('http-status');
    const moduleConfig = require('./identity-access-management.config');
    const roleConfig = require('../../configs/role.config');
    const utilityHelper = require('../../helpers/utilities.helper');
    const errorHelper = require('../../helpers/error.helper');
    const uuidv1 = require('uuid/v1');
    const commonHelper = require('../../common/common-helper-function');
    const Promise = require("bluebird");
    const join = Promise.join;

    const projectionFields = {
        '_id': 1,
        'role_name': 1,
        'role_description': 1,
        'user_specific_actions': 1
    };

    function IAMUserRoleModule() {}

    const _p = IAMUserRoleModule.prototype;

    _p.checkValidationErrors = async (req) => {
        req.checkBody('role_name', moduleConfig.message.validationErrMessage.role_name).notEmpty();
        req.checkBody('role_description', moduleConfig.message.validationErrMessage.role_description).notEmpty();
        req.checkBody('role_actions', moduleConfig.message.validationErrMessage.role_actions).notEmpty();
        const result = await req.getValidationResult();
        return result.array();
    };

    _p.getAllIAMUserRoles = (req, next) => {
        const pagerOpts = utilityHelper.getPaginationOpts(req, next);
        let queryOpts = {};
        if (req.query.role_name) {
            queryOpts.role_name = req.query.role_name;
        }
        queryOpts.deleted = false;
        const sortOpts = { added_on: -1 };
        return join(req.db.collection('IAMCustomRoles').aggregate([
            {
                $match: queryOpts
            },
            {
                $project: {
                    _id: 1,
                    role_name: 1,
                    role_description: 1,
                    user_specific_actions: {
                        $filter: {
                            input: "$user_specific_actions",
                            as: "user_specific_actions",
                            cond: {
                                $eq: [ "$$user_specific_actions.user_id", commonHelper.getLoggedInUserId(req).toString() ]
                            }
                        }
                    }
                }
            },
            {
                $sort: sortOpts
            },
            {
                $unwind: "$user_specific_actions"
            },
            {
                $skip: pagerOpts.perPage * (pagerOpts.page - 1)
            },
            {
                $limit: pagerOpts.perPage
            }

        ]).toArray(), req.db.collection('IAMCustomRoles').aggregate([
                {
                    $match: queryOpts
                },
                {
                    $project: {
                        _id: 0,
                        user_specific_actions: {
                            $filter: {
                                input: "$user_specific_actions",
                                as: "user_specific_actions",
                                cond: {
                                    $eq: [ "$$user_specific_actions.user_id", commonHelper.getLoggedInUserId(req).toString() ]
                                }
                            }
                        }
                    }
                },
                {
                    $unwind: "$user_specific_actions"
                },
                {
                    $count:"total_items"
                }
            ]).toArray(),
            (dataList, count) => {
                return {
                    dataList:(dataList && dataList.length > 0) ? dataList : [],
                    totalItems: (count && count.length > 0 && count[0].total_items) ? count[0].total_items : 0,
                    currentPage:pagerOpts.page
                };
            });
    };

    _p.getRoleDetailObj = (req, queryOpts, user_id) => {
        return req.db.collection('IAMCustomRoles').aggregate([
            {
                $match: queryOpts
            },
            {
                $project: {
                    _id: 1,
                    role_name: 1,
                    role_description: 1,
                    user_specific_actions: {
                        $filter: {
                            input: "$user_specific_actions",
                            as: "user_specific_actions",
                            cond: {
                                $eq: [ "$$user_specific_actions.user_id", user_id ]
                            }
                        }
                    }
                }
            },
            {
                $unwind: "$user_specific_actions"
            }

        ]).toArray();
    };

    _p.getAllIAMUserRoleDetailInfo = async (req, next) => {
        const arrData = await _p.getRoleDetailObj(req, {
            _id: req.params.roleId
        }, commonHelper.getLoggedInUserId(req).toString());
        return (arrData && arrData.length > 0) ? arrData[0] : {};
    };

    _p.getRoleDetailInfoWithActionData = async (req, role_name, parent_id, next) => {
        const arrData = await req.db.collection('IAMCustomRoles').aggregate([
            {
                $match: {
                    role_name: role_name,
                    deleted: false
                }
            },
            {
                $project: {
                    _id: 0,
                    user_specific_actions: {
                        $filter: {
                            input: "$user_specific_actions",
                            as: "user_specific_actions",
                            cond: {
                                $eq: [ "$$user_specific_actions.user_id", parent_id.toString() ]
                            }
                        }
                    }
                }
            },
            {
                $unwind: "$user_specific_actions"
            },
            {
                $unwind: "$user_specific_actions.actions"
            },
            {$group:{
                _id: '$user_specific_actions.actions'
            }},
            {
                $project: {
                    _id:0,
                    action_policy_rules: '$_id'
                }
            },
            {
                $lookup: {
                    from: 'IAMGroups',
                    localField: 'action_policy_rules',
                    foreignField: 'allowed_actions.action_title',
                    as: 'actionsData'
                }
            },
            {
                $match: {
                    "actionsData.deleted": false
                }
            },
            {
                $unwind: '$actionsData'
            },
            {
                $project: {
                    actionsData:1
                }
            },
            {$group:{
                _id: '$actionsData.allowed_actions'
            }},
            {$group:{
                _id: '$_id.policies'
            }},
            {$group:{
                _id: `$_id.${commonHelper.getLoggedInUserRole(req)}`
            }},
            {
                $unwind: '$_id'
            },
            {
                $redact: {
                    $cond: {
                        if: {$gt: [{$size: "$_id"}, 0]},
                        then: "$$KEEP",
                        else: "$$PRUNE"
                    }
                }
            },
            {
                $unwind: '$_id'
            },
            {$group:{
                _id: '$_id'
            }},
            {
                $lookup: {
                    from: 'IAMPolicies',
                    localField: '_id',
                    foreignField: 'policy_rules.policy_rule_title',
                    as: 'rulesData'
                }
            },
            {
                $match: {
                    "rulesData.deleted": false
                }
            },
            {
                $project: {
                    _id: 1,
                    "rulesData.policy_rules": 1
                }
            }
        ]).toArray();
        const rulesArr = [];
        let arrIndex = 0;
        (arrData && arrData.length > 0) ? arrData.forEach((item, index)=> {
            if(item && item.rulesData && item.rulesData.length>0) {
                arrIndex = utilityHelper.getIndexOfObject(item.rulesData[0].policy_rules, 'policy_rule_title', item._id, next);
                rulesArr.push(item.rulesData[0].policy_rules[arrIndex]);
            }
        }): [];
        return rulesArr;
    };

    _p.handleActionDetailUpdate = async (req, res, modelInfo, next) => {
        const dataRes = await _p.saveHelperFunc(req, res, modelInfo);
        if(dataRes.data) {
            const role_policies_detail = await _p.getRolePoliciesData(req, modelInfo, next);
            const updateRes = await req.db.collection('IAMCustomRoles').updateOne({
                "_id": dataRes.data._id,
                "user_specific_actions._id": dataRes.data.user_specific_actions._id
            }, {
                $set: {
                    "user_specific_actions.$.policies_detail": [...role_policies_detail]
                }
            });
        }

        return dataRes;
    };

    _p.registerIAMUserRole = async (req, res, next) => {
        try {
            const errors = await _p.checkValidationErrors(req);
            if (errors && errors.length > 0) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.BAD_REQUEST,
                    message: errorHelper.sendFormattedErrorData(errors)
                });
            } else {
                if(req.body.role_actions && req.body.role_actions.length > 0) {
                    if(!utilityHelper.containsElementInArr([roleConfig.enduser, roleConfig.independent_marketing_partner, roleConfig.vendor, roleConfig.superadmin], req.body.role_name, next)) {
                        const modelInfo = utilityHelper.sanitizeUserInput(req, next);
                        const dataRes = await _p.handleActionDetailUpdate(req, res, modelInfo, next);
                        return dataRes.data ? commonHelper.sendDataManipulationMessage(res, dataRes.data, dataRes.message, HTTPStatus.OK) :  commonHelper.sendResponseData(res, {
                            status: dataRes.status,
                            message: dataRes.message
                        });
                    } else {
                        return commonHelper.sendResponseData(res, {
                            status: HTTPStatus.BAD_REQUEST,
                            message: moduleConfig.message.roleConfilctSystem
                        });
                    }
                } else {
                    return commonHelper.sendResponseData(res, {
                        status: HTTPStatus.BAD_REQUEST,
                        message: moduleConfig.message.selectRoleActions
                    });
                }
            }
        } catch (err) {
            return next(err);
        }
    };

    _p.getRolePoliciesData = async (req, modelInfo, next) => {
        const policiesArr = await _p.getRoleDetailInfoWithActionData(req, modelInfo.role_name, commonHelper.getLoggedInUserId(req), next);
        // const formattedDataArr = policiesArr.filter((item) => req.body.role_actions.includes(item.policy_rule_title));
        return policiesArr.map((item) => ({
            "policy_rule_title" : item.policy_rule_title,
            "policy_rule" : item.policy_rule,
            "policy_rule_http_access" : item.policy_rule_http_access
        }));
    };

    _p.saveHelperFunc = async (req, res, modelInfo) => {
        const customRoleObj = await req.db.collection('IAMCustomRoles').findOne({ role_name: modelInfo.role_name, deleted: false });
        if(customRoleObj && Object.keys(customRoleObj).length > 0) {
            const userDataCount = await req.db.collection('IAMCustomRoles').estimatedDocumentCount({
                "_id": customRoleObj._id,
                "user_specific_actions.user_id": commonHelper.getLoggedInUserId(req).toString()
            });
            if(userDataCount > 0) {
                return Promise.resolve({
                    message: moduleConfig.message.alreadyExistsRoleName,
                    status: HTTPStatus.CONFLICT,
                });
            } else {
                const updateObj = {
                    _id: uuidv1(),
                    actions: [...req.body.role_actions],
                    role_description: modelInfo.role_description,
                    user_id: commonHelper.getLoggedInUserId(req).toString(),
                    added_by: commonHelper.getLoggedInUser(req),
                    updated_on: new Date(),
                    added_on: new Date()
                };
                const updateRes = await req.db.collection('IAMCustomRoles').updateOne({ "_id": customRoleObj._id }, {
                    $push: {
                        user_specific_actions: updateObj
                    }
                });
                return Promise.resolve({
                    message: moduleConfig.message.saveMessageRole,
                    data: {
                        "_id": customRoleObj._id,
                        "role_name": customRoleObj.role_name,
                        "role_description": customRoleObj.role_description,
                        "added_on": customRoleObj.added_on,
                        "user_specific_actions": {...updateObj}
                    },
                    result: updateRes.result.n
                });
            }
        } else {
            const newCustomRole = {
                _id: uuidv1(),
                role_name: modelInfo.role_name,
                added_by: commonHelper.getLoggedInUser(req),
                added_on: new Date(),
                deleted: false
            };
            newCustomRole.user_specific_actions = [
                {
                    _id: uuidv1(),
                    actions: [...req.body.role_actions],
                    role_description: modelInfo.role_description,
                    user_id: commonHelper.getLoggedInUserId(req).toString(),
                    added_by: commonHelper.getLoggedInUser(req),
                    updated_on: new Date(),
                    added_on: new Date()
                }
            ];

            const dataRes = await req.db.collection('IAMCustomRoles').insertOne(newCustomRole);
            return Promise.resolve({
                message: moduleConfig.message.saveMessageRole,
                data: {
                    "_id": newCustomRole._id,
                    "role_name": modelInfo.role_name,
                    "role_description": modelInfo.role_description,
                    "added_on": newCustomRole.added_on,
                    "user_specific_actions": {...newCustomRole.user_specific_actions[0]}
                },
                result: dataRes.result.n
            });
        }
    };


    _p.updateIAMUserRole = async (req, res, next) => {
        try {
            const errors = await _p.checkValidationErrors(req);
            if (errors && errors.length > 0) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.BAD_REQUEST,
                    message: errorHelper.sendFormattedErrorData(errors)
                });
            } else {
                if(req.body.role_actions && req.body.role_actions.length > 0) {
                    if(!utilityHelper.containsElementInArr([roleConfig.enduser, roleConfig.independent_marketing_partner, roleConfig.vendor, roleConfig.superadmin], req.body.role_name, next)) {
                        const modelInfo = utilityHelper.sanitizeUserInput(req, next);
                        const customRoleObj = await req.db.collection('IAMCustomRoles').findOne({ _id: req.params.roleId, deleted: false });
                        if(customRoleObj && Object.keys(customRoleObj).length > 0) {
                            if(customRoleObj.role_name.toLowerCase()!==modelInfo.role_name.trim().toLowerCase()) {
                                const deleteRes = await req.db.collection('IAMCustomRoles').updateOne({ "_id": req.params.roleId }, {
                                    $pull: {
                                        user_specific_actions: {
                                            user_id: commonHelper.getLoggedInUserId(req).toString()
                                        }
                                    }
                                });
                                if(deleteRes.result.n > 0) {
                                    const dataRes = await _p.handleActionDetailUpdate(req, res, modelInfo, next);
                                    return dataRes.data ? commonHelper.sendDataManipulationMessage(res, dataRes.data, dataRes.message, HTTPStatus.OK) :  commonHelper.sendResponseData(res, {
                                        status: dataRes.status,
                                        message: dataRes.message
                                    });
                                }
                                return commonHelper.sendResponseData(res, {
                                    status: HTTPStatus.NOT_MODIFIED,
                                    message: moduleConfig.message.dataNotModified
                                });
                            } else {
                                const role_policies_detail = await _p.getRolePoliciesData(req, modelInfo, next);
                                const updateRes = await req.db.collection('IAMCustomRoles').updateOne({
                                    "_id": req.params.roleId,
                                    "user_specific_actions.user_id": commonHelper.getLoggedInUserId(req).toString() }, {
                                    $set: {
                                        "user_specific_actions.$.actions": [...req.body.role_actions],
                                        "user_specific_actions.$.role_description": modelInfo.role_description,
                                        "user_specific_actions.$.updated_on": new Date(),
                                        "user_specific_actions.$.updated_by": commonHelper.getLoggedInUser(req),
                                        "user_specific_actions.$.policies_detail": [...role_policies_detail]
                                    }
                                });
                                return commonHelper.sendResponseMessage(res, updateRes, {
                                    "_id": req.params.roleId,
                                    "role_name": customRoleObj.role_name,
                                    "role_description": modelInfo.role_description,
                                    "user_specific_actions": {
                                        actions: [...req.body.role_actions],
                                        role_description: modelInfo.role_description,
                                        user_id: commonHelper.getLoggedInUserId(req).toString(),
                                    }
                                }, moduleConfig.message.updateMessageRole);
                            }
                        } else {
                            return commonHelper.sendResponseData(res, {
                                status: HTTPStatus.BAD_REQUEST,
                                message: moduleConfig.message.roleNotExists
                            });
                        }
                    } else {
                        return commonHelper.sendResponseData(res, {
                            status: HTTPStatus.BAD_REQUEST,
                            message: moduleConfig.message.roleConfilctSystem
                        });
                    }
                } else {
                    return commonHelper.sendResponseData(res, {
                        status: HTTPStatus.BAD_REQUEST,
                        message: moduleConfig.message.selectRoleActions
                    });
                }
            }
        } catch (err) {
            return next(err);
        }
    };

    _p.deleteIAMUserRole = async (req, res, next) => {
        try {
            const deleteRes = await req.db.collection('IAMCustomRoles').updateOne({ "_id": req.params.roleId }, {
                $pull: {
                    user_specific_actions: {
                        user_id: commonHelper.getLoggedInUserId(req).toString()
                    }
                }
            });
            return commonHelper.sendResponseMessage(res, deleteRes, {
                "_id": req.params.roleId
            }, moduleConfig.message.deleteMessageRole);
        } catch (err) {
            return next(err);
        }
    };



    _p.getAttachedActionsWithGroupByRole = async (req, role_name, parent_id, next) => {
        const arrData = await req.db.collection('IAMCustomRoles').aggregate([
            {
                $match: {
                    role_name: role_name,
                    deleted: false
                }
            },
            {
                $project: {
                    _id: 0,
                    user_specific_actions: {
                        $filter: {
                            input: "$user_specific_actions",
                            as: "user_specific_actions",
                            cond: {
                                $eq: [ "$$user_specific_actions.user_id", parent_id.toString() ]
                            }
                        }
                    }
                }
            },
            {
                $unwind: "$user_specific_actions"
            },
            {
                $unwind: "$user_specific_actions.actions"
            },
            {$group:{
                _id: '$user_specific_actions.actions'
            }},
            {
                $project: {
                    _id:0,
                    action_policy_rules: '$_id'
                }
            },
            {
                $lookup: {
                    from: 'IAMGroups',
                    localField: 'action_policy_rules',
                    foreignField: 'allowed_actions.action_title',
                    as: 'actionsData'
                }
            },
            {
                $match: {
                    "actionsData.deleted": false
                }
            },
            {
                $unwind: '$actionsData'
            },
            {$group:{
                _id: '$action_policy_rules',
                data: { $push: "$actionsData" }
            }},
            {
                $project: {
                    _id:0,
                    action_policy_rules: '$_id',
                    data: {
                        _id: 1,
                        group_title: 1,
                        allowed_actions: 1,
                    }
                }
            }
        ]).toArray();
        const rulesArr = [];
        let arrIndex = 0;
        const groupArr = [];
        (arrData && arrData.length > 0) ? arrData.forEach((item, index)=> {
            if(item && item.data && item.data.length>0) {
                arrIndex = utilityHelper.getIndexOfObject(item.data[0].allowed_actions, 'action_title', item.action_policy_rules, next);
                if(groupArr.includes(item.data[0].group_title)) {

                    const index = groupArr.indexOf(item.data[0].group_title);
                    rulesArr[index].allowed_actions.push({
                        _id: item.data[0].allowed_actions[arrIndex]._id,
                        action_title: item.data[0].allowed_actions[arrIndex].action_title,
                    });
                } else {
                    groupArr.push(item.data[0].group_title);
                    rulesArr.push({
                        _id: item.data[0]._id,
                        group_title: item.data[0].group_title,
                        allowed_actions: [{
                            _id: item.data[0].allowed_actions[arrIndex]._id,
                            action_title: item.data[0].allowed_actions[arrIndex].action_title,
                        }]
                    });
                }
            }
        }): [];
        return rulesArr;
    };

    return {
        getAllIAMUserRoles: _p.getAllIAMUserRoles,
        getAllIAMUserRoleDetailInfo: _p.getAllIAMUserRoleDetailInfo,
        getRoleDetailInfoWithActionData: _p.getRoleDetailInfoWithActionData,
        registerIAMUserRole: _p.registerIAMUserRole,
        updateIAMUserRole: _p.updateIAMUserRole,
        deleteIAMUserRole: _p.deleteIAMUserRole,
        getRoleDetailObj: _p.getRoleDetailObj,
        getAttachedActionsWithGroupByRole: _p.getAttachedActionsWithGroupByRole
    };

})();

module.exports = iamRolesController;
