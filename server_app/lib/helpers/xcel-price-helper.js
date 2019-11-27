((xcelPriceHelper) => {
    'use strict';

    const Promise = require('bluebird');
    const thirdPartyHelperFunc = require('./third-party-api-request.helper');
    const xcelPriceConfig = require('../configs/xcel-price.config');


    xcelPriceHelper.getCryptoCurrencyPricingBySymbol = async (req, headers, next) => {
        const url = `${xcelPriceConfig.api_url}/${req.params.currencySymbol}`;
        let response = await thirdPartyHelperFunc.requestThirdPartyApi(req, url, headers, next, "GET");
        return Promise.resolve(response);
    };

    xcelPriceHelper.getExchangeRateHelperFunc = async(req, next) => {
        return new Promise(async (resolve, reject) => {
            try {
                const headers = {
                    'Content-Type': 'application/json'
                };
                const latestExchangeRate = await thirdPartyHelperFunc.requestThirdPartyApi(req, process.env.NODE_ENV === 'production' ? process.env.XCEL_EXCHANGE_RATE_CMC_PROD : process.env.XCEL_EXCHANGE_RATE_CMC_STAGE, headers, next, 'GET');
                return resolve((latestExchangeRate.exchange_rate && latestExchangeRate.exchange_rate.exchange_rate) ? parseFloat((latestExchangeRate.exchange_rate.exchange_rate).toFixed(8)) : 0);

            } catch(err) {
                return reject(err);
            }
        });
    };

})(module.exports);
