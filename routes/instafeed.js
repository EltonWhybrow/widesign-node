const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/get', (req, res) => {
    var config = {
        method: 'get',
        url: `https://graph.instagram.com/me/media?fields=id,media_type,media_url,caption,timestamp,permalink,thumbnail_url&access_token=${process.env.INSTA_TOKEN}`,
    };

    axios(config)
        .then(function (response) {
            // console.log(JSON.stringify(response.data));
            const results = JSON.stringify(response.data.data);
            res.send(JSON.parse(results));
            // let timeline = response.data.data;
            // console.log('Timeline>>>>> :', timeline)
        })
        .catch(function (error) {
            console.log(error);
        });
})

module.exports = router;