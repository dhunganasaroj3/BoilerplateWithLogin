

const emailCheckController = (() => {
    'use strict';

    const HTTPStatus = require('http-status');
    const moduleConfig = require('./email-validity-operations.config');
    const utilityHelper = require('../../helpers/utilities.helper');
    const uuidv1 = require('uuid/v1');
    const commonHelper = require('../../common/common-helper-function');
    const commonProvider = require('../../common/common-provider-function');

    function EmailCheckModule(){}

    const _p = EmailCheckModule.prototype;

    _p.getBouncedEmails = (req) => {
        req.query.perpage = 100;
        const pagerOpts = utilityHelper.getPaginationOpts(req, next);
        const queryOpts = {};
        const sortOpts = {
            added_on: -1
        };
        return  commonProvider.getPaginatedDataList(req.db.collection('AmazonSNSWarningsForEmailBounces'), queryOpts, pagerOpts, {}, sortOpts);
    };

    _p.getSuspendedEmailDomains = (req) => {
        req.query.perpage = 100;
        const pagerOpts = utilityHelper.getPaginationOpts(req, next);
        const queryOpts = {};
        const sortOpts = {
            added_on: -1
        };
        return  commonProvider.getPaginatedDataList(req.db.collection('SuspendedEmailDomains'), queryOpts, pagerOpts, {}, sortOpts);
    };

    _p.saveSuspendedEmailDomain =  (async function (req, res, next) {
        try {
            const dataRes = await req.db.collection('SuspendedEmailDomains').insertOne({
                _id: uuidv1(),
                ...req.body
            });
            return commonHelper.sendResponseMessage(res, dataRes, null, moduleConfig.message.saveMessageSuspendedEmailDomains);
        } catch (err) {
            return next(err);
        }
    });

    _p.saveBouncedEmailRecords = async (req, res, next) => {
        try {
            const dataRes = await req.db.collection('AmazonSNSWarningsForEmailBounces').insertOne({
                _id: uuidv1(),
                ...req.body
            });
            return commonHelper.sendResponseMessage(res, dataRes, null, moduleConfig.message.saveMessageAWSSNS);
        } catch (err) {
            return next(err);
        }
    };

    return{
        getSuspendedEmailDomains: _p.getSuspendedEmailDomains,
        getBouncedEmails : _p.getBouncedEmails,
        saveSuspendedEmailDomain : _p.saveSuspendedEmailDomain,
        saveBouncedEmailRecords : _p.saveBouncedEmailRecords
    };

})();

module.exports = emailCheckController;
