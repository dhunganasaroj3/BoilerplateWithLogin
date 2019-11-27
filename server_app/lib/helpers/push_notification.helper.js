/**
 * Created by lakhe on 11/30/17.
 */
((pushNotificationHelper) => {
    'use strict';

    const Promise = require("bluebird");
    const awsConfig = require('../configs/aws_config');
    const aws = require('aws-sdk');
    // configure AWS SDK

    aws.config.update({
        region: process.env.AWS_REGION
    });

    const sns = new aws.SNS();

    sns.createPlatformEndpoint({
        PlatformApplicationArn: '{APPLICATION_ARN}',
        Token: '{DEVICE_TOKEN}'
    }, function(err, data) {
        if (err) {
            return;
        }
        const endpointArn = data.EndpointArn;
        const payload = {
            default: 'Hello World',
            APNS: {
                aps: {
                    alert: 'Hello World',
                    sound: 'default',
                    badge: 1
                }
            }
        };
        // first have to stringify the inner APNS object...
        payload.APNS = JSON.stringify(payload.APNS);
        // then have to stringify the entire message payload
        sns.publish({
            Message: payload,
            MessageStructure: 'json',
            TargetArn: endpointArn
        }, function(err, data) {
            if (err) {
                return;
            }
        });
    });


    pushNotificationHelper.sendPUshNotification = (req, next) => {
        try {
        } catch (err) {
            return next(err);
        }
    };
})(module.exports);
