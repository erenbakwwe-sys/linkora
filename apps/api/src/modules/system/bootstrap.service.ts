import { Injectable, Logger } from '@nestjs/common';
import { RLS_POLICY_SQL, SCHEMA_PATCH_SQL } from '@linkora/db';
import { DatabaseService } from '../../common/services/database.service.js';
import { runAsSystem } from '../../common/services/request-context.js';
import { DEFAULT_TENANT_ID } from '../../common/security/secrets.js';
import { UsersService } from '../users/users.service.js';

/** Projects used by the agent form / lead APIs (fixed IDs are referenced by the frontend). */
export const CORE_PROJECTS = [
  { id: 'cccccccc-0000-0000-0000-000000000001', slug: 'photovoltaik', name: 'Photovoltaik', icon: 'Sun', description: 'Photovoltaik-Anlagen und Stromspeicher' },
  { id: 'cccccccc-0000-0000-0000-000000000002', slug: 'waermepumpe', name: 'Wärmepumpe', icon: 'Flame', description: 'Wärmepumpen und Heizungstausch' },
  { id: 'cccccccc-0000-0000-0000-000000000003', slug: 'treppenlift', name: 'Treppenlift', icon: 'MoveUp', description: 'Treppenlifte, Plattform- und Hublifte' },
  { id: 'cccccccc-0000-0000-0000-000000000004', slug: 'badsanierung', name: 'Badsanierung', icon: 'Bath', description: 'Barrierefreie Badsanierung' },
  { id: 'cccccccc-0000-0000-0000-000000000005', slug: 'elektromobil', name: 'Elektromobil / Elektrorollstuhl', icon: 'Accessibility', description: 'Elektromobile und Elektrorollstühle' },
];

const ROLES = [
  ['aaaaaaaa-0000-0000-0000-000000000001', 'Super Administrator', 'SUPER_ADMIN', 'Platform global super administrator'],
  ['aaaaaaaa-0000-0000-0000-000000000002', 'Company Administrator', 'COMPANY_ADMIN', 'Full control over company and sub-companies'],
  ['aaaaaaaa-0000-0000-0000-000000000003', 'Teamleiter', 'TEAM_LEAD', 'Supervises agents and campaigns'],
  ['aaaaaaaa-0000-0000-0000-000000000004', 'Agent', 'AGENT', 'Call center telephone agent'],
  ['aaaaaaaa-0000-0000-0000-000000000005', 'QC-Reviewer', 'QC_REVIEWER', 'Evaluates call recordings and lead quality'],
  ['aaaaaaaa-0000-0000-0000-000000000006', 'Lead-Partner', 'LEAD_PARTNER', 'External call center selling leads'],
  ['aaaaaaaa-0000-0000-0000-000000000007', 'Buyer', 'BUYER', 'Company purchasing qualified leads'],
];

const ROLE_BY_UI: Record<string, string> = {
  'Firmen-Admin': 'COMPANY_ADMIN',
  Teamleiter: 'TEAM_LEAD',
  Agent: 'AGENT',
  'QC-Prüfer': 'QC_REVIEWER',
};

const WRAPUP_CODES = [
  ['TERM_VEREINBART', 'Termin vereinbart', 'POSITIVE', true],
  ['VERKAUF', 'Verkauf / Abschluss', 'POSITIVE', true],
  ['RUECKRUF_GEWUENSCHT', 'Rückruf gewünscht', 'RETRY', false],
  ['NICHT_ERREICHT', 'Nicht erreicht / Mailbox', 'RETRY', false],
  ['KEIN_INTERESSE', 'Kein Interesse', 'NEGATIVE', false],
  ['SPERRE_DNC', 'Keine weiteren Anrufe erwünscht (DNC)', 'DNC', false],
];

/**
 * Idempotent production bootstrap: creates the real base records (tenant, wallet, roles,
 * projects, wrap-up codes, user accounts). It never creates demo leads or sample people.
 */
