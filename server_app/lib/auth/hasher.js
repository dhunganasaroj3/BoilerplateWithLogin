((hashOperator) => {
  'use strict';

  const crypto = require('crypto');
  const bcrypt = require('bcrypt');
  const Promise = require("bluebird");
  const hasherConfig = require('../configs/hasher.config');

  hashOperator.computeHash = (req, res, sourcePassword, salt) => {
    // Create and return a promise object using the 'new' keyword -> this is special to Bluebird's implementation
    return new Promise((resolve, reject) => {
      bcrypt.hash(sourcePassword, salt, (err, hash) => {
        if (err){
          reject(err);
        } else{
          resolve(hash);
        }
      });
    });
  };

  hashOperator.createSalt = () => {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(hasherConfig.saltRounds, (err, salt) => {
        if(err){
          reject(err);
        }else{
          resolve(salt);
        }
      });
    });
  };

  hashOperator.comparePassword = (inputPwd, hash) => {
    return new Promise((resolve, reject) => {
      bcrypt.compare(inputPwd, hash, (err, isMatch) => {
        if(err) {
          reject(err);
        }
        else{
          resolve(isMatch);
        }
      });
    });
  };

  hashOperator.generateRandomBytes = (length) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(length, (err, saltBuffer) => {
        if (err){
          reject(err);
        } else{
          resolve(saltBuffer.toString('hex').substring(0,length));
        }
      });
    });
  };

})( module.exports);
