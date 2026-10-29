-- Linkora Unified Lead Bank + AI Call Center Platform
-- Full DB Schema Migration 0000

-- 1. Tenants Tree
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_tenant_id UUID REFERENCES tenants(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL DEFAULT 'AGENCY_PARENT',
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    minute_rate_eur NUMERIC(10, 4) NOT NULL DEFAULT 0.0400,
    low_balance_threshold_eur NUMERIC(10, 2) NOT NULL DEFAULT 10.00,
    branding JSONB NOT NULL DEFAULT '{"brand_name": "YourBrand", "primary_color": "#0b1220", "logo_url": null}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tenants_parent ON tenants(parent_tenant_id);

-- 2. Users, RBAC & Teams
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    default_mode VARCHAR(20) NOT NULL DEFAULT 'MANAGER',
    language VARCHAR(5) NOT NULL DEFAULT 'de',
    is_active BOOLEAN NOT NULL DEFAULT true,
    mfa_secret VARCHAR(255),
    mfa_enabled BOOLEAN NOT NULL DEFAULT false,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_email_per_tenant UNIQUE (tenant_id, email)
);
CREATE INDEX IF NOT EXISTS idx_users_tenant_email ON users(tenant_id, email);

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL UNIQUE,
    module VARCHAR(50) NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id, tenant_id)
);

CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_teams_tenant ON teams(tenant_id);

CREATE TABLE IF NOT EXISTS team_members (
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_lead BOOLEAN NOT NULL DEFAULT false,
    PRIMARY KEY (team_id, user_id)
);

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    key_prefix VARCHAR(16) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    scopes TEXT[] NOT NULL DEFAULT '{}',
    ip_allowlist INET[] DEFAULT NULL,
    expires_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);

CREATE TABLE IF NOT EXISTS sso_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    provider_type VARCHAR(50) NOT NULL,
    client_id VARCHAR(255) NOT NULL,
    client_secret_encrypted TEXT,
    issuer_url TEXT,
    metadata_xml TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Projects, Products & Questionnaires
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_project_slug_per_tenant UNIQUE (tenant_id, slug)
);

CREATE TABLE IF NOT EXISTS questionnaires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questionnaire_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    questionnaire_id UUID NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
    version INT NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'PUBLISHED',
    effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_questionnaire_ver UNIQUE (questionnaire_id, version)
);

CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    questionnaire_version_id UUID NOT NULL REFERENCES questionnaire_versions(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    label TEXT NOT NULL,
    input_type VARCHAR(50) NOT NULL,
    options JSONB,
    validation_rules JSONB,
    conditional_logic JSONB,
    order_index INT NOT NULL DEFAULT 0,
    is_required BOOLEAN NOT NULL DEFAULT false
);

-- 4. Leads & Ingestion
CREATE TABLE IF NOT EXISTS lead_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    file_name VARCHAR(255),
    file_hash VARCHAR(64) NOT NULL,
    channel VARCHAR(50) NOT NULL,
    total_rows INT NOT NULL DEFAULT 0,
    accepted_rows INT NOT NULL DEFAULT 0,
    quarantined_rows INT NOT NULL DEFAULT 0,
    duplicate_rows INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_batch_hash_per_tenant UNIQUE (tenant_id, file_hash)
);

CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES lead_batches(id),
    project_id UUID NOT NULL REFERENCES projects(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_raw VARCHAR(50) NOT NULL,
    phone_e164 VARCHAR(20) NOT NULL,
    phone_country VARCHAR(2) NOT NULL DEFAULT 'DE',
    line_type VARCHAR(20) DEFAULT 'UNKNOWN',
    email VARCHAR(255),
    postal_code VARCHAR(20),
    city VARCHAR(100),
    street VARCHAR(150),
    house_number VARCHAR(20),
    status VARCHAR(50) NOT NULL DEFAULT 'NEW',
    consent_verified BOOLEAN NOT NULL DEFAULT false,
    dnc_flag BOOLEAN NOT NULL DEFAULT false,
    extra_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_leads_tenant_status ON leads(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(tenant_id, phone_e164);

CREATE TABLE IF NOT EXISTS lead_provenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    source VARCHAR(100) NOT NULL,
    campaign_name VARCHAR(150),
    opt_in_timestamp TIMESTAMPTZ NOT NULL,
    ip_address INET,
    landing_page_url TEXT,
    consent_text TEXT NOT NULL,
    consent_version VARCHAR(50),
    consent_channel VARCHAR(50) NOT NULL,
    proof_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lead_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    consent_type VARCHAR(50) NOT NULL,
    channel VARCHAR(50) NOT NULL,
    granted_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    is_valid BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lead_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
    questionnaire_version_id UUID NOT NULL REFERENCES questionnaire_versions(id) ON DELETE RESTRICT,
    value_raw TEXT,
    value_normalized JSONB,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_lead_question UNIQUE (lead_id, question_id)
);

CREATE TABLE IF NOT EXISTS quarantine_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES lead_batches(id),
    raw_data JSONB NOT NULL,
    error_reasons JSONB NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_REVIEW',
    resolved_lead_id UUID REFERENCES leads(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS lead_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    actor_id UUID,
    actor_type VARCHAR(50) NOT NULL,
    payload JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lead_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    model_id VARCHAR(100) NOT NULL,
    prompt_version VARCHAR(50) NOT NULL,
    inputs_hash VARCHAR(64) NOT NULL,
    confidence NUMERIC(5, 4) NOT NULL,
    score_0_100 NUMERIC(5, 2) NOT NULL,
    score_band VARCHAR(10) NOT NULL,
    explanation JSONB NOT NULL,
    is_fallback BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lead_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    outcome_type VARCHAR(50) NOT NULL,
    score_at_outcome NUMERIC(5, 2),
    score_band_at_outcome VARCHAR(10),
    feedback_reason TEXT,
    closed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Buyers & Sales
CREATE TABLE IF NOT EXISTS buyers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    company_identifier VARCHAR(100),
    ping_endpoint TEXT,
    post_endpoint TEXT,
    signing_secret VARCHAR(255) NOT NULL,
    ping_enabled BOOLEAN NOT NULL DEFAULT false,
    daily_cap INT NOT NULL DEFAULT 50,
    monthly_cap INT NOT NULL DEFAULT 1000,
    return_window_days INT NOT NULL DEFAULT 7,
    max_return_rate_percent NUMERIC(5, 2) NOT NULL DEFAULT 15.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS buyer_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
    regions TEXT[] NOT NULL DEFAULT '{}',
    min_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    max_score NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    age_min INT,
    age_max INT,
    exclusivity_required VARCHAR(50) NOT NULL DEFAULT 'EXCLUSIVE',
    priority_weight INT NOT NULL DEFAULT 100,
    is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS pings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
    payload_masked JSONB NOT NULL,
    response_status INT,
    bid_amount NUMERIC(10, 2),
    accepted BOOLEAN NOT NULL DEFAULT false,
    latency_ms INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
    ping_id UUID REFERENCES pings(id),
    payload_full JSONB NOT NULL,
    response_status INT,
    accepted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS waterfall_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    attempt_number INT NOT NULL,
    buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
    outcome VARCHAR(50) NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lead_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE RESTRICT,
    sale_price NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    exclusivity VARCHAR(50) NOT NULL DEFAULT 'EXCLUSIVE',
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    sold_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    return_status VARCHAR(50) NOT NULL DEFAULT 'NONE',
    return_window_expires_at TIMESTAMPTZ NOT NULL,
    metadata JSONB DEFAULT '{}'
);

-- 6. Financials & Ledger
CREATE TABLE IF NOT EXISTS price_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    effective_to TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS price_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    price_list_id UUID NOT NULL REFERENCES price_lists(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id),
    buyer_id UUID REFERENCES buyers(id),
    score_band VARCHAR(10),
    base_price NUMERIC(10, 2) NOT NULL,
    floor_price NUMERIC(10, 2) NOT NULL,
    ceiling_price NUMERIC(10, 2) NOT NULL,
    priority INT NOT NULL DEFAULT 10
);

CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
    balance NUMERIC(12, 4) NOT NULL DEFAULT 0.0000,
    credit_limit NUMERIC(12, 4) NOT NULL DEFAULT 0.0000,
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    is_locked BOOLEAN NOT NULL DEFAULT false,
    auto_dial_disabled BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
    tx_type VARCHAR(50) NOT NULL,
    amount NUMERIC(12, 4) NOT NULL,
    balance_after NUMERIC(12, 4) NOT NULL,
    reference_type VARCHAR(50) NOT NULL,
    reference_id UUID,
    idempotency_key VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS metering_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    unit_price NUMERIC(10, 4) NOT NULL,
    total_amount NUMERIC(12, 4) NOT NULL,
    idempotency_key VARCHAR(100) NOT NULL UNIQUE,
    reference_id UUID,
    processed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    lead_sale_id UUID NOT NULL REFERENCES lead_sales(id) ON DELETE RESTRICT,
    buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE RESTRICT,
    reason_code VARCHAR(50) NOT NULL,
    reason_detail TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'APPROVED',
    ledger_entry_id UUID REFERENCES ledger_entries(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS credit_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE RESTRICT,
    return_id UUID REFERENCES returns(id) ON DELETE RESTRICT,
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    credit_note_number VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    tax_amount NUMERIC(12, 2) NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ISSUED',
    pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Campaigns, Dialer, Calls
CREATE TABLE IF NOT EXISTS number_pools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    rotation_days INT NOT NULL DEFAULT 7
);

CREATE TABLE IF NOT EXISTS pool_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_id UUID NOT NULL REFERENCES number_pools(id) ON DELETE CASCADE,
    e164_number VARCHAR(20) NOT NULL,
    reputation_score INT NOT NULL DEFAULT 100,
    total_calls INT NOT NULL DEFAULT 0,
    answered_calls INT NOT NULL DEFAULT 0,
    is_quarantined BOOLEAN NOT NULL DEFAULT false,
    last_rotated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    dialing_mode VARCHAR(50) NOT NULL DEFAULT 'PROGRESSIVE',
    pacing_tempo INT NOT NULL DEFAULT 5,
    max_abandon_rate NUMERIC(5, 2) NOT NULL DEFAULT 3.00,
    min_free_agents INT NOT NULL DEFAULT 1,
    caller_pool_id UUID REFERENCES number_pools(id),
    ring_timeout INT NOT NULL DEFAULT 30,
    retry_rules JSONB NOT NULL DEFAULT '{"max_attempts": 5, "retry_intervals_min": [30, 120, 360]}',
    calling_window JSONB NOT NULL DEFAULT '{"start": "09:00", "end": "20:00", "timezone": "Europe/Berlin"}',
    amd_active BOOLEAN NOT NULL DEFAULT true,
    recording_active BOOLEAN NOT NULL DEFAULT true,
    status VARCHAR(50) NOT NULL DEFAULT 'STOPPED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS call_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    total_leads INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS call_list_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_list_id UUID NOT NULL REFERENCES call_lists(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    priority INT NOT NULL DEFAULT 0,
    attempts INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    next_attempt_at TIMESTAMPTZ,
    CONSTRAINT uq_list_lead UNIQUE (call_list_id, lead_id)
);

CREATE TABLE IF NOT EXISTS wrapup_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    label VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    counts_as_conversion BOOLEAN NOT NULL DEFAULT false,
    isActive BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id),
    lead_id UUID REFERENCES leads(id),
    agent_id UUID REFERENCES users(id),
    telephony_provider VARCHAR(50) NOT NULL,
    provider_call_id VARCHAR(100),
    direction VARCHAR(20) NOT NULL DEFAULT 'OUTBOUND',
    caller_number VARCHAR(30) NOT NULL,
    callee_number VARCHAR(30) NOT NULL,
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    answer_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    duration_seconds INT DEFAULT 0,
    billable_seconds INT DEFAULT 0,
    wrapup_code_id UUID REFERENCES wrapup_codes(id),
    amd_result VARCHAR(50),
    cost_eur NUMERIC(10, 4) DEFAULT 0.0000,
    mos_score NUMERIC(3, 2),
    jitter_ms INT,
    packet_loss_percent NUMERIC(5, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS call_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    s3_bucket VARCHAR(100) NOT NULL,
    s3_key TEXT NOT NULL,
    duration_seconds INT NOT NULL,
    channels_count INT NOT NULL DEFAULT 2,
    is_consented BOOLEAN NOT NULL DEFAULT true,
    retain_until DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    language VARCHAR(5) NOT NULL,
    diarization JSONB NOT NULL,
    masked_text TEXT NOT NULL,
    quality_score NUMERIC(5, 2),
    compliance_flags JSONB DEFAULT '{}',
    objection_tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    client_ip INET,
    user_agent TEXT
);

