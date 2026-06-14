const express = require('express');
const router = express.Router();
const sermons = require('../data/sermons.json');

const MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

// "2026-06-11" -> "June 2026"
function monthLabel(date) {
    if (!date) return "Undated";
    const [year, month] = date.split("-");
    return `${MONTHS[Number(month) - 1]} ${year}`;
}

// data/sermons.json is already sorted newest-first, so the newest is featured
// and the month groups come out in descending order for free.
function organize(list) {
    const featured = list[0] || null;
    const groups = [];
    for (const sermon of list.slice(1)) {
        const label = monthLabel(sermon.date);
        let group = groups.find(g => g.label === label);
        if (!group) {
            group = { label, sermons: [] };
            groups.push(group);
        }
        group.sermons.push(sermon);
    }
    return { featured, groups };
}

router.get("/", (req, res) => {
    const { featured, groups } = organize(sermons);
    res.render('sermons', { currentPage: 'sermons', featured, groups });
});

module.exports = router;