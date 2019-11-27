const userConfirmationTokenRoutes = (() => {
  'use strict';

  const express = require('express');
  const userConfirmationTokenRouter = express.Router();
  const userConfirmationTokenController = require('./user-confirmation.controller');

  userConfirmationTokenRouter.route('/:token')
    .get( userConfirmationTokenController.confirmUserRegistration );

  return userConfirmationTokenRouter;

})();

module.exports = userConfirmationTokenRoutes;