CREATE TABLE IF NOT EXISTS agent_status_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES agent_sessions(id),
    status VARCHAR(50) NOT NULL,
    pause_reason VARCHAR(100),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_seconds INT
);

CREATE TABLE IF NOT EXISTS callbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    assigned_user_id UUID REFERENCES users(id),
    scheduled_at TIMESTAMPTZ NOT NULL,
    timezone VARCHAR(50) NOT NULL DEFAULT 'Europe/Berlin',
    notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dnc_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    scope VARCHAR(50) NOT NULL DEFAULT 'TENANT',
    phone_e164 VARCHAR(20) NOT NULL,
    reason TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_dnc_entry UNIQUE (tenant_id, phone_e164)
);

-- 8. Audit Log & Outbox
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    actor_id UUID,
    actor_type VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_table VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    prev_hash VARCHAR(64) NOT NULL,
    current_hash VARCHAR(64) NOT NULL,
    client_ip INET,
    user_agent TEXT,
    diff JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS outbox_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    secret_hash VARCHAR(255) NOT NULL,
    event_types TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    endpoint_id UUID NOT NULL REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    signature VARCHAR(255) NOT NULL,
    response_code INT,
    response_body TEXT,
    attempt INT NOT NULL DEFAULT 1,
    next_retry_at TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Operations, HR, Rota & Chat
CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED'
);

CREATE TABLE IF NOT EXISTS time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    clock_in TIMESTAMPTZ NOT NULL,
    clock_out TIMESTAMPTZ,
    break_minutes INT NOT NULL DEFAULT 0,
    total_minutes INT,
    approved_by UUID REFERENCES users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING'
);

CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    leave_type VARCHAR(50) NOT NULL,
    reason TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    approved_by UUID REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS bonus_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    reward_amount NUMERIC(10, 2) NOT NULL,
    condition TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS bonus_awards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bonus_rule_id UUID NOT NULL REFERENCES bonus_rules(id) ON DELETE RESTRICT,
    amount NUMERIC(10, 2) NOT NULL,
    reference_id UUID,
    awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcement_reads (
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (announcement_id, user_id)
);

CREATE TABLE IF NOT EXISTS chat_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100),
    type VARCHAR(20) NOT NULL DEFAULT 'DIRECT',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_channel_members (
    channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (channel_id, user_id)
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable and Force RLS on all tenant-owned tables
DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
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
        'chat_channels', 'chat_messages'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
        EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY;', tbl);
        
        -- Drop existing policies if any
        EXECUTE format('DROP POLICY IF EXISTS %I_tenant_isolation ON %I;', tbl, tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I_tenant_insert ON %I;', tbl, tbl);

        -- Create RLS SELECT, UPDATE, DELETE policy
        EXECUTE format('
            CREATE POLICY %I_tenant_isolation ON %I
            FOR ALL USING (app.is_accessible_tenant(tenant_id));
        ', tbl, tbl);

        -- Create RLS INSERT policy
        EXECUTE format('
            CREATE POLICY %I_tenant_insert ON %I
            FOR INSERT WITH CHECK (tenant_id = app.current_tenant_id());
        ', tbl, tbl);
    END LOOP;
END;
$$;

-- RLS on tenants table itself (can read self and descendants)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenants_isolation ON tenants;
CREATE POLICY tenants_isolation ON tenants
    FOR SELECT USING (app.is_accessible_tenant(id));

-- Hard database immutability: Revoke UPDATE and DELETE on tamper-evident tables
REVOKE UPDATE, DELETE ON ledger_entries FROM PUBLIC;
REVOKE UPDATE, DELETE ON audit_log FROM PUBLIC;
REVOKE UPDATE, DELETE ON lead_scores FROM PUBLIC;
