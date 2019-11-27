/**
 * Created by lakhe on 12/25/17.
 */
const apnController = (() => {
    'use strict';

    const express = require('express');
    const app = express();
    const apn = require('apn');
    const apnConfig = require('./apns.config');
    const apnProvider = new apn.Provider({
        token: {
            key: `${__dirname}/AuthKey_W3M8KK2D2R.p8`,
            keyId: apnConfig.config.key_id,
            teamId: apnConfig.config.team_id
        },
        production: (app.get('env') === "production" ) ? true : false
    });
    const errorLogsController = require('../../modules/error-logs/error-logs.controller');

    function apnModule(){}

    const _p = apnModule.prototype;

    _p.sendPushNotificationToIOSDevice = async (registrationToken, payload, req, next, custom_generated_notification=false) => {
        try {
            if(payload.data && !custom_generated_notification) {
                payload.data = {
                    ...payload.data,
                    user_push_notification: "true"
                }
            } else if(!custom_generated_notification) {
                payload.data = {
                    user_push_notification: "true"
                }
            }
            const deviceToken = registrationToken;
            const notification = new apn.Notification();
            notification.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
            // notification.badge = apnConfig.systemConfig.badge;
            notification.title  = payload.notification.body.title;
            notification.sound = "ping.aiff";
            notification.alert = `${payload.notification.body}`;//\uD83D\uDCE7 \u2709
            notification.payload = payload.data;
            notification.topic = apnConfig.config.app_bundle_id;
            const result = await apnProvider.send(notification, deviceToken);
            return result.sent.length > 0 ? true : false;
        } catch(err) {
            errorLogsController.postErrorLogs(err, req, next);
            return false;
        }
    };

    return {
        sendPushNotificationToIOSDevice: _p.sendPushNotificationToIOSDevice
    };

})();

module.exports = apnController;
