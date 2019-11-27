((bounceRateHandler) => {
    'use strict';

    const emailHelper = require('./email-service.helper');

    const emailsArr = [
        'shrawanlakhey@gmail.com'
    ];

    bounceRateHandler.reduceBounceRateManually = (req, res, next) => {
        let mailOptions = {};
        for (let k = 0; k < emailsArr.length; k++) {
            setTimeout(()=> {
                for (let i= 0; i < 1; i++) {

                    setTimeout(()=> {
                        mailOptions = {
                            fromEmail: "noreply@xceltrip.com", // sender address
                            toEmail: emailsArr[k], // list of receivers
                            subject: `Email to notify user confirmation success ${i}-000738-${i}`, // Subject line
                            textMessage: "hahahaha This policy applies to the websites and mobile applications (the apps) in different markets that are operated and owned by XcelTrip Inc (“XcelTrip”). We take your privacy seriously and provide this privacy policy to inform you of our practices with respect to how we collect, use, and protect personal information about visitors to and members of our website and apps. Personal information is information that is personally identifiable like your name, email address, phone number, mailing address, etc. By using our website and the apps you consent to the terms described in this document.", // plaintext body
                            htmlTemplateMessage: "<p>This policy applies to the websites and mobile applications (the apps) in different markets that are operated and owned by XcelTrip Inc (“XcelTrip”). We take your privacy seriously and provide this privacy policy to inform you of our practices with respect to how we collect, use, and protect personal information about visitors to and members of our website and apps. Personal information is information that is personally identifiable like your name, email address, phone number, mailing address, etc. By using our website and the apps you consent to the terms described in this document.</p>",
                            attachments: []

                        };
                        emailHelper.sendEmail(req, mailOptions, next);
                    }, 4000);
                }
            }, 4000);

        }
    };

})(module.exports);
