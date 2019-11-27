'use strict';

const fileUploadHelper = (filePath, prefixVal) => {

    const cloudinary = require('cloudinary');
    const multer = require('multer');
    const HTTPStatus = require('http-status');
    const path = require('path');
    const cloudinaryHelper = require('./cloudinary.helper');
    const fileOperationHelper = require('./file-operation.helper');
    const moduleConfig = require('../modules/cloudinary/cloudinary.message.config');
    const messageConfig = require('../configs/message.config');
    const errorLogController = require('../modules/error-logs/error-logs.controller');
    const commonHelper = require('../common/common-helper-function');
    const hasher = require('../auth/hasher');
    let recentFile = {};

    const storage = multer.diskStorage({
        destination: async (req, file, cb) => {
            const uploadPath = path.resolve(req.root_dir + filePath);
            try {
                const folderStat = await fileOperationHelper.ensureFolderExists(uploadPath, 484);
                if (folderStat) {
                    cb(null, uploadPath);
                } else {
                    cb(null, '');
                }
            } catch (err) {
                errorLogController.postErrorLogs(err, req, cb);
            }
        },
        filename: async (req, file, cb) => {
            const randomString = await  hasher.generateRandomBytes(5);
            cb(null, prefixVal + '-' + Date.now() + '-' + randomString + '.' + file.originalname.substring(file.originalname.lastIndexOf('.') + 1));
        },
        onFileUploadStart: (file) => {
            recentFile = file;
            recentFile.finished = false;
            console.log(file.originalname + ' is starting ...');
        },
        onFileUploadComplete: (file) => {
            recentFile.finished = true;
        }
    });

    const imageUploadSingle = (req, res, next) => {
        if (req.file) {
            try {
                cloudinaryHelper.singleImageUpload(cloudinary, req, req.file, false, res, next);
            } catch (err) {
                const errorObj = {
                    message: "Cloudinary error",
                    stack: err,
                    name: ""
                };
                errorLogController.postErrorLogs(errorObj, req, next);

                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.BAD_REQUEST,
                    message: moduleConfig.message.validationErrMessage.cloudinary_api_key
                });
            }
        } else {
            next();
        }
    };


    const cloudinaryMultiImageUploader = (req, res, next) => {
        if (req.files) {
            try {
                for (let i = 0; i <= req.files.length; i++) {
                    if (req.files[i] && req.files[i].mimetype.includes("image/")) {
                        cloudinaryHelper.singleImageUpload(cloudinary, req, req.files[i], true, res, next);
                    } else if (!req.files[i]) {
                        next();
                    }
                }
            } catch (err) {
                const errorObj = {
                    message: "Cloudinary error",
                    stack: err,
                    name: ""
                };
                errorLogController.postErrorLogs(errorObj, req, next);

                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.BAD_REQUEST,
                    message: moduleConfig.message.validationErrMessage.cloudinary_api_key
                });
            }
        } else {
            next();
        }
    };

    const documentFilter = (req, file, cb) => {
        // accept document files only
        if (!file.originalname.match(/\.(pdf|json|doc|docx|zip|p12)$/)) {
            req.fileValidationError = messageConfig.uploadFile.document;
            return commonHelper.sendResponseData(res, {
                status: HTTPStatus.UNSUPPORTED_MEDIA_TYPE,
                message: messageConfig.uploadFile.document
            });
        }
        cb(null, true);
    };

    const imageFilter = (req, file, cb) => {
        // accept image only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            req.fileValidationError = messageConfig.uploadFile.image;
            return commonHelper.sendResponseData(res, {
                status: HTTPStatus.UNSUPPORTED_MEDIA_TYPE,
                message: messageConfig.uploadFile.image
            });
        }
        cb(null, true);
    };

    return {
        documentUploader: multer({storage: storage, fileFilter: documentFilter}),
        imageUploader: multer({storage: storage, fileFilter: imageFilter}),
        uploader: multer({storage: storage}),
        imageUploadSingle: imageUploadSingle,
        cloudinaryMultiImageUploader: cloudinaryMultiImageUploader,
    };

};

module.exports = fileUploadHelper;
