export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function getApiUrl(endpoint: string): string {
  const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${cleanEndpoint}`;
}
