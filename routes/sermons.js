const express = require('express');
const router = express.Router();
const sermons = require('../data/sermons.json');

router.get("/", (req, res) => {
    res.render('sermons', { currentPage: 'sermons', sermons });
});

module.exports = router;