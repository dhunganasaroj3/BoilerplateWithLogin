const transactionalEmailServiceController = (() => {
  'use strict';

  const HTTPStatus = require('http-status');
  const moduleConfig = require('./email-service.config');
  const utilityHelper = require('../../helpers/utilities.helper');
  const errorHelper = require('../../helpers/error.helper');
  const uuidv1 = require('uuid/v1');
  const commonHelper = require('../../common/common-helper-function');
  const redisHelper = require('../../helpers/redis.helper');

  const documentFields = 'api_key domain';
  const projectionFields = {
    '_id': 1,
    'api_key': 1,
    'domain': 1,
    'added_on': 1
  };

  function EmailServiceModule(){}

  const _p = EmailServiceModule.prototype;

  _p.checkValidationErrors = async (req) => {

    req.checkBody('api_key', moduleConfig.message.validationErrMessage.api_key).notEmpty();
    req.checkBody('domain', moduleConfig.message.validationErrMessage.domain).notEmpty();
    req.checkBody('domain', moduleConfig.message.validationErrMessage.domainValid).isFQDN();
    const result = await req.getValidationResult();
    return result.array();
  };

  _p.getMailServiceConfig = (req) => {
    return req.db.collection('EmailServiceConfiguration').findOne({}, { projection: projectionFields});
  };


  _p.postMailServiceConfig = async (req, res, next) => {
    try {
      const errors = await _p.checkValidationErrors(req);
      if (errors && errors.length > 0) {
        return commonHelper.sendResponseData(res, {
          status: HTTPStatus.BAD_REQUEST,
          message: errorHelper.sendFormattedErrorData(errors)
        });

      }else {
        //Check if transactional email service setting already exists
        const count = await req.db.collection('EmailServiceConfiguration').estimatedDocumentCount({});
        if (count > 0) {
          return commonHelper.sendResponseData(res, {
            status: HTTPStatus.CONFLICT,
            message: moduleConfig.message.alreadyExists
          });
        } else {
          const modelInfo = utilityHelper.sanitizeUserInput(req, next);
          const newEmailServiceConfig = commonHelper.collectFormFields(req, modelInfo, documentFields, undefined);
          const dataRes = await req.db.collection('EmailServiceConfiguration').insertOne(newEmailServiceConfig);
          redisHelper.clearDataCache(req);
          commonHelper.sendResponseMessage(res, dataRes, null, moduleConfig.message.saveMessage);
        }
      }
    } catch (err) {
      return next(err);
    }
  };

  _p.updateMailService = async (req, res, next) => {
    try {
      const errors = await _p.checkValidationErrors(req);
      if (errors && errors.length > 0) {
        return commonHelper.sendResponseData(res, {
          status: HTTPStatus.BAD_REQUEST,
          message: errorHelper.sendFormattedErrorData(errors)
        });
      } else {
        const modelInfo = utilityHelper.sanitizeUserInput(req, next);
        const updateOpts = commonHelper.collectFormFields(req, modelInfo, documentFields, 'update');
        const dataRes = await req.db.collection('EmailServiceConfiguration').updateOne({_id: req.params.emailServiceId }, {$set: updateOpts});

        redisHelper.clearDataCache(req);
        commonHelper.sendResponseMessage(res, dataRes, null, moduleConfig.message.updateMessage);
      }
    } catch (err) {
      return next(err);
    }
  };

  return {
    getMailServiceConfig : _p.getMailServiceConfig,
    postMailServiceConfig : _p.postMailServiceConfig,
    updateMailService : _p.updateMailService

  };

})();

module.exports = transactionalEmailServiceController;
