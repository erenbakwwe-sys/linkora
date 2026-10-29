import { pgTable, uuid, varchar, integer, text, jsonb, boolean, timestamp, inet } from 'drizzle-orm/pg-core';
import { tenants } from './tenants.js';

// APPEND-ONLY TAMPER-EVIDENT AUDIT LOG
export const auditLog = pgTable('audit_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'set null' }),
  actorId: uuid('actor_id'),
  actorType: varchar('actor_type', { length: 50 }).notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  entityTable: varchar('entity_table', { length: 100 }).notNull(),
  entityId: uuid('entity_id').notNull(),
  prevHash: varchar('prev_hash', { length: 64 }).notNull(),
  currentHash: varchar('current_hash', { length: 64 }).notNull(),
  clientIp: inet('client_ip'),
  userAgent: text('user_agent'),
  diff: jsonb('diff'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// TRANSACTIONAL OUTBOX
export const outboxEvents = pgTable('outbox_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  payload: jsonb('payload').notNull(),
  published: boolean('published').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const webhookEndpoints = pgTable('webhook_endpoints', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  secretHash: varchar('secret_hash', { length: 255 }).notNull(),
  eventTypes: text('event_types').array().notNull().default([]),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const webhookDeliveries = pgTable('webhook_deliveries', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  endpointId: uuid('endpoint_id').notNull().references(() => webhookEndpoints.id, { onDelete: 'cascade' }),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  payload: jsonb('payload').notNull(),
  signature: varchar('signature', { length: 255 }).notNull(),
  responseCode: integer('response_code'),
  responseBody: text('response_body'),
  attempt: integer('attempt').notNull().default(1),
  nextRetryAt: timestamp('next_retry_at', { withTimezone: true }),
  status: varchar('status', { length: 50 }).notNull().default('PENDING'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
