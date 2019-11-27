(() => {
  "use strict";

  const roleConfig = require('../../configs/role.config');

  module.exports = {
    message: {
      saveMessage: "Role saved successfully",
      updateMessage: "Role updated successfully",
      notFound: "Role not found",
      alreadyExists: "Role already exists",
      validationErrMessage:{
        role_name : "Role is required"
      }
    },
    config: {
      roles:[
        {
          role_name: roleConfig.superadmin,
          role_description: 'Super Admin'
        }, {
          role_name: roleConfig.enduser,
          role_description: 'End User'
        }, {
          role_name: roleConfig.independent_marketing_partner,
          role_description: 'Independent Marketing Partner'
        }, {
          role_name: roleConfig.vendor,
          role_description: 'Property Admin'
        }
      ]
    }
  };

})();
