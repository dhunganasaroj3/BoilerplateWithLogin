/**
 * Created by lakhe on 8/9/17.
 */
((fileDownloadHelper) => {
    'use strict';

    const HTTPStatus = require('http-status');
    const commonHelper = require('../common/common-helper-function');
    const fileOperationHelper = require('./file-operation.helper');
    const messageConfig = require('../configs/message.config');
    const mime = require('mime');
    const fs = require('fs');
    const path = require('path');


    fileDownloadHelper.downPrivateUploads = async (req, res, next) => {
        try {
            const accessCheck = await fileOperationHelper.checkFileSystemAccess(req.query.file_path);
            if(accessCheck) {
                // const filename = path.basename(req.query.file_path);
                // const mimetype = mime.getType(req.query.file_path);
                // res.setHeader('Content-Disposition', 'attachment; filename=' + filename);
                // res.setHeader('Content-type', mimetype);
                // const readStream = fs.createReadStream(req.query.file_path);
                // // When the stream is done being read, end the response
                // readStream.on('close', () => {
                //     res.end()
                // });
                //
                // readStream.on('error', err => {
                //     // File could not be read
                //     return next(err);
                // });
                //
                // readStream.pipe(res)

                fs.readFile(req.query.file_path, async (err,data) => {
                    const filename = path.basename(req.query.file_path);
                    const mimetype = await mime.getType(req.query.file_path);
                    res.setHeader('Content-Disposition', 'attachment; filename=' + filename);
                    res.setHeader('Content-type', mimetype);
                    res.send(data);
                });

            } else {
                commonHelper.sendResponseData(res, {
                    status: HTTPStatus.FORBIDDEN,
                    message: messageConfig.fileDownload.fileDownload
                })
            }
        } catch (err) {
            return next(err);
        }
    };

})(module.exports);
