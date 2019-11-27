(() => {
  "use strict";

  module.exports = {
    message: {
      saveMessage: "Email service configuration saved successfully",
      updateMessage: "Email service configuration updated successfully",
      notFound: "Email service configuration not found",
      alreadyExists: "You can only update email service configuration setting",
      validationErrMessage:{
        api_key : "Api key  for mailgun service is mandatory",
        domain : "Domain name for mailgun transactional email service is required",
        domainValid : "Invalid domain"
      }
    }
  };

})();
