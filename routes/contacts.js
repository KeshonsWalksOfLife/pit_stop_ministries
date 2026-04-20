const express = require('express');
const router = express.Router();
const { sendContactEmail } = require("../services/email");

router.get("/", (req, res) => {
    res.render('contacts');
});

router.post('/', async (req, res) => {
    const { name, email, category, message } = req.body;
    try {
        await sendContactEmail({ name, email, category, message });
        res.send(`Thank you for your ${category} message, ${name}!
We will get back with you as soon as possible.`);
    }
    catch (error) {
        console.error("Receiving an Error:", error);
        res.status(500).send("An error has occured while sending the email, please try again.");
    }
});

module.exports = router;