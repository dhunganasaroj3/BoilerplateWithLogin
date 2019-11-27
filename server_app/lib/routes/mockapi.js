const newsRoute = (() => {
    'use strict';

    const express = require('express');
    const newsRouter = express.Router();
    const datas = require('./hotels');
    const responseForReferralLink = async (req, res, next) => {
        try {
            const data = datas.hotels;
            data.response = [data.response[0]];
            for (let i = 0; i < 60; i++) {
                const d = {... data.response[0]};
                d._id = (i).toString();
                d.lat = parseFloat((Math.random() * 25).toFixed(7)).toString();
                d.lon = parseFloat((Math.random() * 25).toFixed(7)).toString();
                d.star_rating = parseFloat((Math.random() * 5).toFixed(0));
                const rating = {...d.rating};
                rating.tripadvisor_rating = parseInt((Math.random() * 5).toFixed(0));
                rating.review_count = parseInt((Math.random() * 50).toFixed(0));
                d.rating = rating;
                const rate = [...d.rates][0];
                rate.rate_id = (i).toString();
                rate.price = parseFloat((Math.random() * 10000).toFixed(0));
                rate.discount = null;
                rate.applied_offer = "";
                d.rates[0] = rate;
                data.response.push({...d});
            }
            res.send(data);
        } catch (err) {
            return next(err);
        }
    };
    const responseForRoomRate = async (req, res, next) => {
        try {
            const data = datas.rate.response;
            for (let i = 0; i < 60; i++) {
                const d = {...data.data[0]};
                d.id = i;
                const price = {...d.price};
                price.base = parseFloat((Math.random() * 10000).toFixed(0));
                price.discount = parseFloat((Math.random() * 1000).toFixed(0));
                d.price = price;
                data.data.push({...d});
            }
            res.send(data);
        } catch (err) {
            return next(err);
        }
    };

    newsRouter.route('/')
        .get(responseForReferralLink)
    newsRouter.route('/rate')
        .get(responseForRoomRate)

    return newsRouter;

})();

module.exports = newsRoute;
