/* Tools360 API. Handles contact messages, feedback and anonymous usage counts only. */
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { apiLimiter } = require('./middleware/rateLimit');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.set('trust proxy', 1);
app.use(helmet());

const origins = (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors({ origin: (origin, cb) => cb(null, !origin || origins.includes(origin)), methods: ['GET', 'POST'] }));
app.use(express.json({ limit: '20kb' }));
app.use('/api', apiLimiter);

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/stats', require('./routes/stats'));
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Tools360 API listening on port ' + port));
