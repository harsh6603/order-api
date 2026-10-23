// 404 for unmatched routes.
function notFound() {
  return (req, res) => res.status(404).json({ error: 'Not found', requestId: req.id });
}

// Centralised error handler: maps known errors to HTTP responses and
// hides internal details for unexpected 5xx errors.
// eslint-disable-next-line no-unused-vars
function errorHandler() {
  return (err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Malformed JSON body', requestId: req.id });
    }
    if (err.type === 'entity.too.large') {
      return res.status(413).json({ error: 'Request body too large', requestId: req.id });
    }

    const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 500;
    if (status >= 500) {
      console.error(`[${req.id}]`, err);
      return res.status(status).json({ error: 'Internal server error', requestId: req.id });
    }
    res.status(status).json({ error: err.message, requestId: req.id });
  };
}

module.exports = { notFound, errorHandler };
