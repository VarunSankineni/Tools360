/* Last-resort error handler: logs details, returns a generic message. */
module.exports = function errorHandler(err, _req, res, _next) {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong. Please try again later.' });
};
