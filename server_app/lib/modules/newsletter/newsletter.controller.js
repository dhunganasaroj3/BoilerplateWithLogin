/**
 * Newsletter Module
 *
 * @module NewsletterModule
 */
const newsLetterController = (() => {
  'use strict';

  const HTTPStatus = require('http-status');
  const moduleConfig = require('./newsletter.config');
  const appMessageConfig = require('../../configs/message.config');
  const utilityHelper = require('../../helpers/utilities.helper');
  const errorHelper = require('../../helpers/error.helper');
  const uuidv1 = require('uuid/v1');
  const Promise = require("bluebird");
  const commonHelper = require('../../common/common-helper-function');
  const commonProvider = require('../../common/common-provider-function');
  const hasher = require('../../auth/hasher');
  const emailModuleConfig = require('../email-template/email-template.config');
  const emailHelper = require('../../helpers/email-service.helper');
  const emailTemplateController = require('../email-template/email-template.controller');
  const emailTemplateConfigs = require('../../configs/email-template.config');
  const appConfig = require('../../configs/application.config');
  const redisHelper = require('../../helpers/redis.helper');
  const emailTemplateContentConfigs = require('../../configs/email-template.content.config');

  const projectionFields = {
    '_id': 1,
    'subscriber_email': 1,
    'subscribed': 1,
    'subscription_token': 1,
    'subscribed_date': 1
  };

  function NewsLetterModule(){}

  const _p = NewsLetterModule.prototype;

  _p.checkValidationErrors = async (req) => {
    req.checkBody('subscriber_email', moduleConfig.message.validationErrMessage.subscriber_email).notEmpty();
    req.checkBody('subscriber_email', moduleConfig.message.validationErrMessage.subscriber_email_valid).isEmail();

    const result = await req.getValidationResult();
    return result.array();
  };

    /**
     * This is a functionality for listing all the users subscribed for newsletter.
     *
     * @namespace
     * @param {Object} req - Request
     * @param {Object} req.query - req consists of the query string sent through the api route
     * @param {string|boolean} req.query.subscribed - It provides the value to filter the data
     * @param next
     *
     * @returns {Object} Returns an object containing dataList retrieved from the database, totalItems and currentPage for the pagination support
     * @exports NewsletterModule
     * @name getAllNewsletterSubscribedUsers
     */
  _p.getAllNewsLetterSubscribedUsers = (req, next) => {
      /**
       * Constant that contains the pagination support i.e. page and perpage.
       * @typedef {Object} pagerOpts
       * @property {number} page - The current page of the data list.
       * @property {number} perpage - The number data in the list for each page.
       */
    const pagerOpts = utilityHelper.getPaginationOpts(req, next);
      /**
       * Query to filter from the database.
       * @typedef {Object} queryOpts
       * @property {boolean} subscribed - Filtering value for the data list.
       */
    const queryOpts= (req.query.subscribed) ? { subscribed: true} : {};
      /**
       * Sorting value to retrieve the data from the database.
       * @typedef {Object} sortOpts
       * @property {number} added_on - Determining the sorting by ascending or descending order. Negative refers to descending and vice-versa.
       */
    const sortOpts = { added_on: -1 };

    return  commonProvider.getPaginatedDataList(req.db.collection('NewsLetterSubscription'), queryOpts, pagerOpts, projectionFields, sortOpts);
  };


    /**
     * This functionality is used for the enabling new email subscription.
     *
     * @namespace
     * @param {Object} req - Request
     * @param res - Response
     * @param {string} subscriber_email - Email of the user to be subscribed.
     * @param {string} tokenBytes - subscription token
     * @param next
     *
     * @returns {Promise<Object>} - Returns promise object with properties emailRes(object) and sentEmail(boolean) in case of success and status and data not modified message in case of error
     * @exports NewsletterModule
     * @name enableNewEmailSubscription
     */
  _p.enableNewEmailSubscription = async (req, res, subscriber_email, tokenBytes, next) => {

    const newsLetterInfo = {
      '_id': uuidv1(),
      'subscriber_email': subscriber_email.trim().toLowerCase(),
      'subscribed': true,
      'unsubscribed': false,
      'subscription_token': tokenBytes,
      'subscribed_date': new Date(),
      'added_on': new Date()
    };

    const dataRes = await req.db.collection('NewsLetterSubscription').insertOne(newsLetterInfo);
    if(dataRes.result.n > 0) {
      redisHelper.clearDataCache(req);
      const emailRes = await _p.sendEmailToSubscribedUser(req, res, subscriber_email.trim().toLowerCase(), tokenBytes, next);
      return Promise.resolve((emailRes && Object.keys(emailRes).length > 0) ? {
        emailRes: emailRes,
        sentEmail: true
      } : null);
    } else {
      return Promise.resolve({
        status: HTTPStatus.NOT_MODIFIED,
        message: appMessageConfig.applicationMessage.dataNotModified
      });
    }
  };


    /**
     * This functionality used for subscribing newsletter.
     *
     * @namespace
     * @param {Object} req - Request
     * @param {Object} req.body
     * @param {string} req.body.subscriber_email - Email of the user for subscription.
     * @param res - Response
     * @param next
     *
     * @returns {Promise<Object>} - Returns promise object consisting of status and successful message in case of success and vice-versa.
     * @exports NewsletterModule
     * @name subscribeNewsletter
     */
  _p.subscribeNewsletter = async (req, res, next) => {
    try {
      const errors = await _p.checkValidationErrors(req);
      if (errors && errors.length > 0) {
        return commonHelper.sendResponseData(res, {
          status: HTTPStatus.BAD_REQUEST,
          message: errorHelper.sendFormattedErrorData(errors)
        });
      } else {
        const modelInfo = utilityHelper.sanitizeUserInput(req, next);
        const queryOpts = {
          subscriber_email : modelInfo.subscriber_email.trim().toLowerCase()
        };
        const tokenBytes = await hasher.generateRandomBytes(moduleConfig.config.token_length);
        const subscriberObj = await req.db.collection('NewsLetterSubscription').findOne(queryOpts);
        if(subscriberObj) {
          if(subscriberObj.subscribed) {
            return commonHelper.sendResponseData(res, {
              status: HTTPStatus.CONFLICT,
              message: moduleConfig.message.alreadyExists
            });
          } else {
            const updateOpts = {
              $set: {
                'subscribed': true,
                'unsubscribed': false,
                'subscription_token': tokenBytes,
                'reactivated_date': new Date(),
                'unsubscribed_date': ''
              }
            };

            const updateRes = await req.db.collection('NewsLetterSubscription').updateOne(queryOpts, updateOpts);
            if(updateRes.result.n > 0) {
              redisHelper.clearDataCache(req);
              const emailRes = await  _p.sendEmailToSubscribedUser(req, res, modelInfo.subscriber_email.trim().toLowerCase(), tokenBytes, next);
              return commonHelper.sendResponseData(res, {
                status: (emailRes && Object.keys(emailRes).length > 0) ? HTTPStatus.OK : HTTPStatus.SERVICE_UNAVAILABLE,
                message: (emailRes && Object.keys(emailRes).length > 0) ? moduleConfig.message.saveMessage : moduleConfig.message.emailError
              });
            } else {
              return commonHelper.sendResponseData(res, {
                status: HTTPStatus.NOT_MODIFIED,
                message: appMessageConfig.applicationMessage.dataNotModified
              });
            }
          }
        } else {
          const dataRes = await _p.enableNewEmailSubscription(req, res, modelInfo.subscriber_email, tokenBytes, next);
          if(dataRes.message !== appMessageConfig.applicationMessage.dataNotModified) {
            return commonHelper.sendResponseData(res, {
              status: (dataRes && dataRes.sentEmail) ? HTTPStatus.OK : HTTPStatus.SERVICE_UNAVAILABLE,
              message: (dataRes && dataRes.sentEmail) ? moduleConfig.message.saveMessage : moduleConfig.message.emailError
            });
          } else {
            return commonHelper.sendResponseData(res, {
              status: HTTPStatus.NOT_MODIFIED,
              message: appMessageConfig.applicationMessage.dataNotModified
            });
          }
        }
      }
    } catch (err) {
      return next(err);
    }
  };


    /**
     * This functionality is used for sending email to subscribed user.
     *
     * @namespace
     * @param {Object} req - Request
     * @param res - Response
     * @param {string} subscriber_email - Email of the subscribed user.
     * @param {string} subscription_token - Subscription token of the subscribed user.
     * @param next
     *
     * @returns {Promise<Object>} - Returns promise object containing the email response.
     * @exports NewsletterModule
     * @name sendEmailToSubscribedUser
     */
  _p.sendEmailToSubscribedUser = async (req, res, subscriber_email, subscription_token, next) => {
    try {
      req.params.templateId = emailTemplateConfigs.newsletter_subscribe;
      if (req.params.templateId) {
        const emailTemplateInfo = await emailTemplateController.getEmailTemplateDataByID(req);

        const url = `${req.protocol}://${appConfig.client_app_url}${moduleConfig.config.subscribe_api}${subscription_token}`;
        let messageBody = '';
        if (emailTemplateInfo && emailTemplateInfo.template_content) {
          messageBody = emailTemplateInfo.template_content;
          if (messageBody.indexOf("%message.subscriber_email%") > -1) {
            messageBody = messageBody.replace("%message.subscriber_email%", subscriber_email);
          }

          if (messageBody.indexOf("%message.url_link%") > -1) {
            messageBody = messageBody.replace(new RegExp("%message.url_link%", 'g'), url);
          }
          let message_template = emailTemplateContentConfigs.system_emails;

          if (message_template.indexOf("%email_content%") > -1) {
            message_template = message_template.replace("%email_content%", messageBody);
          }
          const mailOptions = {
            fromEmail: emailTemplateInfo.email_from, // sender address
            toEmail: subscriber_email, // list of receivers
            subject: emailTemplateInfo.email_subject, // Subject line
            textMessage: message_template, // plaintext body
            htmlTemplateMessage: message_template,
            attachments: emailTemplateInfo.attachments
          };
          return emailHelper.sendEmail(req, mailOptions, next);
        }
      }
      return null;
    } catch(err) {
      return next(err);
    }
  };


    /**
     * This functionality is used to unsubscribe the user from the newsletter subscription.
     *
     * @namespace
     * @param {Object} req - Request
     * @param {Object} req.params - Params sent from the api route.
     * @param {string} req.params.subscription_token - subscription token of the newsletter subscribed user.
     * @param res - Response
     * @param next
     *
     * @returns {Promise<Object>} - Returns promise object consisting of status and success message in case of success and vice-versa.
     * @exports NewsletterModule
     * @name unSubscribeNewsletter
     */
  _p.unSubscribeNewsletter = async (req, res, next) => {
    try {
      const queryOpts = {
        subscription_token : req.params.subscription_token
      };
      const subscriberObj = await req.db.collection('NewsLetterSubscription').findOne(queryOpts);
      if(subscriberObj) {
        if(subscriberObj.unsubscribed) {
          return commonHelper.sendResponseData(res, {
            status: HTTPStatus.CONFLICT,
            message: moduleConfig.message.alreadyUnsubscribed
          });
        } else {
          const updateOpts = {
            $set: {
              'subscribed': false,
              'unsubscribed': true,
              'unsubscribed_date': new Date()
            }
          };

          const updateRes = await req.db.collection('NewsLetterSubscription').updateOne(queryOpts, updateOpts);
          if(updateRes.result.n > 0) {
            redisHelper.clearDataCache(req);
            const emailRes = await  _p.sendEmailToUnSubscribedUser(req, res, subscriberObj.subscriber_email, next);
            return commonHelper.sendResponseData(res, {
              status: (emailRes && Object.keys(emailRes).length > 0) ? HTTPStatus.OK : HTTPStatus.SERVICE_UNAVAILABLE,
              message: (emailRes && Object.keys(emailRes).length > 0) ? moduleConfig.message.unSubscribedMessage : moduleConfig.message.emailError
            });
          } else {
            return commonHelper.sendResponseData(res, {
              status: HTTPStatus.NOT_MODIFIED,
              message: appMessageConfig.applicationMessage.dataNotModified
            });
          }
        }
      } else {
        return commonHelper.sendResponseData(res, {
          status: HTTPStatus.BAD_REQUEST,
          message: moduleConfig.message.notFound
        });
      }
    } catch (err) {
      return next(err);
    }
  };


    /**
     * This functionality sends email to unsubscribed user.
     *
     * @namespace
     * @param {Object} req - Request
     * @param res - Response
     * @param {string} subscriber_email - Email of the newletter subscribed user.
     * @param next
     *
     * @returns {Promise<Object>} - Returns promise object consisting of the email response.
     * @exports NewsletterModule
     * @name sendEmailToUnSubscribedUser
     */
  _p.sendEmailToUnSubscribedUser = async (req, res, subscriber_email, next) => {
    try {
      req.params.templateId = emailTemplateConfigs.newsletter_unsubscribe;
      if (req.params.templateId) {
        const emailTemplateInfo = await emailTemplateController.getEmailTemplateDataByID(req);

        let messageBody = '';

        if (emailTemplateInfo && emailTemplateInfo.template_content) {
          messageBody = emailTemplateInfo.template_content;
          if (messageBody.indexOf("%message.subscriber_email%") > -1) {
            messageBody = messageBody.replace("%message.subscriber_email%", subscriber_email);
          }
          let message_template = emailTemplateContentConfigs.system_emails;

          if (message_template.indexOf("%email_content%") > -1) {
            message_template = message_template.replace("%email_content%", messageBody);
          }
          const mailOptions = {
            fromEmail: emailTemplateInfo.email_from, // sender address
            toEmail: subscriber_email, // list of receivers
            subject: emailTemplateInfo.email_subject, // Subject line
            textMessage: message_template, // plaintext body
            htmlTemplateMessage: message_template,
            attachments: emailTemplateInfo.attachments

          };
          return emailHelper.sendEmail(req, mailOptions, next);
        }
      }
      return null;
    } catch(err) {
      return next(err);
    }
  };

  return{
    getAllNewsLetterSubscribedUsers : _p.getAllNewsLetterSubscribedUsers,
    unSubscribeNewsletter : _p.unSubscribeNewsletter,
    subscribeNewsletter : _p.subscribeNewsletter,
    enableNewEmailSubscription: _p.enableNewEmailSubscription
  };
})();

module.exports = newsLetterController;
