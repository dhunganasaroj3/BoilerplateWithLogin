(() => {
  "use strict";

  module.exports = {
    message: {
      saveMessage: "User confirmed successfully",
      alreadyExists: "User already confirmed",
      notFound: "User confirmation token not found",
      emailError: "OOPS!!! Error occurs while sending email...Please contact site administrator",
      expiredMessage: "User confirmation token already expired. We have sent you a new confirmation email.",
        usedToken :"Link is dead. Confirmation Token has already been used or it might be invalid token."
    },
    config: {
      token_expiry_date_in_hours: 72,
      confirm_api: "confirm/user/",
      token_length: 36
    },
    notifications: {
      account_confirmation: "Your email is now verified. Now you can access all the features of this application.",
        account_confirmation_imp: "Your email is now verified. To enjoy the full benefits of IMP, please start the verification process."
    },
    push_notification: {
      title: {
        confirmation: "Account verified"
      }
    }
  };

})();
