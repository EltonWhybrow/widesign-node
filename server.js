"use strict";
const dotenv = require('dotenv')
const path = require('path')
dotenv.config(process.env.NODE_ENV === "production" ?
  { path: path.resolve(__dirname + '../../../.env') } :
  { path: __dirname + '/.env' }
)
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const https = require('https')
const fs = require('fs')

const port = process.env.NODE_ENV === "production" ? process.env.PORT : 3000;
const app = express();
const userRouter = require('./routes/users');
const formsRouter = require('./routes/forms');
const twitterRouter = require('./routes/twitter');
const instaRouter = require('./routes/instafeed')

const dbURI = process.env.MONGODB_URI

// Middleware
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://widesign.co.uk)");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(cors({
  origin: [
    "https://staging.widesign.co.uk",
    "https://www.widesign.co.uk",
    "https://widesign.co.uk",
    "http://localhost:4200",
  ]
}));

// Connect to Mongo and create https server
let https_options = {
  // PRODUCTION CERTS
  key: process.env.NODE_ENV === "production" ?
    fs.readFileSync(path.resolve(__dirname + process.env.PRIVATE_KEY)) :
    fs.readFileSync(__dirname + process.env.PRIVATE_KEY_LOCAL),
  cert: process.env.NODE_ENV === "production" ?
    fs.readFileSync(path.resolve(__dirname + process.env.DOMAIN_CERT)) :
    fs.readFileSync(__dirname + process.env.DOMAIN_CERT_LOCAL),
  ca: [
    process.env.NODE_ENV === "production" ?
      fs.readFileSync(path.resolve(__dirname + process.env.CA_ROOT_CERT)) :
      fs.readFileSync(__dirname + process.env.CA_ROOT_CERT_LOCAL),
    process.env.NODE_ENV === "production" ?
      fs.readFileSync(path.resolve(__dirname + process.env.CA_BUNDLE_CERT)) :
      fs.readFileSync(__dirname + process.env.CA_BUNDLE_CERT_LOCAL)
  ]

  // LOCAL CERTS
  // key: fs.readFileSync(__dirname + '/certificates/private.key'),
  // cert: fs.readFileSync(__dirname + '/certificates/your_domain_name.crt'),
  // ca: [
  //   fs.readFileSync(__dirname + '/certificates/CA_root.crt'),
  //   fs.readFileSync(__dirname + '/certificates/ca_bundle_certificate.crt')
  // ]
};

mongoose.connect(dbURI)
  .then((result) =>

    https.createServer(https_options, app).listen(port, err => {
      if (err) {
        console.log(`The server failed... error was: ${err}`)
      } else {
        console.log(`The server is listening... on port: ${port}`)
      }
    })
  )
  .catch((err) => console.log(err))


app.use(express.json());
app.use('/users', userRouter);
app.use('/forms', formsRouter);
app.use('/tweets', twitterRouter);
app.use('/instafeed', instaRouter);

// jwt authenticate/verify token middleware NOT WORKING NOT SURE SEE WEB SIMPLIFIED
// function authenticateToken(req, res, next) {
//   const authHeader = req.headers['authorization']
//   const token = authHeader && authHeader.split(' ')[1];
//   if (token == null) return res.sendStatus(401)

//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, tokenData) => {
//     if (err) return res.sendStatus(403)
//     req.tokenData = tokenData
//     next()
//   })
// }

app.get('/', (req, res) => {
  res.send('working!');
});

// app.get('/', (req, res) => {
//   res.send(req.tokenData);
// });

// const options = {
//   setHeaders(res, path, stat) {
//     res.setHeader('Access-Control-Allow-Credentials', 'true');
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5,  Date, X-Api-Version, X-File-Name, X-App-Version');
//     res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE, PATCH');
//   }
// }

