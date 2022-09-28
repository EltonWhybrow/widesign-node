
const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const {
    check,
    validationResult
} = require('express-validator');

const User = require("../models/users")

// GET all user from database !!testing ONLY
// router.get('/all', (req, res) => {
//     User.find()
//         .then((result) => {
//             res.send(result)
//         })
//         .catch((err) => {
//             console.log('>>>>> error', err)
//         })
// })

// POST new user to database !!testing ONLY
// router.post('/add', async (req, res) => {
//     let user = req.body;
//     console.log('>>>> refresh token data', user)

//     let tokenData = {
//         username: user.username,
//     }

//     try {
//         const hashedPassword = await bcrypt.hash(req.body.password, 10);
//         const refreshToken = jwt.sign(tokenData, process.env.REFRESH_TOKEN_SECRET)

//         // console.log('refreshToken', refreshToken);
//         console.log('Hashed', hashedPassword);

//         const user = new User({
//             username: req.body.username,
//             password: hashedPassword,
//             refreshToken: refreshToken,
//             role: req.body.role
//         })

//         // Mongoose save to database
//         user.save()
//             .then((user) => {
//                 res.sendStatus(201).json(user)
//             })
//             .catch((err) => {
//                 console.log('>>>>> error', err)
//             })
//     } catch {
//         res.sendStatus(500).send()
//     }

// })

// Login Check database and return token
router.post('/login', [
    // validate post data
    // check('email', 'No email or incorrect format').exists().isEmail(),
    check('username', 'No name or wrong format').exists().matches('^[a-zA-Z-.\'\\s]+$'),
    check('password', 'Wrong password or wrong format').exists().matches('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$£!%*?&])[A-Za-z\d$@$!%*?&].{8,}$')

], (req, res) => {
    // Finds the validation errors in this request and wraps them in an object: See express validationResult for more
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    let user = req.body;


    User.findOne(
        { 'username': user.username },
        { username: 1, password: 1, role: 1, _id: 0 }

    )
        .then(async (result) => {
            console.log('result.password', result.password);
            console.log('user.password', user.password);
            console.log('user.username', user.username);
            console.log('user.role', user.role);
            console.log('result', result);


            let tokenData = {
                username: result.username,
                role: result.role
            }

            if (await bcrypt.compare(user.password, result.password)) {
                const accessToken = generateAccessToken(tokenData)
                const refreshToken = jwt.sign(tokenData, process.env.REFRESH_TOKEN_SECRET)
                console.log('accessToken>>>>> ', accessToken)
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
    return jwt.sign(tokenData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 900 }) // 900 seconds = 15min
}

module.exports = router;