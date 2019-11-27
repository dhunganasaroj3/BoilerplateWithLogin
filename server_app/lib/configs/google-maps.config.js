/**
 * Created by lakhe on 9/18/17.
 */
(() => {
    'use strict';

    module.exports = {
        requestUrl: "https://maps.googleapis.com/maps/api/geocode/json?latlng=%latitude%,%longitude%&key=%api_key%",
        embed_url: "https://www.google.com/maps/place?q=%latitude%,%longitude%",
        map_url: "http://maps.google.com/maps?z=12&t=m&q=%latitude%,%longitude%",
      //  embed_url_img: "https://maps.googleapis.com/maps/api/staticmap?center=%latitude%,%longitude%&amp;zoom=14&amp;size=620x620&amp;key=%api_key%",
        embed_url_img: "https://maps.googleapis.com/maps/api/staticmap?zoom=14&size=620x620&maptype=roadmap%20&markers=color:0xdea021%7Clabel:%7C%latitude%,%longitude%%20&m&key=%api_key%",
        place_base_url:"https://maps.googleapis.com/maps/api/place/details/json"
    };

})();
