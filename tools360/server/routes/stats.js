/* POST /api/stats: adds 1 to today's count for a tool (tool name only).
   GET /api/stats/summary: totals per tool, protected by the x-admin-key header. */
const router = require('express').Router();
const pool = require('../db/connection');
const { isToolId } = require('../middleware/validate');

router.post('/', async (req, res, next) => {
  try {
    const tool = String(req.body.tool || '');
    if (!isToolId(tool)) return res.status(400).json({ error: 'Invalid tool.' });
    await pool.query(
      `INSERT INTO tool_usage (tool, used_on, count) VALUES ($1, CURRENT_DATE, 1)
       ON CONFLICT (tool, used_on) DO UPDATE SET count = tool_usage.count + 1`, [tool]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.get('/summary', async (req, res, next) => {
  try {
    if (!process.env.ADMIN_KEY || req.get('x-admin-key') !== process.env.ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' });
    const { rows } = await pool.query('SELECT tool, SUM(count)::int AS total FROM tool_usage GROUP BY tool ORDER BY total DESC');
    res.json(rows);
  } catch (e) { next(e); }
});
module.exports = router;
