import { pgTable, uuid, varchar, integer, text, jsonb, boolean, timestamp, numeric, inet } from 'drizzle-orm/pg-core';
import { tenants } from './tenants.js';
import { users } from './users.js';

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 150 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const questionnaires = pgTable('questionnaires', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 150 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const questionnaireVersions = pgTable('questionnaire_versions', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionnaireId: uuid('questionnaire_id').notNull().references(() => questionnaires.id, { onDelete: 'cascade' }),
  version: integer('version').notNull().default(1),
  status: varchar('status', { length: 50 }).notNull().default('PUBLISHED'),
  effectiveFrom: timestamp('effective_from', { withTimezone: true }).defaultNow().notNull(),
});

export const questions = pgTable('questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionnaireVersionId: uuid('questionnaire_version_id').notNull().references(() => questionnaireVersions.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 50 }).notNull(),
  label: text('label').notNull(),
  inputType: varchar('input_type', { length: 50 }).notNull(),
  options: jsonb('options'),
  validationRules: jsonb('validation_rules'),
  conditionalLogic: jsonb('conditional_logic'),
  orderIndex: integer('order_index').notNull().default(0),
  isRequired: boolean('is_required').notNull().default(false),
});

export const leadBatches = pgTable('lead_batches', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  fileName: varchar('file_name', { length: 255 }),
  fileHash: varchar('file_hash', { length: 64 }).notNull(),
  channel: varchar('channel', { length: 50 }).notNull(),
  totalRows: integer('total_rows').notNull().default(0),
  acceptedRows: integer('accepted_rows').notNull().default(0),
  quarantinedRows: integer('quarantined_rows').notNull().default(0),
  duplicateRows: integer('duplicate_rows').notNull().default(0),
  status: varchar('status', { length: 50 }).notNull().default('COMPLETED'),
  metadata: jsonb('metadata').default({}),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const leads = pgTable('leads', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  batchId: uuid('batch_id').references(() => leadBatches.id),
  projectId: uuid('project_id').notNull().references(() => projects.id),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phoneRaw: varchar('phone_raw', { length: 50 }).notNull(),
  phoneE164: varchar('phone_e164', { length: 20 }).notNull(),
  phoneCountry: varchar('phone_country', { length: 2 }).notNull().default('DE'),
  lineType: varchar('line_type', { length: 20 }).default('UNKNOWN'),
  email: varchar('email', { length: 255 }),
  postalCode: varchar('postal_code', { length: 20 }),
  city: varchar('city', { length: 100 }),
  street: varchar('street', { length: 150 }),
  houseNumber: varchar('house_number', { length: 20 }),
  status: varchar('status', { length: 50 }).notNull().default('NEW'),
  consentVerified: boolean('consent_verified').notNull().default(false),
  dncFlag: boolean('dnc_flag').notNull().default(false),
  extraData: jsonb('extra_data').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const leadProvenance = pgTable('lead_provenance', {
  id: uuid('id').defaultRandom().primaryKey(),
  leadId: uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  source: varchar('source', { length: 100 }).notNull(),
  campaignName: varchar('campaign_name', { length: 150 }),
  optInTimestamp: timestamp('opt_in_timestamp', { withTimezone: true }).notNull(),
  ipAddress: inet('ip_address'),
  landingPageUrl: text('landing_page_url'),
  consentText: text('consent_text').notNull(),
  consentVersion: varchar('consent_version', { length: 50 }),
  consentChannel: varchar('consent_channel', { length: 50 }).notNull(),
  proofMetadata: jsonb('proof_metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const leadConsents = pgTable('lead_consents', {
  id: uuid('id').defaultRandom().primaryKey(),
  leadId: uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  consentType: varchar('consent_type', { length: 50 }).notNull(),
  channel: varchar('channel', { length: 50 }).notNull(),
  grantedAt: timestamp('granted_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  isValid: boolean('is_valid').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const leadAnswers = pgTable('lead_answers', {
  id: uuid('id').defaultRandom().primaryKey(),
  leadId: uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  questionId: uuid('question_id').notNull().references(() => questions.id, { onDelete: 'restrict' }),
  questionnaireVersionId: uuid('questionnaire_version_id').notNull().references(() => questionnaireVersions.id, { onDelete: 'restrict' }),
  valueRaw: text('value_raw'),
  valueNormalized: jsonb('value_normalized'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const quarantineRecords = pgTable('quarantine_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  batchId: uuid('batch_id').references(() => leadBatches.id),
  rawData: jsonb('raw_data').notNull(),
  errorReasons: jsonb('error_reasons').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('PENDING_REVIEW'),
  resolvedLeadId: uuid('resolved_lead_id').references(() => leads.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
});

export const leadEvents = pgTable('lead_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  leadId: uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  actorId: uuid('actor_id'),
  actorType: varchar('actor_type', { length: 50 }).notNull(),
  payload: jsonb('payload').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const leadScores = pgTable('lead_scores', {
  id: uuid('id').defaultRandom().primaryKey(),
  leadId: uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  modelId: varchar('model_id', { length: 100 }).notNull(),
  promptVersion: varchar('prompt_version', { length: 50 }).notNull(),
  inputsHash: varchar('inputs_hash', { length: 64 }).notNull(),
  confidence: numeric('confidence', { precision: 5, scale: 4 }).notNull(),
  score0100: numeric('score_0_100', { precision: 5, scale: 2 }).notNull(),
  scoreBand: varchar('score_band', { length: 10 }).notNull(),
  explanation: jsonb('explanation').notNull(),
  isFallback: boolean('is_fallback').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const leadOutcomes = pgTable('lead_outcomes', {
  id: uuid('id').defaultRandom().primaryKey(),
  leadId: uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  outcomeType: varchar('outcome_type', { length: 50 }).notNull(),
  scoreAtOutcome: numeric('score_at_outcome', { precision: 5, scale: 2 }),
  scoreBandAtOutcome: varchar('score_band_at_outcome', { length: 10 }),
  feedbackReason: text('feedback_reason'),
  closedAt: timestamp('closed_at', { withTimezone: true }).defaultNow().notNull(),
});

export const dncEntries = pgTable('dnc_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  scope: varchar('scope', { length: 50 }).notNull().default('TENANT'),
  phoneE164: varchar('phone_e164', { length: 20 }).notNull(),
  reason: text('reason'),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
