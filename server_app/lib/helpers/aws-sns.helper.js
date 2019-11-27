
((snsHelper) => {
    'use strict';

    const Promise = require("bluebird");
    const awsConfig = require('../configs/aws_config');
    const smsConfig = require('../configs/sms.config');

    const aws = require('aws-sdk');
    // configure AWS SDK
    aws.config.update({
        accessKeyId: awsConfig.aws_api_user.accessKeyId,
        secretAccessKey: awsConfig.aws_api_user.secretAccessKey,
        region: awsConfig.aws_api_user.region
    });

    const smsSenderHelper = (message, to_number) => {
        return new Promise((resolve, reject) => {
            // Create promise and SNS service object
            const publishTextPromise = new aws.SNS({apiVersion: awsConfig.sns_api_version}).publish({
                Message: message, /* required */
                MessageStructure: 'string',
                PhoneNumber: to_number,
                Subject: smsConfig.subject
            }).promise();

            // handle promise's fulfilled/rejected states
            publishTextPromise.then(
                (data) => {
                    return resolve(data);
                }).catch(
                (err) => {
                    return reject(err);
                });
        });
    }


    snsHelper.sendSMS = (to_number, message) => {

        return new Promise((resolve, reject) => {
            // Create SMS Attribute parameters
            // Create promise and SNS service object
            const setSMSTypePromise = new aws.SNS({apiVersion: awsConfig.sns_api_version}).setSMSAttributes({
                attributes: { /* required */
                    'DefaultSMSType': 'Transactional', /* highest reliability */
                }
            }).promise();

            // Handle promise's fulfilled/rejected states
            setSMSTypePromise
                .then((data) => {
                    return smsSenderHelper(message, to_number);
                })
                .then((data) => {
                    return resolve(true);
                })
                .catch((err) => {
                    return resolve(null);
                });

        });
    };

})(module.exports);
