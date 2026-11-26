/**
 * Row level security policies (idempotent; safe to run on every migration).
 *
 * - `app.bypass_rls = 'on'` (transaction/session setting) lets trusted system code (login,
 *   token refresh, inbound webhooks, bootstrap) work across tenants. It is only ever set by
 *   DatabaseService for code paths wrapped in runAsSystem().
 * - The tenants table is readable without a tenant context. The access check
 *   app.is_accessible_tenant() reads the tenant tree; with RLS on that read it recursed into itself.
 * - Inserts are allowed for the current tenant and its sub-tenants.
 */
export const RLS_TENANT_TABLES = [
  'users', 'teams', 'api_keys', 'sso_connections', 'projects',
  'questionnaires', 'lead_batches', 'leads', 'lead_provenance',
  'lead_consents', 'quarantine_records', 'lead_events', 'lead_scores',
  'lead_outcomes', 'buyers', 'pings', 'posts', 'waterfall_runs',
  'lead_sales', 'price_lists', 'wallets', 'ledger_entries',
  'metering_events', 'returns', 'credit_notes', 'invoices',
  'number_pools', 'campaigns', 'call_lists', 'wrapup_codes',
  'calls', 'call_recordings', 'transcripts', 'agent_sessions',
  'agent_status_log', 'callbacks', 'dnc_entries', 'outbox_events',
  'webhook_endpoints', 'webhook_deliveries', 'shifts', 'time_entries',
  'leave_requests', 'bonus_rules', 'bonus_awards', 'announcements',
  'chat_channels', 'chat_messages',
];

export const RLS_POLICY_SQL = `
CREATE SCHEMA IF NOT EXISTS app;

CREATE OR REPLACE FUNCTION app.rls_bypass() RETURNS BOOLEAN AS $$
  SELECT COALESCE(current_setting('app.bypass_rls', true), '') = 'on';
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION app.current_tenant_id() RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_tenant_id', true), '')::UUID;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION app.is_accessible_tenant(row_tenant_id UUID) RETURNS BOOLEAN AS $$
DECLARE
    cur_tenant UUID;
BEGIN
    IF app.rls_bypass() THEN
        RETURN TRUE;
    END IF;
    cur_tenant := app.current_tenant_id();
    IF cur_tenant IS NULL OR row_tenant_id IS NULL THEN
        RETURN FALSE;
    END IF;
    IF row_tenant_id = cur_tenant THEN
        RETURN TRUE;
    END IF;
    RETURN EXISTS (
        WITH RECURSIVE tenant_tree AS (
            SELECT id FROM tenants WHERE parent_tenant_id = cur_tenant
            UNION ALL
            SELECT t.id FROM tenants t INNER JOIN tenant_tree tt ON t.parent_tenant_id = tt.id
        )
        SELECT 1 FROM tenant_tree WHERE id = row_tenant_id
    );
END;
$$ LANGUAGE plpgsql STABLE;

DO $rls$
DECLARE
    tbl text;
    tables text[] := ARRAY[${RLS_TENANT_TABLES.map((t) => `'${t}'`).join(', ')}];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        IF to_regclass('public.' || tbl) IS NULL THEN
            CONTINUE;
        END IF;
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
        EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I_tenant_isolation ON %I;', tbl, tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I_tenant_insert ON %I;', tbl, tbl);
        EXECUTE format('CREATE POLICY %I_tenant_isolation ON %I FOR ALL USING (app.is_accessible_tenant(tenant_id));', tbl, tbl);
        EXECUTE format('CREATE POLICY %I_tenant_insert ON %I FOR INSERT WITH CHECK (app.is_accessible_tenant(tenant_id));', tbl, tbl);
    END LOOP;
END;
$rls$;

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenants_isolation ON tenants;
DROP POLICY IF EXISTS tenants_select ON tenants;
DROP POLICY IF EXISTS tenants_insert ON tenants;
DROP POLICY IF EXISTS tenants_update ON tenants;
DROP POLICY IF EXISTS tenants_delete ON tenants;
CREATE POLICY tenants_select ON tenants FOR SELECT USING (true);
CREATE POLICY tenants_insert ON tenants FOR INSERT WITH CHECK (app.rls_bypass() OR app.is_accessible_tenant(parent_tenant_id));
CREATE POLICY tenants_update ON tenants FOR UPDATE USING (app.rls_bypass() OR app.is_accessible_tenant(id));
CREATE POLICY tenants_delete ON tenants FOR DELETE USING (app.rls_bypass());
`;

/** Idempotent schema additions used by the application (safe to run repeatedly). */
export const SCHEMA_PATCH_SQL = `
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(150);
ALTER TABLE users ADD COLUMN IF NOT EXISTS team VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS caller_id_number VARCHAR(50);
`;
