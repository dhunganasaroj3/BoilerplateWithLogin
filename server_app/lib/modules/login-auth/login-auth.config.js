(() => {
  "use strict";

  module.exports = {
    message: {
      fieldRequired: "Username is required",
      invalidMessage: "Invalid credentials",
      accountNotConfirmed: "User email not confirmed. Please check your email and click on confirmation link to verify.",
      blockMessage: "You are currently blocked. Please check your email and click the link.",
      ipBlocked : "Your ip address has been blocked due to repeated entry of invalid login credentials",
      authProgress : "Authentication already in progress",
      captch_enable_message: "Captcha enabled",
      suspensionMessage : "You are suspended currently. For further info, please contact the site administrator",
      impUserEmailConfirmationRequired: "You must validate email addresse to access dashboard. Please check your email."
    },
    config: {
      block_user_login_attempt: 14,
      block_mins: 5,
      block_ip_login_attempt_fixed_time: 9,
      captcha_enable_login_attempt: 5//after
    }
  };

})();
