import {
  LoginSchema,
  CreateTenantSchema,
  CreateUserSchema,
  TenantType,
  UserRoleSlug,
  LeadStatus,
  ScoreBand,
  AgentState,
  Permissions,
} from '../src/index.js';

describe('Shared Domain Contracts & Zod Schemas', () => {
  it('should validate valid login credentials', () => {
    const valid = { email: 'admin@lead-kontackt.de', password: 'Password123!' };
    const res = LoginSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('should reject invalid email in login', () => {
    const invalid = { email: 'not-an-email', password: '123' };
    const res = LoginSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it('should validate tenant creation with default branding', () => {
    const tenant = {
      name: 'Call Center Izmir',
      slug: 'cc-izmir',
      type: TenantType.CALL_CENTER_SUB,
    };
    const res = CreateTenantSchema.safeParse(tenant);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.branding.brandName).toBe('YourBrand');
      expect(res.data.minuteRateEur).toBe(0.04);
      expect(res.data.lowBalanceThresholdEur).toBe(10.0);
    }
  });

  it('should validate user creation schema', () => {
    const user = {
      email: 'umut@cc-izmir.com',
      password: 'SecurePassword123!',
      firstName: 'Umut',
      lastName: 'Kaya',
      roleSlug: UserRoleSlug.AGENT,
      language: 'de',
    };
    const res = CreateUserSchema.safeParse(user);
    expect(res.success).toBe(true);
  });

  it('should define all 7 required core roles', () => {
    expect(UserRoleSlug.SUPER_ADMIN).toBe('SUPER_ADMIN');
    expect(UserRoleSlug.COMPANY_ADMIN).toBe('COMPANY_ADMIN');
    expect(UserRoleSlug.TEAM_LEAD).toBe('TEAM_LEAD');
    expect(UserRoleSlug.AGENT).toBe('AGENT');
    expect(UserRoleSlug.QC_REVIEWER).toBe('QC_REVIEWER');
    expect(UserRoleSlug.LEAD_PARTNER).toBe('LEAD_PARTNER');
    expect(UserRoleSlug.BUYER).toBe('BUYER');
  });

  it('should define all dialer agent states from reference screenshot', () => {
    expect(AgentState.ON_CALL).toBe('ON_CALL');
    expect(AgentState.ACW).toBe('ACW'); // Nachbearbeitung
    expect(AgentState.DIALING).toBe('DIALING'); // Wählt
    expect(AgentState.JOINING_LINE).toBe('JOINING_LINE'); // Wählt sich ein
    expect(AgentState.READY).toBe('READY'); // Bereit, wartet auf Anruf
    expect(AgentState.WAITING).toBe('WAITING'); // Wartend
    expect(AgentState.PAUSE).toBe('PAUSE'); // Pause
  });

  it('should define score bands A, B, C, D', () => {
    expect(ScoreBand.A).toBe('A');
    expect(ScoreBand.B).toBe('B');
    expect(ScoreBand.C).toBe('C');
    expect(ScoreBand.D).toBe('D');
  });
});
