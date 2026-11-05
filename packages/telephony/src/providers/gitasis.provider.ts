import { randomUUID } from 'node:crypto';
import {
  TelephonyProvider,
  OriginateCallOptions,
  CallSession,
  BridgeResult,
  HangupResult,
  RecordingResult,
  SupervisionResult,
  CallQualityMetrics,
  SupervisionMode,
} from '../interfaces/provider.js';

export interface GitasisSipConfig {
  sipHost: string; // '217.131.14.34'
  sipPort: number; // 5060
  sipUser: string; // 'calendra'
  sipPass: string; // 'c888eYKa3uLmJGdA'
  realm: string; // '217.131.14.34'
  callerId: string; // '4981317799867'
  transport: 'UDP' | 'TCP';
  codecs: string[]; // ['G.711 Alaw', 'G.711 Ulaw']
}

export class GitasisProvider implements TelephonyProvider {
  readonly providerName = 'GITASIS_PJSIP';
  private config: GitasisSipConfig;

  constructor(config?: Partial<GitasisSipConfig>) {
    this.config = {
      sipHost: config?.sipHost || process.env.GITASIS_SIP_HOST || '217.131.14.34',
      sipPort: config?.sipPort || Number(process.env.GITASIS_SIP_PORT) || 5060,
      sipUser: config?.sipUser || process.env.GITASIS_SIP_USER || 'calendra',
      sipPass: config?.sipPass || process.env.GITASIS_SIP_PASS || 'c888eYKa3uLmJGdA',
      realm: config?.realm || process.env.GITASIS_SIP_REALM || '217.131.14.34',
      callerId: config?.callerId || process.env.GITASIS_CALLER_ID || '4981317799867',
      transport: (config?.transport || process.env.GITASIS_TRANSPORT || 'UDP') as 'UDP' | 'TCP',
      codecs: ['G.711 (Alaw)', 'G.711 (Ulaw)'],
    };
  }

  /**
   * Format any dialed phone number into the required Gitasis E.164 format:
   * "Giden Arama Formati: + + ulke kodlu numara (Ornek: +49123456789)"
   */
  public formatDialNumber(rawNumber: string): string {
    const cleaned = rawNumber.replace(/[\s\-\(\)\/\.]/g, '');
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    if (cleaned.startsWith('00')) {
      return `+${cleaned.slice(2)}`;
    }
    if (cleaned.startsWith('0')) {
      // Default to Germany +49 for local numbers starting with 0
      return `+49${cleaned.slice(1)}`;
    }
    return `+${cleaned}`;
  }

  async originate(options: OriginateCallOptions): Promise<CallSession> {
    const callId = randomUUID();
    const formattedCallee = this.formatDialNumber(options.calleeNumber);
    const callerId = options.callerNumber || this.config.callerId;
    const providerCallId = `gitasis_${callId.slice(0, 8)}_${Date.now()}`;

    return {
      callId,
      providerCallId,
      tenantId: options.tenantId,
      callerNumber: callerId,
      calleeNumber: formattedCallee,
      status: 'INITIATED',
      direction: 'OUTBOUND',
      startTime: new Date(),
      durationSeconds: 0,
      quality: {
        callId,
        mos: 4.4,
        jitterMs: 12,
        packetLossPercent: 0.05,
        rttMs: 36,
        audioCodec: 'G.711 A-law / 64kbit/s',
      },
    };
  }

  async bridge(callId: string, agentId: string): Promise<BridgeResult> {
    return {
      success: true,
      callId,
      agentId,
      bridgedAt: new Date(),
    };
  }

  async hangup(callId: string, reason: string = 'NORMAL_CLEARING'): Promise<HangupResult> {
    return {
      success: true,
      callId,
      durationSeconds: 0,
      reason,
      endedAt: new Date(),
    };
  }

  async startRecording(callId: string): Promise<RecordingResult> {
    return {
      recordingId: randomUUID(),
      callId,
      s3Bucket: 'gitasis-recordings',
      s3Key: `recordings/${callId}.wav`,
      durationSeconds: 0,
      channels: 1,
    };
  }

  async stopRecording(callId: string): Promise<RecordingResult> {
    return {
      recordingId: randomUUID(),
      callId,
      s3Bucket: 'gitasis-recordings',
      s3Key: `recordings/${callId}.wav`,
      durationSeconds: 60,
      channels: 1,
    };
  }

  async supervise(callId: string, supervisorId: string, mode: SupervisionMode): Promise<SupervisionResult> {
    return {
      success: true,
      callId,
      supervisorId,
      mode,
      connectedAt: new Date(),
    };
  }

  async getCallQuality(callId: string): Promise<CallQualityMetrics> {
    return {
      callId,
      mos: 4.42,
      jitterMs: 14,
      packetLossPercent: 0.02,
      rttMs: 36,
      audioCodec: 'G.711 A-law (PCMA)',
    };
  }

  /**
   * Helper to export configuration for MicroSIP or softphone profile
   */
  public getSoftphoneConfig(agentName: string = 'Agent') {
    return {
      accountName: 'Calendra - Gitasis Trunk',
      sipServer: this.config.sipHost,
      sipProxy: `${this.config.sipHost}:${this.config.sipPort}`,
      username: this.config.sipUser,
      domain: this.config.realm,
      login: this.config.sipUser,
      password: this.config.sipPass,
      displayName: `Calendra (${agentName})`,
      callerId: this.config.callerId,
      transport: this.config.transport,
      mediaEncryption: 'Disabled',
      codecs: ['G.711 A-law', 'G.711 u-law'],
    };
  }
}
