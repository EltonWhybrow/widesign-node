const express = require('express');
const router = express.Router();
const nodemailer = require("nodemailer");
const {
    check,
    validationResult
} = require('express-validator');

// Contact form / nodemailer
router.post('/contact-us', [

    // validate post data
    check('contactName', 'No name or wrong format').exists().matches('^[a-zA-Z-.\'\\s]+$'),
    check('contactNumber', 'No contact number or wrong format').exists().matches('^[0-9-\\s]*$'),
    check('contactEmail', 'No email or incorrect format').exists().isEmail(),
    check('contactMessage', 'No message type or wrong format').exists().matches('^[a-zA-Z-.\'\\s]+$'),

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
        await sendUserConfirmation(user, info => {
            console.log("info for sendUserConfirmation >>>>>>>", info);
            console.log("user for sendUserConfirmation >>>>>>>", user);
        });
        await sendContactMail(user, info => {
            console.log("info for sendContactMail >>>>>>>", info);
            console.log("user for sendContactMail >>>>>>>", user);
            res.send(info);
        });
    } catch (e) {
        console.log("error is >>>>>>>", e);
        res.status(400).send({
            error: 'ERROR in Sending'
        });
    } finally {
        console.log("sending of emails finished");
    }

});

// Callback form / nodemailer
router.post('/callback', [

    // validate post data
    check('contactName', 'No name or wrong format').exists().matches('^[a-zA-Z-.\'\\s]+$'),
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
        //     console.log("user from confirmation", user);
        // });
        await sendCallbackMail(user, info => {
            console.log("info for call-back >>>>>>>", info);
            console.log("user for call-back >>>>>>>", user);
            res.send(info);
        });
    } catch (e) {
        console.log("error is >>>>>>>", e);
        res.status(400).send({
            error: 'ERROR with callback'
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

// Contact Confirmation email to be sent to interested parties
async function sendUserConfirmation(user, callback) {
    transporter;

    let mailConfirmOptions = {
        from: '"Elton" <elton@widesign.co.uk>',
        to: user.contactEmail,
        subject: `WideSign - Thanks for getting in touch ${user.contactName}`,
        text: `
              Hi ${user.contactName}, thanks for your callback request. We try our best to reply to all queries within 24hrs, we will be in touch soon. Regards Elton.`,
        html: `
        <body> 
        <table style="border-collapse: collapse;">       
        <tr> 	
        <td style="padding-right: 10px; padding-left: 10px;"><img src="https://widesign.co.uk/assets/logos/logo_web_invert.svg" width="200" height="auto"></td>     
        </tr> 
        <tr> 	
        <td style="padding-right: 10px; padding-left: 10px; padding-top: 10px;">
        <h2>Hi <b>${user.contactName}</b>,</h2>
        <h2>Great to finally meet you, It's a big world out there..</h2>
        <p style="font-size:16px">I try my best to reply to all queries within 24hrs.</p>
        <p style="font-size:16px">Have a cup of tea and relax, I'll be with you shortly!</p>
        <p style="font-size:16px">Kind Regards<br /><b>WideSign (aka Elton)</b></p>
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

    let mailCallbackOptions = {
        from: '"Elton" <elton@widesign.co.uk>',
        to: '"Elton" <elton@widesign.co.uk>',
        // bcc: [{
        //   name: "Elton Whybrow<widesign>",
        //   address: "elton@ingenie.com"
        // }],
        subject: `WideSign - ${user.contactName} sent you a message`,
        text: `
              ${user.contactName} has sent you a message on WideSign website. There contact number is ${user.contactNumber}`,
        html: `
        <body> 
        <table style="border-collapse: collapse;">     
        <tr> 	
        <td style="padding-right: 10px; padding-left: 10px;"><img src="https://widesign.co.uk/assets/logos/logo_web_invert.svg" width="200" height="auto"></td>     
        </tr> 
        <tr> 	
        <td style="padding-right: 10px; padding-left: 10px; padding-top: 10px;">
        <h2><b>${user.contactName}</b> has showed interest in WideSign</h2>
        <p style="font-size:16px">They would like you to call them back.</p>
        <ul>
        <li style="font-size:16px">Phone: ${user.contactNumber}</li>
        </ul> 
        <p style="font-size:16px">Kind Regards<br /><b>WideSign</b></p>
        </td>     
        </tr> 
        </table> 
        </body> 
              `
    };

    let info = await transporter.sendMail(mailCallbackOptions);

    callback(info);
}

// Callback email to be send on to widesign
async function sendContactMail(user, callback) {
    transporter;

    let mailContactOptions = {
        from: '"Elton" <elton@widesign.co.uk>',
        to: '"Elton" <elton@widesign.co.uk>',
        // bcc: [{
        //   name: "Elton Whybrow<widesign>",
        //   address: "elton@ingenie.com"
        // }],
        subject: `WideSign - ${user.contactName} sent you a message`,
        text: `
              ${user.contactName} has sent you a message on WideSign website. There contact number is ${user.contactNumber}`,
        html: `
        <body> 
        <table style="border-collapse: collapse;">     
        <tr> 	
        <td style="padding-right: 10px; padding-left: 10px;"><img src="https://widesign.co.uk/assets/logos/logo_web_invert.svg" width="200" height="auto"></td>     
        </tr> 
        <tr> 	
        <td style="padding-right: 10px; padding-left: 10px; padding-top: 10px;">
        <h2><b>${user.contactName}</b> has sent a messsage from your site WideSign</h2>
        <p style="font-size:16px">They would like you to repsonse asap.</p>
        <ul>
        <li style="font-size:16px">Name: ${user.contactName}</li>
        <li style="font-size:16px">Phone: ${user.contactNumber}</li>
        <li style="font-size:16px">Email Address: ${user.contactEmail}</li>
        <li style="font-size:16px">Message: ${user.contactMessage}</li>
        </ul> 
        <p style="font-size:16px">Kind Regards<br /><b>WideSign</b></p>
        </td>     
        </tr> 
        </table> 
        </body> 
              `
    };

    let info = await transporter.sendMail(mailContactOptions);

    callback(info);
}

module.exports = router;