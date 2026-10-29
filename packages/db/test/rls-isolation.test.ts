import pg from 'pg';
import { runMigrations } from '../src/migrate.js';
import { runSeed } from '../src/seed/seed.js';
import { setTenantSession } from '../src/rls.js';

const { Pool } = pg;

export async function testRlsIsolation() {
  console.log('--- RUNNING RLS ISOLATION INTEGRATION TEST ---');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://linkora_user:linkora_password@localhost:5432/linkora_db',
  });

  const tenantA = '11111111-1111-1111-1111-111111111111'; // Lead-Kontackt (Parent)
  const tenantSub = '22222222-2222-2222-2222-222222222222'; // CC Izmir (Child of A)
  const tenantB = '33333333-3333-3333-3333-333333333333'; // Solar Direkt (Unrelated)

  const client = await pool.connect();
  try {
    // 1. Run migrations and seed
    await runMigrations(pool);
    await runSeed(pool);

    // 2. Insert test lead for Tenant A
    await client.query('BEGIN');
    await setTenantSession(client, tenantA);
    const pvProjectA = (await client.query("SELECT id FROM projects WHERE tenant_id = $1 LIMIT 1", [tenantA])).rows[0].id;
    
    const leadARes = await client.query(
      `INSERT INTO leads (tenant_id, project_id, first_name, last_name, phone_raw, phone_e164, status)
       VALUES ($1, $2, 'Max', 'Mustermann', '01711234567', '+491711234567', 'NEW')
       RETURNING id`,
      [tenantA, pvProjectA]
    );
    const leadAId = leadARes.rows[0].id;
    await client.query('COMMIT');
    console.log(`✓ Lead created for Tenant A: ${leadAId}`);

    // 3. Insert test lead for Tenant B
    await client.query('BEGIN');
    await setTenantSession(client, tenantB);
    
    // Create a project for Tenant B first
    const projBRes = await client.query(
      `INSERT INTO projects (tenant_id, name, slug)
       VALUES ($1, 'Solar Project B', 'solar-b')
       RETURNING id`,
      [tenantB]
    );
    const projBId = projBRes.rows[0].id;

    const leadBRes = await client.query(
      `INSERT INTO leads (tenant_id, project_id, first_name, last_name, phone_raw, phone_e164, status)
       VALUES ($1, $2, 'Erika', 'Musterfrau', '01729876543', '+491729876543', 'NEW')
       RETURNING id`,
      [tenantB, projBId]
    );
    const leadBId = leadBRes.rows[0].id;
    await client.query('COMMIT');
    console.log(`✓ Lead created for Tenant B: ${leadBId}`);

    // 4. TEST CROSS-TENANT READ: Query as Tenant B
    await client.query('BEGIN');
    await setTenantSession(client, tenantB);
    const queryB = await client.query('SELECT * FROM leads WHERE id = $1', [leadAId]);
    await client.query('COMMIT');

    if (queryB.rows.length !== 0) {
      throw new Error(`RLS LEAK! Tenant B was able to read Tenant A's lead ${leadAId}`);
    }
    console.log("✓ PROOF: Tenant B query for Tenant A's lead returned 0 rows (cross-tenant leak impossible)");

    // 5. TEST CROSS-TENANT READ: Query as Tenant A
    await client.query('BEGIN');
    await setTenantSession(client, tenantA);
    const queryA = await client.query('SELECT * FROM leads WHERE id = $1', [leadBId]);
    await client.query('COMMIT');

    if (queryA.rows.length !== 0) {
      throw new Error(`RLS LEAK! Tenant A was able to read Tenant B's lead ${leadBId}`);
    }
    console.log("✓ PROOF: Tenant A query for Tenant B's lead returned 0 rows (cross-tenant leak impossible)");

    // 6. TEST UNSET CONTEXT (NULL): should return 0 rows
    await client.query('BEGIN');
    await client.query("RESET app.current_tenant_id");
    const queryNull = await client.query('SELECT * FROM leads');
    await client.query('COMMIT');

    if (queryNull.rows.length !== 0) {
      throw new Error('RLS LEAK! Unauthenticated query without tenant context returned rows');
    }
    console.log('✓ PROOF: Query without active tenant session returned 0 rows');

    console.log('--- ALL RLS ISOLATION TESTS PASSED PERFECTLY ---');
    return true;
  } finally {
    client.release();
    await pool.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testRlsIsolation().catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
  });
}