@Injectable()
export class BootstrapService {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly users: UsersService,
  ) {}

  async run() {
    return runAsSystem(async () => {
      const summary: Record<string, any> = {};
      await this.db.query(SCHEMA_PATCH_SQL);
      await this.db.query(RLS_POLICY_SQL);
      summary.rlsPolicies = 'applied';

      const tenantId = DEFAULT_TENANT_ID;
      const t = await this.db.query(
        `INSERT INTO tenants (id, name, slug, type, branding)
         VALUES ($1, 'Linkora', 'linkora', 'AGENCY_PARENT', '{"brand_name":"Linkora","primary_color":"#0b1220","logo_url":null}')
         ON CONFLICT DO NOTHING RETURNING id`,
        [tenantId],
      );
      summary.tenantCreated = t.rowCount === 1;

      const w = await this.db.query(
        `INSERT INTO wallets (tenant_id, balance, currency) VALUES ($1, 0, 'EUR') ON CONFLICT (tenant_id) DO NOTHING RETURNING id`,
        [tenantId],
      );
      summary.walletCreated = w.rowCount === 1;

      let rolesCreated = 0;
      for (const [id, name, slug, description] of ROLES) {
        const r = await this.db.query(
          `INSERT INTO roles (id, name, slug, description, is_system)
           SELECT $1::uuid, $2::varchar, $3::varchar, $4::text, true
           WHERE NOT EXISTS (SELECT 1 FROM roles WHERE slug = $3::varchar AND tenant_id IS NULL)
           ON CONFLICT (id) DO NOTHING RETURNING id`,
          [id, name, slug, description],
        );
        rolesCreated += r.rowCount || 0;
      }
      summary.rolesCreated = rolesCreated;

      let projectsCreated = 0;
      for (const [i, p] of CORE_PROJECTS.entries()) {
        const n = String(i + 1).padStart(12, '0');
        const r = await this.db.query(
          `INSERT INTO projects (id, tenant_id, name, slug, description, icon)
           VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING RETURNING id`,
          [p.id, tenantId, p.name, p.slug, p.description, p.icon],
        );
        projectsCreated += r.rowCount || 0;
        await this.db.query(
          `INSERT INTO questionnaires (id, project_id, tenant_id, name)
           VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`,
          [`dddddddd-0000-0000-0000-${n}`, p.id, tenantId, `Standardfragebogen ${p.name}`],
        );
        await this.db.query(
          `INSERT INTO questionnaire_versions (id, questionnaire_id, version, status)
           VALUES ($1, $2, 1, 'PUBLISHED') ON CONFLICT DO NOTHING`,
          [`eeeeeeee-0000-0000-0000-${n}`, `dddddddd-0000-0000-0000-${n}`],
        );
        const existing = await this.db.query(
          `SELECT COUNT(*)::int AS c FROM wrapup_codes WHERE tenant_id = $1 AND project_id = $2`,
          [tenantId, p.id],
        );
        if ((existing.rows[0]?.c || 0) === 0) {
          for (const [code, label, category, conv] of WRAPUP_CODES) {
            await this.db.query(
              `INSERT INTO wrapup_codes (tenant_id, project_id, code, label, category, counts_as_conversion)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [tenantId, p.id, code, label, category, conv],
            );
          }
        }
      }
      summary.projectsCreated = projectsCreated;

      const accounts = this.users.getAccountsWithPasswordHash();
      const createdUsers: string[] = [];
      for (const a of accounts) {
        const [first, ...rest] = a.username.trim().split(/\s+/);
        const roleSlug = ROLE_BY_UI[a.role] || 'AGENT';
        const ins = await this.db.query(
          `INSERT INTO users (tenant_id, email, password_hash, first_name, last_name, default_mode, language, is_active, display_name, team)
           SELECT $1::uuid, $2::varchar, $3::varchar, $4::varchar, $5::varchar, $6::varchar, 'de', $7::boolean, $8::varchar, $9::varchar
           WHERE NOT EXISTS (SELECT 1 FROM users WHERE tenant_id = $1::uuid AND LOWER(email) = LOWER($2::varchar))
           RETURNING id`,
          [tenantId, a.email, a.passwordHash, first || a.username, rest.join(' '), roleSlug === 'AGENT' ? 'AGENT' : 'MANAGER', a.isActive, a.username, a.team && a.team !== '—' ? a.team : null],
        );
        const userId =
          ins.rows[0]?.id ||
          (await this.db.query(`SELECT id FROM users WHERE tenant_id = $1 AND LOWER(email) = LOWER($2)`, [tenantId, a.email]))
            .rows[0]?.id;
        if (ins.rowCount) createdUsers.push(a.email);
        if (userId) {
          await this.db.query(
            `INSERT INTO user_roles (user_id, role_id, tenant_id)
             SELECT $1, r.id, $2 FROM roles r WHERE r.slug = $3 AND r.tenant_id IS NULL
             ON CONFLICT DO NOTHING`,
            [userId, tenantId, roleSlug],
          );
        }
      }
      summary.usersCreated = createdUsers;

      const counts = await this.db.query(
        `SELECT (SELECT COUNT(*) FROM tenants)::int AS tenants, (SELECT COUNT(*) FROM users)::int AS users,
                (SELECT COUNT(*) FROM projects)::int AS projects, (SELECT COUNT(*) FROM roles)::int AS roles,
                (SELECT COUNT(*) FROM leads)::int AS leads`,
      );
      summary.counts = counts.rows[0];
      this.logger.log(`Bootstrap finished: ${JSON.stringify(summary)}`);
      return summary;
    });
  }
}
