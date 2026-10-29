import { pgTable, uuid, varchar, integer, text, date, boolean, timestamp, numeric } from 'drizzle-orm/pg-core';
import { tenants } from './tenants.js';
import { users, teams } from './users.js';

export const shifts = pgTable('shifts', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('SCHEDULED'),
});

export const timeEntries = pgTable('time_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  clockIn: timestamp('clock_in', { withTimezone: true }).notNull(),
  clockOut: timestamp('clock_out', { withTimezone: true }),
  breakMinutes: integer('break_minutes').notNull().default(0),
  totalMinutes: integer('total_minutes'),
  approvedBy: uuid('approved_by').references(() => users.id),
  status: varchar('status', { length: 50 }).notNull().default('PENDING'),
});

export const leaveRequests = pgTable('leave_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  leaveType: varchar('leave_type', { length: 50 }).notNull(),
  reason: text('reason'),
  status: varchar('status', { length: 50 }).notNull().default('PENDING'),
  approvedBy: uuid('approved_by').references(() => users.id),
});

export const bonusRules = pgTable('bonus_rules', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 150 }).notNull(),
  eventType: varchar('event_type', { length: 50 }).notNull(),
  rewardAmount: numeric('reward_amount', { precision: 10, scale: 2 }).notNull(),
  condition: text('condition'),
  isActive: boolean('is_active').notNull().default(true),
});

export const bonusAwards = pgTable('bonus_awards', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  bonusRuleId: uuid('bonus_rule_id').notNull().references(() => bonusRules.id, { onDelete: 'restrict' }),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  referenceId: uuid('reference_id'),
  awardedAt: timestamp('awarded_at', { withTimezone: true }).defaultNow().notNull(),
});

export const announcements = pgTable('announcements', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  isPinned: boolean('is_pinned').notNull().default(false),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const announcementReads = pgTable('announcement_reads', {
  announcementId: uuid('announcement_id').notNull().references(() => announcements.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  readAt: timestamp('read_at', { withTimezone: true }).defaultNow().notNull(),
});

export const chatChannels = pgTable('chat_channels', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }),
  type: varchar('type', { length: 20 }).notNull().default('DIRECT'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const chatChannelMembers = pgTable('chat_channel_members', {
  channelId: uuid('channel_id').notNull().references(() => chatChannels.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
});

export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  channelId: uuid('channel_id').notNull().references(() => chatChannels.id, { onDelete: 'cascade' }),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  senderId: uuid('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
