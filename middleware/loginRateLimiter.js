const { rateLimit } = require("express-rate-limit");

const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    skipSuccessfulRequests: true,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        error: "Too many login attempts. Please try again in 15 minutes."
    }
});

module.exports = loginRateLimiter;
