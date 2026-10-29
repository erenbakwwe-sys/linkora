-- PostgreSQL Initial Database Setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE SCHEMA IF NOT EXISTS app;

-- Function to return current active tenant id set per transaction/session
CREATE OR REPLACE FUNCTION app.current_tenant_id() RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_tenant_id', true), '')::UUID;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to check tenant access (active tenant + descendants in hierarchy)
CREATE OR REPLACE FUNCTION app.is_accessible_tenant(row_tenant_id UUID) RETURNS BOOLEAN AS $$
DECLARE
    cur_tenant UUID;
BEGIN
    cur_tenant := app.current_tenant_id();
    IF cur_tenant IS NULL THEN
        RETURN FALSE;
    END IF;

    IF row_tenant_id = cur_tenant THEN
        RETURN TRUE;
    END IF;

    -- Recursive check for sub-companies in tenant tree
    RETURN EXISTS (
        WITH RECURSIVE tenant_tree AS (
            SELECT id FROM tenants WHERE parent_tenant_id = cur_tenant
            UNION ALL
            SELECT t.id FROM tenants t
            INNER JOIN tenant_tree tt ON t.parent_tenant_id = tt.id
        )
        SELECT 1 FROM tenant_tree WHERE id = row_tenant_id
    );
END;
$$ LANGUAGE plpgsql STABLE;
