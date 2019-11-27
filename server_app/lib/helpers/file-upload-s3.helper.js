/**
 * Created by lakhe on 10/9/17.
 */
'use strict';
const fileUploadHelper = (filePath, prefixVal) => {

    const multer = require('multer');
    const HTTPStatus = require('http-status');
    const messageConfig = require('../configs/message.config');
    const commonHelper = require('../common/common-helper-function');
    const hasher = require('../auth/hasher');
    const awsConfig = require('../configs/aws_config');
    const aws = require('aws-sdk');
    const multerS3 = require('multer-s3');
    // configure AWS SDK

    aws.config.update({
        region: process.env.AWS_REGION
    });
    const s3 = new aws.S3({
        apiVersion: '2010-12-01'
    });

    const s3OptsImage = {
        s3: s3,
        bucket: awsConfig.s3_bucket,
        metadata: (req, file, cb) => {
            cb(null, {file: file.originalname});
        },
        cacheControl: 'max-age=31536000',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        'acl': 'public-read',
        'serverSideEncryption': 'AES256',
        key: async(req, file, cb) => {
            const randomString = await  hasher.generateRandomBytes(5);
            const fileName = prefixVal + '-' + Date.now() + '-' + randomString + '.' + file.originalname.substring(file.originalname.lastIndexOf('.') + 1);
            req.uploadFileInfo = {
                original_name: file.originalname,
                file_name: fileName,
                file_mime_type: file.mimetype
            };
            cb(null, fileName);
        }
    };

    const s3OptsDocument = {
        s3: s3,
        bucket: awsConfig.s3_bucket,
        metadata: (req, file, cb) => {
            cb(null, {file: file.originalname});
        },
        cacheControl: 'max-age=31536000',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        contentDisposition: 'attachment',
        'serverSideEncryption': 'AES256',
        'acl': 'public-read',
        key: async(req, file, cb) => {
            const randomString = await  hasher.generateRandomBytes(5);
            const fileName = prefixVal + '-' + Date.now() + '-' + randomString + '.' + file.originalname.substring(file.originalname.lastIndexOf('.') + 1);
            req.uploadFileInfo = {
                original_name: file.originalname,
                file_name: fileName,
                file_mime_type: file.mimetype
            };
            cb(null, fileName);
        }
    };

    const s3OptsPrivateDocument = {
        s3: s3,
        bucket: awsConfig.s3_bucket,
        metadata: (req, file, cb) => {
            cb(null, {file: file.originalname});
        },
        cacheControl: 'max-age=31536000',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        contentDisposition: 'attachment',
        'serverSideEncryption': 'AES256',
        'acl': 'private',
        key: async(req, file, cb) => {
            const randomString = await  hasher.generateRandomBytes(5);
            const fileName = prefixVal + '-' + Date.now() + '-' + randomString + '.' + file.originalname.substring(file.originalname.lastIndexOf('.') + 1);
            req.uploadFileInfo = {
                original_name: file.originalname,
                file_name: fileName,
                file_mime_type: file.mimetype
            };
            cb(null, fileName);
        }
    };

    const documentFilter = (req, file, cb) => {
        // accept document files only
        if (!file.originalname.match(/\.(pdf|json|doc|docx|zip|p12)$/i)) {
            req.fileValidationError = messageConfig.uploadFile.document;
            return commonHelper.sendResponseData(req.res, {
                status: HTTPStatus.UNSUPPORTED_MEDIA_TYPE,
                message: messageConfig.uploadFile.document
            });
        }
        cb(null, true);
    };

    const getSignedPrivateUrl = (req) => {
        const params = {
            Bucket: awsConfig.s3_bucket,
            Key: req.body.file_name,
            Expires: 600
        };

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

    const imageFilter = (req, file, cb) => {
        // accept image only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
            req.fileValidationError = messageConfig.uploadFile.image;
            return commonHelper.sendResponseData(req.res, {
                status: HTTPStatus.UNSUPPORTED_MEDIA_TYPE,
                message: messageConfig.uploadFile.image
            });
        }
        cb(null, true);
    };

    const _imageUploader = multer({
        storage: multerS3(s3OptsImage),
        fileFilter: imageFilter
    });

    const _documentUploader = multer({
        storage: multerS3(s3OptsDocument),
        fileFilter: documentFilter
    });

    const _privateDocumentUploader = multer({
        storage: multerS3(s3OptsPrivateDocument),
       // fileFilter: documentFilter
    });

    const _uploader = multer({
        storage: multerS3(s3OptsDocument)
    });

    return {
        documentUploader: _documentUploader,
        privateDocumentUploader: _privateDocumentUploader,
        imageUploader: _imageUploader,
        uploader: _uploader,
        getSignedPrivateUrl: getSignedPrivateUrl
    };
};

module.exports = fileUploadHelper;
