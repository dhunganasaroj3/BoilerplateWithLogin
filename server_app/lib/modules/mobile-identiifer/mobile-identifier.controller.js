/**
 * Created by lakhe on 7/19/17.
 */
const MobileIdentifierController = (() => {
    'use strict';

    const moduleConfig = require('./mobile-identifier.config.js');
    const hasher = require('../../auth/hasher');
    const commonHelper = require('../../common/common-helper-function');
    const useragent = require('useragent');
    const uuidv1 = require('uuid/v1');

    function MobileIdentifierSettingModule(){}

    const _p = MobileIdentifierSettingModule.prototype;

    _p.checkMobileIdentifierToken = (req) => {
        return req.db.collection('MobileIdentifier').estimatedDocumentCount({
            unique_identifier: req.query.unique_identifier,
            device_identifier: req.query.device_identifier

        });
    };

    _p.generateUniqueMobileIdentifierCode =  async (req, res, next) => {
        try {
            const randomToken = await hasher.generateRandomBytes(26);
            const saveObj = {
                _id: uuidv1(),
                unique_identifier: randomToken,
                added_on: new Date(),
                mobile_device: req.body.mobile_device,
                device_identifier: req.body.device_identifier
            };
            const dataRes = await req.db.collection('MobileIdentifier').insertOne(saveObj);
            // if(dataRes.result.n > 0) {
            //     const deviceInfo = await req.db.collection('PushNotificationDevices').findOne({ device_identifier: req.body.device_identifier, deleted: false });
            //     saveObj.registration_token = deviceInfo.registration_token;
            // }

            commonHelper.sendJsonResponseMessage(res, dataRes, saveObj, moduleConfig.message.saveMessage);
        } catch (err) {
            return next(err);
        }
    };

    return{
        checkMobileIdentifierToken : _p.checkMobileIdentifierToken,
        generateUniqueMobileIdentifierCode : _p.generateUniqueMobileIdentifierCode
    };

})();

module.exports = MobileIdentifierController;
