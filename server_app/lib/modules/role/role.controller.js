const roleController = (() => {
  'use strict';

  const HTTPStatus = require('http-status');
  const moduleConfig = require('./role.config');
  const utilityHelper = require('../../helpers/utilities.helper');
  const errorHelper = require('../../helpers/error.helper');
  const uuidv1 = require('uuid/v1');
  const commonHelper = require('../../common/common-helper-function');
  const redisHelper = require('../../helpers/redis.helper');

  const documentFields = 'role_name role_description';
  const projectionFields = {
    '_id': 1,
    'role_name': 1,
    'role_description': 1,
    'added_on': 1
  };


  function RoleModule() {
  }

  const _p = RoleModule.prototype;

  _p.checkValidationErrors = async (req) => {

    req.checkBody('role_name', moduleConfig.message.validationErrMessage.role_name).notEmpty();
    const result = await req.getValidationResult();
    return result.array();
  };

  _p.getRole = (req) => {
    return req.db.collection('Role').find({}).project(projectionFields).toArray();
  };

  _p.postRole = async (req, res, next) => {
    try {
      if(req.query && req.query.clean_role_install) {
        req.db.collection('Role').remove({}, async (err, numberRemoved) => {
          if (!err) {
            const newRole = moduleConfig.config.roles;
            const dataRes = await req.db.collection('Role').insertMany(newRole);
            redisHelper.clearDataCache(req);
            commonHelper.sendResponseMessage(res, dataRes, null, moduleConfig.message.saveMessage);
          }
        });
      } else {
        const errors = await _p.checkValidationErrors(req);
        if (errors && errors.length > 0) {
          return commonHelper.sendResponseData(res, {
            status: HTTPStatus.BAD_REQUEST,
            message: errorHelper.sendFormattedErrorData(errors)
          });
        } else {
          const count = await req.db.collection('Role').estimatedDocumentCount({ role_name:req.body.role_name });
          if(count > 0) {
            return commonHelper.sendResponseData(res, {
              status: HTTPStatus.BAD_REQUEST,
              message: moduleConfig.message.alreadyExists
            });
          } else {
            const modelInfo = utilityHelper.sanitizeUserInput(req, next);
            const newRole = commonHelper.collectFormFields(req, modelInfo, documentFields, undefined);
            const dataRes = await req.db.collection('Role').insertOne(newRole);
            redisHelper.clearDataCache(req);
            commonHelper.sendResponseMessage(res, dataRes, null, moduleConfig.message.saveMessage);
          }
        }
      }
    } catch (err) {
      return next(err);
    }
  };

  return {
    getRole: _p.getRole,
    postRole: _p.postRole
  };
})
();

module.exports = roleController;
