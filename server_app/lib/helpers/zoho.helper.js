/**
 * Created by lakhe on 8/9/17.
 */
((zoho) => {
    'use strict';

    const HTTPStatus = require('http-status');
    const commonHelper = require('../common/common-helper-function');
    const messageConfig = require('../configs/message.config');
    const zohoConfig = require('../configs/zoho.config');
    const request = require('request-promise');

    zoho.CreateContact = async (req, res,url, next, body,param) => {
        try {

            let response = null;
            const options = {
                url: zohoConfig.api_url + '/' + url + '?' + param,

                headers: {
                    'Authorization': zohoConfig.Authorization,
                    'orgId': zohoConfig.orgId,
                    'Content-Type': 'application/json'
                },
                body: body,
                json: true
            };
            return new Promise((resolve, reject) => {
                request(options)
                    .then((response) => {
                        resolve(response);
                    })
                    .catch((err) => {
                        resolve({});
                    });
            });
        } catch (err) {
            return next(err);
        }
    };
    zoho.CreateIssue = async (req, res, next, body) => {
        try {
            var response = null;
            if (body.support_type = 'general_issue') {
                body.departmentId = zohoConfig.departments.general.id;
                body.assigneeId = zohoConfig.departments.general.assigned;
            }
            if (body.support_type = 'customer_query') {
                body.departmentId = zohoConfig.departments.customer_query.id;
                body.assigneeId = zohoConfig.departments.customer_query.assigned;
            }
            if (body.support_type = 'payment_issue') {
                body.departmentId = zohoConfig.departments.payement.id;
                body.assigneeId = zohoConfig.departments.payement.assigned;
            }
            if (body.support_type = 'imp_issue') {
                body.departmentId = zohoConfig.departments.imp.id;
                body.assigneeId = zohoConfig.departments.imp.assigned;
            }
            if (body.support_type = 'property_issue') {
                body.departmentId = zohoConfig.departments.property.id;
                body.assigneeId = zohoConfig.departments.property.assigned;
            }
            delete body.support_type;
            body.channel = 'Web';

            body.status = 'Open';
            body.productId = null;
            body.priority = "High";

            body.dueDate = new Date(new Date().setDate(new Date().getDate() + 5));
            var options = {
                method: 'POST',
                url: zohoConfig.api_url + '/tickets',
                headers: {
                    'Authorization': zohoConfig.Authorization,
                    'orgId': zohoConfig.orgId,
                    'Content-Type': 'application/json'
                },
                body: body,
                json: true
            };
            return new Promise((resolve, reject) => {
                request(options)
                    .then((response) => {
                        resolve(response);
                    })
                    .catch((err) => {
                        resolve({});
                    });
            });

        } catch (err) {
            return next(err);
        }
    };

})(module.exports);
