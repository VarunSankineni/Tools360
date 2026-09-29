/* Small input helpers. Always trim and cap length before using user input. */
const clean = (v, max) => String(v == null ? '' : v).trim().slice(0, max);
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) && s.length <= 200;
const isToolId = (s) => /^[a-z0-9-]{2,40}$/.test(s);
module.exports = { clean, isEmail, isToolId };
