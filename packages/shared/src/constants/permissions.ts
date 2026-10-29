export const Permissions = {
  // Tenant
  TENANT_VIEW: 'tenant:view',
  TENANT_CREATE: 'tenant:create',
  TENANT_UPDATE: 'tenant:update',
  TENANT_BRANDING: 'tenant:branding',

  // Users & Teams
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  TEAM_MANAGE: 'team:manage',

  // Leads
  LEAD_VIEW: 'lead:view',
  LEAD_CREATE: 'lead:create',
  LEAD_IMPORT: 'lead:import',
  LEAD_EXPORT: 'lead:export',
  LEAD_QC_REVIEW: 'lead:qc_review',

  // Dialer & Campaigns
  CAMPAIGN_MANAGE: 'campaign:manage',
  DIALER_USE: 'dialer:use',
  DIALER_SUPERVISE: 'dialer:supervise',
  RECORDINGS_LISTEN: 'recordings:listen',
  RECORDINGS_DOWNLOAD: 'recordings:download',

  // Marketplace & Buyers
  MARKETPLACE_BUY: 'marketplace:buy',
  MARKETPLACE_SELL: 'marketplace:sell',
  BUYER_MANAGE: 'buyer:manage',
  PRICING_MANAGE: 'pricing:manage',

  // Financials
  FINANCE_VIEW: 'finance:view',
  WALLET_TOPUP: 'wallet:topup',
  RETURNS_PROCESS: 'returns:process',

  // Operations
  ROTA_MANAGE: 'rota:manage',
  TIME_TRACKING_APPROVE: 'time_tracking:approve',
  AUDIT_VIEW: 'audit:view',
} as const;

export type PermissionCode = (typeof Permissions)[keyof typeof Permissions];
