const locationTrackerRoutes = (() => {
    'use strict';

    const express = require('express');
    const HTTPStatus = require('http-status');
    const moduleConfig = require('./config');
    const locationTrackerController = require('./index');
    const locationTrackerRouter = express.Router();
    const commonHelper = require('../../common/common-helper-function');

    const getLocationInfo = async (req, res, next) => {

        try {
            const locationInfo = await locationTrackerController.getLocationInfo(req, next);
            return commonHelper.sendJsonResponse(res, locationInfo, moduleConfig.message.notFound, HTTPStatus.OK);
        } catch (err) {
            return next(err);
        }
    };

    locationTrackerRouter.route('/country')
        .get( getLocationInfo);

    return locationTrackerRouter;

})();

module.exports = locationTrackerRoutes;
