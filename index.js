"use strict";
require("dotenv").config();
const express = require("express");
var axios = require('axios');
axios
const {
  check,
  validationResult
} = require('express-validator');

const cors = require("cors");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');

const User = require("./models/users")

const port = process.env.PORT || 3000;
const app = express();

const dbURI = 'mongodb+srv://elton:Thankyou99!@ws-cluster.sruxvyb.mongodb.net/widesign?retryWrites=true&w=majority'

mongoose.connect(dbURI)
  .then((result) =>
    app.listen(port, err => {
      if (err) {
        console.log(`The server failed... error was: ${err}`)
      } else {
        console.log(`The server is listening... on port: ${port}`)
      }
    })
  )
  .catch((err) => console.log(err))

// Middleware
app.use(cors({
  origin: ["http://localhost:4200",
    "http://localhost:4201",
    // "https://ingeniebusiness-development.azurewebsites.net",
    // "https://ingeniebusiness-staging.azurewebsites.net",
    // "https://ingeniebusiness.com",
    // "https://www.ingeniebusiness.com"
  ]
}));

app.use(express.json());

// jwt authenticate/verify token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, tokenData) => {
    if (err) return res.sendStatus(403)
    req.tokenData = tokenData
    next()
  })
}

// Routes
app.get('/', authenticateToken, (req, res) => {
  res.send(req.tokenData);
});


// get TWEETS!!
app.get('/get-tweets', (req, res) => {
  var config = {
    method: 'get',
    url: 'https://api.twitter.com/2/users/33846586/tweets?max_results=5&expansions=attachments.media_keys&tweet.fields=public_metrics,created_at,entities&media.fields=preview_image_url,url',
    headers: {
      'Authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAAIwPgwEAAAAA6jV6fVhlp4PCyF2lmXZedbd9%2BqE%3DQzETLleb1TJ9WhsCD4HlU0JASHfsyEF8Q7Ha9oTa2fgzkAtdji',
      'Cookie': 'guest_id=v1%3A163346847473478031; personalization_id="v1_6qZPH2JEzcyPZd8irhwPXg=="'
    }
  };

  axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
      const results = JSON.stringify(response.data);
      res.send(JSON.parse(results));

      let tweets = response.data.data;
      let media = response.data.includes.media;
      console.log('tweets>>>>', tweets);
      console.log('media>>>>>', media);

      let wholeTweet = {
        ...tweets,
        ...media,
      }

      console.log('wholeTweet', wholeTweet)

    })
    .catch(function (error) {
      console.log(error);
    });
})
// END


// ADD User testing add user and getting using mongoose mongoBD
app.post('/add-user', async (req, res) => {
  let user = req.body;
  console.log('>>>> refresm token data', user)

  let tokenData = {
    username: user.username,
  }

  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const refreshToken = jwt.sign(tokenData, process.env.REFRESH_TOKEN_SECRET)

    // console.log('refreshToken', refreshToken);
    console.log('Hashed', hashedPassword);

    const user = new User({
      username: req.body.username,
      password: hashedPassword,
      refreshToken: refreshToken
    })

    // Mongoose save to database
    user.save()
      .then((user) => {
        res.sendStatus(201).json(user)
      })
      .catch((err) => {
        console.log('>>>>> error', err)
      })
  } catch {
    res.sendStatus(500).send()
  }

})

// GET all user from database testing OLNY
app.get('/all-users', (req, res) => {
  User.find()
    .then((result) => {
      res.send(result)
    })
    .catch((err) => {
      console.log('>>>>> error', err)
    })
})

app.post('/token', (req, res) => {
  const refreshToken = req.body.token
})

