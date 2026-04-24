const API_BASE_URL = 'https://v3.football.api-sports.io';

type QueryValue = string | string[] | undefined;
type RequestLike = {
  headers: Record<string, string | string[] | undefined>;
  query?: Record<string, QueryValue>;
  url?: string;
};
type ResponseLike = {
  status: (code: number) => ResponseLike;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
  send: (body: string) => void;
};

export default async function handler(req: RequestLike, res: ResponseLike): Promise<void> {
  try {
    const rawPath = req.query?.['path'];
    const pathParts = Array.isArray(rawPath) ? rawPath : rawPath ? [rawPath] : [];
    const targetPath = pathParts.join('/');

    if (targetPath === '__health') {
      const appUser = process.env['APP_GATE_USER'];
      const appPassword = process.env['APP_GATE_PASSWORD'];
      const apiKey = process.env['API_FOOTBALL_KEY'];
      const incomingUser = String(req.headers['x-app-user'] ?? '');
      const incomingPassword = String(req.headers['x-app-password'] ?? '');

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

    const apiKey = process.env['API_FOOTBALL_KEY'];
    const appUser = process.env['APP_GATE_USER'];
    const appPassword = process.env['APP_GATE_PASSWORD'];

    if (!apiKey || !appUser || !appPassword) {
      res.status(500).json({
        message: 'Missing API_FOOTBALL_KEY, APP_GATE_USER or APP_GATE_PASSWORD environment variable.'
      });
      return;
    }

    const incomingUser = String(req.headers['x-app-user'] ?? '');
    const incomingPassword = String(req.headers['x-app-password'] ?? '');
    if (incomingUser !== appUser || incomingPassword !== appPassword) {
      res.status(401).json({ message: 'Unauthorized app credentials.' });
      return;
    }

    const targetUrl = new URL(`${API_BASE_URL}/${targetPath}`);

    Object.entries(req.query ?? {}).forEach(([key, value]) => {
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

    const contentType = upstream.headers.get('content-type') ?? 'application/json';
    const body = await upstream.text();
    res.setHeader('content-type', contentType);
    res.setHeader('cache-control', 'no-store, max-age=0');
    res.status(upstream.status).send(body);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown serverless error.';
    res.status(500).json({ message: `Function failed: ${message}` });
  }
}
