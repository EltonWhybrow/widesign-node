const express = require('express');
const router = express.Router();
const nodemailer = require("nodemailer");
const {
    check,
    validationResult
} = require('express-validator');

// Callback form using nodemailer
router.post('/callback', [

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
        <body> 
        <table style="border-collapse: collapse;">       
        <tr> 	
        <td style="padding-right: 10px; padding-left: 10px;"><img src="https://widesign.co.uk/assets/logos/logo_web_invert.svg" width="200" height="auto"></td>     
        </tr> 
        <tr> 	
        <td style="padding-right: 10px; padding-left: 10px; padding-top: 10px;">
        <h2>Hi <b>${user.name}</b>, glad to hear you are interested in WideSign.</h2>
        <p>We try our best to reply to all queries within 24hrs.</p>
        <p>We will be in touch soon.</p>
        <p>Kind Regards<br /><b>WideSign</b></p>
        </td>     
        </tr> 
        </table> 
        </body>`
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
        <body> 
        <table style="border-collapse: collapse;">     
        <tr> 	
        <td style="padding-right: 10px; padding-left: 10px;"><img src="https://widesign.co.uk/assets/logos/logo_web_invert.svg" width="200" height="auto"></td>     
        </tr> 
        <tr> 	
        <td style="padding-right: 10px; padding-left: 10px; padding-top: 10px;">
        <h2><b>${user.name}</b> has showed interest in WideSign</h2>
        <p>They would like you to call them back.</p>
        <ul>
        <li>Phone: ${user.contactNumber}</li>
        </ul> 
        <p>Kind Regards<br /><b>WideSign</b></p>
        </td>     
        </tr> 
        </table> 
        </body> 
              `
    };

    let info = await transporter.sendMail(mailRegisterOptions);

    callback(info);
}

module.exports = router;