((smsHelper) => {
  'use strict';

  const twilio = require('twilio');
  const smsConfig = require('../configs/sms.config');
  const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  const Promise = require('bluebird');

  smsHelper.sendSMS = (client_number, message_sms) => {
    return client.messages.create({
      body: message_sms,
      to: client_number,  // Text this number
      from: process.env.TWILIO_PHONE_NUMBER // From a valid Twilio number
    })
    .then((message) => {
      return Promise.resolve(true);
    })
    .catch((err) => {
      return Promise.resolve(null);
    });
  };

})(module.exports);
