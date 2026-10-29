import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/services/database.service.js';

export interface AutoDialSettingsDto {
  ringTimeoutSeconds: number; // e.g. 30
  retryRules: {
    maxAttempts: number;
    intervalsMin: number[];
  };
  amdActive: boolean;
  amdAction: 'HANGUP' | 'VOICEMAIL_DROP' | 'AGENT';
  maxAbandonRatePercent: number; // default 3.00%
  minFreeAgents: number; // default 1
  lineCapMultiplier: number; // default 3.0
  recordingActive: boolean;
  callerIdRotation: 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY';
}

const memorySettings = new Map<string, AutoDialSettingsDto>([
  [
    '11111111-1111-1111-1111-111111111111',
    {
      ringTimeoutSeconds: 30,
      retryRules: {
        maxAttempts: 5,
        intervalsMin: [30, 120, 360],
      },
      amdActive: true,
      amdAction: 'HANGUP',
      maxAbandonRatePercent: 3.0,
      minFreeAgents: 1,
      lineCapMultiplier: 3.0,
      recordingActive: true,
      callerIdRotation: 'WEEKLY',
    },
  ],
]);

@Injectable()
export class AutoDialService {
  constructor(private readonly db: DatabaseService) {}

  async getSettings(tenantId: string): Promise<AutoDialSettingsDto> {
    const existing = memorySettings.get(tenantId);
    if (existing) return existing;

    const defaultSettings: AutoDialSettingsDto = {
      ringTimeoutSeconds: 30,
      retryRules: { maxAttempts: 5, intervalsMin: [30, 120, 360] },
      amdActive: true,
      amdAction: 'HANGUP',
      maxAbandonRatePercent: 3.0,
      minFreeAgents: 1,
      lineCapMultiplier: 3.0,
      recordingActive: true,
      callerIdRotation: 'WEEKLY',
    };

    memorySettings.set(tenantId, defaultSettings);
    return defaultSettings;
  }

  async updateSettings(tenantId: string, updates: Partial<AutoDialSettingsDto>): Promise<AutoDialSettingsDto> {
    const current = await this.getSettings(tenantId);
    const updated: AutoDialSettingsDto = {
      ...current,
      ...updates,
      // Strictly enforce abandon rate limit <= 5.0%
      maxAbandonRatePercent: Math.min(5.0, updates.maxAbandonRatePercent ?? current.maxAbandonRatePercent),
    };

    memorySettings.set(tenantId, updated);
    return updated;
  }
}
