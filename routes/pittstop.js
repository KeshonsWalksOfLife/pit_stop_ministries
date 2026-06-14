const express = require('express');
const router = express.Router();

router.get("/", (req, res) => {
    res.render('pittstop', { currentPage: 'pittStop' });
});

module.exports = router;
