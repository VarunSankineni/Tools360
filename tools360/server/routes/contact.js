/* POST /api/contact: stores a message from the contact form. */
const router = require('express').Router();
const pool = require('../db/connection');
const { formLimiter } = require('../middleware/rateLimit');
const { clean, isEmail } = require('../middleware/validate');

router.post('/', formLimiter, async (req, res, next) => {
  try {
    if (req.body.website) return res.json({ ok: true });        // honeypot field: bots fill it in, people never see it
    const name = clean(req.body.name, 100), email = clean(req.body.email, 200), message = clean(req.body.message, 2000);
    if (!name || !isEmail(email) || message.length < 10) return res.status(400).json({ error: 'Please fill in every field correctly.' });
    await pool.query('INSERT INTO contact_messages (name, email, message) VALUES ($1, $2, $3)', [name, email, message]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});
module.exports = router;
