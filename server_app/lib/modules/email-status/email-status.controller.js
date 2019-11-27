const emailStatusController = (() => {
    'use strict';

    const HTTPStatus = require('http-status');
    const moduleConfig = require('./email-status.config');
    const appConfig = require('../../configs/application.config');
    const Promise = require("bluebird");
    const join = Promise.join;
    const utilityHelper = require('../../helpers/utilities.helper');
    const commonHelper = require('../../common/common-helper-function');
    const commonProvider = require('../../common/common-provider-function');
    const errorHelper = require('../../helpers/error.helper');


    function EmailStatusModule() {
    }

    const _p = EmailStatusModule.prototype;
    _p.getEmailStatus = async (req, next) => {
        const pagerOpts = utilityHelper.getPaginationOpts(req, next);
        let filter = {success: false};
        if (req.query.success) {
            const t = req.query.success;
            filter = {success: (typeof t === 'boolean') ? t : (t == 'true') ? true : false};
        }
        let match = {'success': filter.success};
        if (req.query.start) {
            var date = new Date(req.query.start)
            var nextDate = new Date(req.query.end);
            nextDate.setDate(nextDate.getDate());
            match = {'success': filter.success};
            match = Object.assign({}, match, {'added_on': {$gte: date, $lte: nextDate}});
        }
        const analyticsObjData = await join(_p.getUniqueEmailStatus(req, pagerOpts, match, next), _p.getUniqueEmailTotal(req, match, next), (emails, totals) => {
            return {
                dataList: emails,
                currentPage: pagerOpts.page,
                totalItems: totals
            };
        });
        return analyticsObjData;
    };
    _p.getUniqueEmailStatus = async (req, pagerOpts, match, next) => {
        const skip = {$skip: ((pagerOpts.page - 1) * pagerOpts.perPage)};
        const limit = {$limit: pagerOpts.perPage};
        return req.db.collection('EmailLogs').aggregate([//BounceEmailLogs
            {$match: match},
            {
                $group: {
                    _id: {route: "$route", to: "$mailOptions.to", added_by: "$added_by", success: '$success'},
                    count: {$sum: 1}
                }
            },
            {$sort: {"count": -1}},
            {
                $project: {
                    route: '$_id.route',
                    to: '$_id.to',
                    added_by: '$_id.added_by',
                    success: '$_id.success',
                    count: 1,
                    _id: 0
                }
            },
            skip,
            limit
        ]).toArray();
    };

    _p.getUniqueEmailTotal = async (req, match, next) => {

        const results = await req.db.collection('EmailLogs').aggregate([
            {$match: match},
            {
                $group: {
                    _id: {route: "$route", to: "$mailOptions.to", added_by: "$added_by", success: '$success'},
                    count: {$sum: 1}
                }
            }
        ]).toArray();
        return results.length
    };
    _p.getBlockedEmail = async (req, next) => {
        const pagerOpts = utilityHelper.getPaginationOpts(req, next);
        const queryOpts = {end_date: {$gte: new Date()}};
        const sortOpts = {added_on: -1};
        return commonProvider.getPaginatedDataList(req.db.collection('BlockedEmail'), queryOpts, pagerOpts, {}, sortOpts);
    };
    _p.checkValidationForBlockErrors = async (req) => {
        req.checkBody('email', moduleConfig.message.validationErrMessage.email).notEmpty();
        req.checkBody('duration', moduleConfig.message.validationErrMessage.duration).notEmpty();
        req.checkBody('type', moduleConfig.message.validationErrMessage.type).notEmpty();
        const result = await req.getValidationResult();
        return result.array();
    };
    _p.blockEmail = async (req, res, next) => {
        try {
            const errors = await _p.checkValidationForBlockErrors(req);
            if (errors && errors.length > 0) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.BAD_REQUEST,
                    message: errorHelper.sendFormattedErrorData(errors)
                });
            } else {
                const documentFields = 'email duration type';
                const modelInfo = utilityHelper.sanitizeUserInput(req, next);
                let blockEmail = commonHelper.collectFormFields(req, modelInfo, documentFields, undefined);
                if (blockEmail.type.toLowerCase() === "d") {
                    let day = new Date();
                    blockEmail.end_date = new Date();
                    blockEmail.end_date.setDate(day.getDate() + 2);
                }
                if (blockEmail.type.toLowerCase() === "h") {
                    let day = new Date();
                    blockEmail.end_date = new Date();
                    blockEmail.end_date.setHours(day.getHours() + 2);
                }
                const results = await req.db.collection('BlockedEmail').insertOne(blockEmail);
                commonHelper.sendResponseMessage(res, results, null, moduleConfig.message.saveMessage);

            }
        } catch (err) {
            return next(err);
        }
    };
    return {
        getEmailStatus: _p.getEmailStatus,
        getBlockedEmail: _p.getBlockedEmail,
        blockEmail: _p.blockEmail
    };


})();

module.exports = emailStatusController;
