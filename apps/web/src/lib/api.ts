/**
 * Base URL and endpoint resolver for the Linkora API.
 *
 * In Vercel Services mode:
 * - Server functions/actions receive `process.env.API_URL` injected via service bindings.
 * - Client-side browser code makes requests to `/api/...`, which are routed directly
 *   to the `api` service by top-level Vercel rewrites (or proxied by Next.js in local dev).
 */
export const API_URL =
  process.env.API_URL ||
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3001';

export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (typeof window === 'undefined') {
    const base = (
      process.env.API_URL ||
      process.env.BACKEND_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:3001'
    ).replace(/\/$/, '');
    return `${base}${cleanEndpoint}`;
  }

  return cleanEndpoint;
}
