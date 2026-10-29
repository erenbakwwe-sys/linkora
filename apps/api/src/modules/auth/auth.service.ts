import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../../common/services/database.service.js';
import { AuditService } from '../audit/audit.service.js';
import { scryptSync } from 'node:crypto';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    mode: 'MANAGER' | 'AGENT';
    language: string;
    tenantId: string;
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
    private auditService: AuditService
  ) {}

  private verifyPassword(password: string, hash: string): boolean {
    const salt = 'linkora-secure-salt-2026';
    const computed = scryptSync(password, salt, 32).toString('hex');
    return computed === hash;
  }

  async login(email: string, password: string, tenantSlug?: string): Promise<AuthTokens> {
    let tenantFilter = '';
    const params: any[] = [email];

    if (tenantSlug) {
      tenantFilter = 'AND t.slug = $2';
      params.push(tenantSlug);
    }

    const userRes = await this.db.query(
      `SELECT u.*, r.slug as role_slug, t.name as tenant_name, t.slug as tenant_slug,
              t.branding, t.low_balance_threshold_eur, w.balance as wallet_balance
       FROM users u
       JOIN tenants t ON u.tenant_id = t.id
       LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.tenant_id = u.tenant_id
       LEFT JOIN roles r ON ur.role_id = r.id
       LEFT JOIN wallets w ON t.id = w.tenant_id
       WHERE u.email = $1 ${tenantFilter} AND u.is_active = true
       LIMIT 1`,
      params
    );

    if (userRes.rows.length === 0) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const user = userRes.rows[0];

    if (!this.verifyPassword(password, user.password_hash)) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last login
    await this.db.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenant_id,
      role: user.role_slug || 'AGENT',
      mode: user.default_mode || 'MANAGER',
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: 900,
    } as any);

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id, tenantId: user.tenant_id, type: 'refresh' },
      { expiresIn: 604800 } as any
    );

    await this.auditService.log({
      tenantId: user.tenant_id,
      actorId: user.id,
      actorType: 'USER',
      action: 'AUTH_LOGIN_SUCCESS',
      entityTable: 'users',
      entityId: user.id,
    });

    const walletBalance = Number(user.wallet_balance || 0);
    const lowThreshold = Number(user.low_balance_threshold_eur || 10.0);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role_slug || 'AGENT',
        mode: user.default_mode || 'MANAGER',
        language: user.language || 'de',
        tenantId: user.tenant_id,
      },
      tenant: {
        id: user.tenant_id,
        name: user.tenant_name,
        slug: user.tenant_slug,
        branding: user.branding || {
          brand_name: 'YourBrand',
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
        secret: process.env.JWT_REFRESH_SECRET || 'super-secret-jwt-refresh-key-minimum-32-chars-linkora',
      });

      const userRes = await this.db.query(
        `SELECT u.*, r.slug as role_slug FROM users u
         LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.tenant_id = u.tenant_id
         LEFT JOIN roles r ON ur.role_id = r.id
         WHERE u.id = $1 AND u.is_active = true LIMIT 1`,
        [decoded.sub]
      );

      if (userRes.rows.length === 0) {
        throw new UnauthorizedException('User not found or inactive');
      }

      const user = userRes.rows[0];
      const payload = {
        sub: user.id,
        email: user.email,
        tenantId: user.tenant_id,
        role: user.role_slug || 'AGENT',
        mode: user.default_mode || 'MANAGER',
      };

      const accessToken = await this.jwtService.signAsync(payload, {
        expiresIn: 900,
      } as any);

      return { accessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async switchMode(userId: string, mode: 'MANAGER' | 'AGENT'): Promise<{ mode: 'MANAGER' | 'AGENT'; accessToken: string }> {
    await this.db.query('UPDATE users SET default_mode = $1 WHERE id = $2', [mode, userId]);

    const userRes = await this.db.query(
      `SELECT u.*, r.slug as role_slug FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.tenant_id = u.tenant_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.id = $1 LIMIT 1`,
      [userId]
    );

    const user = userRes.rows[0];
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenant_id,
      role: user.role_slug || 'AGENT',
      mode,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: 900,
    } as any);

    return { mode, accessToken };
  }

  async switchTenant(userId: string, currentTenantId: string, targetTenantId: string): Promise<AuthTokens> {
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

    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: targetTenantId,
      role: 'COMPANY_ADMIN',
      mode: user.default_mode || 'MANAGER',
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync({ sub: user.id, tenantId: targetTenantId, type: 'refresh' });

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
        role: 'COMPANY_ADMIN',
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
