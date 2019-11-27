const userController = (() => {
	'use strict';

	const HTTPStatus = require('http-status');
	const moduleConfig = require('./user-profile.config');
	const appConfig = require('../../configs/application.config');
	const smsConfig = require('../../configs/sms.config');
	const utilityHelper = require('../../helpers/utilities.helper');
	const errorHelper = require('../../helpers/error.helper');
	const smsHelper = require('../../helpers/aws-sns.helper');
	const uuidv1 = require('uuid/v1');
	const request = require('request');
	const rp = require('request-promise');
	const Promise = require('bluebird');
	const fs = Promise.promisifyAll(require('fs'));
	const commonHelper = require('../../common/common-helper-function');
	const commonProvider = require('../../common/common-provider-function');
	const hasher = require('../../auth/hasher');
	const userConfirmationTokenController = require('../user-confirmation/user-confirmation.controller');
	const passwordChangeVerifyController = require('../password-change/password-change.controller');
	const newsletterController = require('../newsletter/newsletter.controller');
	const notificationController = require('../notifications/notifications.controller');
	const roleConfig = require('../../configs/role.config');
	const messageConfig = require('../../configs/message.config');
	const captchaHelper = require('../../helpers/recaptcha.helper');
	const pushNotificationController = require('../push-notification/push-notification.controller');
	const jwtTokenGeneratorHelper = require('../../helpers/jwt-token-generator.helper');
	const xcelTokenConfigs = require('../../configs/xcel-token.config');
	const tokenConfigs = require('../../configs/token.config');
	const userAgent = require('useragent');
	const authorizationTokenController = require('../auth-token/auth-token-controller');

	const emailHelper = require('../../helpers/email-service.helper');
	const emailTemplateController = require('../email-template/email-template.controller');
	const emailTemplateContentConfigs = require('../../configs/email-template.content.config');
	const emailTemplateConfigs = require('../../configs/email-template.config');

	const documentFields =
		'first_name middle_name last_name email country_code country_abbr mobile_number birth_date gender address_country address_city';
	const updateDocFields =
		'first_name middle_name last_name birth_date gender address_address_line_1 address_address_line_2 address_city address_zip_postal_code address_state_region_province address_country';
	const projectionFields = {
		_id: 1,
		first_name: 1,
		middle_name: 1,
		last_name: 1,
		email: 1,
		username: 1,
		phone_number: 1,
		country_code: 1,
		country_abbr: 1,
		mobile_number: 1,
		agree_terms_condition: 1,
		email_offer_subscription: 1,
		birth_date: 1,
		gender: 1,
		active: 1,
		user_role: 1,
		image_name: 1,
		image_original_name: 1,
		multi_factor_auth_enable: 1,
		multi_factor_auth_enable_mobile: 1,
		security_question: 1,
		suspend: 1,
		blocked: 1,
		confirmed: 1,
		mobile_number_validated: 1,
		imp_status: 1,
		added_on: 1,
		address_address_line_1: 1,
		address_address_line_2: 1,
		address_city: 1,
		address_zip_postal_code: 1,
		address_state_region_province: 1,
		address_country: 1,
		verification_process_apply: 1,
		verification_process_applied_on: 1,
	};

	function UserModule() {}

	const _p = UserModule.prototype;

	_p.checkValidationErrors = async (req) => {
		req.checkBody('first_name', moduleConfig.message.validationErrMessage.first_name).notEmpty();
		req.checkBody('last_name', moduleConfig.message.validationErrMessage.last_name).notEmpty();
		req.checkBody('email', moduleConfig.message.validationErrMessage.email).notEmpty();
		req.checkBody('email', moduleConfig.message.validationErrMessage.emailValid).isEmail();
		const result = await req.getValidationResult();
		return result.array();
	};

	_p.checkEmailUpdateValidationErrors = async (req) => {
		req.checkBody('previous_email', moduleConfig.message.validationErrMessage.previous_email).notEmpty();
		req.checkBody('previous_email', moduleConfig.message.validationErrMessage.previous_email_invalid).isEmail();
		req.checkBody('new_email', moduleConfig.message.validationErrMessage.new_email).notEmpty();
		req.checkBody('new_email', moduleConfig.message.validationErrMessage.new_email_invalid).isEmail();
		req
			.checkBody('email_verification_code', moduleConfig.message.validationErrMessage.email_verification_code)
			.notEmpty();
		const result = await req.getValidationResult();
		return result.array();
	};

	_p.getAllUsers = (req, next) => {
		const pagerOpts = utilityHelper.getPaginationOpts(req, next);
		let queryOpts = {};

		if (req.query.name && req.query.name.split(' ').length > 1) {
			queryOpts = Object.assign({}, queryOpts, {
				$and: [
					{
						first_name: {
							$regex: new RegExp('.*' + req.query.name.split(' ')[0], 'i'),
						},
					},
					{
						last_name: {
							$regex: new RegExp('.*' + req.query.name.split(' ')[1], 'i'),
						},
					},
				],
			});
		} else if (req.query.name) {
			queryOpts = {
				$or: [
					{
						first_name: {
							$regex: new RegExp('.*' + req.query.name, 'i'),
						},
					},
					{
						last_name: {
							$regex: new RegExp('.*' + req.query.name, 'i'),
						},
					},
				],
			};
		}

		if (req.query.user_role) {
			queryOpts = Object.assign({}, queryOpts, { user_role: { $elemMatch: { $eq: req.query.user_role } } });

			// queryOpts = {
			//     user_role: {$elemMatch: {$eq: req.query.user_role}}
			// };
		}
		if (req.query.email) {
			queryOpts.email = { $regex: new RegExp('.*' + req.query.email.toLowerCase(), 'i') };
		}
		if (req.query.added_on) {
			const date = new Date(req.query.added_on);
			const nextDate = new Date(req.query.added_on);
			nextDate.setDate(date.getDate() + 1);
			queryOpts = Object.assign({}, queryOpts, {
				$and: [ { added_on: { $gte: date } }, { added_on: { $lte: nextDate } } ],
			});
		}
		queryOpts.deleted = false;
		if (req.query.suspend) {
			queryOpts.suspend = req.query.suspend === true || req.query.suspend === 'true' ? true : false;
		}
		if (req.query.confirmed) {
			queryOpts.confirmed = req.query.confirmed === true || req.query.confirmed === 'true' ? true : false;
		}
		if (req.query.blocked) {
			queryOpts.blocked = req.query.blocked === true || req.query.blocked === 'true' ? true : false;
		}

		if (req.query.address_country && req.query.address_country !== '') {
			queryOpts = Object.assign({}, queryOpts, { address_country: req.query.address_country });
		}
		if (req.query.address_city && req.query.address_city !== '') {
			queryOpts = Object.assign({}, queryOpts, { address_city: req.query.address_city });
		}
		const sortOpts = { added_on: -1 };
		return commonProvider.getPaginatedDataList(
			req.db.collection('User'),
			queryOpts,
			pagerOpts,
			projectionFields,
			sortOpts,
		);
	};

	_p.getUserByID = async (req, next) => {
		const queryOpts = {
			_id: utilityHelper.containsElementInArr(commonHelper.getLoggedInUserRole(req), roleConfig.superadmin, next)
				? req.params.userId
				: commonHelper.getLoggedInUserId(req),
			deleted: false,
		};

		const extraFields = JSON.parse(JSON.stringify(projectionFields));
		extraFields.multi_factor_auth_secret = 1;
		extraFields.multi_factor_auth_secret_mobile = 1;
		const userInfo = await req.db.collection('User').findOne(queryOpts, { projection: extraFields });
		console.log(userInfo);
		let property_detail = {};
		if (userInfo && userInfo.user_role && userInfo.user_role.includes('vendor')) {
			property_detail = await req.db
				.collection('PropertyInformation')
				.find({ user_id: userInfo._id })
				.project({
					status: 1,
					verified: 1,
					property_step: 1,
				})
				.toArray();
		}
		return { ...userInfo, property_detail };
	};

	_p.deleteUserInformation = async (req, res, next) => {
		try {
			const userId = utilityHelper.containsElementInArr(
				commonHelper.getLoggedInUserRole(req),
				roleConfig.superadmin,
				next,
			)
				? req.params.userId
				: commonHelper.getLoggedInUserId(req);
			const queryOpts = {
				_id: userId,
				deleted: false,
			};

			const userInfo = await req.db.collection('User').findOne(queryOpts, { projection: projectionFields });
			if (userInfo) {
				if (userInfo.username !== appConfig.user.defaultUsername) {
					const updateOpts = {
						$set: {
							deleted: true,
							deleted_on: new Date(),
							deleted_by: commonHelper.getLoggedInUser(req),
							mobile_number_validated: false,
						},
					};
					if (userInfo.user_role.indexOf(roleConfig.vendor) > -1) {
						const filter = {
							user_id: userId,
						};
						req.db.collection('PropertyUser').updateOne(filter, updateOpts);
						req.db.collection('PropertyInformation').updateOne(filter, updateOpts);
					}

					const dataRes = await req.db.collection('User').updateOne(queryOpts, updateOpts);
					if (dataRes.result.n > 0) {
						const response = await req.db.collection('IPBlocker').remove({ username: userInfo.username });
						return commonHelper.sendResponseMessage(
							res,
							dataRes,
							{
								_id: userId,
							},
							moduleConfig.message.deleteMessage,
						);
					}
				} else {
					return commonHelper.sendResponseData(res, {
						status: HTTPStatus.METHOD_NOT_ALLOWED,
						message: moduleConfig.message.superAdminDeleteMessage,
					});
				}
			} else {
				return commonHelper.sendResponseData(res, {
					status: HTTPStatus.NOT_FOUND,
					message: moduleConfig.message.notFound,
				});
			}
		} catch (err) {
			return next(err);
		}
	};

	_p.checkForCommonPassword = (req, inputPwd) => {
		// const dictionaryList = {};
		// let exists = true;
		// const passwordConfigFilePath = req.app.get('root_dir') + moduleConfig.config.commonPasswordFilePath;
		//
		// //Check for most common passwords
		// return new Promise((resolve, reject) => {
		//     fs.readFile(passwordConfigFilePath, 'utf8', (err, data) => {
		//         if (err) {
		//             reject(err);
		//         } else {
		//             data = data.split('\n');
		//             data.forEach((password) => {
		//                 dictionaryList[password] = true;
		//             });
		//             //Check if the inputted password is marked as weak password in the file or not, if not then exists bit set to false
		//             if (!dictionaryList[inputPwd]) {
		//                 exists = false;
		//             }
		//             resolve(exists);
		//         }
		//     });
		// });
		return Promise.resolve(false);
	};

	_p.modifyPassword = async (req, res, user_id, next) => {
		try {
			const password = req.body.password.toString();

			const has_weakPassword = await _p.checkForCommonPassword(req, password);
			if (has_weakPassword) {
				return commonHelper.sendResponseData(res, {
					status: HTTPStatus.BAD_REQUEST,
					message: moduleConfig.message.weakPassword,
				});
			} else {
				const salt = await hasher.createSalt();
				const hashPassword = await hasher.computeHash(req, res, password, salt);

				const updateOpts = {
					$set: {
						password: hashPassword,
						password_salt: salt,
						updated_by: commonHelper.getLoggedInUser(req),
					},
				};
				const dataRes = await req.db.collection('User').updateOne({ _id: user_id }, updateOpts);
				if (req.body.log_out_all_devices === 'true' || req.body.log_out_all_devices === true) {
					const token =
						req.body.token || req.query.token || req.headers['x-access-token'] || req.headers.authorization;
					req.db.collection('AuthorizationToken').updateMany(
						{
							user_id: user_id,
							authorization_token: {
								$ne: token,
							},
						},
						{
							$set: {
								deleted: true,
								deleted_on: new Date(),
								deleted_by: commonHelper.getLoggedInUser(req),
							},
						},
					);
				}
				commonHelper.sendResponseMessage(res, dataRes, null, moduleConfig.message.passwordUpdateMessage);
			}
		} catch (err) {
			return next(err);
		}
	};

	_p.changePassword = async (req, res, next) => {
		try {
			req.checkBody('password', moduleConfig.message.validationErrMessage.password).notEmpty();
			req.checkBody('old_password', moduleConfig.message.validationErrMessage.password_old).notEmpty();
			const result = await req.getValidationResult();
			const errors = result.array();
			if (errors && errors.length > 0) {
				return commonHelper.sendResponseData(res, {
					status: HTTPStatus.BAD_REQUEST,
					message: errorHelper.sendFormattedErrorData(errors),
				});
			} else {
				if (req.body.password.trim() === req.body.old_password.trim()) {
					return commonHelper.sendResponseData(res, {
						status: HTTPStatus.BAD_REQUEST,
						message: moduleConfig.message.passwordSame,
					});
				} else {
					if (utilityHelper.checkPasswordStrength(req.body.password.trim())) {
						const _userId = utilityHelper.containsElementInArr(
							commonHelper.getLoggedInUserRole(req),
							roleConfig.superadmin,
							next,
						)
							? req.params.userId
							: commonHelper.getLoggedInUserId(req);

						const queryOpts = {
							_id: _userId,
						};
						projectionFields.password = 1;
						const userInfo = await req.db
							.collection('User')
							.findOne(queryOpts, { projection: projectionFields });

						if (userInfo) {
							const isMatch = await hasher.comparePassword(req.body.old_password, userInfo.password);
							//check to see if the password matches and password cannot be empty string
							//if mismatch, post the record to the database
							if (isMatch) {
								if (req.body.password.trim().toLowerCase().indexOf(userInfo.username) === -1) {
									//Only superadmin user can change the password of all the other users
									//Other users cannot change the password of superadmin user
									//User can change own passwords only.
									//If the queried user is default superadmin user but the logged in user from which query originates is not superadmin, then superadmin password cannot be changed by other users.
									if (
										userInfo.username === appConfig.user.defaultUsername &&
										commonHelper.getLoggedInUser(req) !== appConfig.user.defaultUsername
									) {
										return commonHelper.sendResponseData(res, {
											status: HTTPStatus.FORBIDDEN,
											message: moduleConfig.message.notAllowedToChangeSuperAdminPassword,
										});
										//If the logged in user doesn't match the queried user and also do not match the default superadmin user, then cannot change other password
									} else if (
										commonHelper.getLoggedInUser(req) !== userInfo.username &&
										commonHelper.getLoggedInUser(req) !== appConfig.user.defaultUsername
									) {
										return commonHelper.sendResponseData(res, {
											status: HTTPStatus.FORBIDDEN,
											message: moduleConfig.message.notAllowedToChangeOthersPassword,
										});
									} else {
										_p.modifyPassword(req, res, _userId, next);
									}
								} else {
									return commonHelper.sendResponseData(res, {
										status: HTTPStatus.BAD_REQUEST,
										message: moduleConfig.message.passwordEqUsername,
									});
								}
							} else {
								return commonHelper.sendResponseData(res, {
									status: HTTPStatus.UNAUTHORIZED,
									message: moduleConfig.message.oldPasswordMismatch,
								});
							}
						} else {
							return commonHelper.sendResponseData(res, {
								status: HTTPStatus.NOT_FOUND,
								message: moduleConfig.message.notFound,
							});
						}
					} else {
						return commonHelper.sendResponseData(res, {
							status: HTTPStatus.UNAUTHORIZED,
							message: moduleConfig.message.passwordNotStrong,
						});
					}
				}
			}
		} catch (err) {
			return next(err);
		}
	};

	_p.changeSecurityAnswer = async (req, res, next) => {
		try {
			req.checkBody('security_question', moduleConfig.message.validationErrMessage.security_question).notEmpty();
			req.checkBody('security_answer', moduleConfig.message.validationErrMessage.security_answer).notEmpty();
			const result = await req.getValidationResult();
			const errors = result.array();
			if (errors && errors.length > 0) {
				return commonHelper.sendResponseData(res, {
					status: HTTPStatus.BAD_REQUEST,
					message: errorHelper.sendFormattedErrorData(errors),
				});
			} else {
				const modelInfo = utilityHelper.sanitizeUserInput(req, next);
				const salt = await hasher.createSalt();
				const hashSecurityAnswerData = await hasher.computeHash(req, res, modelInfo.security_answer, salt);
				const updateOpts = {
					$set: {
						security_question: modelInfo.security_question,
						security_answer: hashSecurityAnswerData,
						security_answer_salt: salt,
						updated_by: commonHelper.getLoggedInUser(req),
					},
				};
				const _userId = utilityHelper.containsElementInArr(
					commonHelper.getLoggedInUserRole(req),
					roleConfig.superadmin,
					next,
				)
					? req.params.userId
					: commonHelper.getLoggedInUserId(req);

				const dataRes = await req.db.collection('User').updateOne({ _id: _userId }, updateOpts);
				commonHelper.sendResponseMessage(res, dataRes, null, moduleConfig.message.securityAnswerMessage);
			}
		} catch (err) {
			return next(err);
		}
	};

	_p.implementForgotPasswordAction = async (req, res, next) => {
		try {
			req.checkBody('password', moduleConfig.message.validationErrMessage.password).notEmpty();
			const result = await req.getValidationResult();
			const errors = result.array();
			if (errors && errors.length > 0) {
				return commonHelper.sendResponseData(res, {
					status: HTTPStatus.BAD_REQUEST,
					message: errorHelper.sendFormattedErrorData(errors),
				});
			} else {
				if (utilityHelper.checkPasswordStrength(req.body.password.trim())) {
					const queryOpts = {
						token: req.params && req.params.token ? req.params.token : '',
						used: false,
						expires: {
							$gte: new Date(),
						},
					};
					const tokenObj = await req.db.collection('PasswordChangeVerifyToken').findOne(queryOpts);
					if (tokenObj) {
						const userObj = await req.db.collection('User').findOne({
							_id: tokenObj.user_id,
							deleted: false,
						});
						if (userObj && userObj.password) {
							const isMatch = await hasher.comparePassword(req.body.password.trim(), userObj.password);
							if (!isMatch) {
								const dataRes = await passwordChangeVerifyController.updatePasswordChangeVerifyToken(
									req,
									tokenObj.user_id,
								);
								if (dataRes.result.n > 0) {
									if (req.body.password.trim().toLowerCase().indexOf(userObj.username) === -1) {
										return _p.modifyPassword(req, res, tokenObj.user_id, next);
									} else {
										return commonHelper.sendResponseData(res, {
											status: HTTPStatus.BAD_REQUEST,
											message: moduleConfig.message.passwordEqUsername,
										});
									}
								}
							} else {
								return commonHelper.sendResponseData(res, {
									status: HTTPStatus.UNAUTHORIZED,
									message: moduleConfig.message.passwordMatchOldPassword,
								});
							}
						} else {
							if (req.body.password.trim().toLowerCase().indexOf(userObj.username) === -1) {
								return _p.modifyPassword(req, res, tokenObj.user_id, next);
							} else {
								return commonHelper.sendResponseData(res, {
									status: HTTPStatus.BAD_REQUEST,
									message: moduleConfig.message.passwordEqUsername,
								});
							}
							// return commonHelper.sendResponseData(res, {
							//     status: HTTPStatus.BAD_REQUEST,
							//     message: moduleConfig.message.passwordNotSet
							// });
						}
					}
					return commonHelper.sendResponseData(res, {
						status: HTTPStatus.UNAUTHORIZED,
						message: moduleConfig.message.notAllowedToChangePassword,
					});
				} else {
					return commonHelper.sendResponseData(res, {
						status: HTTPStatus.UNAUTHORIZED,
						message: moduleConfig.message.passwordNotStrong,
					});
				}
			}
		} catch (err) {
			return next(err);
		}
	};

	_p.blockUser = (req, user_id) => {
		const queryOpts = {
			_id: user_id,
		};
		const updateOpts = {
			$set: {
				blocked: true,
				blockedOn: new Date(),
			},
		};
		return req.db.collection('User').updateOne(queryOpts, updateOpts);
	};

	_p.findUserInfoByUserName = (req, username) => {
		const queryOpts = {
			$or: [
				{
					username: username,
				},
				{
					email: username,
				},
			],
			deleted: false,
		};
		return req.db.collection('User').findOne(queryOpts);
	};

	_p.suspendUser = async (req, res, next) => {
		try {
			const queryOpts = {
				_id: req.params.userId,
			};

			const userObj = await req.db.collection('User').findOne(queryOpts);
			if (userObj) {
				if (utilityHelper.containsElementInArr(userObj.user_role, roleConfig.superadmin, next)) {
					return commonHelper.sendResponseData(res, {
						status: HTTPStatus.METHOD_NOT_ALLOWED,
						message: moduleConfig.message.suspendMessageUnable,
					});
				} else {
					const updateOpts = {
						$set: {
							suspend: !userObj.suspend,
							suspended_on: userObj.suspended_on ? undefined : new Date(),
						},
					};

					const dataRes = await req.db.collection('User').updateOne(queryOpts, updateOpts);
					commonHelper.sendResponseMessage(
						res,
						dataRes,
						null,
						userObj.suspend === true
							? moduleConfig.message.suspendMessage
							: moduleConfig.message.removeSuspension,
					);
				}
			} else {
				return commonHelper.sendResponseData(res, {
					status: HTTPStatus.NOT_FOUND,
					message: moduleConfig.message.notFound,
				});
			}
		} catch (err) {
			return next(err);
		}
	};

	_p.verifyPasswordChangeRequest = async (req, res, next) => {
		try {
			req.checkBody('email', moduleConfig.message.validationErrMessage.email).notEmpty();
			req.checkBody('email', moduleConfig.message.validationErrMessage.emailValid).isEmail();
			const result = await req.getValidationResult();
			const errors = result.array();
			if (errors && errors.length > 0) {
				return commonHelper.sendResponseData(res, {
					status: HTTPStatus.BAD_REQUEST,
					message: errorHelper.sendFormattedErrorData(errors),
				});
			} else {
				if (commonHelper.checkDisposableEmail(req.body.email.trim().toLowerCase())) {
					return commonHelper.sendResponseData(res, {
						status: HTTPStatus.BAD_REQUEST,
						message: moduleConfig.message.invalidEmail,
					});
				}
				const queryOpts = {
					email: req.body.email.trim().toLowerCase(),
					deleted: false,
				};
				const userObj = await req.db.collection('User').findOne(queryOpts, { projection: projectionFields });
				if (userObj) {
					// if (userObj.confirmed) {
					if (!userObj.blocked) {
						const emailRes = await passwordChangeVerifyController.sendEmailToConfirmPasswordChangeAction(
							req,
							res,
							userObj,
							next,
						);

						return commonHelper.sendResponseData(res, {
							status:
								emailRes && Object.keys(emailRes).length > 0
									? HTTPStatus.OK
									: HTTPStatus.SERVICE_UNAVAILABLE,
							message:
								emailRes && Object.keys(emailRes).length > 0
									? moduleConfig.message.passwordChangeConfirmationEmail
									: moduleConfig.message.emailError,
						});
					} else {
						return commonHelper.sendResponseData(res, {
							status: HTTPStatus.UNAUTHORIZED,
							message: moduleConfig.message.forgotEmailSendingFailure,
						});
					}
					// } else {
					//     return commonHelper.sendDataManipulationMessage(res, {
					//         email_unconfirmed: true,
					//         user_id: userObj._id.toString(),
					//         success: false
					//     }, moduleConfig.message.forgotEmailSendingFailure, HTTPStatus.UNAUTHORIZED);
					// }
				} else {
					return commonHelper.sendResponseData(res, {
						status: HTTPStatus.UNAUTHORIZED,
						message: moduleConfig.message.forgotEmailSendingFailure,
					});
				}
			}
		} catch (err) {
			return next(err);
		}
	};

	_p.registerUsers = async (req, res, next) => {
		try {
			if (req.mobil_detection) {
				_p.registerHelperFunc(req, res, next);
			} else {
				const captchaRes = await captchaHelper.verifyHuman(req, next);
				if (captchaRes && captchaRes.success === false) {
					return commonHelper.sendResponseData(res, {
						status: HTTPStatus.UNAUTHORIZED,
						message: messageConfig.captchaVerify.notHuman,
					});
				} else {
					_p.registerHelperFunc(req, res, next);
				}
			}
		} catch (err) {
			return next(err);
		}
	};

	_p.RegisterFromBooking = async (req, res, next) => {
		try {
			if (typeof req.body.agree_terms_condition === 'string')
				req.body.agree_terms_condition = req.body.agree_terms_condition == '1' ? true : false;

			_p.RegisterFromBookingHelperFunc(req, res, next);
		} catch (err) {
			return next(err);
		}
	};
	_p.RegisterFromBookingHelperFunc = async (req, res, next) => {
		try {
			const modelInfo = utilityHelper.sanitizeUserInput(req, next);
			req.checkBody('gender', moduleConfig.message.validationErrMessage.gender).notEmpty();
			req.checkBody('email', moduleConfig.message.validationErrMessage.email).notEmpty();
			req.checkBody('email', moduleConfig.message.validationErrMessage.emailValid).isEmail();
			const errors = await _p.checkValidationErrors(req);
			if (errors && errors.length > 0) {
				return Promise.resolve({
					status: HTTPStatus.BAD_REQUEST,
					message: errorHelper.sendFormattedErrorData(errors),
				});
			} else {
				const alreadyRegister = await req.db.collection('User').findOne(
					{
						email: modelInfo.email,
						deleted: false,
					},
					{ projection: { _id: 1, email: 1 } },
				);
				if (alreadyRegister) {
					return commonHelper.sendNormalResponse(
						res,
						{
							...alreadyRegister,
							already_user: true,
						},
						HTTPStatus.OK,
					);
				}
			}
			const dataRes = await _p.handleBookingRegistration(req, res, modelInfo, false, false, false, next);
			const returnObj = dataRes && dataRes.data ? dataRes.data : {};
			if (returnObj && Object.keys(returnObj).length > 0) {
				delete returnObj.password;
				delete returnObj.password_salt;
				delete returnObj.security_question;
				delete returnObj.security_answer;
				delete returnObj.multi_factor_auth_secret;
			}

			if (dataRes && dataRes.data) {
				return commonHelper.sendDataManipulationMessage(res, { ...returnObj }, dataRes.message, dataRes.status);
			} else {
				return commonHelper.sendResponseData(res, {
					status: dataRes.status,
					message: dataRes.message,
				});
			}
		} catch (err) {
			return next(err);
		}
	};
	_p.handleBookingRegistration = async (req, res, modelInfo, emailVerified, isHotelUser, passwordRequired, next) => {
		req
			.checkBody('agree_terms_condition', moduleConfig.message.validationErrMessage.agree_terms_condition)
			.notEmpty();
		req
			.checkBody('agree_terms_condition', moduleConfig.message.validationErrMessage.agree_terms_condition_valid)
			.isBoolean();
		const errors = await _p.checkValidationErrors(req);
		if (errors && errors.length > 0) {
			return Promise.resolve({
				status: HTTPStatus.BAD_REQUEST,
				message: errorHelper.sendFormattedErrorData(errors),
			});
		} else {
			if (commonHelper.checkDisposableEmail(req.body.email.trim().toLowerCase())) {
				return Promise.resolve({
					status: HTTPStatus.BAD_REQUEST,
					message: moduleConfig.message.invalidEmail,
				});
			}
			if (req.body.agree_terms_condition === 'true' || req.body.agree_terms_condition === true) {
				const registerRes = await _p.saveHelperFunc(
					req,
					modelInfo,
					res,
					isHotelUser,
					emailVerified,
					passwordRequired,
					next,
					false,
				);
				if (registerRes) {
					if (registerRes.data) {
						if (req.query.emergency_referral) {
							req.db.collection('EmergencyContactInvitations').updateOne(
								{
									invitation_code: req.query.invitation_code,
								},
								{
									$set: {
										used: true,
									},
								},
							);
						}
						return Promise.resolve({
							data: registerRes.data,
							status: registerRes.status,
							message: registerRes.message,
						});
					} else {
						return Promise.resolve({
							status: registerRes.status,
							message: registerRes.message,
						});
					}
				} else {
					return Promise.resolve({
						status: HTTPStatus.NOT_MODIFIED,
						message: messageConfig.applicationMessage.dataNotModified,
					});
				}
			} else {
				return Promise.resolve({
					status: HTTPStatus.CONFLICT,
					message: moduleConfig.message.validationErrMessage.agree_terms_condition,
				});
			}
		}
	};
	_p.registerHelperFunc = async (req, res, next) => {
		const modelInfo = utilityHelper.sanitizeUserInput(req, next);

		const countMobile = await req.db.collection('SMSTokens').estimatedDocumentCount({
			mobile_number: req.body.mobile_number,
			country_code: modelInfo.country_code,
			sms_token: modelInfo.code,
			validated: false,
		});

		if (countMobile > 0 || req.mobil_detection || !req.body.imp_user) {
			req.valid_mobile_number =
				req.body.imp_user && req.body.mobile_number && req.body.country_code ? true : false;
			req.checkBody('gender', moduleConfig.message.validationErrMessage.gender).notEmpty();
			req.checkBody('password', moduleConfig.message.validationErrMessage.password).notEmpty();
			const dataRes = await _p.handleNewUserRegistration(req, res, modelInfo, false, false, true, next);
			const returnObj = dataRes && dataRes.data ? dataRes.data : {};
			if (returnObj && Object.keys(returnObj).length > 0) {
				delete returnObj.password;
				delete returnObj.password_salt;
				delete returnObj.security_question;
				delete returnObj.security_answer;
				delete returnObj.multi_factor_auth_secret;
			}
			if (req.body.imp_user) {
				if (dataRes && dataRes.data) {
					req.db.collection('SMSTokens').updateOne(
						{
							country_code: modelInfo.country_code,
							country_abbr: modelInfo.country_abbr,
							mobile_number: modelInfo.mobile_number,
							validated: false,
						},
						{
							$set: {
								validated: true,
							},
						},
					);

					return commonHelper.sendDataManipulationMessage(
						res,
						{ ...returnObj },
						dataRes.message,
						dataRes.status,
					);
				} else {
					return commonHelper.sendResponseData(res, {
						status: dataRes.status,
						message: dataRes.message,
					});
				}
			} else {
				return commonHelper.sendDataManipulationMessage(res, { ...returnObj }, dataRes.message, dataRes.status);
			}
		} else {
			return commonHelper.sendResponseData(res, {
				status: HTTPStatus.BAD_REQUEST,
				message: moduleConfig.message.invalid_sms_token,
			});
		}
	};

	_p.handleNewUserRegistration = async (req, res, modelInfo, emailVerified, isHotelUser, passwordRequired, next) => {
		req
			.checkBody('agree_terms_condition', moduleConfig.message.validationErrMessage.agree_terms_condition)
			.notEmpty();
		req
			.checkBody('agree_terms_condition', moduleConfig.message.validationErrMessage.agree_terms_condition_valid)
			.isBoolean();
		const errors = await _p.checkValidationErrors(req);
		if (errors && errors.length > 0) {
			return Promise.resolve({
				status: HTTPStatus.BAD_REQUEST,
				message: errorHelper.sendFormattedErrorData(errors),
			});
		} else {
			if (commonHelper.checkDisposableEmail(req.body.email.trim().toLowerCase())) {
				return Promise.resolve({
					status: HTTPStatus.BAD_REQUEST,
					message: moduleConfig.message.invalidEmail,
				});
			}
			if (req.body.agree_terms_condition === 'true' || req.body.agree_terms_condition === true) {
				const passwordRes = await _p.checkPasswordValidity(req, modelInfo, res, next);
				if (passwordRes.valid === true) {
					const registerRes = await _p.saveHelperFunc(
						req,
						modelInfo,
						res,
						isHotelUser,
						emailVerified,
						passwordRequired,
						next,
						false,
					);
					if (registerRes) {
						if (registerRes.data) {
							if (req.query.emergency_referral) {
								req.db.collection('EmergencyContactInvitations').updateOne(
									{
										invitation_code: req.query.invitation_code,
									},
									{
										$set: {
											used: true,
										},
									},
								);
							}
							return Promise.resolve({
								data: registerRes.data,
								status: registerRes.status,
								message: registerRes.message,
							});
						} else {
							return Promise.resolve({
								status: registerRes.status,
								message: registerRes.message,
							});
						}
					} else {
						return Promise.resolve({
							status: HTTPStatus.NOT_MODIFIED,
							message: messageConfig.applicationMessage.dataNotModified,
						});
					}
				} else {
					return Promise.resolve({
						status: passwordRes.status,
						message: passwordRes.message,
					});
				}
			} else {
				return Promise.resolve({
					status: HTTPStatus.CONFLICT,
					message: moduleConfig.message.validationErrMessage.agree_terms_condition,
				});
			}
		}
	};

	_p.checkPasswordValidity = async (req, modelInfo, res, next) => {
		if (utilityHelper.checkPasswordStrength(req.body.password.trim())) {
			// About 3 percent of users derive the password from the username
			// This is not very secure and should be disallowed
			if (req.body.password.trim().toLowerCase().indexOf(modelInfo.email.trim().toLowerCase()) === -1) {
				const has_weakPassword = await _p.checkForCommonPassword(req, req.body.password);
				if (has_weakPassword) {
					return Promise.resolve({
						valid: false,
						status: HTTPStatus.BAD_REQUEST,
						message: moduleConfig.message.weakPassword,
					});
				} else {
					return Promise.resolve({
						valid: true,
					});
				}
			} else {
				return Promise.resolve({
					valid: false,
					status: HTTPStatus.BAD_REQUEST,
					message: moduleConfig.message.passwordEqUsername,
				});
			}
		} else {
			return Promise.resolve({
				valid: false,
				status: HTTPStatus.UNAUTHORIZED,
				message: moduleConfig.message.passwordNotStrong,
			});
		}
	};

	_p.constructUserObj = async (
		req,
		res,
		emailVerified,
		modelInfo,
		_documentFields,
		passwordRequired,
		password,
		agree_terms_condition,
		email_offer_subscription,
		user_role,
	) => {
		const newUser = commonHelper.collectFormFields(req, modelInfo, _documentFields, undefined);
		if (passwordRequired === true) {
			const saltPassword = await hasher.createSalt();
			const hashPassword = await hasher.computeHash(req, res, password, saltPassword);
			newUser.password = hashPassword;
			newUser.password_salt = saltPassword;
			newUser.agree_terms_condition = agree_terms_condition;
			newUser.email_offer_subscription = email_offer_subscription;
		}

		newUser.email = modelInfo.email.trim().toLowerCase();
		newUser.username = modelInfo.email.trim().toLowerCase();
		newUser.first_name = modelInfo.first_name;
		newUser.last_name = modelInfo.last_name;
		newUser.active = true;
		newUser.multi_factor_auth_enable = false;
		newUser.multi_factor_auth_enable_mobile = false;
		newUser.security_question = '';
		newUser.security_answer = '';
		newUser.user_role = user_role;
		newUser.suspend = false;
		newUser.deleted = false;
		newUser.blocked = false;
		newUser.confirmed = emailVerified;
		newUser.mobile_number_validated = false;
		newUser.captcha_enable_ips = [];
		newUser.linked_social_accounts = {};
		newUser.history_linked_social_accounts = [];
		newUser.backup_recovery_codes = [];
		newUser.sms_sent = false;

		if (modelInfo.imp_user === true || modelInfo.imp_user === 'true') {
			newUser.imp_user = true;
			newUser.refer_code = modelInfo.refer_code;
			newUser.imp_terms_conditions = true;
		}
		return newUser;
	};

	_p.saveHelperFunc = async (
		req,
		modelInfo,
		res,
		isHotelUser,
		emailVerified,
		passwordRequired,
		next,
		socialAuthLogin,
	) => {
		try {
			if (modelInfo.email && modelInfo.email !== '') {
				let queryOpts = {};
				if (socialAuthLogin) {
					queryOpts = {
						// Searches first_name or last_name
						// Searches first name based on whole query or first_name query
						$and: [
							{
								$or: [
									{
										username: modelInfo.email.trim().toLowerCase(),
									},
									{
										email: modelInfo.email.trim().toLowerCase(),
									},
								],
							},
							{
								deleted: false,
							},
						],
					};
				} else {
					if (modelInfo.mobile_number) {
						queryOpts = {
							// Searches first_name or last_name
							// Searches first name based on whole query or first_name query
							$and: [
								{
									$or: [
										{
											username: modelInfo.email.trim().toLowerCase(),
										},
										{
											email: modelInfo.email.trim().toLowerCase(),
										},
										{
											mobile_number: {
												$eq: modelInfo.mobile_number,
											},
											mobile_number_validated: true,
										},
									],
								},
								{
									deleted: false,
								},
							],
						};
					} else {
						queryOpts = {
							// Searches first_name or last_name
							// Searches first name based on whole query or first_name query
							$and: [
								{
									$or: [
										{
											username: modelInfo.email.trim().toLowerCase(),
										},
										{
											email: modelInfo.email.trim().toLowerCase(),
										},
									],
								},
								{
									deleted: false,
								},
							],
						};
					}
				}

				const newUser = await _p.constructUserObj(
					req,
					res,
					emailVerified,
					modelInfo,
					documentFields,
					passwordRequired,
					req.body.password,
					modelInfo.agree_terms_condition,
					modelInfo.email_offer_subscription,
					isHotelUser ? [ roleConfig.vendor ] : [ roleConfig.enduser ],
				);
				if (req.valid_mobile_number) {
					newUser.country_code = modelInfo.country_code;
					newUser.country_abbr = modelInfo.country_abbr;
					newUser.mobile_number = modelInfo.mobile_number;
					newUser.mobile_number_validated = true;
				}
				const commonRes = await commonProvider.checkForDuplicateRecords(
					req.db.collection('User'),
					queryOpts,
					newUser,
				);
				if (commonRes.exists) {
					const userObj = await req.db.collection('User').findOne({
						email: modelInfo.email.trim().toLowerCase(),
						deleted: false,
					});
					return Promise.resolve({
						status: HTTPStatus.CONFLICT,
						message:
							userObj && userObj.email === modelInfo.email.trim().toLowerCase()
								? moduleConfig.message.alreadyExistsUsername
								: moduleConfig.message.alreadyExistsSignupMobileNumber,
						data: null,
					});
				} else {
					if (commonRes.dataRes.result.n > 0) {
						if (emailVerified) {
							const tokenBytes = await hasher.generateRandomBytes(moduleConfig.config.token_length);
							if (
								newUser.email_offer_subscription === true ||
								newUser.email_offer_subscription === 'true'
							) {
								newsletterController.enableNewEmailSubscription(
									req,
									res,
									newUser.email,
									tokenBytes,
									next,
								);
							}

							notificationController.saveNotificationInfo(
								req,
								moduleConfig.notifications.welcome_message,
								newUser._id,
							);
							if (req.mobil_detection) {
								const device_register_res = await pushNotificationController.updatePushNotificationDeviceDataForMobileUserSignup(
									req,
									newUser._id.toString(),
									req.query.registration_token,
									newUser.user_role,
									req.query.platform,
									next,
								);
								if (device_register_res) {
									pushNotificationController.sendPushNotificationToIndividualDevices(
										req,
										newUser._id.toString(),
										{
											notification: {
												title: moduleConfig.push_notification.title.welcome_message,
												body: moduleConfig.notifications.welcome_message,
											},
										},
										next,
									);
								}
							}
							return Promise.resolve({
								status: HTTPStatus.OK,
								message: moduleConfig.message.saveMessage,
								data: newUser,
							});
						} else {
							const emailRes = await userConfirmationTokenController.sendEmailToUser(
								req,
								res,
								newUser,
								false,
								next,
							);
							notificationController.saveNotificationInfo(
								req,
								moduleConfig.notifications.welcome_message,
								newUser._id,
							);
							if (modelInfo.imp_user !== true && modelInfo.imp_user !== 'true') {
								notificationController.saveNotificationInfo(
									req,
									moduleConfig.notifications.email_confirmation_prompt_message,
									newUser._id,
								);
							}
							if (
								newUser.email_offer_subscription === true ||
								newUser.email_offer_subscription === 'true'
							) {
								const tokenBytes = await hasher.generateRandomBytes(moduleConfig.config.token_length);
								const newsletterRes = await newsletterController.enableNewEmailSubscription(
									req,
									res,
									newUser.email,
									tokenBytes,
									next,
								);
							}

							if (req.mobil_detection) {
								const device_register_res = await pushNotificationController.updatePushNotificationDeviceDataForMobileUserSignup(
									req,
									newUser._id,
									req.query.registration_token,
									newUser.user_role,
									req.query.platform,
									next,
								);
								if (device_register_res) {
									pushNotificationController.sendPushNotificationToIndividualDevices(
										req,
										newUser._id.toString(),
										{
											notification: {
												title: moduleConfig.push_notification.title.welcome_message,
												body: moduleConfig.notifications.welcome_message,
											},
										},
										next,
									);
								}
							}
							return Promise.resolve({
								status:
									emailRes && Object.keys(emailRes).length > 0
										? HTTPStatus.OK
										: HTTPStatus.SERVICE_UNAVAILABLE,
								message:
									emailRes && Object.keys(emailRes).length > 0
										? moduleConfig.message.saveMessage
										: moduleConfig.message.emailError,
								data: newUser,
							});
						}
					}
					return null;
				}
			} else {
				return Promise.resolve({
					status: HTTPStatus.BAD_REQUEST,
					message: moduleConfig.message.validationErrMessage.email,
					data: null,
				});
			}
		} catch (err) {
			return next(err);
		}
	};

	_p.updateUser = async (req, res, next, iam_user = false) => {
		try {
			req.checkBody('username', moduleConfig.message.validationErrMessage.username).notEmpty();
			req.checkBody('gender', moduleConfig.message.validationErrMessage.gender).notEmpty();
			const errors = await _p.checkValidationErrors(req);
			if (errors && errors.length > 0) {
				return commonHelper.sendResponseData(res, {
					status: HTTPStatus.BAD_REQUEST,
					message: errorHelper.sendFormattedErrorData(errors),
				});
			} else {
				const modelInfo = utilityHelper.sanitizeUserInput(req, next);
				const userObj = await req.db.collection('User').findOne(
					{
						_id: utilityHelper.containsElementInArr(
							commonHelper.getLoggedInUserRole(req),
							roleConfig.superadmin,
							next,
						)
							? req.params.userId
							: commonHelper.getLoggedInUserId(req),
					},
					{ projection: projectionFields },
				);

				if (userObj) {
					if (
						userObj.username.toLowerCase() !== modelInfo.username.toLowerCase() ||
						userObj.email.toLowerCase() !== modelInfo.email.toLowerCase()
					) {
						let queryOpts = {};
						// For checking duplicate entry
						if (
							userObj.username.toLowerCase() !== modelInfo.username.toLowerCase() &&
							userObj.email.toLowerCase() !== modelInfo.email.toLowerCase()
						) {
							queryOpts = {
								// Searches first_name or last_name
								// Searches first name based on whole query or first_name query
								$and: [
									{
										username: modelInfo.username.trim().toLowerCase(),
									},
									{
										email: modelInfo.email.trim().toLowerCase(),
									},
								],
							};
						} else if (userObj.username.toLowerCase() !== modelInfo.username.toLowerCase()) {
							queryOpts.username = modelInfo.username.toLowerCase();
						} else {
							queryOpts.email = modelInfo.email.trim().toLowerCase();
						}

						queryOpts.deleted = false;
						const count = await req.db.collection('User').estimatedDocumentCount(queryOpts);

						if (count > 0) {
							return commonHelper.sendResponseData(res, {
								status: HTTPStatus.CONFLICT,
								message: moduleConfig.message.alreadyExists,
							});
						} else {
							_p.updateUserMiddlewareFunc(req, res, modelInfo, userObj, next, iam_user);
						}
					} else {
						_p.updateUserMiddlewareFunc(req, res, modelInfo, userObj, next, iam_user);
					}
				} else {
					return commonHelper.sendResponseData(res, {
						status: HTTPStatus.NOT_FOUND,
						message: moduleConfig.message.notFound,
					});
				}
			}
		} catch (err) {
			return next(err);
		}
	};

	_p.updateUserMiddlewareFunc = async (req, res, modelInfo, userObj, next, iam_user) => {
		const imageInfo = utilityHelper.getDocumentFileInfo(
			req,
			{
				document_name: userObj.image_name,
				document_original_name: userObj.image_original_name,
			},
			next,
		);
		const updateOpts = commonHelper.collectFormFields(req, modelInfo, updateDocFields, 'update');
		updateOpts.image_name = imageInfo.document_name ? imageInfo.document_name : '';
		updateOpts.image_original_name = imageInfo.document_original_name ? imageInfo.document_original_name : '';
		updateOpts.phone_number = modelInfo.phone_number ? modelInfo.phone_number : '';
		updateOpts.username = modelInfo.username;
		updateOpts.birth_date = modelInfo.birth_date;
		if (iam_user) {
			updateOpts.user_role = [ modelInfo.user_role ];
		}
		const dataRes = await req.db.collection('User').updateOne(
			{
				_id: utilityHelper.containsElementInArr(
					commonHelper.getLoggedInUserRole(req),
					roleConfig.superadmin,
					next,
				)
					? req.params.userId
					: commonHelper.getLoggedInUserId(req),
			},
			{ $set: updateOpts },
		);
		updateOpts._id = utilityHelper.containsElementInArr(
			commonHelper.getLoggedInUserRole(req),
			roleConfig.superadmin,
			next,
		)
			? req.params.userId
			: commonHelper.getLoggedInUserId(req);
		if (dataRes.result.n > 0) {
			const user = await req.db
				.collection('User')
				.findOne({ _id: updateOpts._id }, { projection: { zoho_crm_id: 1 } });
			const country = await req.db.collection('countries').findOne({ id: updateOpts.address_country });
		}
		if (dataRes.result.n > 0) {
			const auth_token_info = await jwtTokenGeneratorHelper.generateJWTToken(req, {
				...userObj,
				...updateOpts,
				...imageInfo,
			});
			const user_agent = userAgent.lookup(req.headers['user-agent']);
			const ip_address = req.client_ip_address;
			const _hours = utilityHelper.removeCharFromString(tokenConfigs.expires, 'h');
			const tokenExpiryDate = new Date(new Date().getTime() + parseInt(_hours) * 60 * 60 * 1000);
			const geoLocationObj = await commonHelper.getGeoLocationInfo(req.client_ip_address.toString());

			const dataRes = await authorizationTokenController.postAuthorizationTokenInfo(
				req,
				auth_token_info.token,
				user_agent,
				user_agent.family,
				user_agent.major,
				geoLocationObj ? geoLocationObj.country : '',
				geoLocationObj ? geoLocationObj.city : '',
				ip_address,
				tokenExpiryDate,
				userObj._id,
				next,
			);
			pushNotificationController.sendPushNotificationToIndividualDevices(
				req,
				utilityHelper.containsElementInArr(commonHelper.getLoggedInUserRole(req), roleConfig.superadmin, next)
					? req.params.userId
					: commonHelper.getLoggedInUserId(req),
				{
					notification: {
						title: moduleConfig.push_notification.title.profile_information_updated,
						body: moduleConfig.notifications.profile_info_message,
					},
					data: {
						token: auth_token_info.token,
						user_info: JSON.stringify(auth_token_info.userInfo),
					},
				},
				next,
			);
		}
		return commonHelper.sendJsonResponseMessage(res, dataRes, updateOpts, moduleConfig.message.updateMessage);
	};

	_p.sendMobileValidationToken = async (req, res, next) => {
		try {
			req.checkBody('country_code', moduleConfig.message.validationErrMessage.country_code).notEmpty();
			req.checkBody('country_abbr', moduleConfig.message.validationErrMessage.country_abbr).notEmpty();
			req.checkBody('mobile_number', moduleConfig.message.validationErrMessage.mobile_number).notEmpty();
			const result = await req.getValidationResult();
			const errors = result.array();

			if (errors && errors.length > 0) {
				return commonHelper.sendResponseData(res, {
					status: HTTPStatus.BAD_REQUEST,
					message: errorHelper.sendFormattedErrorData(errors),
				});
			} else {
				const modelInfo = utilityHelper.sanitizeUserInput(req, next);
				const queryOpts = {
					mobile_number_validated: true,
					mobile_number: modelInfo.mobile_number,
					_id: {
						$ne: commonHelper.getLoggedInUserId(req),
					},
					deleted: false,
				};

				const count = await req.db.collection('User').estimatedDocumentCount(queryOpts);
				if (count > 0) {
					return commonHelper.sendResponseData(res, {
						status: HTTPStatus.CONFLICT,
						message: moduleConfig.message.alreadyExistsMobileNumber,
					});
				} else {
					const userObj = await req.db.collection('User').findOne({
						_id: commonHelper.getLoggedInUserId(req),
						mobile_number_validated: true,
						mobile_number: modelInfo.mobile_number,
					});
					if (userObj) {
						return commonHelper.sendResponseData(res, {
							status: HTTPStatus.CONFLICT,
							message: moduleConfig.message.mobile_number_validated,
						});
					} else {
						const randomToken = await hasher.generateRandomBytes(moduleConfig.config.mobile_token_length);
						const smsTokenObj = {
							_id: uuidv1(),
							sms_token: randomToken,
							user_id: commonHelper.getLoggedInUserId(req),
							expires: new Date(
								new Date().getTime() + 1000 * 60 * 60 * moduleConfig.config.token_expiry_date_in_mins,
							),
							used: false,
							expired: false,
							added_on: new Date(),
						};

						const userRes = await req.db.collection('User').updateOne(
							{ _id: commonHelper.getLoggedInUserId(req) },
							{
								$set: {
									country_code: modelInfo.country_code,
									country_abbr: modelInfo.country_abbr,
									mobile_number: modelInfo.mobile_number,
								},
							},
						);
						if (userRes.result.n > 0) {
							const dataRes = await req.db.collection('SMSTokens').insertOne(smsTokenObj);
							if (dataRes.result.n > 0) {
								const message = smsConfig.sms_message_verification;
								const message_sms =
									message.indexOf('%verification_token%') > -1
										? message.replace('%verification_token%', randomToken)
										: message;

								const smsRes = await smsHelper.sendSMS(
									`${modelInfo.country_code}${modelInfo.mobile_number}`,
									message_sms,
								);
								if (smsRes) {
									req.db.collection('User').updateOne(
										{ _id: commonHelper.getLoggedInUserId(req) },
										{
											$set: {
												sms_sent: true,
											},
										},
									);
									return commonHelper.sendResponseData(res, {
										status: HTTPStatus.OK,
										message: moduleConfig.message.sms_sent,
									});
								} else {
									return commonHelper.sendResponseData(res, {
										status: HTTPStatus.BAD_REQUEST,
										message: moduleConfig.message.sms_error,
									});
								}
							}
						}
					}
				}
			}
		} catch (err) {
			return next(err);
		}
	};

	_p.sendMobileValidationTokenToAnonymousUser = async (req, res, next) => {
		try {
			req.checkBody('country_code', moduleConfig.message.validationErrMessage.country_code).notEmpty();
			req.checkBody('country_abbr', moduleConfig.message.validationErrMessage.country_abbr).notEmpty();
			req.checkBody('mobile_number', moduleConfig.message.validationErrMessage.mobile_number).notEmpty();
			const result = await req.getValidationResult();
			const errors = result.array();

			if (errors && errors.length > 0) {
				return commonHelper.sendResponseData(res, {
					status: HTTPStatus.BAD_REQUEST,
					message: errorHelper.sendFormattedErrorData(errors),
				});
			} else {
				const modelInfo = utilityHelper.sanitizeUserInput(req, next);
				const queryOpts = {
					mobile_number: modelInfo.mobile_number,
					country_code: modelInfo.country_code,
				};
				const count = await req.db.collection('SMSTokens').estimatedDocumentCount({
					...queryOpts,
					validated: true,
				});
				if (count > 0) {
					return commonHelper.sendResponseData(res, {
						status: HTTPStatus.CONFLICT,
						message: moduleConfig.message.alreadyExistsMobileNumber,
					});
				} else {
					const count = await req.db.collection('User').estimatedDocumentCount({
						...queryOpts,
						mobile_number_validated: true,
						deleted: false,
					});
					if (count > 0) {
						return commonHelper.sendResponseData(res, {
							status: HTTPStatus.CONFLICT,
							message: moduleConfig.message.alreadyExistsMobileNumber,
						});
					} else {
						const dataMobile = await req.db.collection('SMSTokens').findOne(queryOpts);
						let dataRes;
						const randomToken = await hasher.generateRandomBytes(moduleConfig.config.mobile_token_length);

						if (dataMobile && Object.keys(dataMobile).length > 0) {
							const ip_addr_max = dataMobile.history.filter((item) => {
								if (item.added_on && item.ip_address === req.client_ip_address) {
									return item;
								}
							});
							if (ip_addr_max && ip_addr_max.length > moduleConfig.config.max_sms_quota_per_ip) {
								return commonHelper.sendResponseData(res, {
									status: HTTPStatus.METHOD_NOT_ALLOWED,
									message: moduleConfig.message.sms_max_entry_per_ip,
								});
							} else {
								const day_max = dataMobile.history.filter((item) => {
									if (
										item.added_on &&
										utilityHelper.getFormattedDate(item.added_on, '/') ===
											utilityHelper.getFormattedDate(new Date(), '/', next)
									) {
										return item;
									}
								});
								if (day_max && day_max.length > moduleConfig.config.max_sms_quota_per_day) {
									return commonHelper.sendResponseData(res, {
										status: HTTPStatus.METHOD_NOT_ALLOWED,
										message: moduleConfig.message.sms_max_entry,
									});
								} else {
									dataRes = await req.db.collection('SMSTokens').updateOne(queryOpts, {
										$set: {
											sms_token: randomToken,
											modified_on: new Date(),
											country_code: modelInfo.country_code,
											country_abbr: modelInfo.country_abbr,
											ip_address: req.client_ip_address,
											mobile_number: modelInfo.mobile_number,
										},
										$push: {
											history: {
												sms_token: randomToken,
												country_code: modelInfo.country_code,
												country_abbr: modelInfo.country_abbr,
												ip_address: req.client_ip_address,
												mobile_number: modelInfo.mobile_number,
												added_on: new Date(),
											},
										},
									});
								}
							}
						} else {
							const smsTokenObj = {
								_id: uuidv1(),
								sms_token: randomToken,
								validated: false,
								added_on: new Date(),
								country_code: modelInfo.country_code,
								country_abbr: modelInfo.country_abbr,
								ip_address: req.client_ip_address,
								mobile_number: modelInfo.mobile_number,
								sms_type: 'anonymous_user',
								history: [
									{
										sms_token: randomToken,
										country_code: modelInfo.country_code,
										country_abbr: modelInfo.country_abbr,
										ip_address: req.client_ip_address,
										mobile_number: modelInfo.mobile_number,
										added_on: new Date(),
									},
								],
							};

							dataRes = await req.db.collection('SMSTokens').insertOne(smsTokenObj);
						}

						if (dataRes.result.n > 0) {
							const message = smsConfig.sms_message_verification;
							const message_sms =
								message.indexOf('%verification_token%') > -1
									? message.replace('%verification_token%', randomToken)
									: message;

							const smsRes = await smsHelper.sendSMS(
								`${modelInfo.country_code}${modelInfo.mobile_number}`,
								message_sms,
							);
							if (smsRes) {
								return commonHelper.sendResponseData(res, {
									status: HTTPStatus.OK,
									message: moduleConfig.message.sms_sent,
								});
							} else {
								return commonHelper.sendResponseData(res, {
									status: HTTPStatus.BAD_REQUEST,
									message: moduleConfig.message.sms_error,
								});
							}
						}
					}
				}
			}
		} catch (err) {
			return next(err);
		}
	};

	_p.validateMobileNumber = async (req, res, next) => {
		try {
			const queryOpts = {
				sms_token: req.body.sms_token,
				expires: {
					$gte: new Date(),
				},
				user_id: commonHelper.getLoggedInUserId(req),
				expired: false,
			};

			//check to see if the token exists in the collection with specified query parameters
			const tokenInfo = await req.db.collection('SMSTokens').findOne(queryOpts, { projection: projectionFields });
			if (tokenInfo) {
				const queryOpts = {
					_id: commonHelper.getLoggedInUserId(req),
				};
				const updateOpts = {
					$set: {
						mobile_number_validated: true,
					},
				};

				const userRes = await req.db.collection('User').updateOne(queryOpts, updateOpts);
				if (userRes.result.n > 0) {
					const dataRes = await req.db.collection('SMSTokens').updateOne(
						{ sms_token: req.body.sms_token },
						{
							$set: {
								expired: true,
								used: true,
							},
						},
					);

					const userObj = await req.db
						.collection('User')
						.findOne({ _id: commonHelper.getLoggedInUserId(req) });

					commonHelper.sendResponseMessage(
						res,
						userRes,
						null,
						moduleConfig.message.mobile_validation_success,
					);
				}
			} else {
				return commonHelper.sendResponseData(res, {
					status: HTTPStatus.NOT_FOUND,
					message: moduleConfig.message.notFound_sms,
				});
			}
		} catch (err) {
			return next(err);
		}
	};

	_p.validateMobileNumberForAnonymousUser = async (req, res, next) => {
		try {
			const queryOpts = {
				sms_token: req.body.sms_token,
				expires: {
					$gte: new Date(),
				},
				user_id: commonHelper.getLoggedInUserId(req),
				expired: false,
			};

			//check to see if the token exists in the collection with specified query parameters
			const tokenInfo = await req.db.collection('SMSTokens').findOne(queryOpts, { projection: projectionFields });
			if (tokenInfo) {
				const queryOpts = {
					_id: commonHelper.getLoggedInUserId(req),
				};
				const updateOpts = {
					$set: {
						mobile_number_validated: true,
					},
				};

				const userRes = await req.db.collection('User').updateOne(queryOpts, updateOpts);
				if (userRes.result.n > 0) {
					const dataRes = await req.db.collection('SMSTokens').updateOne(
						{ sms_token: req.body.sms_token },
						{
							$set: {
								expired: true,
								used: true,
							},
						},
					);
					commonHelper.sendResponseMessage(
						res,
						userRes,
						null,
						moduleConfig.message.mobile_validation_success,
					);
				}
			} else {
				return commonHelper.sendResponseData(res, {
					status: HTTPStatus.NOT_FOUND,
					message: moduleConfig.message.notFound_sms,
				});
			}
		} catch (err) {
			return next(err);
		}
	};

	_p.resendConfirmationEmail = async (req, res, next) => {
		try {
			let userId = '';
			if (req.params.userId) {
				userId = req.params.userId;
			} else {
				userId = commonHelper.getLoggedInUserId(req);
			}
			if (userId !== '') {
				const userObj = await req.db.collection('User').findOne({ _id: userId });
				if (userObj && userObj.confirmed) {
					return commonHelper.sendResponseData(res, {
						status: HTTPStatus.CONFLICT,
						message: moduleConfig.message.accountAlreadyConfirmed,
					});
				} else {
					const emailRes = await userConfirmationTokenController.sendEmailToUser(
						req,
						res,
						userObj,
						true,
						next,
					);
					return commonHelper.sendResponseData(res, {
						status:
							emailRes && Object.keys(emailRes).length > 0
								? HTTPStatus.OK
								: HTTPStatus.SERVICE_UNAVAILABLE,
						message:
							emailRes && Object.keys(emailRes).length > 0
								? moduleConfig.message.emailConfirmationLink
								: moduleConfig.message.emailError,
					});
				}
			} else {
				return commonHelper.sendResponseData(res, {
					status: HTTPStatus.BAD_REQUEST,
					message: moduleConfig.message.invalidUserId,
				});
			}
		} catch (err) {
			return next(err);
		}
	};

	_p.checkReCaptchaEnable = async (req, res, next) => {
		try {
			const captchaObj = await req.db.collection('CaptchaTracker').findOne({ ip_address: req.client_ip_address });
			return commonHelper.sendJsonResponse(
				res,
				{
					captcha_enable: captchaObj ? true : false,
				},
				'',
				HTTPStatus.OK,
			);
		} catch (err) {
			return next(err);
		}
	};

	_p.logOut = async (req, res, next) => {
		try {
			const token =
				req.body.token || req.query.token || req.headers['x-access-token'] || req.headers.authorization;
			const dataRes = await req.db.collection('AuthorizationToken').updateOne(
				{
					user_id: commonHelper.getLoggedInUserId(req),
					authorization_token: token,
				},
				{
					$set: {
						deleted: true,
						deleted_on: new Date(),
						deleted_by: commonHelper.getLoggedInUser(req),
					},
				},
			);
			if (req.mobil_detection) {
				pushNotificationController.updateLoggedInStatusOfDevices(req, commonHelper.getLoggedInUserId(req));
			}
			commonHelper.sendResponseMessage(res, dataRes, null, moduleConfig.message.user_logout);
		} catch (err) {
			return next(err);
		}
	};

	_p.getUserMobileInfo = (req, res, next) => {
		try {
			return req.db.collection('User').findOne(
				{ _id: commonHelper.getLoggedInUserId(req) },
				{
					projection: {
						_id: 1,
						country_code: 1,
						country_abbr: 1,
						mobile_number: 1,
						mobile_number_validated: 1,
						sms_sent: 1,
					},
				},
			);
		} catch (err) {
			return next(err);
		}
	};

	_p.removeUserMobileInfo = async (req, res, next) => {
		try {
			const userRes = await req.db.collection('User').updateOne(
				{ _id: commonHelper.getLoggedInUserId(req) },
				{
					$set: {
						country_code: '',
						country_abbr: '',
						mobile_number: '',
						mobile_number_validated: false,
						sms_sent: false,
					},
				},
			);

			const userObj = await req.db.collection('User').findOne({ _id: commonHelper.getLoggedInUserId(req) });
			const zohoUpdate = {
				Country_Code: '',
				Mobile: '',
			};
			// zohoCrmContactHelper.UpdateContact(req, res, next, zohoUpdate, userObj.zoho_crm_id);

			commonHelper.sendResponseMessage(res, userRes, null, moduleConfig.message.mobile_remove_success);
		} catch (err) {
			return next(err);
		}
	};

	_p.verifyOAuthLogin = async (req, provider, provider_id) => {
		return req.db
			.collection('User')
			.find({
				'oauth_providers.provider': provider,
				'oauth_providers.provider_id': provider_id,
				deleted: false,
			})
			.toArray();
	};

	_p.saveMobileTwoFactorAuthSecret = async (req, res, secret_token, userObj) => {
		try {
			if (userObj.mobile_number_validated) {
				const userRes = await req.db.collection('User').updateOne(
					{ _id: commonHelper.getLoggedInUserId(req) },
					{
						$set: {
							multi_factor_auth_secret_mobile: secret_token,
							multi_factor_auth_enable_mobile: false,
						},
					},
				);
				return {
					success: userRes && userRes.result && userRes.result.n > 0 ? true : false,
				};
			} else {
				return {
					success: false,
					message: moduleConfig.message.verify_mobile_number,
					status: HTTPStatus.BAD_REQUEST,
				};
			}
		} catch (err) {
			return next(err);
		}
	};

	// _p.checkSocialAccountExists = async (req, account_type, accountObj, next) => {
	//     try {
	//         if (req.params.access_token && req.params.access_token !== undefined) {
	//             const countAccountLinks = await req.db.collection('User').aggregate([
	//                 {
	//                   $match: {
	//                       "deleted": false
	//                   }
	//                 },
	//                 {
	//                     $project: {
	//                         items: {
	//                             $filter: {
	//                                 input: "$items",
	//                                 as: "item",
	//                                 cond: {
	//                                     $eq: {
	//                                         [`linked_social_accounts.${account_type}`]: {
	//                                             $exists: true
	//                                         }
	//                                     }
	//                                 }
	//                             }
	//                         }
	//                     }
	//                 },
	//                 {
	//                     $count: "linked_accounts"
	//                 }
	//             ]);
	//             return (countAccountLinks > 0) ? true : false;
	//         }
	//         return false;
	//     } catch (err) {
	//         return next(err);
	//     }
	// };

	_p.checkSocialAccountExists = async (req, account_type, accountObj, next) => {
		try {
			if (req.params.access_token && req.params.access_token !== undefined) {
				const existingUserObj = await req.db.collection('User').findOne({
					$and: [
						{
							deleted: false,
						},
						{
							$and: [
								{
									[`linked_social_accounts.${account_type}`]: {
										$exists: true,
									},
								},
								{
									[`linked_social_accounts.${account_type}.id`]: accountObj.id,
								},
							],
						},
					],
				});

				if (existingUserObj && Object.keys(existingUserObj).length > 0) {
					if (
						existingUserObj.agree_terms_condition &&
						existingUserObj.password &&
						existingUserObj.password !== ''
					) {
						return {
							exists: true,
						};
					} else {
						return {
							exists: false,
							first_attempt_social_login: true,
						};
					}
				}
			}
			return {
				exists: false,
			};
		} catch (err) {
			return next(err);
		}
	};

	_p.checkSocialAccountLinked = async (req, account_type, next) => {
		try {
			if (req.params.access_token && req.params.access_token !== undefined) {
				const countAccountLinks = await req.db.collection('User').estimatedDocumentCount({
					_id: commonHelper.getLoggedInUserId(req),
					deleted: false,
					[`linked_social_accounts.${account_type}`]: {
						$exists: true,
					},
				});
				return countAccountLinks > 0 ? true : false;
			}
			return false;
		} catch (err) {
			return next(err);
		}
	};

	_p.linkSocialAccounts = async (req, res, next, account_type, dataObj, socialLogin, userObj) => {
		try {
			if ((userObj && Object.keys(userObj).length > 0) || !socialLogin) {
				const linkRes = await req.db.collection('User').updateOne(
					{ _id: socialLogin ? userObj._id : commonHelper.getLoggedInUserId(req) },
					{
						$set: {
							[`linked_social_accounts.${account_type}`]: {
								...dataObj,
								linked: true,
							},
						},
					},
				);
				return linkRes.result.n > 0 ? true : false;
			} else {
				return false;
			}
		} catch (err) {
			return next(err);
		}
	};

	_p.unLinkSocialAccount = async (req, res, next, account_type) => {
		try {
			const accountData = await req.db.collection('User').findOne(
				{
					_id: commonHelper.getLoggedInUserId(req),
					[`linked_social_accounts.${account_type}`]: {
						$exists: true,
					},
					deleted: false,
				},
				{
					projection: {
						_id: 0,
						[`linked_social_accounts.${account_type}`]: 1,
					},
				},
			);
			const accountObj =
				accountData && accountData.linked_social_accounts ? accountData.linked_social_accounts : {};
			const updateRes = await req.db.collection('User').updateOne(
				{ _id: commonHelper.getLoggedInUserId(req) },
				{
					$push: {
						history_linked_social_accounts: accountObj,
					},
				},
			);
			if (updateRes.result.n > 0) {
				const unlinkRes = await req.db.collection('User').updateOne(
					{
						_id: commonHelper.getLoggedInUserId(req),
						deleted: false,
					},
					{
						$unset: {
							[`linked_social_accounts.${account_type}`]: '',
						},
					},
				);
				return unlinkRes.result.n > 0 ? true : false;
			}
			return false;
		} catch (err) {
			return next(err);
		}
	};

	_p.acceptTermsAndConditions = async (req, res, next, user_id) => {
		try {
			const password = req.body.password.toString();
			const has_weakPassword = await _p.checkForCommonPassword(req, password);
			if (has_weakPassword) {
				return commonHelper.sendResponseData(res, {
					status: HTTPStatus.BAD_REQUEST,
					message: moduleConfig.message.weakPassword,
				});
			} else {
				const salt = await hasher.createSalt();
				const hashPassword = await hasher.computeHash(req, res, password, salt);
				const udpateUserObj = {
					password: hashPassword,
					password_salt: salt,
					updated_by: commonHelper.getLoggedInUser(req),
					agree_terms_condition: true,
					email_offer_subscription:
						req.body.email_offer_subscription === true || req.body.email_offer_subscription === 'true'
							? true
							: false,
				};
				if (req.body.imp_user === 'true' || req.body.imp_user === true) {
					udpateUserObj.imp_user = true;
					udpateUserObj.refer_code = req.body.refer_code ? req.body.refer_code : '';
				}
				const userRes = await req.db.collection('User').updateOne(
					{ _id: user_id },
					{
						$set: udpateUserObj,
					},
				);
				return {
					success: userRes && userRes.result && userRes.result.n > 0 ? true : false,
				};
			}
		} catch (err) {
			return next(err);
		}
	};
	_p.isTourCompleted = async (req, res, next) => {
		try {
			const userRes = await req.db
				.collection('User')
				.findOne({ _id: commonHelper.getLoggedInUserId(req) }, { projection: { isTourCompleted: 1 } });
			const tourComplete = userRes && userRes.isTourCompleted ? false : true;
			commonHelper.sendNormalResponse(res, tourComplete, HTTPStatus.OK);
		} catch (err) {
			next(err);
		}
	};
	_p.completedTour = async (req, res, next) => {
		try {
			const userRes = await req.db
				.collection('User')
				.updateOne({ _id: commonHelper.getLoggedInUserId(req) }, { $set: { isTourCompleted: true } });
			commonHelper.sendNormalResponse(res, false, HTTPStatus.OK);
		} catch (err) {
			next(err);
		}
	};

	_p.updateEmailAddress = async (req, res, next) => {
		try {
			const errors = await _p.checkEmailUpdateValidationErrors(req);
			if (errors && errors.length > 0) {
				return commonHelper.sendResponseData(res, {
					status: HTTPStatus.BAD_REQUEST,
					message: errorHelper.sendFormattedErrorData(errors),
				});
			} else {
				if (req.body.previous_email.trim().toLowerCase() === req.body.new_email.trim().toLowerCase()) {
					return commonHelper.sendResponseData(res, {
						status: HTTPStatus.BAD_REQUEST,
						message: messageConfig.applicationMessage.bothEmailSame,
					});
				} else {
					const modelInfo = utilityHelper.sanitizeUserInput(req, next);
					const updateEmailTokenObj = await _p.getEmailUpdateTokenInfo(req, res, next, {
						token: req.params.token,
						used: false,
						expires: {
							$gte: new Date(),
						},
					});
					if (updateEmailTokenObj && Object.keys(updateEmailTokenObj).length > 0) {
						const currentUserObj = await req.db.collection('User').findOne({
							email: modelInfo.previous_email,
							deleted: false,
						});

						if (currentUserObj && Object.keys(currentUserObj).length > 0) {
							if (currentUserObj._id.toString() === updateEmailTokenObj.user_id.toString()) {
								const newEmailVerificationTokenObj = await req.db
									.collection('NewEmailConfirmationTokens')
									.findOne({
										verification_token: modelInfo.email_verification_code,
										email: modelInfo.new_email,
										used: false,
									});

								if (
									newEmailVerificationTokenObj &&
									Object.keys(newEmailVerificationTokenObj).length > 0
								) {
									const queryOpts = {
										// Searches first_name or last_name
										// Searches first name based on whole query or first_name query
										$and: [
											{
												$or: [
													{
														username: modelInfo.new_email.trim().toLowerCase(),
													},
													{
														email: modelInfo.new_email.trim().toLowerCase(),
													},
												],
											},
											{
												deleted: false,
											},
										],
									};
									const newUserCount = await req.db
										.collection('User')
										.estimatedDocumentCount(queryOpts);
									if (newUserCount > 0) {
										return commonHelper.sendResponseData(res, {
											status: HTTPStatus.CONFLICT,
											message: moduleConfig.message.alreadyExistsUsername,
										});
									} else {
										const updateRes = await req.db.collection('User').updateOne(
											{
												_id: currentUserObj._id,
												deleted: false,
											},
											{
												$set: {
													email: modelInfo.new_email.trim().toLowerCase(),
													username: modelInfo.new_email.trim().toLowerCase(),
													history_user_email_updates: currentUserObj,
												},
											},
										);

										if (updateRes.result.n > 0) {
											const newUser = {
												...currentUserObj,
												email: modelInfo.new_email.trim().toLowerCase(),
												username: modelInfo.new_email.trim().toLowerCase(),
											};

											const emailRes = await _p.sendEmailUpdateNotificationToUser(
												req,
												res,
												newUser,
												next,
											);
											notificationController.saveNotificationInfo(
												req,
												moduleConfig.notifications.email_update_message,
												newUser._id,
											);
											req.db.collection('NewEmailConfirmationTokens').updateOne(
												{
													verification_token: modelInfo.email_verification_code,
													email: modelInfo.new_email,
												},
												{
													$set: { used: true },
												},
											);
											req.db.collection('EmailUpdateTokens').updateOne(
												{
													token: req.params.token,
													used: false,
												},
												{
													$set: { used: true },
												},
											);
											if (
												modelInfo.email_offer_subscription === true ||
												modelInfo.email_offer_subscription === 'true'
											) {
												const tokenBytes = await hasher.generateRandomBytes(
													moduleConfig.config.token_length,
												);
												const newsletterRes = await newsletterController.enableNewEmailSubscription(
													req,
													res,
													newUser.email,
													tokenBytes,
													next,
												);
											}

											if (req.mobil_detection) {
												pushNotificationController.sendPushNotificationToIndividualDevices(
													req,
													newUser._id.toString(),
													{
														notification: {
															title:
																moduleConfig.push_notification.title
																	.email_update_message,
															body: moduleConfig.notifications.email_update_message,
														},
													},
													next,
												);
											}
											return commonHelper.sendResponseData(res, {
												status: HTTPStatus.OK,
												message: moduleConfig.message.emailUpdateSuccess,
											});
										} else {
											return commonHelper.sendResponseData(res, {
												status: HTTPStatus.NOT_MODIFIED,
												message: messageConfig.applicationMessage.dataNotModified,
											});
										}
									}
								} else {
									return commonHelper.sendResponseData(res, {
										status: HTTPStatus.BAD_REQUEST,
										message: moduleConfig.message.invalidEmailVerificationToken,
									});
								}
							} else {
								return commonHelper.sendResponseData(res, {
									status: HTTPStatus.BAD_REQUEST,
									message: moduleConfig.message.userVerificationFailed,
								});
							}
						} else {
							return commonHelper.sendResponseData(res, {
								status: HTTPStatus.NOT_FOUND,
								message: moduleConfig.message.notFound,
							});
						}
					} else {
						return commonHelper.sendResponseData(res, {
							status: HTTPStatus.BAD_REQUEST,
							message: moduleConfig.message.invalidEmailUpdateToken,
						});
					}
				}
			}
		} catch (err) {
			return next(err);
		}
	};

	_p.sendEmailUpdateNotificationToUser = async (req, res, userObj, next) => {
		return _p.sendEmailHelperFunc(
			req,
			res,
			userObj,
			emailTemplateConfigs.sendEmailUpdateNotificationText,
			null,
			next,
		);
	};

	_p.sendEmailUpdateVerificationLink = async (req, res, next) => {
		try {
			const userObj = await req.db.collection('User').findOne({
				_id: req.params.userId,
			});
			if (userObj && Object.keys(userObj).length > 0) {
				const currentDate = new Date();
				const tokenBytes = await hasher.generateRandomBytes(moduleConfig.config.token_length);
				const dataRes = await req.db.collection('EmailUpdateTokens').insertOne({
					_id: uuidv1(),
					token: tokenBytes,
					expires: new Date(
						currentDate.getTime() + 1000 * 60 * 60 * moduleConfig.config.token_expiry_date_in_hours,
					),
					user_id: req.params.userId,
					used: false,
					added_on: new Date(),
				});

				if (dataRes && dataRes.result && dataRes.result.n > 0) {
					const emailRes = await _p.sendEmailHelperFunc(
						req,
						res,
						userObj,
						emailTemplateConfigs.sendEmailUpdateVerificationLink,
						tokenBytes,
						next,
					);
					return commonHelper.sendResponseData(res, {
						status: emailRes && Object.keys(emailRes).length > 0 ? HTTPStatus.OK : HTTPStatus.GONE,
						message:
							emailRes && Object.keys(emailRes).length > 0
								? moduleConfig.message.emailUpdateVerificationTokenSent
								: moduleConfig.message.emailError,
					});
				} else {
					return commonHelper.sendResponseData(res, {
						status: HTTPStatus.NOT_MODIFIED,
						message: messageConfig.applicationMessage.dataNotModified,
					});
				}
			} else {
				return commonHelper.sendResponseData(res, {
					status: HTTPStatus.NOT_FOUND,
					message: moduleConfig.message.notFound,
				});
			}
		} catch (err) {
			return next(err);
		}
	};

	_p.sendEmailUpdateConfirmationToken = async (req, res, next) => {
		try {
			req.checkBody('new_email', moduleConfig.message.validationErrMessage.new_email).notEmpty();
			req.checkBody('new_email', moduleConfig.message.validationErrMessage.new_email_invalid).isEmail();
			let result = await req.getValidationResult();
			result = result.array();
			if (result && result.length > 0) {
				return commonHelper.sendResponseData(res, {
					status: HTTPStatus.BAD_REQUEST,
					message: errorHelper.sendFormattedErrorData(result),
				});
			} else {
				const userCount = await req.db.collection('User').estimatedDocumentCount({
					// Searches first_name or last_name
					// Searches first name based on whole query or first_name query
					$and: [
						{
							$or: [
								{
									username: req.body.new_email.trim().toLowerCase(),
								},
								{
									email: req.body.new_email.trim().toLowerCase(),
								},
							],
						},
						{
							deleted: false,
						},
					],
				});

				if (userCount <= 0) {
					const tokenBytes = await hasher.generateRandomBytes(moduleConfig.config.token_length);

					const dataRes = await req.db.collection('NewEmailConfirmationTokens').insertOne({
						_id: uuidv1(),
						verification_token: tokenBytes,
						email: req.body.new_email,
						used: false,
						added_on: new Date(),
					});
					if (dataRes && dataRes.result && dataRes.result.n > 0) {
						const emailRes = await _p.sendEmailHelperFunc(
							req,
							res,
							{
								email: req.body.new_email,
							},
							emailTemplateConfigs.sendEmailUpdateConfirmationToken,
							tokenBytes,
							next,
						);

						return commonHelper.sendResponseData(res, {
							status: emailRes && Object.keys(emailRes).length > 0 ? HTTPStatus.OK : HTTPStatus.GONE,
							message:
								emailRes && Object.keys(emailRes).length > 0
									? moduleConfig.message.emailConfirmationTokenSent
									: moduleConfig.message.emailError,
						});
					} else {
						return commonHelper.sendResponseData(res, {
							status: HTTPStatus.NOT_MODIFIED,
							message: messageConfig.applicationMessage.dataNotModified,
						});
					}
				} else {
					return commonHelper.sendResponseData(res, {
						status: HTTPStatus.CONFLICT,
						message: moduleConfig.message.alreadyExistsUsername,
					});
				}
			}
		} catch (err) {
			return next(err);
		}
	};

	_p.sendEmailHelperFunc = async (req, res, userObj, _templateId, token, next) => {
		try {
			req.params.templateId = _templateId;

			if (req.params.templateId) {
				const emailTemplateInfo = await emailTemplateController.getEmailTemplateDataByID(req);

				let messageBody = '';
				if (emailTemplateInfo && emailTemplateInfo.template_content) {
					messageBody = emailTemplateInfo.template_content;

					if (messageBody.indexOf('%message.name%') > -1) {
						messageBody = messageBody.replace(
							'%message.name%',
							`${userObj.first_name} ${userObj.last_name}`,
						);
					}

					if (messageBody.indexOf('%message.confirmation_token%') > -1) {
						messageBody = messageBody.replace('%message.confirmation_token%', token);
					}

					if (messageBody.indexOf('%message.verification_link%') > -1) {
						messageBody = messageBody.replace(
							new RegExp('%message.verification_link%', 'g'),
							`${req.protocol}://${appConfig.client_app_url}${moduleConfig.config
								.verification_link}${token}`,
						);
					}

					let message_template = emailTemplateContentConfigs.system_emails;

					if (message_template.indexOf('%email_content%') > -1) {
						message_template = message_template.replace('%email_content%', messageBody);
					}
					const mailOptions = {
						fromEmail: emailTemplateInfo.email_from, // sender address
						toEmail: userObj.email, // list of receivers
						subject: emailTemplateInfo.email_subject, // Subject line
						textMessage: message_template, // plaintext body
						htmlTemplateMessage: message_template,
						attachments: emailTemplateInfo.attachments,
					};
					return emailHelper.sendEmail(req, mailOptions, next);
				}
			}
			return null;
		} catch (err) {
			return next(err);
		}
	};

	_p.getEmailUpdateTokenInfo = async (req, res, next, query = {}) => {
		try {
			if (Object.keys(query).length <= 0) {
				query = {
					token: req.params.token,
				};
			}
			const emailUpateTokenObj = await req.db.collection('EmailUpdateTokens').findOne(query);
			if (emailUpateTokenObj && Object.keys(emailUpateTokenObj).length > 0) {
				const userObj = await req.db.collection('User').findOne({
					_id: emailUpateTokenObj.user_id,
					deleted: false,
				});
				if (userObj && Object.keys(userObj).length > 0) {
					emailUpateTokenObj.email = userObj.email;
				}
			}
			return emailUpateTokenObj;
		} catch (err) {
			return {};
		}
	};

	return {
		getAllUsers: _p.getAllUsers,
		getUserByID: _p.getUserByID,
		deleteUserInformation: _p.deleteUserInformation,
		changePassword: _p.changePassword,
		changeSecurityAnswer: _p.changeSecurityAnswer,
		registerUsers: _p.registerUsers,
		updateUser: _p.updateUser,
		verifyPasswordChangeRequest: _p.verifyPasswordChangeRequest,
		blockUser: _p.blockUser,
		findUserInfoByUserName: _p.findUserInfoByUserName,
		implementForgotPasswordAction: _p.implementForgotPasswordAction,
		suspendUser: _p.suspendUser,
		validateMobileNumber: _p.validateMobileNumber,
		sendMobileValidationToken: _p.sendMobileValidationToken,
		resendConfirmationEmail: _p.resendConfirmationEmail,
		handleNewUserRegistration: _p.handleNewUserRegistration,
		checkReCaptchaEnable: _p.checkReCaptchaEnable,
		logOut: _p.logOut,
		getUserMobileInfo: _p.getUserMobileInfo,
		removeUserMobileInfo: _p.removeUserMobileInfo,
		verifyOAuthLogin: _p.verifyOAuthLogin,
		saveMobileTwoFactorAuthSecret: _p.saveMobileTwoFactorAuthSecret,
		linkSocialAccounts: _p.linkSocialAccounts,
		unLinkSocialAccount: _p.unLinkSocialAccount,
		checkSocialAccountLinked: _p.checkSocialAccountLinked,
		checkSocialAccountExists: _p.checkSocialAccountExists,
		saveHelperFunc: _p.saveHelperFunc,
		acceptTermsAndConditions: _p.acceptTermsAndConditions,
		isTourCompleted: _p.isTourCompleted,
		completedTour: _p.completedTour,
		checkPasswordValidity: _p.checkPasswordValidity,
		constructUserObj: _p.constructUserObj,
		updateEmailAddress: _p.updateEmailAddress,
		sendEmailUpdateVerificationLink: _p.sendEmailUpdateVerificationLink,
		getEmailUpdateTokenInfo: _p.getEmailUpdateTokenInfo,
		sendEmailUpdateConfirmationToken: _p.sendEmailUpdateConfirmationToken,
		RegisterFromBooking: _p.RegisterFromBooking,
		sendMobileValidationTokenToAnonymousUser: _p.sendMobileValidationTokenToAnonymousUser,
		validateMobileNumberForAnonymousUser: _p.validateMobileNumberForAnonymousUser,
	};
})();

module.exports = userController;
