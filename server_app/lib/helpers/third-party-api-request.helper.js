/**
 * Created by lakhe on 9/18/17.
 */
((thirdPartyApiRequesterHelper) => {
    'use strict';

    const request = require('request');
    const rp = require('request-promise');

    thirdPartyApiRequesterHelper.requestThirdPartyApi = (req, request_url, headers, next, request_method) => {
        try {
            const options = (headers) ? {
                method: 'GET',
                uri: request_url,
                json: true, // Automatically stringifies the body to JSON
                headers: headers
            } : {
                method: (request_method && request_method==="POST") ? 'POST' : 'GET',
                uri: request_url,
                json: true // Automatically stringifies the body to JSON
            };
            return new Promise((resolve, reject) => {
                rp(options)
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
