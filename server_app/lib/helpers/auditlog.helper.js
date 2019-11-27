((audithelper) => {
    'use strict';

    const commonHelper = require('../common/common-helper-function');
    audithelper.saveChange = (req, oldvalue, newValue, description,module) => {
        const data = {added_on: new Date(),added_by:commonHelper.getLoggedInUser(req),oldvalue,newValue,description,module};
        req.db.collection('AuditLog').save()
    };

})(module.exports);
