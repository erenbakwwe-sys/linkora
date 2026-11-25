import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route (or controller) as publicly accessible, bypassing the global JwtAuthGuard.
 * Use only for login/refresh, public landing-page forms and inbound webhooks that perform
 * their own signature / token verification.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
