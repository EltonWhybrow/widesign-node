"use strict";
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const port = process.env.PORT || 3000;
const app = express();
const userRouter = require('./routes/users');
const formsRouter = require('./routes/forms');
const twitterRouter = require('./routes/twitter');

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
app.use('/users', userRouter);
app.use('/forms', formsRouter);
app.use('/tweets', twitterRouter);

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

// app.get('/', (req, res) => {
//   res.send(req.tokenData);
// });

/* 
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5,  Date, X-Api-Version, X-File-Name, X-App-Version');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE, PATCH'); 
*/