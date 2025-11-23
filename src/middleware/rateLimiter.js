const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // adjust
  message: { error: 'Too many requests from this IP, try again later.' }
});

module.exports = { authLimiter };
