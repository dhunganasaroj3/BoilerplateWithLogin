((s3Helper) => {
    'use strict';

    const Promise = require("bluebird");
    const awsConfig = require('../configs/aws_config');
    const appConfig = require('../configs/application.config');
    const hasher = require('../auth/hasher');

    const aws = require('aws-sdk');

    // configure AWS SDK
    aws.config.update({
        accessKeyId: awsConfig.aws_api_user.accessKeyId,
        secretAccessKey: awsConfig.aws_api_user.secretAccessKey,
        region: awsConfig.aws_api_user.region
    });

    const s3 = new aws.S3({
        apiVersion: '2006-03-01'
    });

    const getSignedUrl = (req, params) => {
        return new Promise((resolve, reject) => {
            s3.getSignedUrl('getObject', params, (err, url) => {
                if(err) {
                    return reject(err);
                } else {
                    return resolve(url);
                }
            });
        });
    };

    const createSignedUrl = (req, params) => {
        return new Promise((resolve, reject) => {
            s3.getSignedUrl('putObject', params, (err, url) => {
                if(err) {
                    return reject(err);
                } else {
                    return resolve(url);
                }
            });
        });
    };


    s3Helper.getSignedUrl = async (req, res, next) => {
        try {
            const key = await hasher.generateRandomBytes(awsConfig.pre_signed_url_length);
            const params = {
                Bucket: awsConfig.s3_bucket,
                Key: `${key}/${req.params.fileName}`,
                // Expires: 600//in secs
                // acl: 'public-read',
                // ServerSideEncryption: "AES256",
            };

            const data = await getSignedUrl(req, params);
            res.status(200);
            res.json({
                data: (data && data.indexOf("?")) ? data.split('?')[0] : ""
            });
        } catch (err) {
            return next(err);
        }
    };

    s3Helper.createSignedUrl = async (req, res, next) => {
        try {
            const key = await hasher.generateRandomBytes(awsConfig.pre_signed_url_length);
            const params = {
                Bucket: awsConfig.s3_bucket,
                // Key: `${key}/user-profile-1532607165116-eaa5c.jpg`,
                Key: 'user-profile-1532607165116-eaa5c.jpg',

                // acl: 'public-read',
                // ServerSideEncryption: "AES256",
            };

            const data = await createSignedUrl(req, params);
            res.status(200);
            res.json({
                data: {
                    put_url: data,
                    get_url: (data && data.indexOf("?")) ? data.split('?')[0] : ""
                }
            });
        } catch (err) {
            return next(err);
        }
    };

})(module.exports);
