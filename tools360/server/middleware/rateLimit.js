/* Rate limits protect the API from spam and abuse. */
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 200, standardHeaders: true, legacyHeaders: false });
const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many messages. Please try again later.' }
});
module.exports = { apiLimiter, formLimiter };
