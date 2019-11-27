/**
 * Created by lakhe on 12/4/17.
 */
const pushNotificationController = (() => {
    'use strict';

    const HTTPStatus = require('http-status');
    const moduleConfig = require('./push-notification.config');
    const utilityHelper = require('../../helpers/utilities.helper');
    const errorHelper = require('../../helpers/error.helper');
    const commonHelper = require('../../common/common-helper-function');
    const commonProvider = require('../../common/common-provider-function');
    const documentFields = 'registration_token platform device_model device_detail notification_key';
    const firebaseController = require('../firebase/firebase.controller');
    const apnsController = require('../apple-apns/apns.controller');
    const uuidv1 = require('uuid/v1');
    const projectionFields = {
        '_id': 1,
        'registration_token': 1,
        'platform': 1,
        'device_model': 1,
        'device_detail': 1,
        'notification_key': 1,
        'user_ids': 1
    };

    const subscription_topics = {
        IMP: 'IMP',
        END_USER: 'END_USER',
        VENDOR: 'VENDOR'
    };

    function pushNotificationModule() {}

    const _p = pushNotificationModule.prototype;

    _p.checkValidationErrors = async (req) => {
        req.checkBody('registration_token', moduleConfig.validationMessage.registration_token).notEmpty();
        req.checkBody('platform', moduleConfig.validationMessage.platform).notEmpty();
        req.checkBody('device_model', moduleConfig.validationMessage.device_model).notEmpty();
        req.checkBody('device_detail', moduleConfig.validationMessage.device_detail).notEmpty();
        const result = await req.getValidationResult();
        return result.array();
    };


    _p.checkCustomPushNotificationValidationErrors = async (req) => {
        req.checkBody('title', moduleConfig.validationMessage.push_notification_title).notEmpty();
        req.checkBody('message', moduleConfig.validationMessage.push_notification_message).notEmpty();
        const result = await req.getValidationResult();
        return result.array();
    };
    _p.getAllPushNotificationMessages = (req, next) => {
        const queryOpts = {
            deleted: false
        };
        const pagerOpts = utilityHelper.getPaginationOpts(req, next);
        const sortOpts = {
            added_on: -1
        };
        if(req.query.push_target) {
            queryOpts.push_target = req.query.push_target;
        }
        if(req.query.priority) {
            queryOpts.priority = req.query.priority;
        }

        return commonProvider.getPaginatedDataList(req.db.collection('PushNotificationMessages'), queryOpts, pagerOpts, {
            '_id':1,
            'push_message': 1,
            'push_title': 1,
            'push_target': 1,
            'added_on': 1,
            'priority': 1,
            'expires_in': 1
        }, sortOpts);
    };


    _p.getAllPushNotificationDevices = (req, next) => {
        let queryOpts = {};
        if (req.query.platform && req.query.platform !== "") {
            queryOpts = Object.assign({}, queryOpts, { platform: req.query.platform });
        }
        if (req.query.device_model && req.query.device_model !== "") {
            queryOpts = Object.assign({}, queryOpts, { device_model: req.query.device_model });
        }
        const pagerOpts = utilityHelper.getPaginationOpts(req, next);
        const sortOpts = {
            added_on: -1
        };
        return commonProvider.getPaginatedDataList(req.db.collection('PushNotificationDevices'), queryOpts, pagerOpts, projectionFields, sortOpts);
    };

    _p.registerPushNotificationDevices = async (req, res, next) => {
        try {
            const errors = await _p.checkValidationErrors(req);
            if (errors && errors.length > 0) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.BAD_REQUEST,
                    message: errorHelper.sendFormattedErrorData(errors)
                });
            } else {
                const pushNotificationObj = commonHelper.collectFormFields(req, req.body, documentFields, undefined);
                // pushNotificationObj.device_identifier = req.query.device_identifier;
                const dataRes = await req.db.collection('PushNotificationDevices').insertOne(pushNotificationObj);
                return commonHelper.sendResponseMessage(res, dataRes, null, moduleConfig.message.saveMessage);
            }
        } catch (err) {
            next(err);
        }
    };

    _p.getSubscriptionTopics = (user_role, next) => {
        if(utilityHelper.containsElementInArr(user_role, "imp", next)) {
            return subscription_topics.IMP;
        }
        else if(utilityHelper.containsElementInArr(user_role, "enduser", next)) {
            return subscription_topics.END_USER;
        } else {
            return subscription_topics.VENDOR;
        }
    };

    _p.sendPushNotificationToTopic = async (req, res, next) => {

    };

    _p.getTimeToLiveValue = (time, timeUnit) => {
        switch(timeUnit) {
            case "m":
                return time * 60;
                break;
            case "h":
                return time * 60 * 60;
                break;
            case "d":
                return time * 60 * 60 * 24;
                break;
            case "w":
                return time * 60 * 60 * 24 * 7;
                break;
        }
    };

    _p.savePushNotificationMessage = async (req, messageObj) => {
        return req.db.collection('PushNotificationMessages').insertOne(messageObj);
    };

    _p.sendCustomPushNotification = async (req, res, next) => {
        try {
            const errors = await _p.checkCustomPushNotificationValidationErrors(req);
            if (errors && errors.length > 0) {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.BAD_REQUEST,
                    message: errorHelper.sendFormattedErrorData(errors)
                });
            } else {
                const payload = {
                    notification: {
                        title: req.body.title,
                        body: req.body.message
                    }
                };
                if (req.body.sound === "enabled")
                    if (req.body.include_custom_data === "true" || req.body.include_custom_data === true) {
                        payload.data = req.body.custom_data ? typeof req.body.custom_data === "object" ? req.body.custom_data : JSON.parse(req.body.custom_data) : {};//max payload of 4KB
                    }
                const defaultOptions = {
                    priority: req.body.priority ? req.body.priority : "normal"
                };
                if (req.body.sound === "enabled") {
                    defaultOptions.sound = "default";
                }
                defaultOptions.time_to_live = _p.getTimeToLiveValue(parseInt(req.body.expires_in), req.body.time_unit);
//defaultOptions.icon

                const pushMessageObj = {
                    _id: uuidv1(),
                    push_message: req.body.message,
                    push_title: req.body.title,
                    push_target: req.body.target,
                    added_on: new Date(),
                    priority: req.body.priority,
                    expires_in: `${req.body.expires_in} ${req.body.time_unit}`,
                    deleted: false
                };
                switch (req.body.target) {
                    case "topic":
                        const topicInfo = await req.db.collection('PushNotificationTopics').findOne({
                            topic_title: req.body.topic_title,
                            deleted: false
                        });
                        if (topicInfo && Object.keys(topicInfo).length > 0) {
                            // const android_device_ids = topicInfo.device_registration_ids.filter((item) => {
                            //     if(item.platform==="android"){
                            //         return item.device_id;
                            //     }
                            // });
                            // const ios_device_ids = topicInfo.device_registration_ids.filter((item) => {
                            //     if(item.platform==="ios"){
                            //         return item.device_id;
                            //     }
                            // });
                            // if(android_device_ids && android_device_ids.length>0) {
                            //     const response = await firebaseController.sendPushNotificationToTopic(req.body.topic, payload, req, next);
                            //     return commonHelper.sendResponseData(res, {
                            //         status: response ? HTTPStatus.OK : HTTPStatus.UNAUTHORIZED,
                            //         message: response ? moduleConfig.message.pushNotificationSentSuccess : moduleConfig.message.pushNotificationSentError
                            //     });
                            // }
                            const response = await firebaseController.sendPushNotificationToTopic(req.body.topic_title, payload, req, next, true, defaultOptions);
                            _p.savePushNotificationMessage(req, pushMessageObj);
                            return commonHelper.sendDataManipulationMessage(res, pushMessageObj, response ? moduleConfig.message.pushNotificationSentSuccess : moduleConfig.message.pushNotificationSentError, response ? HTTPStatus.OK : HTTPStatus.UNAUTHORIZED);
                        } else {
                            return commonHelper.sendResponseData(res, {
                                status: HTTPStatus.NOT_FOUND,
                                message: moduleConfig.message.topicNotFound
                            });
                        }
                        break;
                    case "single_device":
                        const deviceInfo = await req.db.collection('PushNotificationDevices').findOne({registration_token: req.body.registration_token});
                        if (deviceInfo && Object.keys(deviceInfo).length > 0) {
                            if (deviceInfo.platform === "android") {
                                const response = await firebaseController.sendPushNotificationToDevice(req.body.registration_token, payload, req, next, true, defaultOptions);
                                _p.savePushNotificationMessage(req, pushMessageObj);
                                return commonHelper.sendDataManipulationMessage(res, pushMessageObj, response ? moduleConfig.message.pushNotificationSentSuccess : moduleConfig.message.pushNotificationSentError, response ? HTTPStatus.OK : HTTPStatus.UNAUTHORIZED);
                            } else {

                            }
                        } else {
                            return commonHelper.sendResponseData(res, {
                                status: HTTPStatus.NOT_FOUND,
                                message: moduleConfig.message.deviceTokenNotFound
                            });
                        }
                        break;
                    case "group":
                        break;
                }
            }
        } catch (err) {
            return next(err);
        }
    };

    _p.createPushNotificationTopic = async (req, topic_title) => {
        try {
            const count = await req.db.collection('PushNotificationTopics').estimatedDocumentCount({
                topic_title: topic_title,
                deleted: false
            });
            if(count > 0) {
                return {
                    already_exists: true
                };
            } else {
                const pushNotificationTopicObj = {
                    _id: uuidv1(),
                    topic_title: topic_title,
                    device_registration_ids: {
                        "android": [],
                        "iOS": []
                    },
                    added_on: new Date(),
                    deleted: false
                };
                const dataRes = await req.db.collection('PushNotificationTopics').insertOne(pushNotificationTopicObj);
                return {
                    save: (dataRes && dataRes.result.n > 0) ? true : false
                };
            }
        } catch (err) {
            return {
                error: true
            };
        }
    };

    _p.addRegistrationDeviceIdsToTopic = async (req, topic_title, device_registration_token, platform) => {
        try {
            const count = await req.db.collection('PushNotificationTopics').estimatedDocumentCount({
                $and: [
                    {
                        $and: [
                            {
                                topic_title: topic_title,
                            }, {
                                deleted: false
                            }
                        ]
                    },{
                        [`device_registration_ids.${platform}`] : {
                            $elemMatch: {
                                device_id: device_registration_token
                            }
                        }
                    }
                ]
            });
            if(count > 0) {
                return {
                    already_exists: true
                };
            } else {
                const dataRes = await req.db.collection('PushNotificationTopics').updateOne({
                    topic_title: topic_title,
                    deleted: false
                }, {
                    $push: {
                        [`device_registration_ids.${platform}`] : {
                            device_id: device_registration_token
                        }
                    }
                });
                return {
                    add_device_token: (dataRes && dataRes.result.n > 0) ? true : false
                };
            }
        } catch (err) {
            return {
                error: true
            };
        }
    };

    _p.removeRegistrationDeviceIdsFromTopic = async (req, topic_title, device_registration_token, platform) => {
        try {
            const count = await req.db.collection('PushNotificationTopics').estimatedDocumentCount({
                $and: [
                    {
                        $and: [
                            {
                                topic_title: topic_title,
                            }, {
                                deleted: false
                            }
                        ]
                    },{
                        [`device_registration_ids.${platform}`] : {
                            $elemMatch: {
                                device_id: device_registration_token
                            }
                        }
                    }
                ]
            });
            if(count > 0) {
                const dataRes = await req.db.collection('PushNotificationTopics').updateOne({
                    topic_title: topic_title,
                    deleted: false
                }, {
                    $pull: {
                        [`device_registration_ids.${platform}`] : {
                            device_id: device_registration_token
                        }
                    }
                });
                return {
                    add_device_token: (dataRes && dataRes.result.n > 0) ? true : false
                };
            } else {
                return {
                    not_exists: true
                };
            }
        } catch (err) {
            return {
                error: true
            };
        }
    };

    _p.updatePushNotificationDeviceDataForMobileUserSignup = async (req, user_id, registration_token, user_role, platform, next) => {
        try {
            const topic_title = _p.getSubscriptionTopics(user_role, next);
            const updateOpts = {
                $push: {
                    user_ids: user_id.toString()
                }
            };
            const dataRes = await req.db.collection('PushNotificationDevices').updateOne({ registration_token: registration_token, user_ids: {$nin: [user_id.toString()]} }, updateOpts);
            if(dataRes.result.n > 0) {
                const topicSaveRes = await _p.createPushNotificationTopic(req, topic_title);
                if(topicSaveRes.save || topicSaveRes.already_exists) {
                    const deviceTokenInsertRes = await _p.addRegistrationDeviceIdsToTopic(req, topic_title, registration_token, platform);
                    if(deviceTokenInsertRes.already_exists) {
                        return true;
                    } else if(deviceTokenInsertRes.add_device_token){
                        if(platform==='android') {
                            const topicSubscriptionRes = await firebaseController.subscribeToTopic(req, registration_token, topic_title, next);
                            if (topicSubscriptionRes) {
                                return true;
                            }
                        } else {
                            return true;
                        }
                    }
                }
            }
            return false;
        } catch (err) {
            return false;
        }
    };

    _p.updatePushNotificationDeviceData = async (req, res, next) => {
        try {
            const topic_title = _p.getSubscriptionTopics(commonHelper.getLoggedInUserRole(req), next);
            const updateOpts = {
                $push: {
                    'user_ids': commonHelper.getLoggedInUserId(req)
                }
            };
            let failure_message = "";
            const dataRes = await req.db.collection('PushNotificationDevices').updateOne({ registration_token: req.params.token }, updateOpts);
            if(dataRes.result.n > 0) {
                const topicSaveRes = await _p.createPushNotificationTopic(req, topic_title);
                if(topicSaveRes.save || topicSaveRes.already_exists) {
                    const deviceTokenInsertRes = await _p.addRegistrationDeviceIdsToTopic(req, topic_title, req.params.token, req.params.platform);
                    if(deviceTokenInsertRes.already_exists) {
                        return commonHelper.sendResponseData(res, {
                            status: HTTPStatus.OK,
                            message: moduleConfig.message.deviceTokenRegisterSuccess
                        });
                    } else if(deviceTokenInsertRes.add_device_token){
                        if(req.params.platform==='android') {
                            const topicSubscriptionRes = await firebaseController.subscribeToTopic(req, req.params.token, topic_title, next);
                            if(topicSubscriptionRes) {
                                return commonHelper.sendResponseData(res, {
                                    status: HTTPStatus.OK,
                                    message: moduleConfig.message.deviceTokenRegisterSuccess
                                });
                            }
                        } else {
                            return commonHelper.sendResponseData(res, {
                                status: HTTPStatus.OK,
                                message: moduleConfig.message.deviceTokenRegisterSuccess
                            });
                        }
                    }
                    // else if(deviceTokenInsertRes.already_exists) {
                    //     return commonHelper.sendResponseData(res, {
                    //         status: HTTPStatus.OK,
                    //         message: moduleConfig.message.deviceTokenAlreadyExists
                    //     });
                    // }
                }
                failure_message = moduleConfig.message.deviceTokenRegisterFailure
            } else {
                failure_message = moduleConfig.message.deviceTokenLinkedFailure;
            }
            return commonHelper.sendResponseData(res, {
                status: HTTPStatus.NOT_MODIFIED,
                message: failure_message
            })
        } catch (err) {
            return next(err);
        }
    };

    _p.sendPushNotificationToIndividualDevices = async (req, user_id, payload, next) => {
        try {
            const queryPushOpts = {
                deleted: false,
                user_ids: {
                    $in: [user_id.toString()]
                }
            };
            const deviceInfo = await req.db.collection('PushNotificationDevices').find(queryPushOpts).sort({ added_on: -1 }).limit(1).toArray();
            if(deviceInfo && deviceInfo.length > 0){
                const push_registrationTokens = deviceInfo.map((item) => item.registration_token);
                if(deviceInfo[0].platform==="android") {
                    const response = await firebaseController.sendPushNotificationToDevice(push_registrationTokens, payload, req, next, false);
                    return response ? true : false
                } else if(deviceInfo[0].platform==="iOS"){
                    const response = await apnsController.sendPushNotificationToIOSDevice(push_registrationTokens, payload, req, next, false);
                    return response ? true : false
                }
            }
        } catch (err) {
            return next(err);
        }
    };

    _p.getPushNotificationTopics = async (req) => {
        const sortOpts = {
            topic_title: 1
        };
        const queryOpts = {
            deleted:false
        };
        if(req.query.topic_title) {
            queryOpts.topic_title = new RegExp('.*' + req.query.topic_title, "i");// matches anything that  starts with the inputted title, case insensitive
        }
        return req.db.collection('PushNotificationTopics').find(queryOpts).project({
            topic_title: 1,
            added_on: 1,
            _id: 1
        }).sort(sortOpts).toArray();
    };

    _p.updateLoggedInStatusOfDevices = async (req, user_id) => {
        const dataRes = await req.db.collection('PushNotificationDevices').updateOne({
            user_ids: {
                $in: [user_id.toString()]
            },
            registration_token: req.query.registration_token }, {
            $pull: {
                user_ids: user_id.toString()
            }
        });
        return (dataRes.result.n > 0) ? true : false;
    };

    _p.deletePushNotificationMessage = async (req, res, next) => {
        try {
            const queryOpts = {
                _id: req.params.messageId,
                deleted: false
            };
            const updateOpts = {
                $set: {
                    'deleted': true,
                    'deleted_on': new Date(),
                    'deleted_by': commonHelper.getLoggedInUser(req)
                }
            };
            const dataRes = await req.db.collection('User').updateOne(queryOpts, updateOpts);
            return commonHelper.sendResponseMessage(res, dataRes, {
                _id: req.params.messageId
            }, moduleConfig.message.deleteMessage);
        } catch (err) {
            return next(err);
        }
    };

    _p.sendBookingPushNotificationToIndividualDevices = async (req, res, next) => {
        try {
            const queryPushOpts = {
                 "deleted": false,
                "platform": req.params.platform,
                // "token": req.params.token
            };
            const deviceInfo = await req.db.collection('PushNotificationDevices').find(queryPushOpts).sort({ added_on: -1 }).limit(1).toArray();
            if(deviceInfo && deviceInfo.length > 0){
                const push_registrationTokens = deviceInfo.map((item) => item.registration_token);
                const payload = {
                    notification: {
                        title: moduleConfig.push_notification.title.booking_confirmation_status,
                        body: moduleConfig.push_notification.title.booking_confirmation_status,
                    },
                    data: {
                        booking_info: JSON.stringify({
                            refId: req.body.refId,
                            email: req.body.email,
                            paid_amount: req.body.paid_amount
                        })
                    }
                };

                req.db.collection('BookingPushNotificationLogs').insertOne({
                    "refId": req.body.refId,
                    "email": req.body.email,
                    "paid_amount": req.body.paid_amount,
                    "platform": req.params.platform,
                    "token": req.params.token,
                    "added_on": new Date(),
                });
                let response = false;
                if(deviceInfo[0].platform==="android") {
                    response = await firebaseController.sendPushNotificationToDevice(push_registrationTokens, payload, req, next, false);
                    return response ? true : false
                } else if(deviceInfo[0].platform==="iOS"){
                    const response = await apnsController.sendPushNotificationToIOSDevice(push_registrationTokens, payload, req, next, false);
                    return response ? true : false
                }
                return commonHelper.sendResponseData(res, {
                    status: response ? HTTPStatus.OK : HTTPStatus.BAD_REQUEST,
                    message: response ? moduleConfig.message.booking_notification_success : moduleConfig.message.booking_notification_failure
                })
            }
            return commonHelper.sendResponseData(res, {
                status: HTTPStatus.BAD_REQUEST,
                message: moduleConfig.message.deviceTokenNotFound
            })
        } catch (err) {
            return next(err);
        }
    };

    return {
        getAllPushNotificationDevices: _p.getAllPushNotificationDevices,
        registerPushNotificationDevices: _p.registerPushNotificationDevices,
        updatePushNotificationDeviceData: _p.updatePushNotificationDeviceData,
        sendCustomPushNotification: _p.sendCustomPushNotification,
        createPushNotificationTopic: _p.createPushNotificationTopic,
        addRegistrationDeviceIdsToTopic: _p.addRegistrationDeviceIdsToTopic,
        removeRegistrationDeviceIdsFromTopic: _p.removeRegistrationDeviceIdsFromTopic,
        sendPushNotificationToIndividualDevices: _p.sendPushNotificationToIndividualDevices,
        updatePushNotificationDeviceDataForMobileUserSignup: _p.updatePushNotificationDeviceDataForMobileUserSignup,
        getPushNotificationTopics: _p.getPushNotificationTopics,
        updateLoggedInStatusOfDevices: _p.updateLoggedInStatusOfDevices,
        getAllPushNotificationMessages: _p.getAllPushNotificationMessages,
        deletePushNotificationMessage: _p.deletePushNotificationMessage,
        sendBookingPushNotificationToIndividualDevices: _p.sendBookingPushNotificationToIndividualDevices
    };

})();

module.exports = pushNotificationController;
