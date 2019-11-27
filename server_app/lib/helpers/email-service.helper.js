// ((mailHelper) => {
//
//     'use strict';
//
//     const Promise = require("bluebird");
//     const nodemailer = Promise.promisifyAll(require('nodemailer'));
//     const mailGunTransport = require('nodemailer-mailgun-transport');
//     const commonHelper = require('../common/common-helper-function');
//     const uuidv1 = require('uuid/v1');
//
//
//     const appConfig = require('../configs/application.config');
//     const ConfigureEmailServer = (next) => {
//         if (process.env.NODE_ENV === "development") {
//             try {
//                 // const opts = {
//                 //   pool: true,
//                 //   host: 'smtp.gmail.com',
//                 //   port: 465,
//                 //   secure: true, // use SSL
//                 //   auth: {
//                 //     user: 'xceltrip@gmail.com',
//                 //     pass: ''
//                 //   }
//                 // };
//                 const opts = {
//                     service: 'gmail',
//                     auth: {
//                         type: 'OAuth2',
//                         user: 'bookworm.react@gmail.com',
//                         clientId: '885965006708-dq7gqi6dq632oni25vfc45hr7t4mbl1c.apps.googleusercontent.com',
//                         clientSecret: 'Dj50u2TTOHdVUjDh7b9SE2iK',
//                         refreshToken: '1/IhOZF-Xka9Y7sOGlMBShQdzZD0DUGmBtrbTEmNTT1pY'
//                     }
//                 };
//                 return nodemailer.createTransport(opts);
//             }
//             catch (err) {
//                 return next(err);
//             }
//         } else {
//             try {
//                 const opts = {
//                     auth: {
//                         api_key: "key-ed4db57982021139f9adda93f47635ef",
//                         domain: "www.xceltrip.com"
//                     }
//                 };
//                 return nodemailer.createTransport(mailGunTransport(opts));
//             }
//             catch (err) {
//                 return next(err);
//             }
//         }
//     };
//
//     const GetEmailServerConfigurations = async (req, mailData, attachment, next) => {
//         const isEmailSendable = await mailHelper.checkForBlock(req, mailData.to);
//         if (isEmailSendable) {
//             const mailer = ConfigureEmailServer(next);
//             return mailer.sendMail(mailData);
//         } else {
//             return {
//                 accepted: [mailData.email],
//                 message: "Queued. Thank you.",
//                 status: "Not requested to send email, Because Blocked by Admin"
//             };
//         }
//     };
//     mailHelper.checkForBlock = async (req, email) => {
//         const now = new Date();
//         const data = await req.db.collection('BlockedEmail').findOne({
//             email: email,
//             end_date: {$gte: now},
//             deleted: false
//         });
//         if (data) {
//             return false;
//         }
//         return true;
//     };
//     mailHelper.sendEmail = async (req, {fromEmail, toEmail, subject, textMessage, htmlTemplateMessage, attachments, cc}, next) => {
//
//         let mailOptions = {
//             from: `"${appConfig.email_title}" <${fromEmail}>`, // sender address
//             to: toEmail, // list of receivers
//             subject: subject, // Subject line
//             text: textMessage, // plaintext body
//             html: htmlTemplateMessage, // html body
//             attachments: attachments
//         };
//         if (cc !== null && cc !== undefined) {
//             mailOptions.cc = cc;
//         }
//         const emailRes = await GetEmailServerConfigurations(req, mailOptions, true, next);
//         mailOptions = {mailOptions, emailRes}
//         mailOptions.route = req.originalUrl;
//         mailOptions._id = uuidv1();
//         mailOptions.added_on = new Date();
//         mailOptions.added_by = commonHelper.getLoggedInUser(req);
//         let res = null;
//         if (emailRes && ((emailRes.accepted && emailRes.accepted.length >= 1) || (emailRes.message && emailRes.message === "Queued. Thank you."))) {
//             mailOptions.success = true;
//             res = {
//                 processed: true
//             };
//
//         } else {
//             mailOptions.success = false;
//             res = null;
//             req.db.collection('BounceEmailLogs').insertOne(mailOptions);
//         }
//         req.db.collection('EmailLogs').insertOne(mailOptions);
//         return res;
//     };
//
// })(module.exports);


((mailHelper) => {
    'use strict';

    const Promise = require("bluebird");
    const nodemailer = Promise.promisifyAll(require('nodemailer'));
    const awsConfig = require('../configs/aws_config');
    const appConfig = require('../configs/application.config');
    const commonHelper = require('../common/common-helper-function');
    const uuidv1 = require('uuid/v1');

    const aws = require('aws-sdk');
    const status_message = "Not requested to send email, Because Blocked by Admin";
// configure AWS SDK
    aws.config.update({
        accessKeyId: awsConfig.aws_api_user.accessKeyId, secretAccessKey: awsConfig.aws_api_user.secretAccessKey, region: awsConfig.aws_api_user.region
    });

    const ConfigureEmailServer = (next) => {
        try {
            // create Nodemailer SES transporter
            const transporter = nodemailer.createTransport({
                SES: new aws.SES({
                    apiVersion: '2010-12-01'
                }),
                sendingRate: 14 // max 14 messages/second
            });
            return transporter;
        } catch(err) {
            return  next(err);
        }
    };


    const checkForBlock = async (req, email) => {
        const now = new Date();
        const data = await req.db.collection('BlockedEmail').findOne({
            email: email,
            end_date: {$gte: now},
            deleted: false
        });
        return (data && Object.keys(data).length > 0) ? false : true;
    };

    const GetEmailServerConfigurations = async (req, mailData, attachment, next) => {
        try {
            const isEmailSendable = await checkForBlock(req, mailData.to);
            if (isEmailSendable) {
                const mailer = ConfigureEmailServer(next);
                // Push next messages to Nodemailer
                const resData =  await mailer.on('idle', async () => {
                    while (mailer.isIdle()) {
                        return mailer.sendMail(mailData);
                    }
                });
                return resData;
            } else {
                return {
                    accepted: [mailData.email],
                    message: "Queued. Thank you.",
                    status: status_message
                };
            }
        } catch(err) {
            return  next(err);
        }
    };

    mailHelper.sendEmail = async (req, {fromEmail, toEmail, subject, textMessage, htmlTemplateMessage, attachments, cc}, next) => {
        const mailOptions = {
            from: `"${appConfig.email_title}" <${fromEmail}>`, // sender address
            to: toEmail, // list of receivers
            subject: subject, // Subject line
            text: textMessage, // plaintext body
            html: htmlTemplateMessage, // html body
            attachments: attachments
        };
        if(cc!==null && cc!==undefined) {
            mailOptions.cc = cc;
        }
        const emailRes = await GetEmailServerConfigurations(req, mailOptions, true, next);
        if(emailRes) {
            const emailResOptions = {};
            emailResOptions.mailOptions = mailOptions;
            emailResOptions.route = req.originalUrl;
            emailResOptions._id = uuidv1();
            emailResOptions.added_on = new Date();
            emailResOptions.added_by = commonHelper.getLoggedInUser(req);
            emailResOptions.success = true;
            if(emailRes.status && emailRes.status===status_message) {
                emailResOptions.success = false;
                req.db.collection('BounceEmailLogs').insertOne(emailResOptions);
                return null;
            }
            req.db.collection('EmailLogs').insertOne(emailResOptions);
            return emailRes;
        }
        return null;
    };

})(module.exports);
