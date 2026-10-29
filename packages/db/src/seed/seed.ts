import pg from 'pg';
import crypto from 'node:crypto';
import { SEEDED_PRODUCTS } from '@linkora/shared';

const { Pool } = pg;

export async function hashPassword(password: string): Promise<string> {
  const salt = 'linkora-secure-salt-2026';
  return crypto.scryptSync(password, salt, 32).toString('hex');
}

export async function runSeed(pool?: pg.Pool) {
  const p = pool || new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://linkora_user:linkora_password@localhost:5432/linkora_db',
  });

  const client = await p.connect();
  try {
    console.log('Seeding initial data...');
    await client.query('BEGIN');

    // 1. Tenants
    const rootTenantId = '00000000-0000-0000-0000-000000000001';
    const parentTenantId = '11111111-1111-1111-1111-111111111111';
    const subTenantId = '22222222-2222-2222-2222-222222222222';
    const unrelatedTenantId = '33333333-3333-3333-3333-333333333333';

    await client.query(`
      INSERT INTO tenants (id, parent_tenant_id, name, slug, type, currency, minute_rate_eur, low_balance_threshold_eur, branding)
      VALUES 
        ('${rootTenantId}', NULL, 'Linkora Platform', 'platform-root', 'ROOT', 'EUR', 0.0400, 10.00, '{"brand_name": "Linkora", "primary_color": "#0b1220"}'),
        ('${parentTenantId}', NULL, 'Lead-Kontackt GmbH', 'lead-kontackt', 'AGENCY_PARENT', 'EUR', 0.0400, 10.00, '{"brand_name": "Lead-Kontackt", "primary_color": "#0b1220"}'),
        ('${subTenantId}', '${parentTenantId}', 'Call-Center Izmir', 'cc-izmir', 'CALL_CENTER_SUB', 'EUR', 0.0400, 10.00, '{"brand_name": "CC-Izmir", "primary_color": "#0b1220"}'),
        ('${unrelatedTenantId}', NULL, 'Solar Direkt GmbH', 'solar-direkt', 'AGENCY_PARENT', 'EUR', 0.0400, 10.00, '{"brand_name": "Solar Direkt", "primary_color": "#0b1220"}')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 2. Wallets (Lead-Kontackt set to 10.00 EUR low balance trigger)
    await client.query(`
      INSERT INTO wallets (tenant_id, balance, credit_limit, currency)
      VALUES
        ('${rootTenantId}', 1000.00, 0, 'EUR'),
        ('${parentTenantId}', 10.00, 0, 'EUR'),
        ('${subTenantId}', 50.00, 0, 'EUR'),
        ('${unrelatedTenantId}', 500.00, 0, 'EUR')
      ON CONFLICT (tenant_id) DO NOTHING;
    `);

    // 3. Roles
    await client.query(`
      INSERT INTO roles (id, name, slug, description, is_system)
      VALUES
        ('aaaaaaaa-0000-0000-0000-000000000001', 'Super Administrator', 'SUPER_ADMIN', 'Platform global super administrator', true),
        ('aaaaaaaa-0000-0000-0000-000000000002', 'Company Administrator', 'COMPANY_ADMIN', 'Full control over company and sub-companies', true),
        ('aaaaaaaa-0000-0000-0000-000000000003', 'Teamleiter', 'TEAM_LEAD', 'Supervises agents and campaigns', true),
        ('aaaaaaaa-0000-0000-0000-000000000004', 'Agent', 'AGENT', 'Call center telephone agent', true),
        ('aaaaaaaa-0000-0000-0000-000000000005', 'QC-Reviewer', 'QC_REVIEWER', 'Evaluates call recordings and lead quality', true),
        ('aaaaaaaa-0000-0000-0000-000000000006', 'Lead-Partner', 'LEAD_PARTNER', 'External call center selling leads', true),
        ('aaaaaaaa-0000-0000-0000-000000000007', 'Buyer', 'BUYER', 'Company purchasing qualified leads', true)
      ON CONFLICT (id) DO NOTHING;
    `);

    // 4. Teams
    const teamIzmirId = 'bbbbbbbb-0000-0000-0000-000000000001';
    await client.query(`
      INSERT INTO teams (id, tenant_id, name, description)
      VALUES ('${teamIzmirId}', '${subTenantId}', 'Outbound Team A', 'Primary German speaking outbound team')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 5. Users
    const pwdHash = await hashPassword('Admin123!');

    await client.query(`
      INSERT INTO users (id, tenant_id, email, password_hash, first_name, last_name, default_mode, language)
      VALUES
        ('99999999-0000-0000-0000-000000000001', '${rootTenantId}', 'super@yourbrand.com', '${pwdHash}', 'Root', 'SuperAdmin', 'MANAGER', 'de'),
        ('99999999-0000-0000-0000-000000000002', '${parentTenantId}', 'admin@lead-kontackt.de', '${pwdHash}', 'Admin', 'LeadKontackt', 'MANAGER', 'de'),
        ('99999999-0000-0000-0000-000000000003', '${subTenantId}', 'admin@cc-izmir.com', '${pwdHash}', 'Kemal', 'Yilmaz', 'MANAGER', 'tr'),
        ('99999999-0000-0000-0000-000000000004', '${subTenantId}', 'teamlead@cc-izmir.com', '${pwdHash}', 'Serkan', 'Demir', 'MANAGER', 'tr'),
        ('99999999-0000-0000-0000-000000000005', '${subTenantId}', 'umut@cc-izmir.com', '${pwdHash}', 'Umut', 'Kaya', 'AGENT', 'de'),
        ('99999999-0000-0000-0000-000000000006', '${subTenantId}', 'eren@cc-izmir.com', '${pwdHash}', 'Erensamsun', 'Aydin', 'AGENT', 'de'),
        ('99999999-0000-0000-0000-000000000007', '${parentTenantId}', 'qc@lead-kontackt.de', '${pwdHash}', 'Birgit', 'Schneider', 'MANAGER', 'de'),
        ('99999999-0000-0000-0000-000000000008', '${unrelatedTenantId}', 'admin@solardirekt.de', '${pwdHash}', 'Hans', 'Meyer', 'MANAGER', 'de')
      ON CONFLICT (id) DO NOTHING;
    `);

    // Assign Roles
    await client.query(`
      INSERT INTO user_roles (user_id, role_id, tenant_id)
      VALUES
        ('99999999-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', '${rootTenantId}'),
        ('99999999-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000002', '${parentTenantId}'),
        ('99999999-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000002', '${subTenantId}'),
        ('99999999-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000003', '${subTenantId}'),
        ('99999999-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000004', '${subTenantId}'),
        ('99999999-0000-0000-0000-000000000006', 'aaaaaaaa-0000-0000-0000-000000000004', '${subTenantId}'),
        ('99999999-0000-0000-0000-000000000007', 'aaaaaaaa-0000-0000-0000-000000000005', '${parentTenantId}'),
        ('99999999-0000-0000-0000-000000000008', 'aaaaaaaa-0000-0000-0000-000000000002', '${unrelatedTenantId}')
      ON CONFLICT DO NOTHING;
    `);

    // 6. Seed 8 Standard Projects & Questionnaires
    console.log('Seeding 8 standard products and versioned questionnaires...');
    const projectMap: Record<string, { id: string; questId: string; versionId: string }> = {};

    for (let i = 0; i < SEEDED_PRODUCTS.length; i++) {
      const prod = SEEDED_PRODUCTS[i];
      const projId = `cccccccc-0000-0000-0000-${(i + 1).toString().padStart(12, '0')}`;
      const questId = `dddddddd-0000-0000-0000-${(i + 1).toString().padStart(12, '0')}`;
      const versionId = `eeeeeeee-0000-0000-0000-${(i + 1).toString().padStart(12, '0')}`;

      projectMap[prod.slug] = { id: projId, questId, versionId };

      await client.query(`
        INSERT INTO projects (id, tenant_id, name, slug, description, icon)
        VALUES ('${projId}', '${parentTenantId}', '${prod.name}', '${prod.slug}', '${prod.description}', '${prod.icon}')
        ON CONFLICT (id) DO NOTHING;
      `);

      await client.query(`
        INSERT INTO questionnaires (id, project_id, tenant_id, name)
        VALUES ('${questId}', '${projId}', '${parentTenantId}', 'Standardfragebogen ${prod.name}')
        ON CONFLICT (id) DO NOTHING;
      `);

      await client.query(`
        INSERT INTO questionnaire_versions (id, questionnaire_id, version, status)
        VALUES ('${versionId}', '${questId}', 1, 'PUBLISHED')
        ON CONFLICT (id) DO NOTHING;
      `);

      // Seed Questions
      for (let qIdx = 0; qIdx < prod.questions.length; qIdx++) {
        const q = prod.questions[qIdx];
        const qId = `ffffffff-${(i + 1).toString().padStart(4, '0')}-0000-0000-${(qIdx + 1).toString().padStart(12, '0')}`;
        await client.query(`
          INSERT INTO questions (id, questionnaire_version_id, code, label, input_type, options, order_index, is_required)
          VALUES (
            '${qId}',
            '${versionId}',
            '${q.code}',
            '${q.label.replace(/'/g, "''")}',
            '${q.inputType}',
            ${q.options ? `'${JSON.stringify(q.options)}'::jsonb` : 'NULL'},
            ${q.orderIndex},
            ${q.isRequired}
          )
          ON CONFLICT (id) DO NOTHING;
        `);
      }
    }

    // 7. Wrapup Codes
    const pvProj = projectMap['photovoltaik'];
    await client.query(`
      INSERT INTO wrapup_codes (tenant_id, project_id, code, label, category, counts_as_conversion)
      VALUES
        ('${parentTenantId}', '${pvProj.id}', 'TERM_VEREINBART', 'Termin vereinbart', 'POSITIVE', true),
        ('${parentTenantId}', '${pvProj.id}', 'RUECKRUF_GEWUENSCHT', 'Rückruf gewünscht', 'RETRY', false),
        ('${parentTenantId}', '${pvProj.id}', 'NICHT_ERREICHT', 'Nicht erreicht / Mailbox', 'RETRY', false),
        ('${parentTenantId}', '${pvProj.id}', 'KEIN_INTERESSE', 'Kein Interesse', 'NEGATIVE', false),
        ('${parentTenantId}', '${pvProj.id}', 'SPERRE_DNC', 'Keine weiteren Anrufe erwünscht (DNC)', 'DNC', false)
      ON CONFLICT DO NOTHING;
    `);

    // 8. DNC Entries (Suppression List)
    await client.query(`
      INSERT INTO dnc_entries (id, tenant_id, scope, phone_e164, reason)
      VALUES
        ('12121212-0000-0000-0000-000000000001', '${parentTenantId}', 'TENANT', '+491709999999', 'Customer requested telephone block via Robinson list')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 9. Sample Leads with Provenance, Consents, and Events
    const lead1Id = '77777777-0000-0000-0000-000000000001';
    const lead2Id = '77777777-0000-0000-0000-000000000002';
    const lead3Id = '77777777-0000-0000-0000-000000000003';
    const lead4Id = '77777777-0000-0000-0000-000000000004';

    // Lead 1: Photovoltaik - CONFIRMED with full consent
    await client.query(`
      INSERT INTO leads (id, tenant_id, project_id, first_name, last_name, phone_raw, phone_e164, phone_country, line_type, email, postal_code, city, street, house_number, status, consent_verified, dnc_flag)
      VALUES (
        '${lead1Id}',
        '${parentTenantId}',
        '${pvProj.id}',
        'Maximilian',
        'Weber',
        '0171 4567890',
        '+491714567890',
        'DE',
        'MOBILE',
        'm.weber@beispiel-solar.de',
        '80331',
        'München',
        'Sendlinger Str.',
        '14',
        'CONFIRMED',
        true,
        false
      )
      ON CONFLICT (id) DO NOTHING;
    `);

    // Lead 1 Provenance
    await client.query(`
      INSERT INTO lead_provenance (id, lead_id, tenant_id, source, campaign_name, opt_in_timestamp, ip_address, landing_page_url, consent_text, consent_version, consent_channel)
      VALUES (
        '88888888-0000-0000-0000-000000000001',
        '${lead1Id}',
        '${parentTenantId}',
        'Google Ads Search',
        'PV_Muenchen_Q4',
        NOW() - INTERVAL '2 days',
        '194.25.0.12',
        'https://angebot.solarenergie-portal.de/pv-muenchen',
        'Ich erkläre mich damit einverstanden, dass die Lead-Kontackt GmbH und deren Partner mich bezüglich eines unverbindlichen Photovoltaik-Angebots telefonisch oder per E-Mail kontaktieren dürfen. Diese Einwilligung kann ich jederzeit widerrufen.',
        'v2.1',
        'ONLINE_FORM'
      )
      ON CONFLICT (id) DO NOTHING;
    `);

    // Lead 1 Consent Record
    await client.query(`
      INSERT INTO lead_consents (id, lead_id, tenant_id, consent_type, channel, granted_at, is_valid)
      VALUES (
        '88888888-1111-0000-0000-000000000001',
        '${lead1Id}',
        '${parentTenantId}',
        'MARKETING_PHONE',
        'PHONE',
        NOW() - INTERVAL '2 days',
        true
      )
      ON CONFLICT (id) DO NOTHING;
    `);

    // Lead 1 Answers
    const pvQ1 = `ffffffff-0001-0000-0000-000000000001`;
    const pvQ2 = `ffffffff-0001-0000-0000-000000000002`;
    const pvQ3 = `ffffffff-0001-0000-0000-000000000003`;
    await client.query(`
      INSERT INTO lead_answers (lead_id, question_id, questionnaire_version_id, value_raw, value_normalized)
      VALUES
        ('${lead1Id}', '${pvQ1}', '${pvProj.versionId}', 'Ja, Alleineigentümer', '"OWNER"'::jsonb),
        ('${lead1Id}', '${pvQ2}', '${pvProj.versionId}', 'Satteldach', '"SATTELDACH"'::jsonb),
        ('${lead1Id}', '${pvQ3}', '${pvProj.versionId}', '5200', '5200'::jsonb)
      ON CONFLICT DO NOTHING;
    `);

    // Lead 1 Event
    await client.query(`
      INSERT INTO lead_events (lead_id, tenant_id, event_type, actor_type, payload)
      VALUES ('${lead1Id}', '${parentTenantId}', 'LEAD_CONFIRMED', 'USER', '{"reason": "QC Review passed successfully", "score": 88}'::jsonb)
      ON CONFLICT DO NOTHING;
    `);

    // Lead 2: Wärmepumpe - QC_PENDING with consent
    const wpProj = projectMap['waermepumpe'];
    await client.query(`
      INSERT INTO leads (id, tenant_id, project_id, first_name, last_name, phone_raw, phone_e164, phone_country, line_type, email, postal_code, city, street, house_number, status, consent_verified, dnc_flag)
      VALUES (
        '${lead2Id}',
        '${parentTenantId}',
        '${wpProj.id}',
        'Claudia',
        'Fischer',
        '040 7654321',
        '+49407654321',
        'DE',
        'FIXED_LINE',
        'c.fischer@nord-mail.de',
        '20095',
        'Hamburg',
        'Mönckebergstraße',
        '42',
        'QC_PENDING',
        true,
        false
      )
      ON CONFLICT (id) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO lead_provenance (id, lead_id, tenant_id, source, campaign_name, opt_in_timestamp, ip_address, landing_page_url, consent_text, consent_version, consent_channel)
      VALUES (
        '88888888-0000-0000-0000-000000000002',
        '${lead2Id}',
        '${parentTenantId}',
        'Meta Ads',
        'Waermepumpe_Nord',
        NOW() - INTERVAL '1 day',
        '84.116.4.21',
        'https://waerme.klima-vergleich24.de/hamburg',
        'Ja, ich erteile meine ausdrückliche Einwilligung zur telefonischen Kontaktaufnahme zur Beratung für eine Wärmepumpe.',
        'v1.0',
        'ONLINE_FORM'
      )
      ON CONFLICT (id) DO NOTHING;
    `);

    // Lead 3: Treppenlift - NEW, NO CONSENT PROOF (Should trigger hard stop on dial/sale)
    const tlProj = projectMap['treppenlift'];
    await client.query(`
      INSERT INTO leads (id, tenant_id, project_id, first_name, last_name, phone_raw, phone_e164, phone_country, line_type, email, postal_code, city, street, house_number, status, consent_verified, dnc_flag)
      VALUES (
        '${lead3Id}',
        '${parentTenantId}',
        '${tlProj.id}',
        'Gerhard',
        'Müller',
        '069 8877665',
        '+49698877665',
        'DE',
        'FIXED_LINE',
        'g.mueller@web.de',
        '60311',
        'Frankfurt am Main',
        'Zeil',
        '105',
        'NEW',
        false,
        false
      )
      ON CONFLICT (id) DO NOTHING;
    `);

    // Lead 4: Photovoltaik - On DNC List (Should be blocked by DNC suppression)
    await client.query(`
      INSERT INTO leads (id, tenant_id, project_id, first_name, last_name, phone_raw, phone_e164, phone_country, line_type, email, postal_code, city, street, house_number, status, consent_verified, dnc_flag)
      VALUES (
        '${lead4Id}',
        '${parentTenantId}',
        '${pvProj.id}',
        'Stefan',
        'Klaus',
        '0170 9999999',
        '+491709999999',
        'DE',
        'MOBILE',
        's.klaus@t-online.de',
        '70173',
        'Stuttgart',
        'Königstraße',
        '28',
        'NEW',
        true,
        true
      )
      ON CONFLICT (id) DO NOTHING;
    `);

    // 10. Sample Callbacks (Rückrufe)
    await client.query(`
      INSERT INTO callbacks (id, tenant_id, lead_id, assigned_user_id, scheduled_at, timezone, notes, status)
      VALUES
        ('98989898-0000-0000-0000-000000000001', '${parentTenantId}', '${lead2Id}', '99999999-0000-0000-0000-000000000005', NOW() + INTERVAL '2 hours', 'Europe/Berlin', 'Kunde wünscht Rückruf nach 16:30 Uhr wegen Ehepartner', 'PENDING'),
        ('98989898-0000-0000-0000-000000000002', '${parentTenantId}', '${lead1Id}', '99999999-0000-0000-0000-000000000006', NOW() - INTERVAL '30 minutes', 'Europe/Berlin', 'Dringend: Detailfragen zum Speicherangebot', 'PENDING')
      ON CONFLICT (id) DO NOTHING;
    `);

    await client.query('COMMIT');
    console.log('Seed completed successfully with 8 products, questionnaires, leads, and callbacks.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err);
    throw err;
  } finally {
    client.release();
  }
}

if (typeof require !== 'undefined' && require.main === module) {
  runSeed().catch(console.error);
}
