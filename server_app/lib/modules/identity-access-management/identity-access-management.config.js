/**
 * Created by lakhe on 12/11/17.
 */
(() => {
    "use strict";

    module.exports = {
        message: {
            saveMessageRole: "Role created successfully and policies are attached to it.",
            updateMessageRole: "Role updated successfully",
            updateMessagePolicy: "Policy information updated",
            deleteMessageRole: "Role deleted successfully",
            deleteMessagePolicyRule: "Policy rule deleted successfully",
            roleNotExists: "Specified role do not exist.",
            roleConfilctSystem: "Custom roles cannot be matched with system roles. ex: superadmin,imp,vendor,enduser",
            selectRolePolicies:"Please select policies to be attached with the role",
            selectRoleActions: "Please select actions for the roles",
            alreadyExistsRoleName: "User role already exists",
            notFoundUser: "Identity Access management user not found",
            notFoundRole: "Identity Access management user not found",
            notFoundPolicy: "Identity Access management policy not found",
            notFoundPolicyRule: "Policy rule not found",
            dataNotModified: "Database data not modified",
            policyRuleAlreadyExists: "Rule already exists",
            policyAlreadyExists: "Specified policy already exists",
            saveMessagePolicy: "Policy saved successfully",
            saveMessagePolicyRule: "Policy rule saved successfully",
            updateMessagePolicyRule: "Policy rule information updated",
            policyNotExists: "Specified policy doesn't exists",
            groupAlreadyExists: "Specified group already exists",
            saveMessageGroup: "IAM Group saved successfully",
            updateMessageGroup: "IAM Group information updated successfully",
            groupNotExists: "Specified group doesn't exists",
            deleteIAMGroup: "IAM group deleted successfully",
            notFoundGroup: "IAM Group not found",
            actionAlreadyExists: "Specified Action already exists for the group",
            saveMessageAction: "Action for the group saved successfully",
            notFoundAction:"No actions found for the specified group",
            updateMessageAction: "Action for the group information updated successfully",
            deleteMessageAction: "Action removed successfully",
            selectPolicyRules: "Please select policy rules for the action",
            validationErrMessage:{
                role_name : "Title of the role is required",
                role_description : "Role description is required",
                policy_title: "Title for policy is required",
                policy_description: "Description for policy is required",
                policy_rule_title: "Title is required for a rule",
                policy_rule: "Rule for the policy is required",
                policy_rule_http_access: "HTTP Access method is required",
                policy_rule_description: "Description is required for a rule",
                group_title: "Title for the action group is required",
                group_description: "Description is required for a action group",
                action_title: "Title for the action is required",
                action_description: "Description for the action is required",
                attached_policies: "Please attach policies to the action",
                user_roles: "Please provide value for user role",
                role_actions: "Please attach allowed actions to the role"
            }
        },
        config: {
            documentFilePath: '/private-uploads/user-profiles/',
            uploadPrefix: 'user-profile',
            commonPasswordFilePath: '/lib/static-data/10k_most_common.txt',
            mobile_token_length: 6
        },
        notifications: {
            welcome_message: "Welcome to the XcelTrip Travel Application. Best Travel Packages that no one can match."
        },
        push_notification: {
            title: {
                welcome_message: "Welcome to XcelTrip"
            }
        }
    };
})();
