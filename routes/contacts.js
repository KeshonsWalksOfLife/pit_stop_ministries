const express = require('express');
const router = express.Router();

router.get("/", (req, res) => {
    res.render('contacts');
});

router.post('/', (req, res) => {
    console.log(req.body);
    res.send("Got it brother!");
});

module.exports = router;