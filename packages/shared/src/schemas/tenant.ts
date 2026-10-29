import { z } from 'zod';
import { TenantType } from '../constants/enums.js';

export const CreateTenantSchema = z.object({
  name: z.string().min(2).max(255),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  type: z.nativeEnum(TenantType).default(TenantType.AGENCY_PARENT),
  parentTenantId: z.string().uuid().optional(),
  currency: z.string().length(3).default('EUR'),
  minuteRateEur: z.number().positive().default(0.04),
  lowBalanceThresholdEur: z.number().nonnegative().default(10.0),
  branding: z
    .object({
      brandName: z.string().default('YourBrand'),
      primaryColor: z.string().default('#0b1220'),
      logoUrl: z.string().nullable().default(null),
    })
    .default({
      brandName: 'YourBrand',
      primaryColor: '#0b1220',
      logoUrl: null,
    }),
});

export type CreateTenantDto = z.infer<typeof CreateTenantSchema>;

export const UpdateBrandingSchema = z.object({
  brandName: z.string().min(1).max(100),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  logoUrl: z.string().nullable().optional(),
});

export type UpdateBrandingDto = z.infer<typeof UpdateBrandingSchema>;
