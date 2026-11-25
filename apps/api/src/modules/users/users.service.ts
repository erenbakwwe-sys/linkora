import { Injectable, BadRequestException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../../common/services/database.service.js';
import { scryptSync } from 'node:crypto';
import { DEFAULT_TENANT_ID, safeEqual } from '../../common/security/secrets.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

export interface UserItem {
  id: string;
  userNumber: string; // e.g. '#156', '#211'
  username: string;
  name: string;
  email: string;
  role: 'Firmen-Admin' | 'Teamleiter' | 'Agent' | 'QC-Prüfer';
  team: string; // e.g. 'MD-Team', 'Testcalendra', '—'
  isActive: boolean;
  callerIdNumber: string | null;
  lastLogin: string;
  createdAt: string;
  passwordHash?: string;
  tenantId?: string;
  /** @deprecated legacy plaintext password from persisted files; migrated to a hash on load */
  passwordPlain?: string;
  /** Built-in demo account; its password comes from DEMO_USERS_PASSWORD (or dev defaults outside production) */
  builtin?: 'admin' | 'agent';
}

export type PublicUserItem = Omit<UserItem, 'passwordHash' | 'passwordPlain' | 'builtin'>;

export function toPublicUser(u: UserItem): PublicUserItem {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, passwordPlain, builtin, ...rest } = u;
  return rest;
}

@Injectable()
export class UsersService implements OnModuleInit {
  private inMemoryUsers: UserItem[] = [
    {
      id: 'usr-157',
      userNumber: '#157',
      username: 'Murat2',
      name: 'Murat2',
      email: 'murat2@linkora.io',
      role: 'Agent',
      team: 'MD-Team',
      isActive: true,
      callerIdNumber: '+49 40 42925873',
      lastLogin: 'vor 5 Min.',
      createdAt: '31.10.2026',
      builtin: 'agent',
    },
    {
      id: 'usr-156',
      userNumber: '#156',
      username: 'Murat Dere',
      name: 'Murat Dere',
      email: 'murat.dere@linkora.io',
      role: 'Agent',
      team: 'MD-Team',
      isActive: true,
      callerIdNumber: '+49 30 901820',
      lastLogin: 'vor 18 Std.',
      createdAt: '13.08.2026',
      builtin: 'agent',
    },
    {
      id: 'usr-209',
      userNumber: '#209',
      username: 'Eren',
      name: 'Eren',
      email: 'eren.lead@linkora.io',
      role: 'Teamleiter',
      team: 'Testcalendra',
      isActive: true,
      callerIdNumber: null,
      lastLogin: 'vor 27 Tagen',
      createdAt: '02.10.2026',
      builtin: 'agent',
    },
    {
      id: 'usr-212',
      userNumber: '#212',
      username: 'Derya',
      name: 'Derya',
      email: 'derya@linkora.io',
      role: 'Firmen-Admin',
      team: '—',
      isActive: true,
      callerIdNumber: '+49 89 203040',
      lastLogin: 'vor 1 Std.',
      createdAt: '02.10.2026',
      builtin: 'admin',
    },
    {
      id: 'usr-210',
      userNumber: '#210',
      username: 'Erensamsun',
      name: 'Erensamsun',
      email: 'erensamsun@linkora.io',
      role: 'Firmen-Admin',
      team: '—',
      isActive: true,
      callerIdNumber: '+49 40 325510',
      lastLogin: 'vor 18 Std.',
      createdAt: '02.10.2026',
      builtin: 'admin',
    },
    {
      id: 'usr-240',
      userNumber: '#240',
      username: 'Erensamsun',
      name: 'Erensamsun',
      email: 'erensamsun.admin@linkora.io',
      role: 'Firmen-Admin',
      team: '—',
      isActive: true,
      callerIdNumber: null,
      lastLogin: '—',
      createdAt: '28.10.2026',
      builtin: 'admin',
    },
    {
      id: 'usr-151',
      userNumber: '#151',
      username: 'Murat.D',
      name: 'Murat.D',
      email: 'murat.d@linkora.io',
      role: 'Firmen-Admin',
      team: '—',
      isActive: true,
      callerIdNumber: '+49 221 498230',
      lastLogin: 'vor 24 Tagen',
      createdAt: '10.08.2026',
      builtin: 'admin',
    },
    {
      id: 'usr-211',
      userNumber: '#211',
      username: 'Umut',
      name: 'Umut',
      email: 'umut@cc-izmir.com',
      role: 'Firmen-Admin',
      team: '—',
      isActive: true,
      callerIdNumber: null,
      lastLogin: 'vor 1 Tagen',
      createdAt: '02.10.2026',
      builtin: 'admin',
    },
  ];

