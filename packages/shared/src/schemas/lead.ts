import { z } from 'zod';
import { LeadStatus } from '../constants/enums.js';

export const leadStatusSchema = z.nativeEnum(LeadStatus);

export const consentChannelSchema = z.enum([
  'ONLINE_FORM',
  'PHONE',
  'EMAIL',
  'WRITTEN',
  'SMS',
]);
export type ConsentChannel = z.infer<typeof consentChannelSchema>;

export const provenanceInputSchema = z.object({
  source: z.string().min(1, 'Source is required (e.g. Google Ads, Partner-X, Facebook)'),
  campaignName: z.string().optional(),
  optInTimestamp: z.string().or(z.date()).transform((val) => new Date(val).toISOString()),
  ipAddress: z.string().optional(),
  landingPageUrl: z.string().url().optional().or(z.literal('')),
  consentText: z.string().min(10, 'Explicit consent wording proof is required'),
  consentVersion: z.string().default('v1.0'),
  consentChannel: consentChannelSchema.default('ONLINE_FORM'),
  proofMetadata: z.record(z.any()).optional().default({}),
});
export type ProvenanceInput = z.infer<typeof provenanceInputSchema>;

export const leadIngestSchema = z.object({
  projectId: z.string().uuid('Valid project UUID is required'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  phone: z.string().min(5, 'Phone number is required').max(50),
  phoneCountry: z.string().length(2).default('DE'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  postalCode: z.string().max(20).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  street: z.string().max(150).optional().or(z.literal('')),
  houseNumber: z.string().max(20).optional().or(z.literal('')),
  provenance: provenanceInputSchema.optional(),
  answers: z.record(z.any()).optional().default({}),
  extraData: z.record(z.any()).optional().default({}),
});
export type LeadIngestInput = z.infer<typeof leadIngestSchema>;

export const qcActionSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT', 'REQUEST_RECALL']),
  reason: z.string().min(3, 'A clear reason is required for QC tracking').max(500),
  recallScheduledAt: z.string().datetime().optional(),
});
export type QcActionInput = z.infer<typeof qcActionSchema>;

export const callbackCreateSchema = z.object({
  leadId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  timezone: z.string().default('Europe/Berlin'),
  notes: z.string().optional(),
  assignedUserId: z.string().uuid().optional(),
});
export type CallbackCreateInput = z.infer<typeof callbackCreateSchema>;

export const columnMappingSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  street: z.string().optional(),
  houseNumber: z.string().optional(),
  source: z.string().optional(),
  consentText: z.string().optional(),
  optInTimestamp: z.string().optional(),
  answers: z.record(z.string()).optional(),
});
export type ColumnMapping = z.infer<typeof columnMappingSchema>;

export const importExecuteSchema = z.object({
  projectId: z.string().uuid(),
  fileName: z.string().default('upload.csv'),
  fileHash: z.string().min(32),
  mapping: columnMappingSchema,
  rows: z.array(z.record(z.any())).min(1, 'At least one row is required'),
  defaultSource: z.string().default('CSV_IMPORT'),
  defaultConsentText: z.string().optional(),
});
export type ImportExecuteInput = z.infer<typeof importExecuteSchema>;

export interface CanDialResult {
  allowed: boolean;
  reason?: 'NO_CONSENT_PROOF' | 'DNC_SUPPRESSED' | 'INVALID_PHONE' | 'ALREADY_SOLD' | 'MAX_ATTEMPTS_REACHED' | 'OUTSIDE_CALLING_HOURS';
  message: string;
  leadId: string;
  phoneE164?: string;
  consentVerified: boolean;
  dncFlag: boolean;
}
