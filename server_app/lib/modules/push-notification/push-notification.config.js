/**
 * Created by lakhe on 12/4/17.
 */
(() => {
    "use strict";

    module.exports = {
        message: {
            saveMessage: "Device registered successfully",
            updateMessage: "Device data updated successfully",
            deviceNotFound: "No Devices Found",
            deleteMessage: "Push notification message deleted successfully",
            pushNotificationSentSuccess: "Push notification sent successfully",
            pushNotificationSentError: "Failure to send push notification",
            saveTopic: "Topic created successfully",
            saveTopicError: "Error creating topic",
            topicAlreadyExists:"Push Notification topic already exists",
            topicSaveSuccess: "Topic created successfully",
            topicSaveFailure: "Failure to create topic",
            deviceTokenRegisterSuccess: "Device token registered to the topic and linked with user successfully ",
            deviceTokenLinkedFailure: "Device token failed to linked with the user",
            deviceTokenAlreadyExists: "Device token already exists.",
            deviceTokenRegisterFailure: "Device token failed to registered to the topic",
            topicNotFound: "Topic not found",
            messageNotFound: "Push messages not found",
            deviceTokenNotFound: "Device registration token not found",
            booking_notification_success: 'Booking notification success',
            booking_notification_failure: 'Booking notification failure',
        },
        validationMessage: {
            registration_token: "Device registration token is required",
            platform: "Platform is required",
            device_model: "Device model is required",
            device_detail: "Detail for device is required",
            topic_title: "Topic title is required",
            push_notification_title: "Please enter value for the PUSH notification title",
            push_notification_message: "Please enter value for the PUSH notification message"
        },
        config: {
        },
        push_notification: {
            title: {
                booking_confirmation_status: "Booking confirmation status"
            }
        }
    };

})();
