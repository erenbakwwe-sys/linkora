import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import type pg from 'pg';
import { setTenantSession, withTenantContext } from '@linkora/db';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pgModule = require('pg');
const PoolClass = pgModule.Pool || pgModule.default?.Pool;

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  public pool!: pg.Pool;

  onModuleInit() {
    const url = process.env.DATABASE_URL || 'postgresql://linkora_user:linkora_password@localhost:5432/linkora_db';
    const isCloudDb = !url.includes('localhost') && !url.includes('127.0.0.1');
    const needsSsl = isCloudDb && (process.env.NODE_ENV === 'production' || url.includes('sslmode=') || process.env.DATABASE_SSL === 'true');

    this.pool = new PoolClass({
      connectionString: url,
      ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }

  async onModuleDestroy() {
    if (this.pool && typeof this.pool.end === 'function') {
      await this.pool.end();
    }
  }

  async query<T extends pg.QueryResultRow = any>(sql: string, params: any[] = []): Promise<pg.QueryResult<T>> {
    return this.pool.query<T>(sql, params);
  }

  async withTenant<T>(tenantId: string, fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
    return withTenantContext(this.pool, tenantId, fn);
  }

  async setClientTenant(client: pg.PoolClient, tenantId: string): Promise<void> {
    return setTenantSession(client, tenantId);
  }
}
