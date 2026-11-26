import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Per-request database context.
 *
 * PostgreSQL enforces tenant isolation with FORCED row level security. Every query must therefore
 * run with `app.current_tenant_id` set (or, for a few system operations such as login and inbound
 * webhooks, with `app.bypass_rls`). The context is stored per request and applied by
 * DatabaseService.query().
 */
export interface DbContext {
  tenantId?: string;
  bypassRls?: boolean;
}

const storage = new AsyncLocalStorage<DbContext>();

export function getDbContext(): DbContext | undefined {
  return storage.getStore();
}

/** Starts a fresh (mutable) context for the current request. */
export function runWithDbContext<T>(fn: () => T, initial: DbContext = {}): T {
  return storage.run({ ...initial }, fn);
}

/** Sets the tenant of the current request (called by the auth guard). */
export function setRequestTenant(tenantId: string | undefined) {
  const store = storage.getStore();
  if (store) store.tenantId = tenantId;
}

/** Runs `fn` with a specific tenant context (nested, does not leak to the caller). */
export function runAsTenant<T>(tenantId: string, fn: () => Promise<T>): Promise<T> {
  return storage.run({ tenantId }, fn);
}

/**
 * Runs `fn` with row level security bypassed. Only for system operations that must look across
 * tenants before a tenant is known (login, token refresh, inbound partner webhooks, bootstrap).
 */
export function runAsSystem<T>(fn: () => Promise<T>): Promise<T> {
  return storage.run({ bypassRls: true }, fn);
}
