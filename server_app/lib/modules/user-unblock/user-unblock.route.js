const userUnBlockTokenRoutes = (() => {
  'use strict';

  const express = require('express');
  const userUnBlockTokenRouter = express.Router();
  const userUnBlockTokenController = require('./user-unblock.controller');


  userUnBlockTokenRouter.route('/:token')
    .get( userUnBlockTokenController.unBlockUserAccount );

  return userUnBlockTokenRouter;

})();

module.exports = userUnBlockTokenRoutes;
