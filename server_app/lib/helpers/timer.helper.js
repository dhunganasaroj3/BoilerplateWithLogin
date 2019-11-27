
((timerHelper) => {
    'use strict';

    const Promise = require('bluebird');

    timerHelper.delayPromise = (duration) => {
        return new Promise(function(resolve, reject){
            setTimeout(function(){
                resolve('hello');
            }, duration)
        });
    };

})(module.exports);
