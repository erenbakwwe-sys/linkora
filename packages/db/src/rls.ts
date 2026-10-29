import type * as pg from 'pg';
import * as crypto from 'node:crypto';

/**
 * Sets the active tenant context in PostgreSQL session for the current transaction
 */
export async function setTenantSession(client: pg.PoolClient, tenantId: string): Promise<void> {
  // Use parameterized identifier or sanitized UUID to prevent SQL injection
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tenantId)) {
    throw new Error(`Invalid tenant ID format: ${tenantId}`);
  }
  await client.query(`SET LOCAL app.current_tenant_id = '${tenantId}'`);
}

/**
 * Executes a callback within a tenant-scoped transaction
 */
export async function withTenantContext<T>(
  pool: pg.Pool,
  tenantId: string,
  fn: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await setTenantSession(client, tenantId);
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Generates next hash in the tamper-evident audit log chain
 */
export function calculateAuditHash(
  prevHash: string,
  entityTable: string,
  entityId: string,
  action: string,
  actorId: string | null,
  timestamp: string,
  diff: unknown
): string {
  const content = `${prevHash}|${entityTable}|${entityId}|${action}|${actorId || 'null'}|${timestamp}|${JSON.stringify(diff)}`;
  return crypto.createHash('sha256').update(content).digest('hex');
}
