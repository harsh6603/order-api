const { randomUUID } = require('node:crypto');

// Attaches a correlation id to every request/response for log tracing.
function requestId() {
  return (req, res, next) => {
    const incoming = req.get('x-request-id');
    req.id = incoming && /^[\w-]{1,64}$/.test(incoming) ? incoming : randomUUID();
    res.set('x-request-id', req.id);
    next();
  };
}

module.exports = { requestId };
