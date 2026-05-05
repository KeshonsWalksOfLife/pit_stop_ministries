const express = require('express');
const router = express.Router();
const { sendContactEmail } = require("../services/email");
const { validateContact } = require("../services/validateContact");

router.get("/", (req, res) => {
    res.render('contacts', { currentPage: 'contacts', errors: {}, values: {} });
});

router.post('/', async (req, res) => {
    // Runs all 4 fields checks.
    // Gets back errors (which fields failed) + values (what user typed)
    const { errors, values } = validateContact(req.body);

    if (Object.keys(errors).length > 0) {
        return res.render('contacts', { currentPage: 'contacts', errors, values });
    }
    try {
        await sendContactEmail(values);
        res.render('contact-success', { name: values.name });
    }
    catch (error) {
        console.error("Receiving an Error:", error);
        res.status(500).send("An error has occured while sending the email, please try again.");
    }
});

module.exports = router;