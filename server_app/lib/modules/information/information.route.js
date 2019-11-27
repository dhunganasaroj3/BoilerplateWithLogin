const informationRoutes = (() => {
    'use strict';

    const HTTPStatus = require('http-status');
    const express = require('express');
    const moduleConfig = require('./information.config');
    const informationController = require('./information.controller');
    const informationRouter = express.Router();
    const commonHelper = require('../../common/common-helper-function');
    const tokenAuthMiddleware = require('../../middlewares/token-auth.middleware');
    const roleAuthMiddleware = require('../../middlewares/role-authorization.middleware');


    const getCurrencyList = async (req, res, next) => {
        try {
            const currencyList = await informationController.getCurrencyList(req, next);
            return commonHelper.sendJsonResponse(res, currencyList, moduleConfig.message.notFound, HTTPStatus.OK);
        } catch (err) {
            return next(err);
        }
    };
    const GetCountries = async (req, res, next) => {
        try {
            const currencyList = await informationController.GetCountries(req, next);
            return commonHelper.sendJsonResponse(res, currencyList, moduleConfig.message.notFound, HTTPStatus.OK);
        } catch (err) {
            return next(err);
        }
    };

    const GetTimeZone = async (req, res, next) => {
        try {
            const currencyList = await informationController.GetTimeZone(req, next);
            return commonHelper.sendJsonResponse(res, currencyList, moduleConfig.message.notFound, HTTPStatus.OK);
        } catch (err) {
            return next(err);
        }
    };
    const GetStates = async (req, res, next) => {
        try {
            const currencyList = await informationController.GetStates(req, next);
            return commonHelper.sendJsonResponse(res, currencyList, moduleConfig.message.notFound, HTTPStatus.OK);
        } catch (err) {
            return next(err);
        }
    };

    const GetCity = async (req, res, next) => {
        try {
            const currencyList = await informationController.GetCity(req, next);
            return commonHelper.sendJsonResponse(res, currencyList, moduleConfig.message.notFound, HTTPStatus.OK);
        } catch (err) {
            return next(err);
        }
    };

    informationRouter.route('/currency')
        .get(getCurrencyList);
    informationRouter.route('/countries')
        .get(GetCountries);
    informationRouter.route('/country')
        .get(GetCountries);
    informationRouter.route('/timezone')
        .get(GetTimeZone);
    informationRouter.route('/states/:id')
        .get(GetStates);
    informationRouter.route('/city/:id')
        .get(GetCity);

    return informationRouter;

})();

module.exports = informationRoutes;
