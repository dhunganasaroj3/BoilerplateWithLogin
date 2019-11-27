/**
 * Created by lakhe on 7/19/17.
 */
const MobileIdentifierRoutes = (() => {
    'use strict';

    const express = require('express');
    const MobileIdentifierRouter = express.Router();
    const mobileIdentifierController = require('./mobile-identifier.controller.js');


    MobileIdentifierRouter.route('/')
        .post(  mobileIdentifierController.generateUniqueMobileIdentifierCode );

    return MobileIdentifierRouter;

})();

module.exports = MobileIdentifierRoutes;
