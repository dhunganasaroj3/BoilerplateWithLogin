/**
 * Created by lakhe on 12/11/17.
 */
const iamRoutes = (() => {
    'use strict';

    const HTTPStatus = require('http-status');
    const express = require('express');
    const iamRouter = express.Router();
    const moduleConfig = require('./identity-access-management.config');
    const iamUserController = require('./identity-access-management-user.controller');
    const iamRoleController = require('./identity-access-management-roles.controller');
    const iamGroupController = require('./identity-access-management-action-group.controller');
    const iamPolicyController = require('./identity-access-management-policy.controller');
    const commonHelper = require('../../common/common-helper-function');
    const roleAuthMiddleware = require('../../middlewares/role-authorization.middleware');

    //method declaration to return user list to the client, if exists, else return not found message
    const getIAMUsers = async (req, res, next) => {
        try {
            const iamUserList = await iamUserController.getAllIAMUsers(req, next);

            return commonHelper.sendJsonResponse(res, iamUserList, moduleConfig.message.notFoundUser, HTTPStatus.OK);
        } catch (err) {
            return next(err);
        }
    };

    const getIAMRoles = async (req, res, next) => {
        try {
            const iamRolesList = await iamRoleController.getAllIAMUserRoles(req, next);
            return commonHelper.sendJsonResponse(res, iamRolesList, moduleConfig.message.notFoundRole, HTTPStatus.OK);
        } catch (err) {
            return next(err);
        }
    };

    const getIAMRoleDetailInfo = async (req, res, next) => {
        try {
            const iamRolesDetailObj = await iamRoleController.getAllIAMUserRoleDetailInfo(req, next);
            return commonHelper.sendJsonResponse(res, iamRolesDetailObj, moduleConfig.message.notFoundRole, HTTPStatus.OK);
        } catch (err) {
            return next(err);
        }
    };

    const getIAMPolicies = async (req, res, next) => {
        try {
            const iamPolicyList = await iamPolicyController.getAllIAMPolicies(req, next);
            return commonHelper.sendJsonResponse(res, iamPolicyList, moduleConfig.message.notFoundPolicy, HTTPStatus.OK);
        } catch (err) {
            return next(err);
        }
    };

    const getPolicyRuleDetailInfo = async (req, res, next) => {
        try {
            const iamPolicyRuleList = await iamPolicyController.getPolicyRuleDetailInfo(req, next);
            return commonHelper.sendJsonResponse(res, iamPolicyRuleList, moduleConfig.message.notFoundPolicyRule, HTTPStatus.OK);
        } catch (err) {
            return next(err);
        }
    };

    const getPolicyDetailInfo = async (req, res, next) => {
        try {
            const iamPolicyObj = await iamPolicyController.getPolicyDetailInfo(req);
            return commonHelper.sendJsonResponse(res, iamPolicyObj, moduleConfig.message.notFoundPolicy, HTTPStatus.OK);
        } catch (err) {
            return next(err);
        }
    };

    const getPolicyRulesList = async (req, res, next) => {
        try {
            const lstIAMPolicyRules = await iamPolicyController.getPolicyRulesList(req);
            return commonHelper.sendJsonResponse(res, lstIAMPolicyRules, moduleConfig.message.notFoundPolicyRule, HTTPStatus.OK);
        } catch (err) {
            return next(err);
        }
    };

    const getIAMGroupDetailInfo = async (req, res, next) => {
        try {
            const iamGroupObj = await iamGroupController.getGroupDetailInfo(req);
            return commonHelper.sendJsonResponse(res, iamGroupObj, moduleConfig.message.notFoundGroup, HTTPStatus.OK);
        } catch (err) {
            return next(err);
        }
    };

    const getIAMGroupsList = async (req, res, next) => {
        try {
            const lstIAMGroups = await iamGroupController.getAllIAMGroups(req);
            return commonHelper.sendJsonResponse(res, lstIAMGroups, moduleConfig.message.notFoundGroup, HTTPStatus.OK);
        } catch (err) {
            return next(err);
        }
    };

    const getActionListRoleWise = async (req, res, next) => {
        try {
            const lstGroupActionsRoleWise = await iamGroupController.getActionListRoleWise(req, {
                "deleted": false
            }, req.params.user_role, {
                _id: 1,
                group_title: 1,
                group_description: 1,
                added_on: 1,
            }, true);
            return commonHelper.sendJsonResponse(res, lstGroupActionsRoleWise, moduleConfig.message.notFoundAction, HTTPStatus.OK);
        } catch (err) {
            return next(err);
        }
    };

    const getActionsList = async (req, res, next) => {
        try {
            const lstGroupActions = await iamGroupController.getActionsList(req);
            return commonHelper.sendJsonResponse(res, lstGroupActions, moduleConfig.message.notFoundAction, HTTPStatus.OK);
        } catch (err) {
            return next(err);
        }
    };

    const getActionDetailInfo = async (req, res, next) => {
        try {
            const actionDetailObj = await iamGroupController.getActionDetailInfo(req);
            return commonHelper.sendJsonResponse(res, actionDetailObj, moduleConfig.message.notFoundAction, HTTPStatus.OK);
        } catch (err) {
            return next(err);
        }
    };

    iamRouter.route('/user')
        .get( roleAuthMiddleware.authorize, getIAMUsers)
        .post( roleAuthMiddleware.authorize, iamUserController.registerIAMUser);

    iamRouter.route('/user/:userId')
        .put( roleAuthMiddleware.authorize, iamUserController.updateIAMUser);


    iamRouter.route('/role')
        .get( roleAuthMiddleware.authorize, getIAMRoles)
        .post( roleAuthMiddleware.authorize, iamRoleController.registerIAMUserRole);

    iamRouter.route('/role/:roleId')
        .get( roleAuthMiddleware.authorize, getIAMRoleDetailInfo)
        .put( roleAuthMiddleware.authorize, iamRoleController.updateIAMUserRole)
        .patch( roleAuthMiddleware.authorize, iamRoleController.deleteIAMUserRole);

    iamRouter.route('/group')
        .get( roleAuthMiddleware.authorize, getIAMGroupsList)
        .post( roleAuthMiddleware.authorize, iamGroupController.createIAMGroup);

    iamRouter.route('/group-list-actions/:user_role')
        .get( roleAuthMiddleware.authorize, getActionListRoleWise)

    iamRouter.route('/group/:groupId')
        .get( roleAuthMiddleware.authorize, getIAMGroupDetailInfo)
        .patch( roleAuthMiddleware.authorize, iamGroupController.removeIAMGroup)
        .put( roleAuthMiddleware.authorize, iamGroupController.updateIAMGroup);

    iamRouter.route('/group-actions/:groupId')
        .get( roleAuthMiddleware.authorize, getActionsList)
        .put( roleAuthMiddleware.authorize, iamGroupController.createActions);

    iamRouter.route('/group-actions/:groupId/:actionId')
        .get( roleAuthMiddleware.authorize, getActionDetailInfo)
        .patch( roleAuthMiddleware.authorize, iamGroupController.removeAction)
        .put( roleAuthMiddleware.authorize, iamGroupController.updateActions);

    iamRouter.route('/policy')
        .get( roleAuthMiddleware.authorize, getIAMPolicies)
        .post( roleAuthMiddleware.authorize, iamPolicyController.registerIAMPolicy);

    iamRouter.route('/policy/:policyRuleId')
        .get( roleAuthMiddleware.authorize, getPolicyDetailInfo)
        .put( roleAuthMiddleware.authorize, iamPolicyController.updateIAMPolicy);

    iamRouter.route('/policy-rule/:policyRuleId')
        .get( roleAuthMiddleware.authorize, getPolicyRulesList)
        .put( roleAuthMiddleware.authorize, iamPolicyController.attachPolicyRules);

    iamRouter.route('/policy-rule/:policyRuleId/:ruleId')
        .get(roleAuthMiddleware.authorize, getPolicyRuleDetailInfo)
        .patch( roleAuthMiddleware.authorize, iamPolicyController.removePolicyRule)
        .put( roleAuthMiddleware.authorize, iamPolicyController.updatePolicyRule);

    return iamRouter;

})();

module.exports = iamRoutes;
