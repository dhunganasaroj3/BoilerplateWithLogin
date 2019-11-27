/**
 * Created by manoj on 3/30/17.
 * SMS Api Reference https://www.clxcommunications.com/help/getting-started/using-rest-api/
 */
(() => {
  'use strict';

  module.exports = {

    sms_message_verification: 'XcelTrip verification code: %verification_token%. Use this to validate your phone number.',
    subject: 'XcelTrip Mobile Verification Code',
    sms_message_multi_factor_auth: 'XcelTrip Multi-Factor authentication code: %verification_token%. Use this to enable multi-factor authentication on your account.',
    types: {
      verification: 'verification',
      multi_factor_auth: 'multi_factor_auth'
    }

  };

})();
