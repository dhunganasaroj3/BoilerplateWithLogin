(() => {
  'use strict';

  const express = require('express');
  const app = express();

  module.exports = {
    user: {
      defaultUserFirstName: 'xcelTrip',
      defaultUserLastName: 'TravelApp',
      defaultUsername: 'superadmin',
      defaultPassword: 'superadmin@123',
      defaultUserEmail: 'admin@xceltrip.com',
      defaultUserRole: 'superadmin',
      defaultUserId: '594a6100ed85be38dcf5662b'
    },
    cloudinary: {
      defaultCloudName: 'xceltrip'
    },
    passwordChangeToken: {
      expiry: '24'//in hours
    },
    userConfirmationToken: {
      expiry: '24'//in hours
    },
    userUnBlockToken: {
      expiry: '24'//in hours
    },
    maxFailedLoginAttempt: 10,
    client_app_url: app.get('env') === "production" ? "www.xceltrip.com/" : "localhost:3003/",
    extranet_url: app.get('env') === "production" ? "extranet.xceltrip.com/" : "localhost:3000/",
    support_default_email: "feedback@xceltrip.com",
    noreply_email: "noreply@xceltrip.com",
    aws_s3_path: app.get('env') === "production" ? "https://s3.amazonaws.com/xceltripstaging/" : "https://s3.amazonaws.com/xceltripstaging/",
    email_title: "XcelTrip LLC"
  };

})();
