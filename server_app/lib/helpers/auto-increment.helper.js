/**
 * Auto increment support for mongodb and mongoose
 */

var settings = {};
var defaultSettings = {
    collection: "counters",
    field: "_id",
    step: 1
};


exports.getNextSequence = function(db, collectionName, fieldName, callback) {
    if (typeof fieldName == "function") {
        callback = fieldName;
        fieldName = null;
    }

    if (db._state == "connecting") {
        db.on("open", function(err, db) {
            getNextId(db, collectionName, fieldName, callback);
        });
    } else {
        getNextId(db, collectionName, fieldName, callback);
    }
};


exports.setDefaults = function(options) {
    for (var key in options) {
        if (options.hasOwnProperty(key)) {
            defaultSettings[key] = options[key];
        }
    }
};


function getNextId(db, collectionName, fieldName, callback) {
    if (typeof fieldName == "function") {
        callback = fieldName;
        fieldName = null;
    }

    fieldName = fieldName || getOption(collectionName, "field");
    var collection = db.collection(defaultSettings.collection);
    var step = getOption(collectionName, "step");

    collection.findAndModify({ _id: collectionName, field: fieldName },
        null, { $inc: { seq: step } }, { upsert: true, new: true },
        function(err, result) {
            if (err) {
                if (err.code == 11000) {
                    process.nextTick(getNextId.bind(null, db, collectionName, fieldName, callback));
                } else {
                    callback(err);
                }
            } else {
                if (result.value && result.value.seq) {
                    callback(null, result.value.seq);
                } else {
                    callback(null, result.seq);
                }
            }
        }
    );
}

function getOption(collectionName, optionName) {
    return settings[collectionName] && settings[collectionName][optionName] !== undefined ?
        settings[collectionName][optionName] :
        defaultSettings[optionName];
}