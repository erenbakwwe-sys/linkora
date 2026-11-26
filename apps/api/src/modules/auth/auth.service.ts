import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException, ServiceUnavailableException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService, isDatabaseConfigured } from '../../common/services/database.service.js';
import { AuditService } from '../audit/audit.service.js';
import { UsersService } from '../users/users.service.js';
import { scryptSync } from 'node:crypto';
import { getJwtRefreshSecret, getJwtSecret, safeEqual } from '../../common/security/secrets.js';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    username?: string;
    role: string;
    mode: 'MANAGER' | 'AGENT';
    language: string;
    tenantId: string;
    callerIdNumber?: string | null;
    team?: string;
  };
  tenant: {
    id: string;
    name: string;
    slug: string;
    branding: {
      brand_name: string;
      primary_color: string;
      logo_url: string | null;
    };
    walletBalance: number;
    lowBalanceWarning: boolean;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private db: DatabaseService,
    private jwtService: JwtService,
    private auditService: AuditService,
    private usersService: UsersService
  ) {}

  private verifyPassword(password: string, hash: string): boolean {
    const salt = 'linkora-secure-salt-2026';
    if (!hash || typeof hash !== 'string') return false;
    const computed = scryptSync(password, salt, 32).toString('hex');
    return safeEqual(computed, hash);
  }

  async login(email: string, password: string, tenantSlug?: string): Promise<AuthTokens> {
    const cleanTerm = (email || '').trim().toLowerCase();
    const cleanPwd = (password || '').trim();
    const cleanSlug = (tenantSlug || '').trim().toLowerCase();

    if (!cleanTerm) {
      throw new BadRequestException('E-Mail oder Benutzername ist erforderlich');
    }
    if (!cleanPwd) {
      throw new BadRequestException('Passwort ist erforderlich');
    }

    let user: any = null;
    let isFromDb = false;
    // In-memory accounts are only a first-setup mode: as soon as the database holds users,
    // the database is the only source of accounts (deactivations/password changes must apply).
    let memoryLoginAllowed = !isDatabaseConfigured();

    try {
      let tenantFilter = '';
      const params: any[] = [cleanTerm];

      if (cleanSlug) {
        tenantFilter = 'AND t.slug = $2';
        params.push(cleanSlug);
      }

      const userRes = await this.db.query(
        `SELECT u.*, r.slug as role_slug, t.name as tenant_name, t.slug as tenant_slug,
                t.branding, t.low_balance_threshold_eur, w.balance as wallet_balance
         FROM users u
         JOIN tenants t ON u.tenant_id = t.id
         LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.tenant_id = u.tenant_id
         LEFT JOIN roles r ON ur.role_id = r.id
         LEFT JOIN wallets w ON t.id = w.tenant_id
         WHERE (LOWER(u.email) = $1 OR LOWER(u.first_name) = $1 OR LOWER(u.first_name || ' ' || u.last_name) = $1
                OR LOWER(u.first_name || u.last_name) = $1 OR LOWER(COALESCE(u.display_name, '')) = $1)
               ${tenantFilter} AND u.is_active = true
         ORDER BY (LOWER(u.email) = $1) DESC
         LIMIT 20`,
        params
      );

      // Several accounts can share a name: use the one whose password matches
      const match = (userRes.rows || []).find((row: any) => this.verifyPassword(cleanPwd, row.password_hash));
      if (match) {
        user = match;
        isFromDb = true;
      } else if (isDatabaseConfigured()) {
        const anyUsers = await this.db.query('SELECT 1 FROM users LIMIT 1');
        memoryLoginAllowed = anyUsers.rows.length === 0;
        if (!memoryLoginAllowed) {
          throw new UnauthorizedException(
            userRes.rows.length > 0
              ? 'Ungültige Anmeldedaten (Passwort falsch)'
              : 'Ungültige Anmeldedaten: E-Mail oder Benutzername nicht gefunden',
          );
        }
      }
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      if (isDatabaseConfigured()) {
        throw new ServiceUnavailableException('Datenbank nicht erreichbar. Bitte später erneut versuchen.');
      }
    }

    if (!isFromDb && !memoryLoginAllowed) {
      throw new UnauthorizedException('Ungültige Anmeldedaten');
    }

    if (isFromDb && user) {
      try {
        await this.db.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);
      } catch {}
    } else {
      // Check in UsersService (in-memory or admin created)
      const candidates = this.usersService.findUsersByEmailOrUsername(cleanTerm).filter((u) => u.isActive);
      if (candidates.length === 0) {
        throw new UnauthorizedException('Ungültige Anmeldedaten: E-Mail oder Benutzername nicht gefunden');
      }

      // No master passwords: only the user's own (hashed) password is accepted.
      // Several accounts may share a name, so pick the one whose password matches.
      const memUser = this.usersService.findUserForLogin(cleanTerm, cleanPwd);
      if (!memUser) {
        throw new UnauthorizedException('Ungültige Anmeldedaten (Passwort falsch)');
      }

      const isManager = memUser.role === 'Firmen-Admin';
      const roleSlug = isManager ? 'COMPANY_ADMIN' : 'AGENT';
      const mode = isManager ? 'MANAGER' : 'AGENT';

      user = {
        id: memUser.id,
        email: memUser.email,
        first_name: memUser.username.split(' ')[0] || memUser.username,
        last_name: memUser.username.split(' ')[1] || '',
        username: memUser.username,
        role_slug: roleSlug,
        default_mode: mode,
        tenant_id: memUser.tenantId || '11111111-1111-1111-1111-111111111111',
        tenant_name: 'Linkora',
        tenant_slug: 'linkora',
        caller_id_number: memUser.callerIdNumber || (isManager ? '+49 40 325510' : '+49 40 42925873'),
        team: memUser.team || (isManager ? '—' : 'MD-Team'),
        wallet_balance: 10.0,
        low_balance_threshold_eur: 10.0,
      };
    }

    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenant_id,
      role: user.role_slug || 'AGENT',
      mode: user.default_mode || 'AGENT',
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: 900,
    } as any);

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id, tenantId: user.tenant_id, type: 'refresh' },
      { expiresIn: 604800, secret: getJwtRefreshSecret() } as any
    );

    try {
      await this.auditService.log({
        tenantId: user.tenant_id,
        actorId: user.id,
        actorType: 'USER',
        action: 'AUTH_LOGIN_SUCCESS',
        entityTable: 'users',
        entityId: user.id,
      });
    } catch {}

    const walletBalance = Number(user.wallet_balance || 10.0);
    const lowThreshold = Number(user.low_balance_threshold_eur || 10.0);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username || user.display_name || `${user.first_name} ${user.last_name}`.trim(),
        role: user.role_slug || 'AGENT',
        mode: user.default_mode || 'AGENT',
        language: user.language || 'de',
        tenantId: user.tenant_id,
        callerIdNumber: user.caller_id_number || (user.default_mode === 'MANAGER' ? '+49 40 325510' : '+49 40 42925873'),
        team: user.team || (user.default_mode === 'MANAGER' ? '—' : 'MD-Team'),
      },
      tenant: {
        id: user.tenant_id,
        name: user.tenant_name,
        slug: user.tenant_slug,
        branding: user.branding || {
          brand_name: 'Linkora',
          primary_color: '#0b1220',
          logo_url: null,
        },
        walletBalance,
        lowBalanceWarning: walletBalance <= lowThreshold,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = await this.jwtService.verifyAsync(refreshToken, {
        secret: getJwtRefreshSecret(),
      });
      if (decoded?.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      let user: any = null;
      try {
        const userRes = await this.db.query(
          `SELECT u.*, r.slug as role_slug FROM users u
           LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.tenant_id = u.tenant_id
           LEFT JOIN roles r ON ur.role_id = r.id
           WHERE u.id::text = $1 AND u.is_active = true LIMIT 1`,
          [decoded.sub]
        );
        user = userRes.rows[0] || null;
      } catch {
        // DB not reachable – fall back to in-memory accounts below
      }

      const memoryAllowed =
        !isDatabaseConfigured() || (await this.db.query('SELECT 1 FROM users LIMIT 1').catch(() => ({ rows: [1] }))).rows.length === 0;
      if (!user && memoryAllowed) {
        const memUser = this.usersService.findUserById(decoded.sub);
        if (memUser && memUser.isActive) {
          const isManager = memUser.role === 'Firmen-Admin';
          user = {
            id: memUser.id,
            email: memUser.email,
            tenant_id: memUser.tenantId || '11111111-1111-1111-1111-111111111111',
            role_slug: isManager ? 'COMPANY_ADMIN' : 'AGENT',
            default_mode: isManager ? 'MANAGER' : 'AGENT',
          };
        }
      }

      if (!user) {
        throw new UnauthorizedException('User not found or inactive');
      }

      const payload = {
        sub: user.id,
        email: user.email,
        // keep the tenant the refresh token was issued for (it was validated at switch time)
        tenantId: decoded.tenantId || user.tenant_id,
        role: user.role_slug || 'AGENT',
        mode: user.default_mode || 'AGENT',
      };

      const accessToken = await this.jwtService.signAsync(payload, {
        expiresIn: 900,
      } as any);

      return { accessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async switchMode(
    userId: string,
    mode: 'MANAGER' | 'AGENT',
    currentRole?: string,
    currentTenantId?: string,
  ): Promise<{ mode: 'MANAGER' | 'AGENT'; accessToken: string }> {
    if (mode === 'MANAGER' && (!currentRole || currentRole === 'AGENT')) {
      throw new ForbiddenException('Agents cannot switch to manager mode');
    }
    await this.db.query('UPDATE users SET default_mode = $1 WHERE id = $2', [mode, userId]);

    const userRes = await this.db.query(
      `SELECT u.*, r.slug as role_slug FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.tenant_id = u.tenant_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.id = $1 LIMIT 1`,
      [userId]
    );

    const user = userRes.rows[0];
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: currentTenantId || user.tenant_id,
      role: user.role_slug || currentRole || 'AGENT',
      mode,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: 900,
    } as any);

    return { mode, accessToken };
  }

  async switchTenant(
    userId: string,
    currentTenantId: string,
    targetTenantId: string,
    currentRole: string = 'AGENT',
  ): Promise<AuthTokens> {
    if (currentRole === 'AGENT') {
      throw new ForbiddenException('Agents cannot switch tenants');
    }
    // Check if user has access to target tenant (either direct membership or target is child of current tenant)
    const allowedRes = await this.db.query(
      `WITH RECURSIVE tenant_tree AS (
         SELECT id FROM tenants WHERE id = $1
         UNION ALL
         SELECT t.id FROM tenants t INNER JOIN tenant_tree tt ON t.parent_tenant_id = tt.id
       )
       SELECT 1 FROM tenant_tree WHERE id = $2`,
      [currentTenantId, targetTenantId]
    );

    if (allowedRes.rows.length === 0) {
      throw new BadRequestException('Not authorized to access the requested tenant in hierarchy');
    }

    const tenantRes = await this.db.query(
      `SELECT t.*, w.balance as wallet_balance FROM tenants t
       LEFT JOIN wallets w ON t.id = w.tenant_id
       WHERE t.id = $1 LIMIT 1`,
      [targetTenantId]
    );

    const userRes = await this.db.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [userId]);

    const user = userRes.rows[0];
    const targetTenant = tenantRes.rows[0];
    if (!user || !targetTenant) {
      throw new BadRequestException('Not authorized to access the requested tenant in hierarchy');
    }

    // Keep the caller's role – switching tenant must never grant admin rights.
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: targetTenantId,
      role: currentRole,
      mode: user.default_mode || 'MANAGER',
    };

    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: 900, secret: getJwtSecret() } as any);
    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id, tenantId: targetTenantId, type: 'refresh' },
      { expiresIn: 604800, secret: getJwtRefreshSecret() } as any,
    );

    const walletBalance = Number(targetTenant.wallet_balance || 0);
    const lowThreshold = Number(targetTenant.low_balance_threshold_eur || 10.0);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: currentRole,
        mode: user.default_mode || 'MANAGER',
        language: user.language || 'de',
        tenantId: targetTenantId,
      },
      tenant: {
        id: targetTenant.id,
        name: targetTenant.name,
        slug: targetTenant.slug,
        branding: targetTenant.branding || { brand_name: 'YourBrand', primary_color: '#0b1220', logo_url: null },
        walletBalance,
        lowBalanceWarning: walletBalance <= lowThreshold,
      },
    };
  }

  async getMe(userId: string, tenantId: string) {
    const res = await this.db.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.default_mode, u.language,
              r.slug as role_slug, t.id as tenant_id, t.name as tenant_name, t.slug as tenant_slug,
              t.branding, t.low_balance_threshold_eur, w.balance as wallet_balance
       FROM users u
       JOIN tenants t ON t.id = $2
       LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.tenant_id = $2
       LEFT JOIN roles r ON ur.role_id = r.id
       LEFT JOIN wallets w ON t.id = w.tenant_id
       WHERE u.id = $1 LIMIT 1`,
      [userId, tenantId]
    );

    if (res.rows.length === 0) {
      throw new UnauthorizedException('User not found');
    }

    const row = res.rows[0];
    const walletBalance = Number(row.wallet_balance || 0);
    const lowThreshold = Number(row.low_balance_threshold_eur || 10.0);

    return {
      user: {
        id: row.id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        role: row.role_slug || 'AGENT',
        mode: row.default_mode || 'MANAGER',
        language: row.language || 'de',
        tenantId: row.tenant_id,
      },
      tenant: {
        id: row.tenant_id,
        name: row.tenant_name,
        slug: row.tenant_slug,
        branding: row.branding || { brand_name: 'YourBrand', primary_color: '#0b1220', logo_url: null },
        walletBalance,
        lowBalanceWarning: walletBalance <= lowThreshold,
      },
    };
  }
}