// Admin login from ng app
app.post('/login', [
  // validate post data
  // check('email', 'No email or incorrect format').exists().isEmail(),
  check('username', 'No name or wrong format').exists().matches('^[a-zA-Z-.\'\\s]+$'),
  check('password', 'Wrong password or wrong format').exists().matches('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$£!%*?&])[A-Za-z\d$@$!%*?&].{8,}$'),

], (req, res) => {
  // Finds the validation errors in this request and wraps them in an object: See express validationResult for more
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array()
    });
  }

  let user = req.body;
  let tokenData = {
    username: user.username,
  }

  User.findOne(
    { 'username': user.username },
    { username: 1, password: 1, _id: 0 }

  )
    .then(async (result) => {
      // console.log('result.password', result.password);
      // console.log('user.name', user.password);
      if (await bcrypt.compare(user.password, result.password)) {
        const accessToken = generateAccessToken(tokenData)
        const refreshToken = jwt.sign(tokenData, process.env.REFRESH_TOKEN_SECRET)

        console.log('refreshToken>>>>> ', refreshToken)
        // res.cookie('JWT', accessToken)
        res.status(200).send(
          {
            success: true,
            message: 'OK you got authorised!',
            username: result.username,
            accessToken: accessToken,
            refreshToken: refreshToken
          })
      } else {
        res.status(401).send(
          {
            success: false,
            message: 'Unauthorised!! Password is sketchy, your dont have the sprinkles..'
          }
        )
      }
    })
    .catch((err) => {
      res.status(401).send(
        {
          success: false,
          message: 'Unauthorised!! Username is not a thing, your dont have the sprinkles..'
        }
      )
    })
})

function generateAccessToken(tokenData) {
  return jwt.sign(tokenData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 20 }) // 900 seconds = 15min
}




// Callback form using nodemailer
app.post('/callback', [

  // validate post data
  // check('email', 'No email or incorrect format').exists().isEmail(),
  check('name', 'No name or wrong format').exists().matches('^[a-zA-Z-.\'\\s]+$'),
  check('contactNumber', 'No contact number or wrong format').exists().matches('^[0-9-\\s]*$'),

], async (req, res) => {
  let user = req.body;

  // Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array()
    });
  }

  try {
    // await sendUserConfirmation(user, info => {
    //   console.log("user from confirmation", user);
    // });
    await sendCallbackMail(user, info => {
      console.log("info for call-back >>>>>>>", info);
      res.send(info);
    });
  } catch (e) {
    console.log("error is >>>>>>>", e);
    res.status(400).send({
      error: 'ERROR REGISTER'
    });
  } finally {
    console.log("sending of emails finished");
  }

});

// Reusable transporter for nodemailer
const transporter = nodemailer.createTransport({
  host: "mail.supremecluster.com",
  port: 465, // 587
  secure: true, // true for 465, false for other ports
  auth: {
    user: "info@widesign.co.uk",
    pass: "wide999SIGN" // move to env var in git??
  },
  // debug: true, // show debug output
  // logger: true // log information in console
});

// Callback Confirmation email to be sent to interested parties
async function sendUserConfirmation(user, callback) {
  transporter;

  let mailConfirmOptions = {
    from: '"Elton" <elton@widesign.co.uk>',
    to: user.email,
    subject: `WideSign - Thanks for getting in touch ${user.name}`,
    text: `
            Hi ${user.name}, thanks for your callback request. We try our best to reply to all queries within 24hrs, we will be in touch soon. Regards Elton.`,
    html: `
            <img src="https://widesign.co.uk/assets/logos/logo_web_invert.svg" width="200" height="auto">
            <h2>Hi <b>${user.name}</b>, glad to hear you are interested in WideSign.</h2>
            <p>We try our best to reply to all queries within 24hrs.</p>
            <p>We will be in touch soon.</p>
            <p>Kind Regards<br /><b>WideSign</b></p>`
  };
  let info = await transporter.sendMail(mailConfirmOptions);

  callback(info);
}

// Callback email to be send on to widesign
async function sendCallbackMail(user, callback) {
  transporter;

  let mailRegisterOptions = {
    from: '"Elton" <elton@widesign.co.uk>',
    to: '"Elton" <elton@widesign.co.uk>',
    // bcc: [{
    //   name: "Elton Whybrow<widesign>",
    //   address: "elton@ingenie.com"
    // }],
    subject: `WideSign - ${user.name} sent you a message`,
    text: `
            ${user.name} has sent you a message on WideSign website. There contact number is ${user.contactNumber}`,
    html: `
            <img src="https://widesign.co.uk/assets/logos/logo_web_invert.svg" width="200" height="auto">
            <h2><b>${user.name}</b> has showed interest in WideSign</h2>
            <p>They would like you to call them back.</p>
            <ul>
            <li>Phone: ${user.contactNumber}</li>
            </ul> 
            <p>Kind Regards<br /><b>WideSign</b></p>`
  };

  let info = await transporter.sendMail(mailRegisterOptions);

  callback(info);
}


// res.setHeader('Access-Control-Allow-Credentials', 'true');
// res.setHeader('Access-Control-Allow-Origin', '*');
// res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5,  Date, X-Api-Version, X-File-Name, X-App-Version');
// res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE, PATCH');