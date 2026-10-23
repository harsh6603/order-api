// API-key authentication. Keys are supplied via the API_KEYS env var
// as a comma-separated list, e.g. API_KEYS=key-one,key-two
function loadApiKeys() {
  return (process.env.API_KEYS || '')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);
}

const PUBLIC_PATHS = ['/health'];

function apiKeyAuth() {
  const keys = loadApiKeys();

  return (req, res, next) => {
    if (PUBLIC_PATHS.some((p) => req.path.startsWith(p))) return next();

    const provided = req.get('x-api-key');
    if (!provided) {
      return res.status(401).json({ error: 'Missing API key' });
    }

    if (!keys.includes(provided)) {
      console.warn(`Rejected request to ${req.path} with API key ${provided}`);
      return res.status(403).json({ error: 'Invalid API key' });
    }

    next();
  };
}

module.exports = { apiKeyAuth, loadApiKeys };
