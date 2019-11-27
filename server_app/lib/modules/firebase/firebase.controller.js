/**
 * Created by lakhe on 12/3/17.
 */
const firebaseController = (() => {
    'use strict';

    const admin = require("firebase-admin");
    const serviceAccount = require("./xceltrip-1509425773509-firebase-adminsdk-5pr2l-5e205a9895.json");
    const errorLogsController = require('../../modules/error-logs/error-logs.controller');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://xceltrip-1509425773509.firebaseio.com"
    });
    const registrationToken = "";//can be an array of strings or just string
    const payload = {
        notification: {
            title: "$GOOG up 1.43% on the day",
            body: "$GOOG gained 11.80 points to close at 835.67, up 1.43% on the day."
        },
        data: {
            MyKey1: "Hello"
        }
    };
    const defaultOptions = {
        priority: "normal",
        ttl: 60*60*24
    };

    function firebaseModule(){}

    const _p = firebaseModule.prototype;

    _p.handlePayloadDataFormat = (payload) => {
        const returnObj = {};
        Object.keys(payload).forEach((key,index) => {
            returnObj[key] = payload[key].toString();
        });
        return returnObj;
    }

    _p.sendPushNotificationToDevice = async (registrationToken, payload, req, next, custom_generated_notification=false, options = defaultOptions) => {
        return new Promise(async (resolve, reject) => {
            try {
                if(payload.data && !custom_generated_notification) {
                    payload.data = _p.handlePayloadDataFormat(payload.data);
                    payload.data = {
                        ...payload.data,
                        user_push_notification: "true"
                    }
                } else if(!custom_generated_notification) {
                    payload.data = {
                        user_push_notification: "true"
                    }
                }
                const response = await admin.messaging().sendToDevice(registrationToken, payload, options);
                if(response && response.successCount>0) {
                    return resolve(true);
                } else {
                    // errorLogsController.postErrorLogs(response, req, next);
                    return resolve(false);
                }
            } catch (err) {
                errorLogsController.postErrorLogs(err, req, next);
                return resolve(false);
            }
        });
    };

    _p.sendPushNotificationToDeviceGroup = async (req) => {
        const notificationKey = "some-notification-key";
        try {
            const response = await admin.messaging().sendToDeviceGroup(notificationKey, payload, options);
            if(response) {
            } else {
            }
        } catch(err) {
        }
    };

    _p.sendPushNotificationToTopic = async (topic, payload, req, next, custom_generated_notification=false, options = defaultOptions) => {
        return new Promise(async (resolve, reject) => {
            try {
                if (payload.data && !custom_generated_notification) {
                    payload = _p.handlePayloadDataFormat(payload.data);
                    payload.data = {
                        ...payload.data,
                        user_push_notification: "true"
                    }
                } else if (!custom_generated_notification) {
                    payload.data = {
                        user_push_notification: "true"
                    }
                }
                const response = await admin.messaging().sendToTopic(topic, payload, options);
                if (response && response.messageId) {
                    return resolve(true);
                } else {
                    // errorLogsController.postErrorLogs(response, req, next);
                    return resolve(false);
                }
            } catch (err) {
                errorLogsController.postErrorLogs(err, req, next);
                return resolve(false);
            }
        });
    };

    _p.sendPushNotificationToCondition = async (req) => {
        return new Promise(async (resolve, reject) => {
            const condition = "'stock-GOOG' in topics || 'industry-tech' in topics";
            try {
                const response = await admin.messaging().sendToCondition(condition, payload, options);
                if (response) {
                    console.log("Successfully sent message", response);
                } else {
                    console.log("Error sending message")
                }
            } catch (err) {
                console.log("Error sending message", err)
            }
        });
    };

    _p.subscribeToTopic = async (req, registrationToken, topic, next) => {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await admin.messaging().subscribeToTopic(registrationToken, topic);
                if (response && response.successCount > 0) {
                    return resolve(true);
                } else {
                    // errorLogsController.postErrorLogs(response, req, next);
                    return resolve(false);
                }
            } catch (err) {
                errorLogsController.postErrorLogs(err, req, next);
                return resolve(false);
            }
        });
    };

    _p.unsubscribeFromTopic = async (req) => {
        return new Promise(async (resolve, reject) => {
            const topic = "highScores";
            try {
                const response = await admin.messaging().unsubscribeFromTopic(registrationToken, topic);
                if (response) {
                } else {
                }
            } catch (err) {
                console.log("Error sending message", err)
            }
        });
    };

    return {
        sendPushNotificationToDevice: _p.sendPushNotificationToDevice,
        sendPushNotificationToDeviceGroup: _p.sendPushNotificationToDeviceGroup,
        sendPushNotificationToTopic: _p.sendPushNotificationToTopic,
        sendPushNotificationToCondition: _p.sendPushNotificationToCondition,
        subscribeToTopic: _p.subscribeToTopic,
        unsubscribeFromTopic: _p.unsubscribeFromTopic
    };

})();

module.exports = firebaseController;
