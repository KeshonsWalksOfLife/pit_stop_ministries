const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5, // Limit each IP to 5 requests per 'window'
    message: 'Too many submissions. Please wait a few minutes and try again.',
    standardHeaders: true, // Return rate limit info in the 'RateLimit-x' headers
    legacyHeaders: false, // Disable the X-RateLimit-* headers
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
    keyGenerator: (req) => {
        const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
        return email || ipKeyGenerator(req.ip);
    },
});

module.exports = { limiter, emailLimiter };

/* Set a custom handler for more advanced use-cases, such as using res.render() to send a templated response.
​
statusCode
number
The HTTP status code to send back when a client is rate limited.
Defaults to 429.*/