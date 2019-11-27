const locationTrackerController = (() => {
    'use strict';

    const utilityHelper = require('../../helpers/utilities.helper');
    const locationHelper = require('../../helpers/location-helper');

    function LocationTrackerModule () {}

    const _p = LocationTrackerModule.prototype;

    _p.getLocationInfo = async (req, next) => {
        const locationData = await locationHelper.getUserLocationObject(req);
        return (locationData && Object.keys(locationData).length > 0 && locationData.country) ? {country: locationData.country.toLowerCase()} : {};
    };

    return {
        getLocationInfo: _p.getLocationInfo
    };

})();

module.exports = locationTrackerController;
