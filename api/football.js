const API_BASE_URL = 'https://v3.football.api-sports.io';

module.exports = async function handler(req, res) {
  try {
    const rawPath = req.query?.path;
    const path = Array.isArray(rawPath) ? rawPath[0] || '' : rawPath || '';

    if (path === '__health') {
      const appUser = String(process.env.APP_GATE_USER || '').trim();
      const appPassword = String(process.env.APP_GATE_PASSWORD || '').trim();
      const apiKey = String(process.env.API_FOOTBALL_KEY || '').trim();
      const incomingUser = String(req.headers['x-app-user'] || '').trim();
      const incomingPassword = String(req.headers['x-app-password'] || '').trim();

      res.status(200).json({
        ok: true,
        env: {
          hasApiKey: Boolean(apiKey),
          hasAppUser: Boolean(appUser),
          hasAppPassword: Boolean(appPassword)
        },
        auth: {
          hasIncomingUser: Boolean(incomingUser),
          hasIncomingPassword: Boolean(incomingPassword),
          userMatches: Boolean(appUser) && incomingUser === appUser,
          passwordMatches: Boolean(appPassword) && incomingPassword === appPassword
        }
      });
      return;
    }

    const apiKey = String(process.env.API_FOOTBALL_KEY || '').trim();
    const appUser = String(process.env.APP_GATE_USER || '').trim();
    const appPassword = String(process.env.APP_GATE_PASSWORD || '').trim();

    if (!apiKey || !appUser || !appPassword) {
      res.setHeader('x-proxy-debug', 'missing-env');
      res.status(500).json({
        message: 'Missing API_FOOTBALL_KEY, APP_GATE_USER or APP_GATE_PASSWORD environment variable.'
      });
      return;
    }

    const incomingUser = String(req.headers['x-app-user'] || '').trim();
    const incomingPassword = String(req.headers['x-app-password'] || '').trim();
    if (incomingUser !== appUser || incomingPassword !== appPassword) {
      res.setHeader('x-proxy-auth', 'failed');
      res.status(401).json({ message: 'Unauthorized app credentials.' });
      return;
    }

    res.setHeader('x-proxy-auth', 'ok');

    const targetPath = path ? `/${path}` : '';
    const targetUrl = new URL(`${API_BASE_URL}${targetPath}`);

    Object.entries(req.query || {}).forEach(([key, value]) => {
      if (key === 'path') {
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((item) => targetUrl.searchParams.append(key, item));
        return;
      }
      if (value !== undefined) {
        targetUrl.searchParams.set(key, String(value));
      }
    });

    const upstream = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        'x-apisports-key': apiKey
      }
    });

    const contentType = upstream.headers.get('content-type') || 'application/json';
    const body = await upstream.text();
    res.setHeader('content-type', contentType);
    res.setHeader('cache-control', 'no-store, max-age=0');
    if (upstream.status === 401 || upstream.status === 403) {
      res.setHeader('x-upstream-auth', 'failed');
    } else {
      res.setHeader('x-upstream-auth', 'ok');
    }
    res.status(upstream.status).send(body);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown serverless error.';
    res.setHeader('x-proxy-debug', 'exception');
    res.status(500).json({ message: `Function failed: ${message}` });
  }
};
