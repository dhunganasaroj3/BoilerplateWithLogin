const informationController = (() => {
    'use strict';

    const HTTPStatus = require('http-status');
    const moduleConfig = require('./information.config');
    const errorHelper = require('../../helpers/error.helper');
    const utilityHelper = require('../../helpers/utilities.helper');
    const commonHelper = require('../../common/common-helper-function');
    const ObjectId = require('mongodb').ObjectID;
    const Promise = require("bluebird");
    const join = Promise.join;
    const commonProvider = require('../../common/common-provider-function');
    const notificationController = require('../notifications/notifications.controller');


    function informationModule() {
    }

    const _p = informationModule.prototype;



    _p.GetCountries = async (req,next) => {
        try {
            return req.db.collection('countries').find({}, {_id: 1, id: 1, sortname: 1, name: 1}).toArray();
        } catch (err) {
            return next(err);
        }
    };

    _p.GetTimeZone = async (req) => {
        try {
            return req.db.collection('timezone').find({}).toArray();
        } catch (err) {
            return next(err);
        }
    };
    _p.GetStates = async (req) => {
        try {
            return req.db.collection('states').find({country_id: req.params.id}, {_id: 0, id: 1, name: 1}).toArray();
        } catch (err) {
            return next(err);
        }
    };
    _p.GetCity = async (req) => {
        try {
            return req.db.collection('cities').find({state_id: req.params.id}, {_id: 0, id: 1, name: 1}).toArray();
        } catch (err) {
            return next(err);
        }
    };
    return {
        getCurrencyList: _p.getCurrencyList,
        GetCountries: _p.GetCountries,
        GetTimeZone: _p.GetTimeZone,
        GetStates: _p.GetStates,
        GetCity: _p.GetCity,
    };

})();

module.exports = informationController;
