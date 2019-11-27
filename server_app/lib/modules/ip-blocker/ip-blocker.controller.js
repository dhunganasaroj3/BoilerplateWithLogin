const ipBlockerController = (() => {
  'use strict';

  const uuidv1 = require('uuid/v1');

  function IPBlockerModule(){}

  const _p = IPBlockerModule.prototype;

  _p.checkBlockedExpiryStatus = async (req, ip_address, _username, next) => {
    try {
      const queryOpts = {
        ip_address: ip_address,
        username: _username.trim().toLowerCase(),
        blocked_upto: { $gte: new Date() }
      };
      const count = await req.db.collection('IPBlocker').estimatedDocumentCount(queryOpts);
      return (count > 0) ? true : false;
    } catch(err) {
      return next(err);
    }
  };

  _p.blockLoginIpAddress = (req, ip_address, expiry_date, _username) => {
    const ipBlockerInfo = {
      _id: uuidv1(),
      ip_address: ip_address,
      username: _username,
      blocked_upto: new Date(expiry_date),
      added_on: new Date()
    };
    return req.db.collection('IPBlocker').insertOne(ipBlockerInfo);
  };

  return{
    checkBlockedExpiryStatus : _p.checkBlockedExpiryStatus,
    blockLoginIpAddress: _p.blockLoginIpAddress
  };

})();

module.exports = ipBlockerController;
