((jwtTokenGeneratorHelper) => {
    'use strict';

    const tokenConfigs = require('../configs/token.config');
    const utilityHelper = require('../helpers/utilities.helper');
    const jwt = require('jsonwebtoken');
    const commonHelper = require('../common/common-helper-function');
    const appConfig = require('../configs/application.config');

    const docFields = '_id first_name last_name username email user_role multi_factor_auth_enable confirmed mobile_number_validated parent_user_role parent_id access';

    jwtTokenGeneratorHelper.generateJWTToken = async (req, userObj) => {
        const claims = {
            subject: userObj._id,
            issuer: `${req.protocol}://${appConfig.client_app_url}`,
            permissions: ['save', 'update', 'read', 'delete']
        };

        const userInfo = commonHelper.constructObject(userObj, docFields);
        const token = jwt.sign(
            {
                user: userInfo,
                claims: claims
            }, process.env.TOKEN_SECRET, {
                algorithm: tokenConfigs.hashAlgorithm,
                expiresIn: req.mobil_detection ? tokenConfigs.mobileExpires : tokenConfigs.expires,// expires in given hours
                issuer: userInfo._id.toString()
            });
        let property_detail = {};
        if (userInfo && userInfo.user_role && userInfo.user_role.includes('vendor')) {
            property_detail = await req.db.collection('PropertyInformation').find({user_id: userInfo._id}, {
                status: 1,
                verified: 1,
                property_step: 1
            }).toArray();
        }
        // return the information including token as JSON
        return {
            success: true,
            token: token,
            userInfo: {
                ...userInfo,
                property_detail,
                image_name: userObj.image_name,
                imp_status: userObj.imp_status,
                gender: userObj.gender,
                address_country: userObj.address_country,
                birth_date: userObj.birth_date,
                mobile_number: userObj.mobile_number,
                country_abbr: userObj.country_abbr,
                country_code: userObj.country_code,
                address_city: userObj.address_city,
                address_address_line_1: userObj.address_address_line_1,
                address_address_line_2: userObj.address_address_line_2,
                address_zip_postal_code: userObj.address_zip_postal_code,
                address_state_region_province: userObj.address_state_region_province,
                image_original_name: userObj.image_original_name,
                active: userObj.active
            }
        };
    };

    jwtTokenGeneratorHelper.generateAllowedActions = (req, allowed_actions, user_id) => {
        const claims = {
            issuer: `${req.protocol}://${appConfig.client_app_url}`
        };
        return jwt.sign(
            {
                allowed_actions: allowed_actions,
                claims: claims
            }, process.env.TOKEN_SECRET, {
                algorithm: tokenConfigs.hashAlgorithm,
                issuer: user_id.toString()
            });
    };

})(module.exports);
