import { z } from 'zod';
import { UserMode, UserRoleSlug } from '../constants/enums.js';

export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  roleSlug: z.nativeEnum(UserRoleSlug).default(UserRoleSlug.AGENT),
  teamId: z.string().uuid().optional(),
  language: z.enum(['de', 'tr', 'en']).default('de'),
  defaultMode: z.nativeEnum(UserMode).default(UserMode.AGENT),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
