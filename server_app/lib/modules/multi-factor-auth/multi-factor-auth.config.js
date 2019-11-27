(() => {
  "use strict";

  module.exports = {
    message: {
      notVerified : "TOTP Token not verified",
      notFound : "TOTP token not found",
      notValidated: "Multi-Factor authentication failed. Please enter correct code.",
      verifySuccess : "Multi-Factor authentication for user verified successfully",
      disabled : "Multi-Factor authentication disabled for the account successfully",
      already_enabled: "Multi-Factor authentication already enabled.",
      sms_sent:'Multi-Factor authentication code sent to your mobile number',
      emailError: "OOPS!!! Error occurs while sending email...Please contact site administrator",
      recoveryCodeSentSuccess: "Recovery code sent successfully. Please check your email. Please note that recovery code will be valid only for 30 mins.",
      referCodeNotValid: "Refer code not valid",
      recoveryCodeCreateSuccess: "New recovery code for multi-factor authentication created successfully",
      validationErrMessage:{
        mobile_number: "Please enter valid mobile number",
        country_code: "Please enter country code",
      }
    },
    config: {
      mobile_token_length: 6,
      recovery_code_length: 6,
      recovery_code_time_validity: 30, //mins
      backup_recovery_code_nos: 5
    }
  };

})();

