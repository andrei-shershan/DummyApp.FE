import { BFF_HOST } from '../config';

interface FetchOptions extends RequestInit {
  data?: unknown;
}

async function parseJson(response: Response) {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Failed to parse server response as JSON.');
  }
}

export async function fetchClient<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { data, headers, ...rest } = options;
  const url = path.startsWith('http') ? path : `${BFF_HOST}${path}`;

  const requestHeaders = new Headers(headers ?? {});
  if (data !== undefined) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    credentials: 'include',
    headers: requestHeaders,
    ...rest,
    body: data !== undefined ? JSON.stringify(data) : rest.body,
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      const loginUrl = `${BFF_HOST}/login?returnUrl=${encodeURIComponent(window.location.href)}`;
      window.location.replace(loginUrl);
      throw new Error('Authentication required. Redirecting to login.');
    }

    const errorPayload = await parseJson(response).catch(() => null);
    const message = errorPayload?.message || response.statusText || 'Unexpected error from server.';
    throw new Error(message);
  }

  return (await parseJson(response)) as T;
}
