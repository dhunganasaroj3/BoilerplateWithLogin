((appllicationRoutes) => {
	'use strict';

	appllicationRoutes.init = (app) => {
		const HTTPStatus = require('http-status');
		const commonHelper = require('../common/common-helper-function');
		const tokenAuthMiddleware = require('../middlewares/token-auth.middleware');
		const rateLimiter = require('../middlewares/rate-limiter.middleware');
		const emailValidator = require('../helpers/email-validator');
		const bounceRateReductionHandler = require('../helpers/bounce-rate-mitigation-handler-helper');

		rateLimiter.init(app);

		// app.delete('/api/deletefile', tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorizeAll, fileOperationHelper.deleteFile);
		// app.get('/api/download/file', tokenAuthMiddleware.authenticate, fileDownloadHelper.downPrivateUploads);

		app.use(async (req, res, next) => {
			// bounceRateReductionHandler.reduceBounceRateManually(req, res, next);
			const content_type = req.get('Content-Type') || req.get('content-type');
			if (content_type && content_type.indexOf('multipart/form-data') >= 0) {
				req.multi_part_enctype_operation = true;
				next();
			} else {
				return emailValidator.validateEmailFormat(req, res, next);
			}
		});

		const authTokenRouter = require('../modules/auth-token/auth-token.route');
		app.use('/api/configuration/authtoken', tokenAuthMiddleware.authenticate, authTokenRouter);

		// const cloudinarySettingRouter = require('../modules/cloudinary/cloudinary.setting.route');
		// app.use('/api/configuration/cloudinary', tokenAuthMiddleware.authenticate, cloudinarySettingRouter);

		// const commissionSettingRouter = require('../modules/commision-setting/commision-setting.route');
		// app.use('/api/configuration/commission-setting', tokenAuthMiddleware.authenticate, commissionSettingRouter);

		const emailServiceRouter = require('../modules/email-service/email-service.route');
		app.use('/api/configuration/email-service', tokenAuthMiddleware.authenticate, emailServiceRouter);

		const emailTemplateRouter = require('../modules/email-template/email-template.route');
		app.use('/api/configuration/email-template', tokenAuthMiddleware.authenticate, emailTemplateRouter);

		const errorLogRouter = require('../modules/error-logs/error-logs.route');
		app.use('/api/error-logs', tokenAuthMiddleware.authenticate, errorLogRouter);

		// const siteAnalyticsRouter = require('../modules/site-analytics/site-analytics.route');
		// app.use('/api/configuration/site-analytics', siteAnalyticsRouter);

		// const featureRouter = require('../modules/feature-setting/feature-setting.route');
		// app.use('/api/configuration/features', featureRouter);

		// const htmlContentModuleRouter = require('../modules/html-static-content/html-static-content.route');
		// app.use('/api/html-static-content', htmlContentModuleRouter);

		// const htmlEditorImageRouter = require("../modules/html-editor/html-editor.route");
		// app.use('/api/html-editor', tokenAuthMiddleware.authenticate, htmlEditorImageRouter);

		const loginAttemptLogRouter = require('../modules/login-logs/login-logs.route');
		app.use('/api/logs/login-attempts', tokenAuthMiddleware.authenticate, loginAttemptLogRouter);

		const userUnBlockRouter = require('../modules/user-unblock/user-unblock.route');
		app.use('/api/unblock/user', userUnBlockRouter);

		const userConfirmationRouter = require('../modules/user-confirmation/user-confirmation.route');
		app.use('/api/confirm/user', userConfirmationRouter);

		const passwordChangeVerifyRouter = require('../modules/password-change/password-change.route');
		app.use('/api/password-reset/user', passwordChangeVerifyRouter);

		const notificationRouter = require('../modules/notifications/notifications.route');
		app.use('/api/notification', tokenAuthMiddleware.authenticate, notificationRouter);

		const userRouter = require('../modules/user-profile/user-profile.route');
		app.use('/api/user', userRouter);

		const multiFactorAuthenticationRouter = require('../modules/multi-factor-auth/multi-factor-auth.route');
		app.use('/api/multi-factor-auth', multiFactorAuthenticationRouter);

		const loginRouter = require('../modules/login-auth/login-auth.route');
		app.use('/api', rateLimiter.rateLimitByIpAddress, loginRouter);

		const roleRouter = require('../modules/role/role.route');
		app.use('/api/configuration/role', tokenAuthMiddleware.authenticate, roleRouter);

		const newsletterRouter = require('../modules/newsletter/newsletter.route');
		app.use('/api/newsletter', newsletterRouter);

		const mobileIdentifierRouter = require('../modules/mobile-identiifer/mobile-identifier.route.js');
		app.use('/api/mobile-identifier', mobileIdentifierRouter);

		// const dashboardAnalyticsRouter = require('../modules/analytics-information/analytics-information.route');
		// app.use('/api/analytics-data', dashboardAnalyticsRouter);

		// const homePageRouter = require('../modules/home-page-data/home-data.route.js');
		// app.use('/api/home', homePageRouter);

		//knowledge base router
		// const knowledgeBaseRouter = require('../modules/knowledge-base/knowledge-base.route.js');
		// app.use('/api/knowledge-base', knowledgeBaseRouter);

		// const panicSOSRouter = require('../modules/panic-button/panic-button.route');
		// app.use('/api/send-sos-messages', panicSOSRouter);

		const socialAccountLinkingRouter = require('../modules/social-accounts-linking/social-accounts-linking.route');
		app.use('/api/social-account', socialAccountLinkingRouter);

		const emailMsgTemplate = require('../modules/email-message-template/email-message-template.route');
		app.use('/api/email-message-template', tokenAuthMiddleware.authenticate, emailMsgTemplate);

		const pushNotificationRouter = require('../modules/push-notification/push-notification.route');
		app.use('/api/cloud-messaging', pushNotificationRouter);

		const emailStatus = require('../modules/email-status/email-status.route');
		app.use('/api/email-status', tokenAuthMiddleware.authenticate, emailStatus);

		const adminAccess = require('../modules/admin-access/admin-access.route');
		app.use('/api/admin-access', tokenAuthMiddleware.authenticate, adminAccess);

		const identityAccessManagementRouter = require('../modules/identity-access-management/identity-access-management.route');
		app.use('/api/identity-access-management', tokenAuthMiddleware.authenticate, identityAccessManagementRouter);

		const fakeEmailsRouter = require('../modules/fake-email-identifier/fake-email-identifier.route');
		app.use('/api/fake-emails', tokenAuthMiddleware.authenticate, fakeEmailsRouter);

		const emailCheckValidatorRouter = require('../modules/email-validity-operations/email-validity-operations.route');
		app.use('/api/email-checks', emailCheckValidatorRouter);

		const informationRouter = require('../modules/information/information.route');
		app.use('/api/information', informationRouter);

		// const faqRouter = require('../modules/faq/faq.route');
		// app.use('/api/faq', faqRouter);

		// const documentRouter = require('./document-management.route');
		// app.use('/api', documentRouter);
		//
		// const documentTypeRouter = require('./document.settings.route');
		// app.use('/api/document-type', documentTypeRouter);

		// app.get('/api/authenticate', tokenAuthMiddleware.authenticate, (req, res) => {
		//   res.status(200);
		//   res.json({
		//     success: true,
		//     message: 'Token is Verified'
		//   });
		// });
		//
		// const dashboardRouter = require('./dashboard.route');
		// app.use('/api', tokenAuthMiddleware.authenticate, roleAuthMiddleware.authorizeConsularAndSuperAdmin, dashboardRouter);
		//
		// const viewRouter = require('./viewroutes/view.route');
		// viewRouter.init(app, userApiLoginRouter);

		// const traformRouter = require('../modules/traform/traform.route');
		// app.use('/api/v1/traform', traformRouter);
		//
		// const trawerxRouter = require('../modules/trawerx/trawerx.route');
		// app.use('/api/v1/trawerx', trawerxRouter);

		// const csvRouter = require('../modules/csv-import/csv');
		// app.use('/api/csv', csvRouter);

		const data = require('./mockapi');
		app.use('/api/hotelinfo', data);

		const getSignedUrlHelper = require('../helpers/s3.helper');
		app.get(
			'/api/get/secure-document-url/:moduleName/:fileName',
			tokenAuthMiddleware.authenticate,
			getSignedUrlHelper.getSignedUrl,
		);
		app.get(
			'/api/create/secure-document-url/:moduleName/:fileName',
			tokenAuthMiddleware.authenticate,
			getSignedUrlHelper.createSignedUrl,
		);

		const locationTrackerRouter = require('../modules/location-tracker/route');
		app.use('/api/location', locationTrackerRouter);

		app.get('/health-check', (req, res, next) => {
			res.status(200);
			res.json({
				message: 'health is OK',
			});
		});

		// catch 404 and forward to error handler
		app.use('/api/*', (req, res, next) => {
			commonHelper.sendResponseData(res, {
				status: HTTPStatus.NOT_FOUND,
				message: 'Api Route not available',
			});
		});
	};
})(module.exports);
