import { pgTable, uuid, varchar, integer, text, date, boolean, timestamp, numeric } from 'drizzle-orm/pg-core';
import { tenants } from './tenants.js';
import { projects } from './leads.js';
import { buyers, leadSales } from './buyers.js';

export const priceLists = pgTable('price_lists', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 150 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('EUR'),
  effectiveFrom: timestamp('effective_from', { withTimezone: true }).defaultNow().notNull(),
  effectiveTo: timestamp('effective_to', { withTimezone: true }),
  isActive: boolean('is_active').notNull().default(true),
});

export const priceRules = pgTable('price_rules', {
  id: uuid('id').defaultRandom().primaryKey(),
  priceListId: uuid('price_list_id').notNull().references(() => priceLists.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').references(() => projects.id),
  buyerId: uuid('buyer_id').references(() => buyers.id),
  scoreBand: varchar('score_band', { length: 10 }),
  basePrice: numeric('base_price', { precision: 10, scale: 2 }).notNull(),
  floorPrice: numeric('floor_price', { precision: 10, scale: 2 }).notNull(),
  ceilingPrice: numeric('ceiling_price', { precision: 10, scale: 2 }).notNull(),
  priority: integer('priority').notNull().default(10),
});

export const wallets = pgTable('wallets', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }).unique(),
  balance: numeric('balance', { precision: 12, scale: 4 }).notNull().default('0.0000'),
  creditLimit: numeric('credit_limit', { precision: 12, scale: 4 }).notNull().default('0.0000'),
  currency: varchar('currency', { length: 3 }).notNull().default('EUR'),
  isLocked: boolean('is_locked').notNull().default(false),
  autoDialDisabled: boolean('auto_dial_disabled').notNull().default(false),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// IMMUTABLE LEDGER ENTRIES
export const ledgerEntries = pgTable('ledger_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  walletId: uuid('wallet_id').notNull().references(() => wallets.id, { onDelete: 'restrict' }),
  txType: varchar('tx_type', { length: 50 }).notNull(),
  amount: numeric('amount', { precision: 12, scale: 4 }).notNull(),
  balanceAfter: numeric('balance_after', { precision: 12, scale: 4 }).notNull(),
  referenceType: varchar('reference_type', { length: 50 }).notNull(),
  referenceId: uuid('reference_id'),
  idempotencyKey: varchar('idempotency_key', { length: 100 }).notNull().unique(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// IDEMPOTENT METERING EVENTS
export const meteringEvents = pgTable('metering_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  eventType: varchar('event_type', { length: 50 }).notNull(),
  quantity: numeric('quantity', { precision: 10, scale: 2 }).notNull(),
  unitPrice: numeric('unit_price', { precision: 10, scale: 4 }).notNull(),
  totalAmount: numeric('total_amount', { precision: 12, scale: 4 }).notNull(),
  idempotencyKey: varchar('idempotency_key', { length: 100 }).notNull().unique(),
  referenceId: uuid('reference_id'),
  processed: boolean('processed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const returns = pgTable('returns', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  leadSaleId: uuid('lead_sale_id').notNull().references(() => leadSales.id, { onDelete: 'restrict' }),
  buyerId: uuid('buyer_id').notNull().references(() => buyers.id, { onDelete: 'restrict' }),
  reasonCode: varchar('reason_code', { length: 50 }).notNull(),
  reasonDetail: text('reason_detail'),
  status: varchar('status', { length: 50 }).notNull().default('APPROVED'),
  ledgerEntryId: uuid('ledger_entry_id').references(() => ledgerEntries.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const creditNotes = pgTable('credit_notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  buyerId: uuid('buyer_id').notNull().references(() => buyers.id, { onDelete: 'restrict' }),
  returnId: uuid('return_id').notNull().references(() => returns.id, { onDelete: 'restrict' }),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('EUR'),
  creditNoteNumber: varchar('credit_note_number', { length: 100 }).notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const invoices = pgTable('invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  invoiceNumber: varchar('invoice_number', { length: 100 }).notNull().unique(),
  periodStart: date('period_start').notNull(),
  periodEnd: date('period_end').notNull(),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
  taxAmount: numeric('tax_amount', { precision: 12, scale: 2 }).notNull(),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('ISSUED'),
  pdfUrl: text('pdf_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
