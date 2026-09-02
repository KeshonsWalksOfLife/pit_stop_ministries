const path = require('path');
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const { FileRateLimitStore } = require('./fileRateLimitStore');

// Where hit counts are persisted so they survive process restarts (Render
// free-tier idle spin-down, redeploys, crashes). Point RATE_LIMIT_DATA_DIR at
// a mounted volume in Docker so this directory isn't wiped with the container.
const dataDir = process.env.RATE_LIMIT_DATA_DIR || path.join(__dirname, '..', 'data-runtime');

function logBlocked(label, req) {
    console.log(`Rate limit blocked (${label})`, {
        ip: req.ip,
        email: req.body?.email,
        name: req.body?.name,
        timestamp: new Date(),
    });
}

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5, // Limit each IP to 5 requests per 'window'
    message: 'Too many submissions. Please wait a few minutes and try again.',
    standardHeaders: true, // Return rate limit info in the 'RateLimit-x' headers
    legacyHeaders: false, // Disable the X-RateLimit-* headers
    store: new FileRateLimitStore(path.join(dataDir, 'ip-limiter.json')),
    handler: (req, res, next, options) => {
        logBlocked('per-IP', req);
        res.status(options.statusCode).send(options.message);
    },
});

// Per-IP limiting alone doesn't stop a sender who spreads submissions across
// the day from the same address (e.g. one every hour) — that stays well under
// the window above. This limiter keys on the submitted email instead, so the
// same sender is capped regardless of IP.
const emailLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    limit: 3, // Limit each email address to 3 requests per day
    message: 'Too many submissions from this email today. Please wait and try again tomorrow.',
    standardHeaders: true,
    legacyHeaders: false,
    store: new FileRateLimitStore(path.join(dataDir, 'email-limiter.json')),
    keyGenerator: (req) => {
        const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
        return email || ipKeyGenerator(req.ip);
    },
    handler: (req, res, next, options) => {
        logBlocked('per-email', req);
        res.status(options.statusCode).send(options.message);
    },
});

module.exports = { limiter, emailLimiter };
