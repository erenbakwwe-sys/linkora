import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  tenantSlug: z.string().optional(),
});

export type LoginDto = z.infer<typeof LoginSchema>;

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;

export const SwitchTenantSchema = z.object({
  tenantId: z.string().uuid(),
});

export type SwitchTenantDto = z.infer<typeof SwitchTenantSchema>;

export const SwitchModeSchema = z.object({
  mode: z.enum(['MANAGER', 'AGENT']),
});

export type SwitchModeDto = z.infer<typeof SwitchModeSchema>;
