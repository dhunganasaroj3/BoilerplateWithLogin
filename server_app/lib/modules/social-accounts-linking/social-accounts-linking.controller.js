/**
 * Created by lakhe on 9/18/17.
 */

const socialAccountLinkingController = (() => {
    'use strict';

    const HTTPStatus = require('http-status');
    const moduleConfig = require('./social-accounts-linking.config');
    const uuidv1 = require('uuid/v1');
    const commonHelper = require('../../common/common-helper-function');
    const thirdPartyApiRequesterHelper = require('../../helpers/third-party-api-request.helper');
    const userController = require('../user-profile/user-profile.controller');
    const loginController = require('../login-auth/login-auth.controller');
    const roleConfig = require('../../configs/role.config');
    const userModuleConfig = require('../user-profile/user-profile.config');
    const hasher = require('../../auth/hasher');
    const userConfig = require('../user-profile/user-profile.config');
    const jsSHA = require('jssha');
    const errorHelper = require('../../helpers/error.helper');
    const newsletterController = require('../newsletter/newsletter.controller');
    const userConfirmationConfig = require('../user-confirmation/user-confirmation.config');
    // const impConfig = require('../agent-registration/agent-registration.config');
    const utilityHelper = require('../../helpers/utilities.helper');
    const impStatus = require('../../configs/agent-status.config');
    // const impHelper = require('../agent-registration/imp-registration-helper');

    function SocialAccountLinkModule(){}

    const _p = SocialAccountLinkModule.prototype;

    _p.constructUserObject = (dataObj, email, verified_email, first_name, last_name, birthday) => {
        return {
            'first_name': first_name,
            'middle_name': '',
            'last_name': last_name,
            'email': email,
            'username': email,
            'phone_number': '',
            'country_code': '',
            'country_abbr': '',
            'mobile_number': '',
            'agree_terms_condition': false,
            'email_offer_subscription': false,
            'birth_date': birthday ? birthday : '',
            'gender': dataObj.gender ? dataObj.gender : '',
            'active': true,
            'user_role': [roleConfig.enduser],
            'image_name': '',
            'image_original_name': '',
            'multi_factor_auth_enable': false,
            'multi_factor_auth_enable_mobile': false,
            'security_question': '',
            'security_answer': '',
            'suspend': false,
            'blocked': false,
            'confirmed': verified_email,
            'deleted': false,
            'mobile_number_validated': false,
            'added_on': new Date(),
            'captcha_enable_ips': [],
            'linked_social_accounts': {},
            'password':'',
            'password_salt': '',
            'history_linked_social_accounts': []

        };
    };

    _p.collectParametersForOAuth = (oauth_nonce, oauth_timestamp, oauth_token) => {
        return `include_email=true&include_entities=true&oauth_consumer_key=${moduleConfig.oauthConfig.twitter.app_id}&oauth_nonce=${oauth_nonce}&oauth_signature_method=HMAC-SHA1&oauth_timestamp=${oauth_timestamp}&oauth_token=${oauth_token}&oauth_version=1.0`
    };

    _p.generateSignatureBaseString = (parameterString) => {
        return `GET&https%3A%2F%2Fapi.twitter.com%2F1.1%2Faccount%2Fverify_credentials.json&${parameterString}`;
    };

    _p.encodeParameterString = (parameterString) => {
        return parameterString.replace(/&/g, '%26').replace(/=/g, '%3D');
    };

    _p.getSigningKey = (access_token) => {
        return `${moduleConfig.oauthConfig.twitter.app_secret}&${access_token}`;
    };

    _p.getOAuthSignature = (string, secret) => {
        const shaObj = new jsSHA("SHA-1", "TEXT");
        shaObj.setHMACKey(secret, "TEXT");
        shaObj.update(string);
        const hmac = shaObj.getHMAC("B64");
        const encodedString = hmac.replace(/\//g, '%2F').replace(/=/g, '%3D');
        return encodedString;
    };

    _p.generateOAuthSignature = (oauth_nonce, oauth_timestamp, oauth_token) => {
        const parameterString = _p.collectParametersForOAuth(oauth_nonce, oauth_timestamp, oauth_token);
        const baseSignatureString = _p.generateSignatureBaseString(_p.encodeParameterString(parameterString));
        const signingKey = _p.getSigningKey(oauth_token);
        const oAuthSignature = _p.getOAuthSignature(baseSignatureString, signingKey);
        return oAuthSignature;
    };

    _p.requestSocialOAuthApiDataHelper = async (req, next, request_url, scope_permissions, type) => {
        try {
            if(req.params.access_token && req.params.access_token!==undefined) {
                const permissionsScope = (scope_permissions && scope_permissions.length > 0)
                    ?
                    scope_permissions.join(',') : '';
                if (request_url.indexOf("%access_token%") > -1) {
                    request_url = request_url.replace("%access_token%", req.params.access_token);
                }
                if (request_url.indexOf("%fields%") > -1) {
                    request_url = request_url.replace("%fields%", moduleConfig.config.linkedin_fields.join(','));
                }
                let headers = null;
                const randomToken = await hasher.generateRandomBytes(moduleConfig.config.twitterUniqueNonceLength);
                switch (type) {
                    case moduleConfig.config.account_types.FACEBOOK:
                        if (permissionsScope !== "") {
                            request_url += `&fields=${permissionsScope}&format=json&method=get&suppress_http_code=1`;
                        }
                        break;
                    case moduleConfig.config.account_types.GOOGLE:
                        if (permissionsScope !== "") {
                            request_url += `&scope=${permissionsScope}`;
                        }
                        break;
                    case moduleConfig.config.account_types.LINKEDIN:
                        if (permissionsScope !== "") {
                            request_url += `&scope=${permissionsScope}&format=json`;
                        }
                        // headers = {
                            // 'x-li-format': 'json',
                            // 'Authorization': `Bearer ${req.params.access_token}`
                        // };
                        break;
                    case moduleConfig.config.account_types.TWITTER:
                        if (permissionsScope !== "") {
                            request_url += `&scope=${permissionsScope}&format=json`;
                        }
                        const randomToken = await hasher.generateRandomBytes(moduleConfig.config.twitterUniqueNonceLength);
                        const timestamp = Math.round(Date.now() / 1000);
                        const oAuthSignature = _p.generateOAuthSignature(randomToken, timestamp, req.params.access_token);
                        headers = {
                            'Authorization': `OAuth oauth_consumer_key="${moduleConfig.oauthConfig.twitter.app_id}", oauth_nonce="${moduleConfig.oauthConfig.twitter.app_id}_${randomToken}", oauth_signature="${oAuthSignature}", oauth_signature_method="HMAC-SHA1", oauth_timestamp="${timestamp}", oauth_token="${req.params.access_token}", oauth_version="1.0"`
                        };
                        break;
                }
                const dataObj = await thirdPartyApiRequesterHelper.requestThirdPartyApi(req, request_url, headers, next, null);
                return (dataObj && dataObj.error && Object.keys(dataObj.error).length > 0) ? null : (dataObj && Object.keys(dataObj).length > 0) ? dataObj : null;
            }
            return null;
        } catch (err) {
            return next(err);
        }
    };

    _p.linkFacebookAccount = async (req, res, next) => {
        try {
            const accountAlreadyLinked = await userController.checkSocialAccountLinked(req, moduleConfig.config.account_types.FACEBOOK, next);
            if(accountAlreadyLinked) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.CONFLICT,
                    message: moduleConfig.message.facebook_account_already_linked
                });
            } else {
                const dataObj = await _p.requestSocialOAuthApiDataHelper(req, next, moduleConfig.config.facebook_request_url, moduleConfig.config.facebook_scope_permissions, moduleConfig.config.account_types.FACEBOOK);
                if(dataObj && Object.keys(dataObj).length > 0) {
                    const isExists = await userController.checkSocialAccountExists(req, moduleConfig.config.account_types.FACEBOOK, dataObj, next);
                    if(isExists && isExists.exists) {
                        return commonHelper.sendResponseData(res, {
                            status: HTTPStatus.UNAUTHORIZED,
                            message: moduleConfig.message.already_exists_account
                        });
                    } else {
                        const responseData = await userController.linkSocialAccounts(req, res, next, moduleConfig.config.account_types.FACEBOOK, dataObj, false, null);
                        return commonHelper.sendResponseData(res, {
                            status: responseData ? HTTPStatus.OK : HTTPStatus.BAD_REQUEST,
                            message: responseData ? moduleConfig.message.facebook_link_success : moduleConfig.message.facebook_link_failure
                        });
                    }
                } else {
                    return commonHelper.sendResponseData(res, {
                        status: HTTPStatus.UNAUTHORIZED,
                        message: moduleConfig.message.wrong_access_token_facebook
                    });
                }
            }
        } catch (err) {
            return next(err);
        }
    };

    _p.linkTwitterAccount = async (req, res, next) => {
        try {
            const accountAlreadyLinked = await userController.checkSocialAccountLinked(req, moduleConfig.config.account_types.TWITTER, next);
            if(accountAlreadyLinked) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.CONFLICT,
                    message: moduleConfig.message.twitter_account_already_linked
                });
            } else {
                const dataObj = await _p.requestSocialOAuthApiDataHelper(req, next, moduleConfig.config.twitter_request_url, moduleConfig.config.twitter_scope_permissions, moduleConfig.config.account_types.TWITTER);
                if(dataObj && Object.keys(dataObj).length > 0) {
                    const isExists = await userController.checkSocialAccountExists(req, moduleConfig.config.account_types.TWITTER, dataObj, next);
                    if(isExists && isExists.exists) {
                        return commonHelper.sendResponseData(res, {
                            status: HTTPStatus.UNAUTHORIZED,
                            message: moduleConfig.message.already_exists_account
                        });
                    } else {
                        const responseData = await userController.linkSocialAccounts(req, res, next, moduleConfig.config.account_types.TWITTER, dataObj, false, null);
                        return commonHelper.sendResponseData(res, {
                            status: responseData ? HTTPStatus.OK : HTTPStatus.BAD_REQUEST,
                            message: responseData ? moduleConfig.message.twitter_link_success : moduleConfig.message.twitter_link_failure
                        });
                    }
                } else {
                    return commonHelper.sendResponseData(res, {
                        status: HTTPStatus.UNAUTHORIZED,
                        message: moduleConfig.message.wrong_access_token_twitter
                    });
                }
            }
        } catch (err) {
            return next(err);
        }
    };

    _p.linkLinkedInAccount = async (req, res, next) => {
        try {
            const accountAlreadyLinked = await userController.checkSocialAccountLinked(req, moduleConfig.config.account_types.LINKEDIN, next);
            if(accountAlreadyLinked) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.CONFLICT,
                    message: moduleConfig.message.linkedin_account_already_linked
                });
            } else {
                const dataObj = await _p.requestSocialOAuthApiDataHelper(req, next, moduleConfig.config.linkedin_request_url, moduleConfig.config.linkedin_scope_permissions, moduleConfig.config.account_types.LINKEDIN);
                if(dataObj && Object.keys(dataObj).length > 0) {
                    const isExists = await userController.checkSocialAccountExists(req, moduleConfig.config.account_types.LINKEDIN, dataObj, next);
                    if(isExists && isExists.exists) {
                        return commonHelper.sendResponseData(res, {
                            status: HTTPStatus.UNAUTHORIZED,
                            message: moduleConfig.message.already_exists_account
                        });
                    } else {
                        const responseData = await userController.linkSocialAccounts(req, res, next, moduleConfig.config.account_types.LINKEDIN, dataObj, false, null);
                        return commonHelper.sendResponseData(res, {
                            status: responseData ? HTTPStatus.OK : HTTPStatus.BAD_REQUEST,
                            message: responseData ? moduleConfig.message.linkedin_link_success : moduleConfig.message.linkedin_link_failure
                        });
                    }
                } else {
                    return commonHelper.sendResponseData(res, {
                        status: HTTPStatus.UNAUTHORIZED,
                        message: moduleConfig.message.wrong_access_token_linkedin
                    });
                }
            }
        } catch (err) {
            return next(err);
        }
    };

    _p.linkGoogleAccount = async (req, res, next) => {
        try {
            const accountAlreadyLinked = await userController.checkSocialAccountLinked(req, moduleConfig.config.account_types.GOOGLE, next);
            if(accountAlreadyLinked) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.CONFLICT,
                    message: moduleConfig.message.google_account_already_linked
                });
            } else {
                const dataObj = await _p.requestSocialOAuthApiDataHelper(req, next, moduleConfig.config.google_request_url, moduleConfig.config.google_scope_permissions, moduleConfig.config.account_types.GOOGLE);
                if(dataObj && Object.keys(dataObj).length > 0) {
                    const isExists = await userController.checkSocialAccountExists(req, moduleConfig.config.account_types.GOOGLE, dataObj, next);
                    if(isExists && isExists.exists) {
                        return commonHelper.sendResponseData(res, {
                            status: HTTPStatus.UNAUTHORIZED,
                            message: moduleConfig.message.already_exists_account
                        });
                    } else {
                        const responseData = await userController.linkSocialAccounts(req, res, next, moduleConfig.config.account_types.GOOGLE, dataObj, false, null);
                        return commonHelper.sendResponseData(res, {
                            status: responseData ? HTTPStatus.OK : HTTPStatus.BAD_REQUEST,
                            message: responseData ? moduleConfig.message.google_link_success : moduleConfig.message.google_link_failure
                        });
                    }
                } else {
                    return commonHelper.sendResponseData(res, {
                        status: HTTPStatus.UNAUTHORIZED,
                        message: moduleConfig.message.wrong_access_token_google
                    });
                }
            }
        } catch (err) {
            return next(err);
        }
    };

    _p.verifyFacebookLogin = async (req, res, next) => {
        const dataObj = await _p.requestSocialOAuthApiDataHelper(req, next, moduleConfig.config.facebook_request_url, moduleConfig.config.facebook_scope_permissions, moduleConfig.config.account_types.FACEBOOK);
        if(dataObj && Object.keys(dataObj).length > 0) {
            _p.verifySocialAccountLogins(req, res, next, dataObj, moduleConfig.config.account_types.FACEBOOK, moduleConfig.config.facebook_scope_permissions, moduleConfig.config.facebook_request_url, moduleConfig.message.facebook_link_failure, moduleConfig.message.wrong_access_token_facebook, dataObj.email, dataObj.verified, dataObj.first_name, dataObj.last_name, dataObj.birthday)
        } else {
            return commonHelper.sendResponseData(res, {
                status: HTTPStatus.UNAUTHORIZED,
                message: moduleConfig.message.wrong_access_token_facebook
            });
        }
    };

    _p.verifyTwitterLogin = async (req, res, next) => {
        const dataObj = await _p.requestSocialOAuthApiDataHelper(req, next, moduleConfig.config.twitter_request_url, moduleConfig.config.twitter_scope_permissions, moduleConfig.config.account_types.TWITTER);
        if(dataObj && Object.keys(dataObj).length > 0) {
            _p.verifySocialAccountLogins(req, res, next, dataObj, moduleConfig.config.account_types.TWITTER, moduleConfig.config.twitter_scope_permissions, moduleConfig.config.twitter_request_url, moduleConfig.message.twitter_link_failure, moduleConfig.message.wrong_access_token_twitter, dataObj.emailAddress, true, dataObj.firstName, dataObj.lastName, dataObj.birthday)
        } else {
            return commonHelper.sendResponseData(res, {
                status: HTTPStatus.UNAUTHORIZED,
                message: moduleConfig.message.wrong_access_token_twitter
            });
        }
    };

    _p.verifyLinkedInLogin = async (req, res, next) => {
        const dataObj = await _p.requestSocialOAuthApiDataHelper(req, next, moduleConfig.config.linkedin_request_url, moduleConfig.config.linkedin_scope_permissions, moduleConfig.config.account_types.LINKEDIN);
        if(dataObj && Object.keys(dataObj).length > 0) {
            _p.verifySocialAccountLogins(req, res, next, dataObj, moduleConfig.config.account_types.LINKEDIN, moduleConfig.config.linkedin_scope_permissions, moduleConfig.config.linkedin_request_url, moduleConfig.message.linkedin_link_failure, moduleConfig.message.wrong_access_token_linkedin, dataObj.emailAddress, true, dataObj.firstName, dataObj.lastName, dataObj.birthday)
        } else {
            return commonHelper.sendResponseData(res, {
                status: HTTPStatus.UNAUTHORIZED,
                message: moduleConfig.message.wrong_access_token_linkedin
            });
        }
    };

    _p.verifyGoogleLogin = async (req, res, next) => {
        try {
            const dataObj = await _p.requestSocialOAuthApiDataHelper(req, next, moduleConfig.config.google_request_url, moduleConfig.config.google_scope_permissions, moduleConfig.config.account_types.GOOGLE);
            if(dataObj && Object.keys(dataObj).length > 0) {
                _p.verifySocialAccountLogins(req, res, next, dataObj, moduleConfig.config.account_types.GOOGLE, moduleConfig.config.google_scope_permissions, moduleConfig.config.google_request_url, moduleConfig.message.google_link_failure, moduleConfig.message.wrong_access_token_google, dataObj.email, dataObj.verified_email, dataObj.given_name, dataObj.family_name)
            } else {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.UNAUTHORIZED,
                    message: moduleConfig.message.wrong_access_token_google
                });
            }
        } catch (err) {
            return next(err);
        }
    };

    _p.verifySocialAccountLogins = async (req, res, next, dataObj, social_account_type, social_account_permissions, social_account_req_url, social_account_link_fail_message, social_account_wrong_access_token, _email, _verified_email, _given_name, _family_name, _birthday='') => {
        try {
            const accountAlreadyLinked = await userController.checkSocialAccountExists(req, social_account_type, dataObj, next);
            if(accountAlreadyLinked && accountAlreadyLinked.exists) {
                const userObj = await req.db.collection('User').findOne({
                    [`linked_social_accounts.${social_account_type}.id`]: dataObj.id,
                    deleted: false
                });
                const loginObj = await loginController.handleLoginSuccessAction(req, userObj, next);
                return next(null, loginObj);
            } else {
                let accountuserObj = await userController.findUserInfoByUserName(req, dataObj.email);
                if(accountAlreadyLinked.first_attempt_social_login) {
                    return commonHelper.sendDataManipulationMessage(res, {
                        first_attempt_social_login: true,
                        _id: accountuserObj._id
                    }, moduleConfig.message.terms_accept_issue, HTTPStatus.OK);
                }
                if(!accountuserObj) {
                    const userObj = _p.constructUserObject(dataObj, _email, _verified_email, _given_name, _family_name, _birthday);
                    const userRes = await userController.saveHelperFunc(req, userObj, res, false, _verified_email, false, next, true);
                    accountuserObj = await userController.findUserInfoByUserName(req, userObj.email);
                    if(!userRes) {
                        return commonHelper.sendDataManipulationMessage(res, {
                            success: false
                        }, userModuleConfig.message.socialAuthFailed, HTTPStatus.BAD_REQUEST);
                    }
                    if(userRes.status && userRes.status === HTTPStatus.CONFLICT) {
                        if(!userObj.confirmed) {
                            return commonHelper.sendDataManipulationMessage(res, {
                                success: false
                            }, userModuleConfig.message.alreadyExists, HTTPStatus.BAD_REQUEST);
                        }
                    }
                }
                if(!accountuserObj.confirmed) {
                    return commonHelper.sendDataManipulationMessage(res, {
                        success: false
                    }, userModuleConfig.message.alreadyExists, HTTPStatus.BAD_REQUEST);
                }
                const linkRes = await userController.linkSocialAccounts(req, res, next, social_account_type, dataObj, true, accountuserObj);
                if(linkRes) {
                    const responseObj = {
                        first_name: accountuserObj.first_name,
                        last_name: accountuserObj.last_name,
                        email: accountuserObj.email,
                        username: accountuserObj.username,
                        user_role: accountuserObj.user_role,
                        confirmed: accountuserObj.confirmed,
                        image_name: accountuserObj.image_name,
                        _id: accountuserObj._id,
                        multi_factor_auth_enable: accountuserObj.multi_factor_auth_enable,
                        mobile_number_validated: accountuserObj.mobile_number_validated
                    };
                    if(accountuserObj.password) {
                        const loginObj = await loginController.handleLoginSuccessAction(req, accountuserObj, next);
                        return next(null, loginObj);
                    } else {
                        return commonHelper.sendDataManipulationMessage(res, {
                            first_attempt_social_login: true,
                            _id: accountuserObj._id
                        }, moduleConfig.message.terms_accept_issue, HTTPStatus.OK);
                    }
                } else {
                    return commonHelper.sendDataManipulationMessage(res, {
                        success: false
                    }, social_account_link_fail_message, HTTPStatus.BAD_REQUEST);
                }
            }
        } catch (err) {
            return next(err);
        }
    };

    _p.unLinkFacebookAccount = async (req, res, next) => {
        try {
            const accountUnLinked = await userController.unLinkSocialAccount(req, res, next, moduleConfig.config.account_types.FACEBOOK);
            return commonHelper.sendResponseData(res, {
                status: accountUnLinked ? HTTPStatus.OK : HTTPStatus.BAD_REQUEST,
                message: accountUnLinked ? moduleConfig.message.facebook_unlink_success : moduleConfig.message.facebook_unlink_failure
            });

        } catch (err) {
            return next(err);
        }
    };

    _p.unLinkTwitterAccount = async (req, res, next) => {
        try {
            const accountUnLinked = await userController.unLinkSocialAccount(req, res, next, moduleConfig.config.account_types.TWITTER);
            return commonHelper.sendResponseData(res, {
                status: accountUnLinked ? HTTPStatus.OK : HTTPStatus.BAD_REQUEST,
                message: accountUnLinked ? moduleConfig.message.twitter_unlink_success : moduleConfig.message.twitter_unlink_failure
            });
        } catch (err) {
            return next(err);
        }
    };

    _p.unLinkLinkedInAccount = async (req, res, next) => {
        try {
            const accountUnLinked = await userController.unLinkSocialAccount(req, res, next, moduleConfig.config.account_types.LINKEDIN);
            return commonHelper.sendResponseData(res, {
                status: accountUnLinked ? HTTPStatus.OK : HTTPStatus.BAD_REQUEST,
                message: accountUnLinked ? moduleConfig.message.linkedin_unlink_success : moduleConfig.message.linkedin_unlink_failure
            });
        } catch (err) {
            return next(err);
        }
    };

    _p.unLinkGoogleAccount = async (req, res, next) => {
        try {
            const accountUnLinked = await userController.unLinkSocialAccount(req, res, next, moduleConfig.config.account_types.GOOGLE);
            return commonHelper.sendResponseData(res, {
                status: accountUnLinked ? HTTPStatus.OK : HTTPStatus.BAD_REQUEST,
                message: accountUnLinked ? moduleConfig.message.google_unlink_success : moduleConfig.message.google_unlink_failure
            });
        } catch (err) {
            return next(err);
        }
    };

    _p.acceptTermsAndConditions = async (req, res, next) => {
        try {
            req.checkBody('password', userConfig.message.validationErrMessage.password).notEmpty();
            const result = await req.getValidationResult();
            const errors = result.array();
            if (errors && errors.length > 0) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.BAD_REQUEST,
                    message: errorHelper.sendFormattedErrorData(errors)
                });
            } else {
                const userObj = await req.db.collection('User').findOne({
                    '_id': req.params.userId,
                    deleted: false
                });
                if (userObj.agree_terms_condition) {
                    return commonHelper.sendResponseData(res, {
                        status: HTTPStatus.CONFLICT,
                        message: moduleConfig.message.termsAndConditionsAlreadyAccepted
                    });
                } else {
                    const modelInfo = utilityHelper.sanitizeUserInput(req, next);

                    // if (modelInfo.refer_code && modelInfo.refer_code !== '') {
                    //     const referTokenObj = await impHelper.checkForReferCode(req, modelInfo.refer_code, true, next);
                    //     if (!referTokenObj) {
                    //         return commonHelper.sendResponseData(res, {
                    //             status: HTTPStatus.BAD_REQUEST,
                    //             message: impConfig.message.referCodeInvalid
                    //         });
                    //     }
                    // }

                    const termsAccepted = await userController.acceptTermsAndConditions(req, res, next, req.params.userId);
                    if (termsAccepted) {

                        // const global_refer_code =  await hasher.generateRandomBytes(impConfig.config.token_length);

                        const impObj = {
                            _id: uuidv1(),
                            refer_code: modelInfo.refer_code ? modelInfo.refer_code : "",
                            submitted_documents: [],
                            imp_terms_conditions: true,
                            user_id: userObj._id,
                            reason: '',
                            approval_documents: [],
                            global_refer_code: global_refer_code,
                            history_agent_application: []
                        };

                        const queryOpts = {
                            deleted: false,
                            _id: userObj._id
                        };

                        const updateObj = {
                            confirmed: true,
                            active: true,
                            user_role: [roleConfig.enduser, roleConfig.independent_marketing_partner],
                            imp_status: impStatus.status.processed,
                            processed_on: new Date()
                        };

                        // const impRes = await impHelper.handleAgentRegistration(req, res, {
                        //     ...modelInfo,
                        //     refer_code: userObj.refer_code
                        //
                        // }, impObj, userObj, queryOpts, updateObj, queryOpts, next);

                        if (req.body.email_offer_subscription === true || req.body.email_offer_subscription === 'true') {
                            const tokenBytes = await hasher.generateRandomBytes(userConfirmationConfig.config.token_length);
                            const newsletterRes = await newsletterController.enableNewEmailSubscription(req, res, userObj.email, tokenBytes, next);
                        }

                        const newUserInfo = await req.db.collection('User').findOne({
                            '_id': req.params.userId,
                            deleted: false
                        });
                        const loginObj = await loginController.handleLoginSuccessAction(req, newUserInfo, next);
                        return next(null, loginObj);
                    } else {
                        return commonHelper.sendResponseData(res, {
                            status: HTTPStatus.NOT_IMPLEMENTED,
                            message: moduleConfig.message.termsConditionsAcceptFailure
                        });
                    }
                }
            }
        } catch (err) {
            return next(err);
        }
    };

    _p.checkSocialAccountLinkingStatus = async (req, res, next) => {
        try {
            const accountData = await req.db.collection('User').findOne({
                "_id": commonHelper.getLoggedInUserId(req),
                linked_social_accounts: {
                    $exists: true
                },
                deleted: false
            }, { projection:{
                _id: 0,
                linked_social_accounts: 1
            }});
            const accountObj = (accountData && accountData.linked_social_accounts )
                ?
                accountData.linked_social_accounts : {};
            return commonHelper.sendNormalResponse(res, {
                status_facebook: accountObj[moduleConfig.config.account_types.FACEBOOK] ? true : false,
                status_twitter: accountObj[moduleConfig.config.account_types.TWITTER] ? true : false,
                status_google: accountObj[moduleConfig.config.account_types.GOOGLE] ? true : false,
                status_linkedin: accountObj[moduleConfig.config.account_types.LINKEDIN] ? true : false
            }, HTTPStatus.OK)
        } catch (err) {
            return next(err);
        }
    };

    _p.exchangeOAuthCodeForAccessToken = async (req, res, next) => {
        let request_url = "";
        if(req.originalUrl.includes('linkedin')) {
            request_url = moduleConfig.config.linkedin_exchange_oauth_for_token_url;
            if (request_url.indexOf("%client_id%") > -1) {
                request_url = request_url.replace("%client_id%", moduleConfig.oauthConfig.linkedin.app_id);
            }
            if (request_url.indexOf("%client_secret%") > -1) {
                request_url = request_url.replace("%client_secret%", moduleConfig.oauthConfig.linkedin.app_secret);
            }
            if (request_url.indexOf("%redirect_uri%") > -1) {
                request_url = request_url.replace("%redirect_uri%", req.query.redirect_uri ? req.query.redirect_uri : "");
            }
            if (request_url.indexOf("%code%") > -1) {
                request_url = request_url.replace("%code%", req.params.access_token);
            }
        } else {
            request_url = moduleConfig.config.google_exchange_oauth_for_token_url;
            if (request_url.indexOf("%client_id%") > -1) {
                request_url = request_url.replace("%client_id%", moduleConfig.oauthConfig.googleplus.app_id);
            }
            if (request_url.indexOf("%client_secret%") > -1) {
                request_url = request_url.replace("%client_secret%", moduleConfig.oauthConfig.googleplus.app_secret);
            }
            if (request_url.indexOf("%grant_type%") > -1) {
                request_url = request_url.replace("%grant_type%", "authorization_code");
            }
            if (request_url.indexOf("%code%") > -1) {
                request_url = request_url.replace("%code%", req.params.access_token);
            }
        }
        const dataObj = await thirdPartyApiRequesterHelper.requestThirdPartyApi(req, request_url, null, next, 'POST');
        return dataObj;

    };

    return{
        linkFacebookAccount: _p.linkFacebookAccount,
        linkTwitterAccount: _p.linkTwitterAccount,
        linkLinkedInAccount: _p.linkLinkedInAccount,
        linkGoogleAccount: _p.linkGoogleAccount,
        unLinkFacebookAccount: _p.unLinkFacebookAccount,
        unLinkTwitterAccount: _p.unLinkTwitterAccount,
        unLinkLinkedInAccount: _p.unLinkLinkedInAccount,
        unLinkGoogleAccount: _p.unLinkGoogleAccount,
        verifyFacebookLogin: _p.verifyFacebookLogin,
        verifyTwitterLogin: _p.verifyTwitterLogin,
        verifyLinkedInLogin: _p.verifyLinkedInLogin,
        verifyGoogleLogin: _p.verifyGoogleLogin,
        acceptTermsAndConditions: _p.acceptTermsAndConditions,
        checkSocialAccountLinkingStatus: _p.checkSocialAccountLinkingStatus,
        exchangeOAuthCodeForAccessToken: _p.exchangeOAuthCodeForAccessToken
    };

})();

module.exports = socialAccountLinkingController;
