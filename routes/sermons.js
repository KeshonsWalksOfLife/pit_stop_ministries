const express = require('express');
const router = express.Router();

router.get("/", (req, res) => {
    res.render('sermons', { currentPage: 'sermons' });
});

module.exports = router;