((handlebarHelpers) => {

    'use strict';

    const paginate = require('handlebars-paginate');
    handlebarHelpers.paginate = paginate;

    handlebarHelpers.titleLimit = (title) => {
      return (title.length > 55) ?  title.substring(0, 55) : title;
    };

    handlebarHelpers.summaryLimit = (word) => {
      return (word.length > 98) ? word.substring(0, 98) : word;
    };

    handlebarHelpers.longSummaryLimit = (word) => {
      return (word.length > 150) ? word.substring(0, 150) : word;
    };

    handlebarHelpers.loopFromSecond = (data, options) => {
        let loopData = "";
        for (let i = 1; i < data.length; i++) {
            loopData += options.fn(data[i]);
        }
        return loopData;
    };

    handlebarHelpers.makeFirstCharacterUpperCase = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    handlebarHelpers.formatHeaderUrl = (string) => {
        const formattedUrl = string.substr(1).replace('-',' ');
        return formattedUrl.charAt(0).toUpperCase() + formattedUrl.slice(1).split('?')[0];
    };

    handlebarHelpers.date = (date) => {
        return date.toLocaleDateString();
    };

    handlebarHelpers.dateFormatter = (date) => {
        return `${date.getFullYear()}/${(date.getMonth() + 1)}/${date.getDate()}`;
    };

    handlebarHelpers.onlyDateFormatter = (date) => {
        return new Date(date).getDate();
    };

    handlebarHelpers.onlyfullMonthFormatter = (date) => {
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        return monthNames[date.getMonth()];
    };

    handlebarHelpers.justDate = (date) => {
        return new Date(date).getDate();
    };

    handlebarHelpers.meta = (name, options) => {
        if (!this._meta) this._meta = {};
        this._meta[name] = options.fn(this);
        return null;
    };

    handlebarHelpers.pagetitle = (name, options) => {
        if (!this._pagetitle) this._pagetitle = {};
        this._pagetitle[name] = options.fn(this);
        return null;
    };

    handlebarHelpers.lowerCase = (data) => {
        return data ? data.toLowerCase() : "";
    };

    handlebarHelpers.beforeSpace = (data) => {
        return data.split(" ")[0];
    };

    handlebarHelpers.afterSpace = (data) => {
        return data.split(" ")[1];
    };
    handlebarHelpers.checkData = (data, options) => {
        if (typeof data !== "undefined" && (Array.isArray(data) && data.length > 0))
            return options.fn(this);
        else
            return options.inverse(this);
    };
    handlebarHelpers.checkAndBindList = (data, options) => {
        const fn = options.fn, inverse = options.inverse;
        let ret = "";
        let context = 0;
        if (data !== "null" && typeof data !== "undefined" && (Array.isArray(data)) && data.length > 0) {
            for (let i = 0, j = data.length; i < j; i++) {
                context = Object.create(data[i]);
                context.index = i;
                ret = ret + fn(context);
            }
        }
        else {
            ret = inverse(this);
        }
        return ret;
    };

    handlebarHelpers.checkValueExists = (data, options) => {
        if (typeof data !== 'undefined' && Array.isArray(data) && data.length > 0) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    };

    handlebarHelpers.indexIncrement = (index) => {
        return index + 1;
    };

    handlebarHelpers.cloudinaryUrl = (imageName, options) => {
        const cloudinary = require('cloudinary');
        const option = JSON.parse(options.hash.option);
        return cloudinary.url(imageName, option);
    };

    handlebarHelpers.copyRightYear = () => {
        return new Date().getFullYear();
    };
    handlebarHelpers.justDate = (date) => {
        return new Date(date).getDate();
    };
    handlebarHelpers.justMonth = (date) => {
        const monthShortNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        return monthShortNames[new Date(date).getMonth()];

        //return new Date(date).toLocaleDateString("en-US", {month: "short"});
    };
    handlebarHelpers.justYear = (date) => {
        return new Date(date).getFullYear();
    };
    handlebarHelpers.justDay = (date) => {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return days[new Date(date).getDay()];
    };
    handlebarHelpers.justTime = (date) => {
      let hours = date.getHours();
      let minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? '0' + minutes : minutes;
      const strTime = hours + ':' + minutes + ' ' + ampm;
      return strTime;
    };

})(module.exports);
