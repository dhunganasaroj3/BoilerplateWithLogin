/**
 * Created by lakhe on 12/29/17.
 */

const fakeEmailController = (() => {
    'use strict';

    const HTTPStatus = require('http-status');
    const utilityHelper = require('../../helpers/utilities.helper');
    const uuidv1 = require('uuid/v1');
    const commonHelper = require('../../common/common-helper-function');
    const commonProvider = require('../../common/common-provider-function');
    const dnsResolver = require('../../helpers/dns.resolver.helper');
    const moduleConfig = require('./fake-email-identifier.config');


    const projectionFields = {
        '_id': 1,
        'first_name': 1,
        'last_name': 1,
        'email': 1,
        'gender': 1,
        'username': 1,
        'auto_gen_password': 1,
        'user_role': 1,
        'reset_password_first_login': 1,
        'parent_user_role': 1,
        'added_on': 1
    };

    function IAMUserModule() {}

    const _p = IAMUserModule.prototype;

    _p.getAllFakeEmails = (req, next) => {
        const pagerOpts = utilityHelper.getPaginationOpts(req, next);
        let queryOpts = {};
        queryOpts.deleted = false;
        const sortOpts = { added_on: -1 };
        return commonProvider.getPaginatedDataList(req.db.collection('FakeEmails'), queryOpts, pagerOpts, projectionFields, sortOpts);
    };

    _p.monitorFakeEmails = async (req, item, dataObj, loginObj, dnsResolveStatus) => {
        dataObj = {};
        loginObj = {};
        dnsResolveStatus = await dnsResolver.resolveMailExchangeRecords(item.email);
        if(!dnsResolveStatus) {
            dataObj = {
                _id: uuidv1(),
                email:item.email,
                username:item.username,
                first_name:item.first_name,
                last_name:item.last_name,
                added_on:item.added_on
            };
            loginObj = await req.db.collection('LoginLogs').findOne({ user_id: item._id });
            if(loginObj && Object.keys(loginObj).length > 0) {
                dataObj.ip_address = loginObj.ip_address;
                dataObj.browser = loginObj.browser;
                dataObj.operating_system = loginObj.operating_system;
                dataObj.user_agent_source = loginObj.user_agent_source;
                dataObj.device = loginObj.device;
                dataObj.country = loginObj.country;
                dataObj.city = loginObj.city;
                dataObj.coordinates = loginObj.coordinates;
            }
            req.db.collection('FakeEmails').insertOne(dataObj);
        }
    };

    _p.detectAndPostFakeEmail = async (req, res, next) => {
        try {
            const lstUsers = await req.db.collection('User').find({}).project({_id:1, email:1, username:1, first_name: 1, last_name:1, added_on:1 }).sort({added_on: -1}).toArray();
            let dataObj = {};
            let loginObj = {};
            let dnsResolveStatus = {};
            lstUsers.forEach(async (item, index) => {
                setTimeout(() => {
                    _p.monitorFakeEmails(req, item, dataObj, loginObj, dnsResolveStatus);
                }, 1500);
            });
            return commonHelper.sendResponseData(res, {
                status: HTTPStatus.OK,
                message: moduleConfig.message.saveMessage
            });

        } catch (err) {
            return next(err);
        }
    };

    return {
        getAllFakeEmails: _p.getAllFakeEmails,
        detectAndPostFakeEmail: _p.detectAndPostFakeEmail
    };

})();

module.exports = fakeEmailController;
