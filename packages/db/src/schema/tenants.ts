import { pgTable, uuid, varchar, numeric, jsonb, boolean, timestamp } from 'drizzle-orm/pg-core';

export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  parentTenantId: uuid('parent_tenant_id'),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  type: varchar('type', { length: 50 }).notNull().default('AGENCY_PARENT'),
  currency: varchar('currency', { length: 3 }).notNull().default('EUR'),
  minuteRateEur: numeric('minute_rate_eur', { precision: 10, scale: 4 }).notNull().default('0.0400'),
  lowBalanceThresholdEur: numeric('low_balance_threshold_eur', { precision: 10, scale: 2 }).notNull().default('10.00'),
  branding: jsonb('branding').notNull().default({
    brand_name: 'YourBrand',
    primary_color: '#0b1220',
    logo_url: null,
  }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
