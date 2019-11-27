((fileOperations) => {
    'use strict';

    const cloudinary = require('cloudinary');
    const HTTPStatus = require('http-status');
    const Promise = require("bluebird");
    const mkdirp = require('mkdirp');
    const fs = Promise.promisifyAll(require('fs'));
    const cloudinaryHelper = require('./cloudinary.helper');
    const messageConfig = require('../configs/message.config');
    const commonHelper = require('../common/common-helper-function');
    const mime = require('mime');

    fileOperations.ensureFolderExists = (path, mask) => {
        return new Promise((resolve, reject) => {
            mkdirp(path, (err) => {
                if (err) {
                    reject(err); // something else went wrong
                } else {
                    resolve(true);// successfully created folder
                }
            });
        });
    };


    fileOperations.checkFileSystemAccess = (filePath) => {
        return new Promise((resolve, reject) => {
            fs.access(filePath, fs.R_OK, (err) => {
                if (err) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    };

    fileOperations.readFile = (filePath) => {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });

        });
    };

    fileOperations.writeFile = (filePath, content) => {
        return new Promise((resolve, reject) => {
            fs.writeFile(filePath, content, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });

        });
    };

    fileOperations.getFileContent = (filePath) => {
        return new Promise((resolve, reject) => {
            fileOperations.readFile(filePath)
                .then((data) => {
                    resolve(data);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    };

    fileOperations.deleteFile = async (req, res, next) => {
        try {
            const fileName = (req.query && req.query.filename) ? req.query.filename : '';
            if (fileName !== "") {
                //const type = (req.query.type) ? req.query.type : '';
                const filePath = (req.query.path) ? req.query.path : '';
                const type = await mime.getType(filePath);
                if (type === 'image' || type === 'image/*') {
                    cloudinaryHelper.deleteImage(fileName, cloudinary, req, res, next);
                }
                const fileStat = await fileOperations.unLinkFile(filePath);
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.OK,
                    message: messageConfig.fileDelete.fileDelete
                });
            } else {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.BAD_REQUEST,
                    message: messageConfig.fileDelete.fieldRequiredFile
                });
            }
        } catch (err) {
            return next(err);
        }
    };
    fileOperations.deleteFileByPath = async (req, res, next, filePath, fileName) => {
        try {
            if (filePath !== "") {
                const type = await mime.getType(filePath);
                if (type.includes('image/')) {
                    cloudinaryHelper.deleteImage(fileName, cloudinary, req, res, next);
                }
                const fileStat = await fileOperations.unLinkFile(filePath);
                return commonHelper.sendJsonResponse(res, fileName, messageConfig.fileDelete.fileDelete, HTTPStatus.OK);
            } else {
                return commonHelper.sendResponseData(res, {
                    status: HTTPStatus.BAD_REQUEST,
                    message: messageConfig.fileDelete.fieldRequiredFile
                });
            }
        } catch (err) {
            return next(err);
        }
    };
    fileOperations.appendFile = (filePath, content) => {
        return new Promise((resolve, reject) => {
            fs.appendFile(filePath, content, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    };

    fileOperations.unLinkFile = (filePath) => {
        return new Promise((resolve, reject) => {
            fs.unlink(filePath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    };

})(module.exports);
