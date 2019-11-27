const adminAccessController = (() => {
    'use strict';

    const HTTPStatus = require('http-status');
    const moduleConfig = require('./admin-access.config');
    const uuidv1 = require('uuid/v1');
    const commonHelper = require('../../common/common-helper-function');
    const loginAuthController = require('../login-auth/login-auth.controller');

    function AdminAccessModule() {
    }

    const _p = AdminAccessModule.prototype;

    _p.sendUserAccessToken = async (req, res, next) => {
        try {
            let userObj = await req.db.collection('User').findOne({
                _id: req.params.id,
                deleted: false,
                active: true
            });
            if(userObj) {
                userObj.access = ["GET"];
                const data = await loginAuthController.handleLoginSuccessAction(req, userObj, next)
               return commonHelper.sendResponseMessage(res, {result: {n: 1}}, data, moduleConfig.message.tokenCreated);
            }
            return commonHelper.sendResponseData(res, {
                status: HTTPStatus.BAD_REQUEST,
                message: moduleConfig.error.userNotFound
            });
        } catch (err) {
            next(err);
        }
    };

    return {
        sendUserAccessToken: _p.sendUserAccessToken
    };

})();

module.exports = adminAccessController;
