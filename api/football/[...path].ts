const API_BASE_URL = 'https://v3.football.api-sports.io';

type QueryValue = string | string[] | undefined;
type RequestLike = {
  headers: Record<string, string | string[] | undefined>;
  query: Record<string, QueryValue>;
};
type ResponseLike = {
  status: (code: number) => ResponseLike;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
  send: (body: string) => void;
};

export default async function handler(req: RequestLike, res: ResponseLike): Promise<void> {
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

  const rawPath = req.query['path'];
  const pathParts = Array.isArray(rawPath) ? rawPath : rawPath ? [rawPath] : [];
  const targetPath = pathParts.join('/');
  const targetUrl = new URL(`${API_BASE_URL}/${targetPath}`);

  Object.entries(req.query).forEach(([key, value]) => {
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
  res.setHeader('cache-control', 'public, s-maxage=15, stale-while-revalidate=30');
  res.status(upstream.status).send(body);
}
