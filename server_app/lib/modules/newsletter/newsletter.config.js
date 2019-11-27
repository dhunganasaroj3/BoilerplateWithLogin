(() => {
  "use strict";

  module.exports = {
    message: {
      saveMessage: "Newsletter subscription saved successfully",
      unSubscribedMessage: "Unsubscribed Done.",
      notFound: "Newsletter subscription not found",
      alreadyExists: "Email already subscribed",
      alreadyUnsubscribed: "Email already un-subscribed",
      emailError: "OOPS!!! Error occurs while sending email...Please contact site administrator",
      validationErrMessage:{
        subscriber_email : "Email is required",
        subscriber_email_valid : "Invalid Email"
      }
    },
    config: {
      token_length: 8,
      subscribe_api: 'newsletter/unsubscribe/'
    }
  };

})();
