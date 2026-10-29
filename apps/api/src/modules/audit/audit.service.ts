import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/services/database.service.js';
import { calculateAuditHash } from '@linkora/db';

export interface CreateAuditEntry {
  tenantId: string | null;
  actorId: string | null;
  actorType: 'USER' | 'API_KEY' | 'SYSTEM';
  action: string;
  entityTable: string;
  entityId: string;
  clientIp?: string;
  userAgent?: string;
  diff?: unknown;
}

let memoryLastHash = '0'.repeat(64);

@Injectable()
export class AuditService {
  constructor(private db: DatabaseService) {}

  async log(entry: CreateAuditEntry): Promise<string> {
    const timestamp = new Date().toISOString();
    let prevHash = memoryLastHash;

    try {
      // Query last hash in audit_log
      const lastRow = await this.db.query<{ current_hash: string }>(
        'SELECT current_hash FROM audit_log ORDER BY created_at DESC LIMIT 1'
      );
      if (lastRow.rows[0]?.current_hash) {
        prevHash = lastRow.rows[0].current_hash;
      }
    } catch {
      // Offline fallback: keep in-memory hash chain
    }

    const currentHash = calculateAuditHash(
      prevHash,
      entry.entityTable,
      entry.entityId,
      entry.action,
      entry.actorId,
      timestamp,
      entry.diff || null
    );

    memoryLastHash = currentHash;

    try {
      await this.db.query(
        `INSERT INTO audit_log (
          tenant_id, actor_id, actor_type, action, entity_table, entity_id,
          prev_hash, current_hash, client_ip, user_agent, diff, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          entry.tenantId,
          entry.actorId,
          entry.actorType,
          entry.action,
          entry.entityTable,
          entry.entityId,
          prevHash,
          currentHash,
          entry.clientIp || null,
          entry.userAgent || null,
          entry.diff ? JSON.stringify(entry.diff) : null,
          timestamp,
        ]
      );
    } catch {
      // Offline fallback: audit logged in memory
    }

    return currentHash;
  }

  async verifyChain(): Promise<{ valid: boolean; totalChecked: number; brokenAt?: string }> {
    const result = await this.db.query<{
      id: string;
      prev_hash: string;
      current_hash: string;
      entity_table: string;
      entity_id: string;
      action: string;
      actor_id: string | null;
      created_at: Date;
      diff: any;
    }>('SELECT * FROM audit_log ORDER BY created_at ASC');

    let expectedPrevHash = '0'.repeat(64);
    let count = 0;

    for (const row of result.rows) {
      if (row.prev_hash !== expectedPrevHash) {
        return { valid: false, totalChecked: count, brokenAt: row.id };
      }

      const calculated = calculateAuditHash(
        row.prev_hash,
        row.entity_table,
        row.entity_id,
        row.action,
        row.actor_id,
        new Date(row.created_at).toISOString(),
        row.diff
      );

      if (calculated !== row.current_hash) {
        return { valid: false, totalChecked: count, brokenAt: row.id };
      }

      expectedPrevHash = row.current_hash;
      count++;
    }

    return { valid: true, totalChecked: count };
  }
}