  private freeCallerNumbers: string[] = [
    '+49 30 901821 (Berlin Hauptnummer)',
    '+49 89 203045 (München Pool)',
    '+49 40 325519 (Hamburg Pool)',
    '+49 221 498235 (Köln Pool)',
    '+49 69 975820 (Frankfurt Pool)',
    '+49 711 216080 (Stuttgart Pool)',
  ];

  constructor(private db: DatabaseService) {}

  onModuleInit() {
    this.loadPersistedUsers();
  }

  private getStorageFilePath(): string {
    try {
      const dir = path.resolve(process.cwd(), 'data');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      return path.join(dir, 'users.json');
    } catch {
      return path.resolve(process.cwd(), 'users.json');
    }
  }

  private loadPersistedUsers() {
    try {
      const filePath = this.getStorageFilePath();
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(this.inMemoryUsers.map(u => u.id));
          const existingEmails = new Set(this.inMemoryUsers.map(u => u.email.toLowerCase()));
          for (const u of parsed) {
            if (u && typeof u.passwordPlain === 'string' && u.passwordPlain) {
              u.passwordHash = this.hashPassword(u.passwordPlain);
              delete u.passwordPlain;
            }
            if (!u || !u.id || !u.email) continue;
            if (!existingIds.has(u.id) && !existingEmails.has(u.email.toLowerCase())) {
              this.inMemoryUsers.unshift(u);
              existingIds.add(u.id);
              existingEmails.add(u.email.toLowerCase());
            }
          }
        }
      } else {
        this.savePersistedUsers();
      }
    } catch {
      // Continue gracefully
    }
  }

  private savePersistedUsers() {
    try {
      const filePath = this.getStorageFilePath();
      // Never persist plaintext passwords
      const data = this.inMemoryUsers.map(({ passwordPlain, ...rest }) => rest);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), { encoding: 'utf-8', mode: 0o600 });
    } catch {
      // Ignore in read-only environments
    }
  }

  private hashPassword(password: string): string {
    const salt = 'linkora-secure-salt-2026';
    return scryptSync(password, salt, 32).toString('hex');
  }

  /** Verifies a password against an in-memory user record (no master passwords). */
  verifyUserPassword(user: UserItem, password: string): boolean {
    if (!password) return false;
    if (user.passwordHash) {
      return safeEqual(this.hashPassword(password), user.passwordHash);
    }
    if (user.builtin) {
      const configured = process.env.DEMO_USERS_PASSWORD;
      if (configured) return safeEqual(password, configured);
      const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
      if (isProd) return false; // built-in demo credentials are disabled in production
      return safeEqual(password, user.builtin === 'admin' ? 'Admin123!' : 'Agent123!');
    }
    return false;
  }

  async getAllUsers(tenantId: string = DEFAULT_TENANT_ID): Promise<PublicUserItem[]> {
    try {
      const dbUsers = await this.db.query(
        `SELECT id, email, first_name, last_name, default_mode, is_active, created_at, last_login_at
         FROM users
         WHERE tenant_id = $1
         ORDER BY created_at DESC LIMIT 50`,
        [tenantId]
      );

      if (dbUsers.rows && dbUsers.rows.length > 0) {
        // Merge or sync with inMemoryUsers to ensure the exact 7 users from reference are present
        const existingEmails = new Set(this.inMemoryUsers.map(u => u.email.toLowerCase()));
        for (const row of dbUsers.rows) {
          if (!existingEmails.has(row.email.toLowerCase())) {
            const num = '#' + Math.floor(100 + Math.random() * 899);
            this.inMemoryUsers.push({
              id: row.id,
              userNumber: num,
              username: `${row.first_name} ${row.last_name}`.trim(),
              name: `${row.first_name} ${row.last_name}`.trim(),
              email: row.email,
              role: row.default_mode === 'MANAGER' ? 'Firmen-Admin' : 'Agent',
              team: '—',
              isActive: row.is_active ?? true,
              callerIdNumber: null,
              lastLogin: row.last_login_at ? new Date(row.last_login_at).toLocaleDateString('de-DE') : '—',
              createdAt: new Date(row.created_at).toLocaleDateString('de-DE'),
              tenantId,
            });
            existingEmails.add(row.email.toLowerCase());
          }
        }
      }
    } catch {
      // Fallback cleanly to inMemoryUsers
    }
    // In-memory accounts without an explicit tenant belong to the default platform tenant
    return this.inMemoryUsers
      .filter((u) => (u.tenantId || DEFAULT_TENANT_ID) === tenantId)
      .map(toPublicUser);
  }

  private findInTenant(id: string, tenantId: string): UserItem | undefined {
    return this.inMemoryUsers.find(
      (u) => (u.id === id || u.userNumber === id) && (u.tenantId || DEFAULT_TENANT_ID) === tenantId,
    );
  }

  getFreeSystemNumbers(): string[] {
    const assignedNumbers = new Set(
      this.inMemoryUsers
        .filter(u => u.isActive && u.callerIdNumber)
        .map(u => u.callerIdNumber)
    );
    return this.freeCallerNumbers.filter(n => !assignedNumbers.has(n));
  }

  async updateUser(
    tenantId: string,
    id: string,
    dto: {
      username?: string;
      name?: string;
      role?: 'Firmen-Admin' | 'Teamleiter' | 'Agent' | 'QC-Prüfer';
      team?: string;
      isActive?: boolean;
      callerIdNumber?: string | null;
      newPassword?: string;
    }
  ): Promise<PublicUserItem> {
    const user = this.findInTenant(id, tenantId);
    if (!user) {
      throw new NotFoundException(`Benutzer mit ID ${id} nicht gefunden`);
    }

    if (dto.username !== undefined) {
      user.username = dto.username.trim();
      user.name = dto.username.trim();
    }
    if (dto.name !== undefined) {
      user.name = dto.name.trim();
      user.username = dto.name.trim();
    }
    if (dto.role !== undefined) {
      user.role = dto.role;
    }
    if (dto.team !== undefined) {
      user.team = dto.team;
    }
    if (dto.isActive !== undefined) {
      user.isActive = dto.isActive;
      // Anrufer-Nummer wird beim Deaktivieren automatisch freigegeben
      if (!dto.isActive) {
        user.callerIdNumber = null;
      }
    }
    if (dto.callerIdNumber !== undefined && user.isActive) {
      user.callerIdNumber = dto.callerIdNumber === '' ? null : dto.callerIdNumber;
    }

    // Password Update
    if (dto.newPassword && dto.newPassword.trim().length > 0) {
      if (dto.newPassword.trim().length < 8) {
        throw new BadRequestException('Das Passwort muss mindestens 8 Zeichen lang sein.');
      }
      const hashed = this.hashPassword(dto.newPassword.trim());
      // Apply to the in-memory record as well (previously the new password never took effect here)
      user.passwordHash = hashed;
      delete user.passwordPlain;
      delete user.builtin;
      try {
        await this.db.query(
          `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE (email = $2 OR id::text = $3) AND tenant_id = $4`,
          [hashed, user.email, user.id, tenantId]
        );
      } catch (err) {
        // Updated in DB if available
      }
    }

    this.savePersistedUsers();
    return toPublicUser(user);
  }

  async createUser(tenantId: string, dto: {
    username: string;
    email: string;
    role: 'Firmen-Admin' | 'Teamleiter' | 'Agent' | 'QC-Prüfer';
    team?: string;
    callerIdNumber?: string | null;
    password?: string;
  }): Promise<PublicUserItem> {
    const username = (dto?.username || '').trim();
    const email = (dto?.email || '').trim();
    if (!username || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException('Benutzername und gültige E-Mail sind erforderlich.');
    }
    const allowedRoles = ['Firmen-Admin', 'Teamleiter', 'Agent', 'QC-Prüfer'];
    if (dto.role && !allowedRoles.includes(dto.role)) {
      throw new BadRequestException('Ungültige Rolle.');
    }
    if (this.inMemoryUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new BadRequestException('Ein Benutzer mit dieser E-Mail existiert bereits.');
    }
    const plainPwd = dto.password?.trim() || '';
    if (plainPwd.length < 8) {
      throw new BadRequestException('Das Passwort muss mindestens 8 Zeichen lang sein.');
    }
    const num = '#' + Math.floor(100 + Math.random() * 899);
    const hashed = this.hashPassword(plainPwd);

    const newUser: UserItem = {
      id: 'usr-' + Date.now(),
      userNumber: num,
      username: dto.username.trim(),
      name: dto.username.trim(),
      email: dto.email.trim(),
      role: dto.role || 'Agent',
      team: dto.team?.trim() || 'MD-Team',
      isActive: true,
      callerIdNumber: dto.callerIdNumber || '+49 40 42925873',
      lastLogin: '—',
      createdAt: new Date().toLocaleDateString('de-DE'),
      passwordHash: hashed,
      tenantId,
    };

    if (plainPwd && plainPwd.length >= 8) {
      try {
        await this.db.query(
          `INSERT INTO users (tenant_id, email, password_hash, first_name, last_name, default_mode, is_active)
           VALUES ($6, $1, $2, $3, $4, $5, true)
           ON CONFLICT DO NOTHING`,
          [
            email,
            hashed,
            dto.username.split(' ')[0] || dto.username,
            dto.username.split(' ')[1] || '',
            dto.role === 'Firmen-Admin' ? 'MANAGER' : 'AGENT',
            tenantId,
          ]
        );
      } catch {
        // Ignored if local
      }
    }

    this.inMemoryUsers.unshift(newUser);
    this.savePersistedUsers();
    return toPublicUser(newUser);
  }

  findUserById(id: string): UserItem | undefined {
    if (!id) return undefined;
    return this.inMemoryUsers.find((u) => u.id === id);
  }

  findUserByEmailOrUsername(identifier: string): UserItem | undefined {
    if (!identifier) return undefined;
    const term = identifier.trim().toLowerCase();
    return this.inMemoryUsers.find(
      (u) =>
        u.email.toLowerCase() === term ||
        u.username.toLowerCase() === term ||
        u.name.toLowerCase() === term ||
        (term === 'admin@linkora.io' && (u.username.toLowerCase() === 'erensamsun' || u.email.toLowerCase() === 'erensamsun@linkora.io')) ||
        (term === 'admin' && (u.role === 'Firmen-Admin' || u.username.toLowerCase() === 'erensamsun'))
    );
  }

  async toggleStatus(tenantId: string, id: string): Promise<PublicUserItem> {
    const user = this.findInTenant(id, tenantId);
    if (!user) {
      throw new NotFoundException(`Benutzer mit ID ${id} nicht gefunden`);
    }

    user.isActive = !user.isActive;
    if (!user.isActive) {
      // Beim Deaktivieren wird die Anrufer-Nummer sofort frei
      user.callerIdNumber = null;
    }

    try {
      await this.db.query(
        `UPDATE users SET is_active = $1, updated_at = NOW() WHERE (email = $2 OR id::text = $3) AND tenant_id = $4`,
        [user.isActive, user.email, user.id, tenantId]
      );
    } catch {
      // DB sync
    }

    this.savePersistedUsers();
    return toPublicUser(user);
  }
}
