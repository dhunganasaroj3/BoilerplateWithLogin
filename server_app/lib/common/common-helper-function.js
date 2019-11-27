'use strict';


((commonHelper) => {
    'use strict';

    const HTTPStatus = require('http-status');
    const messageConfig = require('../configs/message.config');
    const disposableDomainList = require('../static-data/disposable-email-domains.json');
    const suspendedDomainList = require('../static-data/temporary-blocked-emails');
    const Promise = require('bluebird');
    const uuidv1 = require('uuid/v1');
    const modelConfig = require('../configs/model');
    const sanitizeHtml = require('sanitize-html');
    const utilityHelper = require('../helpers/utilities.helper');
    const path = require('path');
    const maxmind = require('maxmind');
    const geoLocation = maxmind.openSync(path.join(__dirname,'../' ,'static-data', 'GeoIP2-City.mmdb'))

    commonHelper.getLoggedInUser = (req) => {
        return (req.decoded && req.decoded.user && req.decoded.user.username) ? req.decoded.user.username : 'system';
    };

    commonHelper.getDisposableEmails = () => {
        return disposableDomainList;
    };

    commonHelper.getTemporarySuspendedEmails = () => {
        return suspendedDomainList;
    };

    commonHelper.checkDisposableEmail = (email) => {
        const mailDomain = email.replace(/.*@/, "");
        return !!(disposableDomainList.indexOf(mailDomain) > -1);
    };
    commonHelper.getLoggedInPersonName = (req) => {
        return (req.decoded && req.decoded.user && req.decoded.user.first_name) ? `${req.decoded.user.first_name} ${req.decoded.user.last_name}` : '';
    };

    commonHelper.getLoggedInUserId = (req) => {
        return (req.decoded && req.decoded.user && req.decoded.user._id) ? req.decoded.user._id : '';
    };

    commonHelper.getTextValFromObjectField = (_val) => {
        return (_val) ? _val : '';
    };

    commonHelper.checkAndGetParentUserRole = (req) => {
        return (req.decoded && req.decoded.user && req.decoded.user.parent_user_role) ? req.decoded.user.parent_user_role : null;
    };

    commonHelper.getLoggedInUserRole = (req) => {
        const parent_user_role = commonHelper.checkAndGetParentUserRole(req);
        return parent_user_role ? parent_user_role :  (req.decoded && req.decoded.user && req.decoded.user.user_role) ? req.decoded.user.user_role : '';
    };

    commonHelper.getLoggedInUserEmail = (req) => {
        return (req.decoded && req.decoded.user && req.decoded.user.email) ? req.decoded.user.email : '';
    };

    commonHelper.sendJsonResponse = (res, data, message, status) => {
        res.status(status);
        const returnObj = data ? (status === HTTPStatus.NOT_FOUND ? {
            'status': status,
            'data': (data instanceof Array) ? [] : {},
            'message': message
        } : {
            'status': status,
            'data': data
        }) : {
            'status': status,
            'data': (data instanceof Array) ? [] : {},
            'message': message
        };
        res.json(returnObj);
    };

    commonHelper.sendDataManipulationMessage = (res, data, message, status) => {
        res.status(status);
        res.json({
            'status': status,
            'data': data,
            'message': message
        });
    };

    commonHelper.sendNormalResponse = (res, data, status) => {
        res.status(status);
        res.json({
            'status': status,
            'data': data,
        });
    };

    commonHelper.sendResponseData = (res, {status, message}) => {
        res.status(status);
        res.json({
            'status': status,
            'message': message
        });
    };


    commonHelper.getGeoLocationInfo = (ip_address) => {
        return new Promise((resolve, reject) => {
            const location = geoLocation.get(ip_address);
            if (location && location.city.names.en && location.country.names.en) {
                resolve({
                    city: location.city.names.en,
                    country: location.country.names.en
                });
            } else {
                resolve(null);
            }
        });
    };

    commonHelper.convertCommaSeparatedStringToArray = (commaSeparatedString) => {
        return (commaSeparatedString && (commaSeparatedString.indexOf(',') > -1))
            ? commaSeparatedString.split(',') :
            (commaSeparatedString && (commaSeparatedString.indexOf(':') > -1))
                ? commaSeparatedString.split(':') : (commaSeparatedString) ? [commaSeparatedString] : [];
    };

    commonHelper.handleArrayOfObjects = (req, arrayOfObjects, dataModel, dataObj, next) => {
        for (let i = 0; i < arrayOfObjects.length; i++) {
            dataObj[i] = {};
            commonHelper.iterateFormFieldObject(req, arrayOfObjects[i], dataModel, dataObj[i], next);
        }
        return dataObj;
    };

    commonHelper.iterateFormFieldObject = (req, iterateFormFields, dataModel, dataObj, next) => {
        Object.keys(dataModel).forEach(function(key) {
            switch(dataModel[key].type) {
                case modelConfig.dataTypes.string:
                    dataObj[key] = (iterateFormFields[key] !== '' && iterateFormFields[key])
                        ? (!dataModel[key].contentText)
                            ? (!dataModel[key].format_comma_separated_to_array)
                                ? sanitizeHtml(iterateFormFields[key])
                                : commonHelper.convertCommaSeparatedStringToArray(iterateFormFields[key])
                            : utilityHelper.sanitizeUserHtmlBodyInput(iterateFormFields[key], next)
                        : "";
                    break;
                case modelConfig.dataTypes.bool:
                    dataObj[key] = (iterateFormFields[key] && (iterateFormFields[key] === 'true' || iterateFormFields[key] === true)) ? true : false;
                    break;
                case modelConfig.dataTypes.integer:
                    dataObj[key] = (iterateFormFields[key] !== '' && !isNaN(iterateFormFields[key])) ? parseInt(iterateFormFields[key]) : 0;
                    break;
                case modelConfig.dataTypes.float:
                case modelConfig.dataTypes.double:
                    dataObj[key] = (iterateFormFields[key] !== '' && !isNaN(iterateFormFields[key])) ? parseFloat(iterateFormFields[key]) : 0;
                    break;
                case modelConfig.dataTypes.object:
                    dataObj[key] = {};
                    commonHelper.iterateFormFieldObject(req, iterateFormFields[key], dataModel[key].fields, dataObj[key], next);
                    break;
                case modelConfig.dataTypes.array:
                    dataObj[key] = [];
                    dataObj[key] = (iterateFormFields[key] !== undefined || iterateFormFields[key] !== null) ?
                        (iterateFormFields[key] && iterateFormFields[key].length > 0) ?
                            (typeof iterateFormFields[key][0] === "object") ?
                                commonHelper.handleArrayOfObjects(req, iterateFormFields[key], dataModel[key].fields, dataObj[key], next)
                                : iterateFormFields[key]
                            : []
                        :
                        [];

                    break;
                case modelConfig.dataTypes.date:
                    dataObj[key] = (iterateFormFields[key] !== '' && (typeof iterateFormFields[key] === 'string')) ? new Date(iterateFormFields[key]) : iterateFormFields[key];
                    break;
            }
            return  dataObj;
        });
    };

    commonHelper.collectFormFields = (req, formObj, dataModel, action, next) => {
        try {
            const dataObj = (action === 'update')
                ? {
                    updated_by: commonHelper.getLoggedInUser(req),
                    updated_on: new Date()
                } : {
                    _id: uuidv1(),
                    added_by: commonHelper.getLoggedInUser(req),
                    added_on: new Date(),
                    deleted: false
                };
            if (Object.keys(dataModel).length > 0) {
                commonHelper.iterateFormFieldObject(req, formObj, dataModel, dataObj, next);
            }
            return dataObj;
        }
        catch (err) {
            // return  next(err);
        }
    };

    commonHelper.constructObject = (inputObj, collectFields) => {
        try {
            const specifiedFieldsArr = collectFields.split(' ');
            let dataObj = {};

            for (let i = 0; i < specifiedFieldsArr.length; i++) {
                dataObj[specifiedFieldsArr[i]] = inputObj[specifiedFieldsArr[i]];
            }
            return dataObj;
        }
        catch (err) {
            // return  next(err);
        }
    };

    commonHelper.sendResponseMessage = (res, dataRes, dataObj, messageResponse) => {
        if (dataRes && dataRes.result && dataRes.result.n > 0) {
            const returnObj = dataObj ? {
                status: HTTPStatus.OK,
                message: messageResponse,
                data: dataObj
            } : {
                status: HTTPStatus.OK,
                message: messageResponse
            };
            res.status(HTTPStatus.OK);
            return res.json(returnObj);
        } else {
            return commonHelper.sendResponseData(res, {
                status: HTTPStatus.NOT_MODIFIED,
                message: messageConfig.applicationMessage.dataNotModified
            });
        }
    };

    commonHelper.sendJsonResponseMessage = (res, dataRes, returnObj, messageResponse) => {
        if (dataRes && dataRes.result && dataRes.result.n > 0) {
            res.status(HTTPStatus.OK);
            res.json({
                'status': HTTPStatus.OK,
                'data': returnObj,
                'message': messageResponse
            });
        } else {
            return commonHelper.sendResponseData(res, {
                status: HTTPStatus.NOT_MODIFIED,
                message: messageConfig.applicationMessage.dataNotModified
            });
        }
    };

})(module.exports);
