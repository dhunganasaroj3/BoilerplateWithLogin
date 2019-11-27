const loginRoutes = (() => {
	'use strict';

	const HTTPStatus = require('http-status');
	const passport = require('passport');
	const express = require('express');
	const loginRouter = express.Router();
	const moduleConfig = require('./login-auth.config');
	const userMessageConfig = require('../user-profile/user-profile.config');
	const ipBlockerController = require('../ip-blocker/ip-blocker.controller');
	const mobileIdentifierController = require('../mobile-identiifer/mobile-identifier.controller');
	const commonHelper = require('../../common/common-helper-function');
	const appConfig = require('../../configs/application.config');
	const roleConfig = require('../../configs/role.config');
	const identityAccessManagementRoleController = require('../identity-access-management/identity-access-management-roles.controller');
	const jwtHelper = require('../../helpers/jwt-token-generator.helper');

	require('../../auth/passport-auth');
	require('../../auth/passport-facebook-oauth');

	const respondLoginMessage = async (req, res, next) => {
		if (req.loginStatusMessage) {
			if (req.loginStatusMessage.success === true) {
				if (req.loginStatusMessage.userInfo && req.loginStatusMessage.userInfo.user_role) {
					let found = [
						roleConfig.superadmin,
						roleConfig.enduser,
						roleConfig.vendor,
						roleConfig.independent_marketing_partner,
					].some((role) => req.loginStatusMessage.userInfo.user_role.indexOf(role) >= 0);
					if (!found) {
						const iamActions = await identityAccessManagementRoleController.getAttachedActionsWithGroupByRole(
							req,
							req.loginStatusMessage.userInfo.user_role[0],
							req.loginStatusMessage.userInfo.parent_id,
							next,
						);
						if (iamActions && iamActions.length > 0) {
							req.loginStatusMessage.allowed_actions = jwtHelper.generateAllowedActions(
								req,
								iamActions,
								req.loginStatusMessage.userInfo._id,
							);
						}
					}
				}
				return commonHelper.sendJsonResponse(res, req.loginStatusMessage, '', HTTPStatus.OK);
			} else {
				const returnObj = {
					success: false,
				};
				if (req.loginStatusMessage.email_unconfirmed) {
					returnObj.email_unconfirmed = req.loginStatusMessage.email_unconfirmed;
					returnObj.user_id = req.loginStatusMessage.user_id;
					returnObj.email = req.body.username;
				}
				if (req.loginStatusMessage.captcha_enable) {
					returnObj.captcha_enable = true;
					returnObj.email = req.body.username;
				}
				return commonHelper.sendDataManipulationMessage(
					res,
					returnObj,
					req.loginStatusMessage ? req.loginStatusMessage.message : '',
					req.loginStatusMessage ? req.loginStatusMessage.status_code : HTTPStatus.UNAUTHORIZED,
				);
			}
		} else {
			return commonHelper.sendResponseData(res, {
				status: HTTPStatus.UNAUTHORIZED,
				message: {
					message: moduleConfig.message.invalidMessage,
					success: false,
				},
			});
		}
	};

	const checkValidationError = (req, res, next) => {
		if (req.body && req.body.username) {
			if (req.body.password) {
				next();
			} else {
				return commonHelper.sendResponseData(res, {
					status: HTTPStatus.BAD_REQUEST,
					message: {
						message: userMessageConfig.message.validationErrMessage.password,
						success: false,
					},
				});
			}
		} else {
			return commonHelper.sendResponseData(res, {
				status: HTTPStatus.BAD_REQUEST,
				message: {
					message: userMessageConfig.message.validationErrMessage.username,
					success: false,
				},
			});
		}
	};

	const detectMobileDevice = async (req, res, next) => {
		try {
			if (req.query && req.query.device_identifier && req.query.unique_identifier) {
				const count = await mobileIdentifierController.checkMobileIdentifierToken(req);
				if (count > 0) {
					req.mobil_detection = true;
				}
			}
			next();
		} catch (err) {
			return next(err);
		}
	};

	const checkIpBlockStatus = async (req, res, next) => {
		try {
			const blocked = await ipBlockerController.checkBlockedExpiryStatus(
				req,
				req.client_ip_address,
				req.body.username,
				next,
			);
			if (blocked) {
				return commonHelper.sendResponseData(res, {
					status: HTTPStatus.FORBIDDEN,
					message: {
						message: moduleConfig.message.ipBlocked,
						success: false,
					},
				});
			} else {
				next();
			}
		} catch (err) {
			return next(err);
		}
	};

	loginRouter.route('/login/').post(
		// checkParallizeLoginStatus,
		checkValidationError,
		checkIpBlockStatus,
		detectMobileDevice,
		passport.authenticate('local-login', {
			session: false,
		}),
		respondLoginMessage,
	);

	loginRouter.route('/login/facebook').get(
		detectMobileDevice,
		passport.authenticate('facebook', {
			scope: [ 'public_profile', 'email', 'user_friends', 'user_about_me', 'user_birthday' ],
		}),
		respondLoginMessage,
	);

	loginRouter
		.route('/login/facebook/callback')
		.get(passport.authenticate('facebook', { failureRedirect: '/login', session: false }), (req, res) => {
			let returnObj = {};
			if (req.user.already_exists) {
				returnObj = {
					token: req.user && req.user.token_info ? req.user.token_info.token : '',
					userInfo: req.user && req.user.token_info ? req.user.token_info.userInfo : '',
				};
				res.redirect(
					`${req.protocol}://${appConfig.client_app_url}privacy-policy?response=${encodeURIComponent(
						JSON.stringify(returnObj),
					)}`,
				);
			} else {
				const userObj = req.user && req.user.profile ? req.user.profile : null;

				returnObj = {
					first_name: userObj && userObj.name && userObj.name.givenName ? userObj.name.givenName : '',
					middle_name: userObj && userObj.name && userObj.name.middleName ? userObj.name.middleName : '',
					last_name: userObj && userObj.name && userObj.name.familyName ? userObj.name.familyName : '',
					email: userObj && userObj.emails && userObj.emails.length > 0 ? userObj.emails[0].value : '',
					gender: userObj ? userObj.gender : '',
					image_name: userObj && userObj.photos && userObj.photos.length > 0 ? userObj.photos[0].value : '',
					social_auth_info: userObj,
				};

				res.redirect(
					`${req.protocol}://${appConfig.client_app_url}privacy-policy?response=${encodeURIComponent(
						JSON.stringify(returnObj),
					)}`,
				);
			}
		});

	return loginRouter;
})();

module.exports = loginRoutes;
