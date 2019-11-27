/**
 * Created by lakhe on 6/27/17.
 */
((redisHelper) => {
    'use strict';

    const express = require('express');
    const app = express();
    const redis = require('redis');
    const redisConfig = require('../configs/redis.config');
    const client = redis.createClient(redisConfig[app.get('env')].port, redisConfig[app.get('env')].host, {no_ready_check: true});
    const commonHelper = require('../common/common-helper-function');
    const HTTPStatus = require('http-status');
    const Promise = require('bluebird');

    redisHelper.init = (app) => {
        client.auth(redisConfig[app.get('env')].pass, (err) => {
            if (err) throw err;
        });

        client.on('ready', () => {
            console.log('Ready to connect to Redis database...');
        });

        client.on('connect', () => {
            console.log('Connected to Redis database...');
            app.locals.redis_cache_db = client;
        });

        client.on("error", function (err) {
            console.log("Error " + err);
        });
    };

    redisHelper.generateUniqueCacheKey = (req) => {
        return `${req.baseUrl}${req.url}`;
    };


    redisHelper.getCachedObjectData = (req, res, next) => {
        const _keyData = redisHelper.generateUniqueCacheKey(req);
        req.redis_cache_db.get(_keyData, (err, data) => {
            if (!err && data !== null) {
                return commonHelper.sendJsonResponse(res, JSON.parse(data), '', HTTPStatus.OK)
            } else {
                next();
            }
        });
    };

    redisHelper.getCachedStringData = (req, res, next) => {
        const _keyData = redisHelper.generateUniqueCacheKey(req);
        req.redis_cache_db.get(_keyData, (err, data) => {
            if (!err && data !== null) {
                return commonHelper.sendJsonResponse(res, data, '', HTTPStatus.OK)
            } else {
                next();
            }
        });
    };

    redisHelper.setDataForCatch = (req, key, data) => {
        const storeData = (typeof data === 'string') ? data : JSON.stringify(data)
        req.redis_cache_db.setex(key, (parseInt(redisConfig.redisCacheExpires) * 60 * 60), storeData);
    };
    redisHelper.getCachedForObjectData = (req, key) => {
        return new Promise((fullfill, reject) => {
            req.redis_cache_db.get(key, async (err, data) => {

                if (!err && data !== null) {
                    fullfill(JSON.parse(data));
                } else {
                    fullfill(null);
                }
            });
        });
    };

    redisHelper.setDataToCache = (req, data) => {
        const _keyData = redisHelper.generateUniqueCacheKey(req);
        const storeData = (typeof data === 'string') ? data : JSON.stringify(data);
        req.redis_cache_db.setex(_keyData, (parseInt(redisConfig.redisCacheExpires) * 60 * 60), storeData);
    };

    redisHelper.scanRedisKeys = (req, cursor, returnKeys) => {
        req.redis_cache_db.scan(
            cursor,
            'MATCH', `${req.baseUrl}*`,
            'COUNT', '1',
            (err, res) => {
                if (!err) {
                    cursor = res[0];
                    const cache_keys = res[1];
                    cache_keys.forEach((key) => {
                        returnKeys.push(key);
                    });
                    if (cache_keys.length > 0) {
                        console.log('Array of matching keys', cache_keys);
                    }
                    if (cursor === '0') {
                        return redisHelper.clearCacheKeys(returnKeys);
                    }
                } else {
                    return Promise.resolve([]);
                }

                return redisHelper.scanRedisKeys(req, cursor, returnKeys);
            });
    };

    redisHelper.clearDataCache = async (req) => {
        // Delete cached model data
        let cursor = '0';
        let returnKeys = [];
        redisHelper.scanRedisKeys(req, cursor, returnKeys);

    };

    redisHelper.clearCacheKeys = (keys) => {
        client.del(keys, (err) => {
            if (!err) {
                console.log('keys cleared from the redis db...');
            }
            return;
        });
    };

})(module.exports);
