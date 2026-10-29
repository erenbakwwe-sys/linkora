import { pgTable, uuid, varchar, integer, text, jsonb, boolean, timestamp, numeric, date, inet } from 'drizzle-orm/pg-core';
import { tenants } from './tenants.js';
import { users } from './users.js';
import { projects, leads } from './leads.js';

export const numberPools = pgTable('number_pools', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  rotationDays: integer('rotation_days').notNull().default(7),
});

export const poolNumbers = pgTable('pool_numbers', {
  id: uuid('id').defaultRandom().primaryKey(),
  poolId: uuid('pool_id').notNull().references(() => numberPools.id, { onDelete: 'cascade' }),
  e164Number: varchar('e164_number', { length: 20 }).notNull(),
  reputationScore: integer('reputation_score').notNull().default(100),
  totalCalls: integer('total_calls').notNull().default(0),
  answeredCalls: integer('answered_calls').notNull().default(0),
  isQuarantined: boolean('is_quarantined').notNull().default(false),
  lastRotatedAt: timestamp('last_rotated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const campaigns = pgTable('campaigns', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'restrict' }),
  name: varchar('name', { length: 150 }).notNull(),
  dialingMode: varchar('dialing_mode', { length: 50 }).notNull().default('PROGRESSIVE'),
  pacingTempo: integer('pacing_tempo').notNull().default(5), // Slider 1-10
  maxAbandonRate: numeric('max_abandon_rate', { precision: 5, scale: 2 }).notNull().default('3.00'),
  minFreeAgents: integer('min_free_agents').notNull().default(1),
  callerPoolId: uuid('caller_pool_id').references(() => numberPools.id),
  ringTimeout: integer('ring_timeout').notNull().default(30),
  retryRules: jsonb('retry_rules').notNull().default({ max_attempts: 5, retry_intervals_min: [30, 120, 360] }),
  callingWindow: jsonb('calling_window').notNull().default({ start: '09:00', end: '20:00', timezone: 'Europe/Berlin' }),
  amdActive: boolean('amd_active').notNull().default(true),
  recordingActive: boolean('recording_active').notNull().default(true),
  status: varchar('status', { length: 50 }).notNull().default('STOPPED'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const callLists = pgTable('call_lists', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  campaignId: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 150 }).notNull(),
  totalLeads: integer('total_leads').notNull().default(0),
  status: varchar('status', { length: 50 }).notNull().default('ACTIVE'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const callListEntries = pgTable('call_list_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  callListId: uuid('call_list_id').notNull().references(() => callLists.id, { onDelete: 'cascade' }),
  leadId: uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  priority: integer('priority').notNull().default(0),
  attempts: integer('attempts').notNull().default(0),
  status: varchar('status', { length: 50 }).notNull().default('PENDING'),
  nextAttemptAt: timestamp('next_attempt_at', { withTimezone: true }),
});

export const wrapupCodes = pgTable('wrapup_codes', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 50 }).notNull(),
  label: varchar('100', { length: 100 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  countsAsConversion: boolean('counts_as_conversion').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
});

export const calls = pgTable('calls', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  campaignId: uuid('campaign_id').references(() => campaigns.id),
  leadId: uuid('lead_id').references(() => leads.id),
  agentId: uuid('agent_id').references(() => users.id),
  telephonyProvider: varchar('telephony_provider', { length: 50 }).notNull(),
  providerCallId: varchar('provider_call_id', { length: 100 }),
  direction: varchar('direction', { length: 20 }).notNull().default('OUTBOUND'),
  callerNumber: varchar('caller_number', { length: 30 }).notNull(),
  calleeNumber: varchar('callee_number', { length: 30 }).notNull(),
  startTime: timestamp('start_time', { withTimezone: true }).defaultNow().notNull(),
  answerTime: timestamp('answer_time', { withTimezone: true }),
  endTime: timestamp('end_time', { withTimezone: true }),
  durationSeconds: integer('duration_seconds').default(0),
  billableSeconds: integer('billable_seconds').default(0),
  wrapupCodeId: uuid('wrapup_code_id').references(() => wrapupCodes.id),
  amdResult: varchar('amd_result', { length: 50 }),
  costEur: numeric('cost_eur', { precision: 10, scale: 4 }).default('0.0000'),
  mosScore: numeric('mos_score', { precision: 3, scale: 2 }),
  jitterMs: integer('jitter_ms'),
  packetLossPercent: numeric('packet_loss_percent', { precision: 5, scale: 2 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const callRecordings = pgTable('call_recordings', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  callId: uuid('call_id').notNull().references(() => calls.id, { onDelete: 'cascade' }),
  s3Bucket: varchar('s3_bucket', { length: 100 }).notNull(),
  s3Key: text('s3_key').notNull(),
  durationSeconds: integer('duration_seconds').notNull(),
  channelsCount: integer('channels_count').notNull().default(2),
  isConsented: boolean('is_consented').notNull().default(true),
  retainUntil: date('retain_until').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const transcripts = pgTable('transcripts', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  callId: uuid('call_id').notNull().references(() => calls.id, { onDelete: 'cascade' }),
  language: varchar('language', { length: 5 }).notNull(),
  diarization: jsonb('diarization').notNull(),
  maskedText: text('masked_text').notNull(),
  qualityScore: numeric('quality_score', { precision: 5, scale: 2 }),
  complianceFlags: jsonb('compliance_flags').default({}),
  objectionTags: text('objection_tags').array().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const agentSessions = pgTable('agent_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  clientIp: inet('client_ip'),
  userAgent: text('user_agent'),
});

export const agentStatusLog = pgTable('agent_status_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sessionId: uuid('session_id').references(() => agentSessions.id),
  status: varchar('status', { length: 50 }).notNull(),
  pauseReason: varchar('pause_reason', { length: 100 }),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  durationSeconds: integer('duration_seconds'),
});

export const callbacks = pgTable('callbacks', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  leadId: uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  assignedUserId: uuid('assigned_user_id').references(() => users.id),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
  timezone: varchar('timezone', { length: 50 }).notNull().default('Europe/Berlin'),
  notes: text('notes'),
  status: varchar('status', { length: 50 }).notNull().default('PENDING'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
