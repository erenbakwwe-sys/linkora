import { pgTable, uuid, varchar, integer, text, jsonb, boolean, timestamp, numeric } from 'drizzle-orm/pg-core';
import { tenants } from './tenants.js';
import { leads } from './leads.js';
import { projects } from './leads.js';

export const buyers = pgTable('buyers', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 200 }).notNull(),
  companyIdentifier: varchar('company_identifier', { length: 100 }),
  pingEndpoint: text('ping_endpoint'),
  postEndpoint: text('post_endpoint'),
  signingSecret: varchar('signing_secret', { length: 255 }).notNull(),
  pingEnabled: boolean('ping_enabled').notNull().default(false),
  dailyCap: integer('daily_cap').notNull().default(50),
  monthlyCap: integer('monthly_cap').notNull().default(1000),
  returnWindowDays: integer('return_window_days').notNull().default(7),
  maxReturnRatePercent: numeric('max_return_rate_percent', { precision: 5, scale: 2 }).notNull().default('15.00'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const buyerCriteria = pgTable('buyer_criteria', {
  id: uuid('id').defaultRandom().primaryKey(),
  buyerId: uuid('buyer_id').notNull().references(() => buyers.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'restrict' }),
  regions: text('regions').array().notNull().default([]),
  minScore: numeric('min_score', { precision: 5, scale: 2 }).notNull().default('0.00'),
  maxScore: numeric('max_score', { precision: 5, scale: 2 }).notNull().default('100.00'),
  ageMin: integer('age_min'),
  ageMax: integer('age_max'),
  exclusivityRequired: varchar('exclusivity_required', { length: 50 }).notNull().default('EXCLUSIVE'),
  priorityWeight: integer('priority_weight').notNull().default(100),
  isActive: boolean('is_active').notNull().default(true),
});

export const pings = pgTable('pings', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  leadId: uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  buyerId: uuid('buyer_id').notNull().references(() => buyers.id, { onDelete: 'cascade' }),
  payloadMasked: jsonb('payload_masked').notNull(),
  responseStatus: integer('response_status'),
  bidAmount: numeric('bid_amount', { precision: 10, scale: 2 }),
  accepted: boolean('accepted').notNull().default(false),
  latencyMs: integer('latency_ms'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const posts = pgTable('posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  leadId: uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  buyerId: uuid('buyer_id').notNull().references(() => buyers.id, { onDelete: 'cascade' }),
  pingId: uuid('ping_id').references(() => pings.id),
  payloadFull: jsonb('payload_full').notNull(),
  responseStatus: integer('response_status'),
  accepted: boolean('accepted').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const waterfallRuns = pgTable('waterfall_runs', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  leadId: uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  attemptNumber: integer('attempt_number').notNull(),
  buyerId: uuid('buyer_id').notNull().references(() => buyers.id, { onDelete: 'cascade' }),
  outcome: varchar('outcome', { length: 50 }).notNull(),
  reason: text('reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// MANDATORY SEPARATION: lead_sales is distinct from leads
export const leadSales = pgTable('lead_sales', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  leadId: uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  buyerId: uuid('buyer_id').notNull().references(() => buyers.id, { onDelete: 'restrict' }),
  salePrice: numeric('sale_price', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('EUR'),
  exclusivity: varchar('exclusivity', { length: 50 }).notNull().default('EXCLUSIVE'),
  status: varchar('status', { length: 50 }).notNull().default('COMPLETED'),
  soldAt: timestamp('sold_at', { withTimezone: true }).defaultNow().notNull(),
  returnStatus: varchar('return_status', { length: 50 }).notNull().default('NONE'),
  returnWindowExpiresAt: timestamp('return_window_expires_at', { withTimezone: true }).notNull(),
  metadata: jsonb('metadata').default({}),
});
