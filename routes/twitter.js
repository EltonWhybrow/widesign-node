const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/get', (req, res) => {
    var config = {
        method: 'get',
        url: 'https://api.twitter.com/2/users/33846586/tweets?max_results=5&expansions=attachments.media_keys&tweet.fields=public_metrics,created_at,entities&media.fields=preview_image_url,url',
        headers: {
            'Authorization': `Bearer ${process.env.TWITTERAPI_TOKEN}`,
            'Cookie': 'guest_id=v1%3A163346847473478031; personalization_id="v1_6qZPH2JEzcyPZd8irhwPXg=="'
        }
    };

    axios(config)
        .then(function (response) {
            // console.log(JSON.stringify(response.data));
            const results = JSON.stringify(response.data);
            res.send(JSON.parse(results));

            let tweets = response.data.data;
            let media = response.data.includes.media;

            // let newObject = {
            //     ...tweets,
            //     ...media
            // }
            // console.log('>>>LOG>>>', newObject);
            // console.log('tweets DATA>>>>', tweets);
            // console.log('media KEYS>>>>>', media[0].media_key);

        })
        .catch(function (error) {
            console.log(error);
        });
})

module.exports = router;