const express = require('express');
const router = express.Router();
const { sendContactEmail } = require("../services/email");
const { validateContact } = require("../services/validateContact");
const { verifyCaptcha } = require("../services/verifyCaptcha");
const { limiter, emailLimiter } = require("../services/rateLimiter");

const hcaptchaSiteKey = process.env.HCAPTCHA_SITE_KEY;

router.get("/", (req, res) => {
    res.render('contacts', { currentPage: 'contacts', errors: {}, values: {}, hcaptchaSiteKey });
});

router.post('/', limiter, emailLimiter, async (req, res) => {
    // Honey pot verification
    if (req.body.website) {
        console.log('Honeypot triggered', {
            ip: req.ip,
            email: req.body.email,
            name: req.body.name,
            timestamp: new Date()
        });
        res.render('contact-success', { currentPage: 'contacts', name: 'friend' });
        return;
    }

    const captchaOk = await verifyCaptcha(req.body['h-captcha-response'], req.ip);
    if (!captchaOk) {
        const values = {
            name: req.body.name,
            email: req.body.email,
            category: req.body.category,
            message: req.body.message,
        };
        return res.render('contacts', {
            currentPage: 'contacts',
            errors: { captcha: 'Please complete the verification challenge and try again.' },
            values,
            hcaptchaSiteKey,
        });
    }

    // Gets back errors (which fields failed) + values (what user typed)
    const { errors, values } = validateContact(req.body);

    if (Object.keys(errors).length > 0) {
        return res.render('contacts', { currentPage: 'contacts', errors, values, hcaptchaSiteKey });
    }
    try {
        await sendContactEmail(values);
        res.render('contact-success', { currentPage: 'contacts', name: values.name });
    }
    catch (error) {
        console.error("Receiving an Error:", error);
        res.status(500).send("An error has occurred while sending the email, please try again.");
    }
});

module.exports = router;
