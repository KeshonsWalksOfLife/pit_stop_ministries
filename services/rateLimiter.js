const { rateLimit } = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5, // Limit each IP to 5 requests per 'window'
    message: 'Too many submissions. Please wait a few minutes and try again.',
    standardHeaders: true, // Return rate limit info in the 'RateLimit-x' headers
    legacyHeaders: false, // Disable the X-RateLimit-* headers
});

module.exports = { limiter };

/* Set a custom handler for more advanced use-cases, such as using res.render() to send a templated response.
​
statusCode
number
The HTTP status code to send back when a client is rate limited.
Defaults to 429.*/