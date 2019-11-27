const errorLogController = (() => {
  'use strict';

  const HTTPStatus = require('http-status');
  const moduleConfig = require('./error-logs.config');
  const errorHelper = require('../../helpers/error.helper');
  const utilityHelper = require('../../helpers/utilities.helper');
  const commonHelper = require('../../common/common-helper-function');
  const uuidv1 = require('uuid/v1');
  const commonProvider = require('../../common/common-provider-function');
  const redisHelper = require('../../helpers/redis.helper');
  const userAgent = require('useragent');

  const documentFields='error_message error_stack error_type';
  const projectionFields = {
    '_id': 1,
    'error_message': 1,
    'error_stack': 1,
    'error_type': 1,
    'added_on': 1
  };

  function ErrorLogModule(){}

  const _p = ErrorLogModule.prototype;

  _p.getErrorLogs = (req, next) => {
    const pagerOpts = utilityHelper.getPaginationOpts(req, next);
    const queryOpts = {};
    if(req.query.startdate && req.query.enddate && (new Date(req.query.startdate) instanceof Date) && (new Date(req.query.enddate) instanceof Date)){

      queryOpts.added_on = {
        $gte: new Date(new Date(req.query.startdate).setHours(0, 0, 0, 0)),
        $lte: new Date(new Date(req.query.enddate).setHours(23, 59, 59, 999))
      };
    } else if(req.query.startdate && !req.query.enddate && (new Date(req.query.startdate) instanceof Date) ){
      const currentDate = new Date(req.query.startdate);
      const startDate = new Date(currentDate.setHours(0, 0, 0, 0));
      const endDate = new Date(currentDate.setHours(23, 59, 59, 999));

      queryOpts.added_on = {
        $gt: startDate,
        $lt: endDate
      };
    }
    const sortOpts = { added_on: -1 };
    return commonProvider.getPaginatedDataList(req.db.collection('ErrorLogs'), queryOpts, pagerOpts, projectionFields, sortOpts);
  };

  _p.getErrorLogDetailInfo = (req) => {
    return req.db.collection('ErrorLogs').findOne({ _id: req.params.errorLogId }, { projection: projectionFields});
  };

  _p.deleteErrorLog = async (req, res, next) => {

    try {
      const queryOpts = (req.params && req.params.errorLogId) ? {_id: req.params.errorLogId } : {};
      const multiOpts = (req.params && req.params.errorLogId) ? false : true;
      const dataRes = await req.db.collection('ErrorLogs').remove(queryOpts, multiOpts);
      redisHelper.clearDataCache(req);
      commonHelper.sendResponseMessage(res, dataRes, (req.params && req.params.errorLogId) ? {_id: req.params.errorLogId } : {}, moduleConfig.message.deleteMessage);
    } catch (err) {
      return next(err);
    }
  };

  _p.postErrorLogs = async (err, req, next) => {
    try {
      const errObj = errorHelper.getErrorObj(err, next);
      const user_agent = userAgent.lookup(req.headers['user-agent']);
      const newErrorLogInfo = commonHelper.constructObject(errObj, documentFields);
      newErrorLogInfo.apiRoute = req.originalUrl;
      newErrorLogInfo.apiMethod = req.method;
      newErrorLogInfo.client_data = {
        query_strings: req.query,
        query_params: req.params,
        body: req.body
      };
      newErrorLogInfo._id = uuidv1();
      newErrorLogInfo.user_agent = user_agent;
      newErrorLogInfo.added_by = (req && req.decoded && req.decoded.user  && req.decoded.user.username) ? req.decoded.user.username : 'system';
      newErrorLogInfo.added_on = new Date();
      const dataRes = await req.db.collection('ErrorLogs').insertOne(newErrorLogInfo);
      if(dataRes.result.n > 0){
        redisHelper.clearDataCache(req);
        console.log('error saved');
      } else {
        console.log('OOPS!!! db error');
      }
    } catch (err) {
      // return next(err);
    }
  };

  return{
    getErrorLogs: _p.getErrorLogs,
    getErrorLogDetailInfo: _p.getErrorLogDetailInfo,
    deleteErrorLog: _p.deleteErrorLog,
    postErrorLogs: _p.postErrorLogs
  };

})();

module.exports = errorLogController;
