((formValidationHelper) => {
    'use strict';

    const utilityHelper = require('../helpers/utilities.helper');
    const modelConfig = require('../configs/model');

    formValidationHelper.iterateFormFieldObject = (req, iterateFormFields, dataModel, next, parent_key, arr_index) => {
        Object.keys(dataModel).forEach((key) => {
            if(dataModel[key].type === modelConfig.dataTypes.object) {
                formValidationHelper.iterateFormFieldObject(req, iterateFormFields[key], dataModel[key].fields, next, key);
            } else if(dataModel[key].type === modelConfig.dataTypes.array) {
                if (iterateFormFields[key] && iterateFormFields[key].length > 0) {
                    for (let j = 0; j < iterateFormFields[key].length; j++) {
                        if (typeof iterateFormFields[key][j] !== 'string') {
                            formValidationHelper.iterateFormFieldObject(req, iterateFormFields[key][j], dataModel[key].fields, next, key, j);
                        }
                    }
                }
            } else if(dataModel[key].required) {
                req.checkBody(parent_key ? arr_index >= 0 ? `${parent_key}[${arr_index}].${key}` :  `${parent_key}.${key}` : key, dataModel[key].validation_message).notEmpty();
            }

            if(dataModel[key].extra_validation_checks && dataModel[key].extra_validation_checks.length > 0) {
                let dynamicFunc = "";
                for(let i = 0; i < dataModel[key].extra_validation_checks.length; i++) {
                    dynamicFunc = Object.keys(dataModel[key].extra_validation_checks[i])[0];
                    req.checkBody(parent_key ? `${parent_key}.${key}` : key, dataModel[key].extra_validation_checks[i].validation_message)[dynamicFunc]();
                }
            }


        });
    };

    formValidationHelper.checkFormDataValidity = async (req, formObj, dataModel, next) => {
       try {
           if (Object.keys(dataModel).length > 0) {
               formValidationHelper.iterateFormFieldObject(req, formObj, dataModel, next);
           }
           const result = await req.getValidationResult();
           return result.array().length > 0 ? {
               valid: false,
               messages: result.array().map((item) => {
                   return { [item.param]: item.msg }
               })
           } : {
               valid: true
           };
       } catch (err) {
           return next(err);
       }
    };

})(module.exports);
