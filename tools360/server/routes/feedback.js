/* POST /api/feedback: "Was this helpful?" answers. No personal data. */
const router = require('express').Router();
const pool = require('../db/connection');
const { formLimiter } = require('../middleware/rateLimit');
const { isToolId } = require('../middleware/validate');

router.post('/', formLimiter, async (req, res, next) => {
  try {
    const { tool, helpful } = req.body;
    if (!isToolId(String(tool)) || typeof helpful !== 'boolean') return res.status(400).json({ error: 'Invalid feedback.' });
    await pool.query('INSERT INTO feedback (tool, helpful) VALUES ($1, $2)', [tool, helpful]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});
module.exports = router;
