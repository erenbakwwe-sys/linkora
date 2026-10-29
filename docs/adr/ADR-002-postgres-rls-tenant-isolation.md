# ADR-002: Multi-Tenant Isolation via PostgreSQL Row-Level Security (RLS)

## Status
Accepted

## Context
The platform hosts multiple tenants (agencies, sub-call centers, buyers).
Cross-tenant data leakage is a critical compliance and security violation.
Two main isolation approaches exist:
1. Schema-per-tenant or DB-per-tenant: Complex migration handling across hundreds of schemas, difficult tree hierarchy aggregation.
2. Shared tables with PostgreSQL Row-Level Security (RLS): Clean single schema, strict kernel-level enforcement via `ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY`, native support for parent/child company visibility trees.

## Decision
Adopt shared schema with PostgreSQL Row-Level Security:
1. Every tenant-owned table includes `tenant_id NOT NULL REFERENCES tenants(id)`.
2. The API layer runs queries inside transactions where it sets `SET LOCAL app.current_tenant_id = '<tenant-uuid>'`.
3. RLS policies call `app.is_accessible_tenant(tenant_id)` which allows access if `tenant_id` equals the current tenant or any sub-company in the tenant hierarchy.
4. Automated integration tests continuously verify that cross-tenant queries return 0 rows.

## Consequences
- Single unified migration pipeline.
- Database itself enforces isolation regardless of ORM bugs.
- Sub-company reporting ("eigene + Unterfirmen") is natively supported via recursive SQL hierarchy.
