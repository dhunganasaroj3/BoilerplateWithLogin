/**
 * Created by lakhe on 12/11/17.
 */
const iamActionGroupController = (() => {
    'use strict';

    const HTTPStatus = require('http-status');
    const moduleConfig = require('./identity-access-management.config');
    const utilityHelper = require('../../helpers/utilities.helper');
    const errorHelper = require('../../helpers/error.helper');
    const uuidv1 = require('uuid/v1');
    const commonHelper = require('../../common/common-helper-function');
    const commonProvider = require('../../common/common-provider-function');
    const Promise = require('bluebird');
    const roleConfig = require('../../configs/role.config');
    const documentFields = 'group_title group_description';
    const projectionFields = {
        '_id': 1,
        'group_title': 1,
        'group_description': 1,
        'allowed_actions': 1
    };

    function iamActionGroupModule() {}

    const _p = iamActionGroupModule.prototype;

    _p.checkValidationErrors = async (req) => {
        req.checkBody('group_title', moduleConfig.message.validationErrMessage.group_title).notEmpty();
        req.checkBody('group_description', moduleConfig.message.validationErrMessage.group_description).notEmpty();
        const result = await req.getValidationResult();
        return result.array();
    };

    _p.checkActionsValidationErrors = async (req) => {
        req.checkBody('action_title', moduleConfig.message.validationErrMessage.action_title).notEmpty();
        req.checkBody('action_description', moduleConfig.message.validationErrMessage.action_description).notEmpty();
        req.checkBody('attached_policies', moduleConfig.message.validationErrMessage.attached_policies).notEmpty();
        const result = await req.getValidationResult();
        return result.array();
    };

    _p.getAllIAMGroups = (req, next) => {
        const pagerOpts = utilityHelper.getPaginationOpts(req, next);
        let queryOpts = {};

        if (req.query.group_title) {
            queryOpts.group_title = {$regex: new RegExp('.*' + req.query.group_title, "i")}
        }
        queryOpts.deleted = false;
        const sortOpts = { added_on: -1 };
        return commonProvider.getPaginatedDataList(req.db.collection('IAMGroups'), queryOpts, pagerOpts, projectionFields, sortOpts);
    };

    _p.getGroupDetailInfo = (req) => {
        return req.db.collection('IAMGroups').findOne({_id: req.params.groupId, deleted: false}, {
            projection: {
                '_id': 1,
                'group_title': 1,
                'group_description': 1,
            }
        });
    };

    _p.createIAMGroup = async (req, res, next) => {
        try {
            const errors = await _p.checkValidationErrors(req);
            if (errors && errors.length > 0) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.BAD_REQUEST,
                    message: errorHelper.sendFormattedErrorData(errors)
                });
            } else {
                const modelInfo = utilityHelper.sanitizeUserInput(req, next);
                const count = await req.db.collection('IAMGroups').estimatedDocumentCount({
                    group_title: modelInfo.group_title,
                    deleted: false
                });
                if(count > 0) {
                    return commonHelper.sendResponseData(res, {
                        status: HTTPStatus.CONFLICT,
                        message: moduleConfig.message.groupAlreadyExists
                    });
                } else {
                    const newGroup = commonHelper.collectFormFields(req, modelInfo, documentFields, undefined);
                    newGroup['allowed_actions'] = [];
                    const dataRes = await req.db.collection('IAMGroups').insertOne(newGroup);
                    return commonHelper.sendResponseMessage(res, dataRes, newGroup, moduleConfig.message.saveMessageGroup);
                }
            }
        } catch (err) {
            return next(err);
        }
    };

    _p.updateIAMGroup = async (req, res, next) => {
        try {
            const errors = await _p.checkValidationErrors(req);
            if (errors && errors.length > 0) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.BAD_REQUEST,
                    message: errorHelper.sendFormattedErrorData(errors)
                });
            } else {
                const modelInfo = utilityHelper.sanitizeUserInput(req, next);
                const groupObj = await req.db.collection('IAMGroups').findOne({ _id: req.params.groupId, deleted: false });
                if(groupObj && Object.keys(groupObj).length > 0) {
                    if (groupObj.group_title !== modelInfo.group_title) {
                        const count = await req.db.collection('IAMGroups').estimatedDocumentCount({
                            group_title: modelInfo.group_title,
                            deleted: false
                        });
                        if(count > 0) {
                            return commonHelper.sendResponseData(res, {
                                status: HTTPStatus.CONFLICT,
                                message: moduleConfig.message.groupAlreadyExists
                            });
                        } else {
                            const returnData = await _p.groupHelperFunc(req, modelInfo);
                            return commonHelper.sendResponseMessage(res, returnData.updateRes, {
                                ...returnData.dataObj
                            }, moduleConfig.message.updateMessageGroup);
                        }
                    } else {
                        const returnData = await _p.groupHelperFunc(req, modelInfo);
                        return commonHelper.sendResponseMessage(res, returnData.updateRes, {
                            ...returnData.dataObj
                        }, moduleConfig.message.updateMessageGroup);
                    }
                } else {
                    return commonHelper.sendResponseData(res, {
                        status: HTTPStatus.BAD_REQUEST,
                        message: moduleConfig.message.groupNotExists
                    });
                }
            }
        } catch (err) {
            return next(err);
        }
    };

    _p.groupHelperFunc = async (req, modelInfo) => {
        const dataObj = {
            'group_title': modelInfo.group_title,
            'group_description': modelInfo.group_description,
            "updated_by": commonHelper.getLoggedInUser(req),
            "updated_on": new Date()
        };
        const updateRes = await req.db.collection('IAMGroups').updateOne({
            "_id": req.params.groupId },
            {$set: {
                "group_title": dataObj.group_title,
                "group_description": dataObj.group_description,
                "updated_by": dataObj.updated_by,
                "updated_on": dataObj.updated_on
            }
        });
        return Promise.resolve({
            updateRes: updateRes,
            dataObj: dataObj
        });
    };

    _p.removeIAMGroup = async (req, res, next) => {
        try {
            const deleteRes = await req.db.collection('IAMGroups').updateOne({ "_id": req.params.groupId }, {
                $set: {
                    'deleted': true,
                    'deleted_on': new Date(),
                    'deleted_by': commonHelper.getLoggedInUser(req)
                }
            });
            return commonHelper.sendResponseMessage(res, deleteRes, {
                "_id": req.params.groupId
            }, moduleConfig.message.deleteIAMGroup);
        } catch (err) {
            return next(err);
        }
    };


    _p.createActions = async (req, res, next) => {
        try {
            const errors = await _p.checkActionsValidationErrors(req);
            if (errors && errors.length > 0) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.BAD_REQUEST,
                    message: errorHelper.sendFormattedErrorData(errors)
                });
            } else {
                if(req.body.attached_policies && req.body.attached_policies.length > 0) {
                    const modelInfo = utilityHelper.sanitizeUserInput(req, next);
                    const count = await req.db.collection('IAMGroups').estimatedDocumentCount({
                        _id: req.params.groupId,
                        allowed_actions: {
                            $elemMatch: { action_title: modelInfo.action_title }
                        }
                    });
                    if(count > 0) {
                        return commonHelper.sendResponseData(res, {
                            status: HTTPStatus.BAD_REQUEST,
                            message: moduleConfig.message.actionAlreadyExists
                        });
                    } else {
                        const actionDataObj = {
                            _id: uuidv1(),
                            action_title: modelInfo.action_title,
                            action_description: modelInfo.action_description,
                            policies: {
                                [roleConfig.superadmin]: [],
                                [roleConfig.vendor]: [],
                                [roleConfig.independent_marketing_partner]: []
                            },
                            deleted: false,
                            added_by: commonHelper.getLoggedInUser(req),
                            added_on: new Date()
                        };
                        const attachedPolicies = await _p.createActionHelperFunc(req, res, modelInfo);
                        const updateOpts = attachedPolicies.map((item) => {
                            return  {
                                [item.user_role]: item.policies
                            }
                        });
                        updateOpts.forEach((item, index) => {
                            const keys = Object.keys(item)
                            actionDataObj.policies[keys[0]] = item[keys[0]];
                        });
                        // actionDataObj['policies'] = updateOpts;
                        const updateRes = await req.db.collection('IAMGroups').updateOne({ "_id": req.params.groupId }, {
                            $push: {
                                allowed_actions: actionDataObj
                            }
                        });
                        return commonHelper.sendResponseMessage(res, updateRes, actionDataObj, moduleConfig.message.saveMessageAction);
                    }
                }else {
                    return commonHelper.sendResponseData(res, {
                        status: HTTPStatus.BAD_REQUEST,
                        message: moduleConfig.message.selectPolicyRules
                    });
                }
            }
        } catch (err) {
            return next(err);
        }
    };

    _p.createActionHelperFunc = async (req, res, modelInfo) => {
        const data = await _p.getFilteredAttachedPolicies(req, res, modelInfo);
        return Promise.resolve(data);
    };

    _p.getFilteredAttachedPolicies = async (req, res, modelInfo) => {
        let count = 0;
        let attachedPolicies = [];
        return new Promise((resolve, reject) => {
            req.body.attached_policies.forEach(async (item, index) => {

                if(count <= 0) {
                    attachedPolicies.push({
                        user_role: item.user_role,
                        policies: item.policies
                    });
                }
                if(index === (req.body.attached_policies.length - 1)) {
                    return resolve(attachedPolicies);
                }
            });
        });
    };

    _p.getActionListRoleWise = async (req, queryOpts, user_role, projectOpts = { _id: 0 }, include_all=false) => {
        return _p.getActionsHelperFunc(req, queryOpts, user_role, projectOpts, include_all);
    };

    _p.getActionsHelperFunc = async (req, queryOpts, user_role, projectOpts, include_all) => {
        const lstActions = await req.db.collection('IAMGroups').aggregate([
            {
                $match: queryOpts
            },
            {
                $project: {
                    ...projectOpts,
                    allowed_actions: {
                        $filter: {
                            input: "$allowed_actions",
                            as: "allowed_actions",
                            cond: {
                                $and: [
                                    {$eq: ["$$allowed_actions.deleted", false]},
                                    {$gt: [{ $size: `$$allowed_actions.policies.${user_role}` }, 0]}
                                ]
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    ...projectOpts,
                    "allowed_actions._id": 1,
                    "allowed_actions.action_title": 1,
                    "allowed_actions.action_description": 1,
                    "allowed_actions.added_by": 1,
                    "allowed_actions.added_on": 1,
                    [`allowed_actions.policies.${user_role}`]: 1
                }
            }
        ]).toArray()
        if(include_all) {
            return (lstActions && lstActions.length > 0) ? lstActions : [];
        } else {
            return (lstActions && lstActions.length > 0 && lstActions[0].allowed_actions) ? lstActions[0].allowed_actions : [];
        }
    };

    _p.getActionsList = async (req) => {
        if(!req.query.user_role) {
            const lstActions = await req.db.collection('IAMGroups').aggregate([
                {
                    $match: {
                        "_id": req.params.groupId
                    }
                },
                {
                    $project: {
                        _id: 0,
                        allowed_actions: {
                            $filter: {
                                input: "$allowed_actions",
                                as: "allowed_actions",
                                cond: {
                                    $eq: [ "$$allowed_actions.deleted", false ]
                                }
                            }
                        }
                    }
                }
            ]).toArray();
            return (lstActions && lstActions.length > 0 && lstActions[0].allowed_actions) ? lstActions[0].allowed_actions : [];
        } else {
            return _p.getActionListRoleWise(req, {
                "_id": req.params.groupId,
                "deleted": false
            }, req.query.user_role);
        }

    };

    _p.getActionDetailInfo = async (req) => {
        const arrData = await req.db.collection('IAMGroups').aggregate([
            {
                $match: {
                    "_id": req.params.groupId
                }
            },
            {
                $project: {
                    _id: 0,
                    allowed_actions: {
                        $filter: {
                            input: '$allowed_actions',
                            as: "allowed_actions",
                            cond: {
                                $eq: [ "$$allowed_actions._id", req.params.actionId ]
                            }
                        }
                    }
                }
            }

        ]).toArray();
        return (arrData && arrData.length > 0 && arrData[0].allowed_actions && arrData[0].allowed_actions.length > 0) ? arrData[0].allowed_actions[0] : {};
    };

    _p.updateActions = async (req, res, next) => {
        try {
            const errors = await _p.checkActionsValidationErrors(req);
            if (errors && errors.length > 0) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.BAD_REQUEST,
                    message: errorHelper.sendFormattedErrorData(errors)
                });
            } else {
                if(req.body.attached_policies && req.body.attached_policies.length > 0) {
                    const modelInfo = utilityHelper.sanitizeUserInput(req, next);
                    const actionDetailObj = await _p.getActionDetailInfo(req);
                    if ((actionDetailObj && Object.keys(actionDetailObj).length > 0) && actionDetailObj.action_title.toLowerCase() === modelInfo.action_title.trim().toLowerCase()) {
                        const updateActionObj = await _p.updateHelperFunc(req, res, modelInfo);
                        return commonHelper.sendResponseMessage(res, updateActionObj.updateRes, updateActionObj.attachObj, moduleConfig.message.updateMessageAction);
                    } else {
                        const count = await req.db.collection('IAMGroups').estimatedDocumentCount({
                            _id: req.params.groupId,
                            [req.params.role]: {
                                $elemMatch: {
                                    action_title: modelInfo.action_title
                                }
                            }
                        });
                        if (count > 0) {
                            return commonHelper.sendResponseData(res, {
                                status: HTTPStatus.CONFLICT,
                                message: moduleConfig.message.actionAlreadyExists
                            });
                        } else {
                            const updateActionObj = await _p.updateHelperFunc(req, res, modelInfo);
                            return commonHelper.sendResponseMessage(res, updateActionObj.updateRes, updateActionObj.attachObj, moduleConfig.message.updateMessageAction);
                        }
                    }
                } else {
                    return commonHelper.sendResponseData(res, {
                        status: HTTPStatus.BAD_REQUEST,
                        message: moduleConfig.message.selectPolicyRules
                    });
                }
            }
        } catch (err) {
            return next(err);
        }
    };

    _p.updateHelperFunc = async (req, res, modelInfo) => {

        const attachObj = {
            action_title: modelInfo.action_title,
            action_description: modelInfo.action_description,
            policies: {
                [roleConfig.superadmin]: [],
                [roleConfig.vendor]: [],
                [roleConfig.independent_marketing_partner]: []
            }
        };
        const attachedPolicies = await _p.createActionHelperFunc(req, res, modelInfo);
        const updateOpts = attachedPolicies.map((item) => {
            return  {
                [item.user_role]: item.policies
            }
        });
        updateOpts.forEach((item, index) => {
            const keys = Object.keys(item)
            attachObj.policies[keys[0]] = item[keys[0]];
        });
        const updateRes = await req.db.collection('IAMGroups').updateOne({
            "_id": req.params.groupId,
            "allowed_actions._id": req.params.actionId
        }, {
            $set: {
                "allowed_actions.$.action_title": attachObj.action_title,
                "allowed_actions.$.action_description": attachObj.action_description,
                "allowed_actions.$.policies": attachObj.policies,
                "allowed_actions.$.updated_by": commonHelper.getLoggedInUser(req),
                "allowed_actions.$.updated_on": new Date()
            }
        })
        return Promise.resolve({
            updateRes: updateRes,
            attachObj: attachObj
        });
    };

    _p.removeAction = async (req, res, next) => {
        try {
            const deleteRes = await req.db.collection('IAMGroups').updateOne({ "_id": req.params.groupId }, {
                $pull: {
                    "allowed_actions": {
                        _id: req.params.actionId
                    }
                }
            });
            return commonHelper.sendResponseMessage(res, deleteRes, {
                "_id": req.params.groupId,
                "actionId": req.params.actionId
            }, moduleConfig.message.deleteMessageAction);
        } catch (err) {
            return next(err);
        }
    };

    return {
        getAllIAMGroups: _p.getAllIAMGroups,
        getGroupDetailInfo: _p.getGroupDetailInfo,
        createIAMGroup: _p.createIAMGroup,
        updateIAMGroup: _p.updateIAMGroup,
        removeIAMGroup: _p.removeIAMGroup,
        createActions: _p.createActions,
        getActionListRoleWise: _p.getActionListRoleWise,
        getActionsList: _p.getActionsList,
        getActionDetailInfo: _p.getActionDetailInfo,
        updateActions: _p.updateActions,
        removeAction: _p.removeAction
    };

})();

module.exports = iamActionGroupController;
