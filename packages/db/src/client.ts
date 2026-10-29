import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema/index.js';

const { Pool } = pg;

export function createDbPool(connectionString?: string) {
  const url = connectionString || process.env.DATABASE_URL || 'postgresql://linkora_user:linkora_password@localhost:5432/linkora_db';
  const isCloudDb = !url.includes('localhost') && !url.includes('127.0.0.1');
  const needsSsl = isCloudDb && (process.env.NODE_ENV === 'production' || url.includes('sslmode=') || process.env.DATABASE_SSL === 'true');

  return new Pool({
    connectionString: url,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}

export type DatabaseInstance = ReturnType<typeof createDbClient>;

export function createDbClient(pool?: pg.Pool) {
  const p = pool || createDbPool();
  return drizzle(p, { schema });
}
