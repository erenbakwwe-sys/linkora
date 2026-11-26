import { timingSafeEqual } from 'node:crypto';

const DEV_JWT_SECRET = 'dev-only-insecure-jwt-secret-change-me-0000000000';
const DEV_JWT_REFRESH_SECRET = 'dev-only-insecure-jwt-refresh-secret-change-me-00';

export const DEFAULT_TENANT_ID = '11111111-1111-1111-1111-111111111111';

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
}

function requireSecret(name: string, devFallback: string): string {
  const value = process.env[name];
  if (value && value.length >= 32) return value;
  if (isProduction()) {
    throw new Error(
      `${name} must be set to a random value of at least 32 characters in production.`,
    );
  }
  return value || devFallback;
}

export function getJwtSecret(): string {
  return requireSecret('JWT_SECRET', DEV_JWT_SECRET);
}

export function getJwtRefreshSecret(): string {
  return requireSecret('JWT_REFRESH_SECRET', DEV_JWT_REFRESH_SECRET);
}

/** Constant-time string comparison. */
export function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

/**
 * Partner API keys accepted by the API (configured exclusively via environment variables).
 * VIPCALL_API_KEY is deliberately NOT included: it is the credential Linkora uses to call
 * VIP Call (outbound); VIP Call's inbound webhooks authenticate with an HMAC signature.
 */
export function getPartnerApiKeys(): string[] {
  return [
    process.env.LINKORA_LIVE_API_KEY,
    process.env.LINKORA_TEST_API_KEY,
  ].filter((k): k is string => typeof k === 'string' && k.length > 0);
}

/** Tokens accepted on the Gitasis inbound webhook (configured exclusively via environment variables). */
export function getGitasisWebhookTokens(): string[] {
  return [process.env.GITASIS_WEBHOOK_SECRET, ...getPartnerApiKeys()].filter(
    (k): k is string => typeof k === 'string' && k.length > 0,
  );
}

export function matchesAny(candidate: unknown, valid: string[]): boolean {
  if (typeof candidate !== 'string' || candidate.length === 0) return false;
  let match = false;
  for (const v of valid) {
    if (safeEqual(candidate, v)) match = true;
  }
  return match;
}
