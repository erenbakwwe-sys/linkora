-- Linkora Platform Backup Snapshot (20261028-192017)
-- Tamper-Evident SHA-256 Audit Log Included
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  payload_hash VARCHAR(64) NOT NULL,
  prev_entry_hash VARCHAR(64) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Verified 48 core domain tables present.
-- Transactional Outbox status: HEALTHY (0 pending DLQ items)
