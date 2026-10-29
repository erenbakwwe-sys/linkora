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

export interface TelnyxConfig {
  apiKey: string;
  connectionId: string;
  webhookUrl?: string;
}

export class TelnyxProvider implements TelephonyProvider {
  readonly providerName = 'TELNYX';
  private config: TelnyxConfig;

  constructor(config?: Partial<TelnyxConfig>) {
    this.config = {
      apiKey: config?.apiKey || process.env.TELNYX_API_KEY || 'mock_telnyx_key',
      connectionId: config?.connectionId || process.env.TELNYX_CONNECTION_ID || 'mock_conn_id',
      webhookUrl: config?.webhookUrl,
    };
  }

  async originate(options: OriginateCallOptions): Promise<CallSession> {
    const callId = randomUUID();
    const providerCallId = `v3:telnyx_${callId.slice(0, 8)}`;

    return {
      callId,
      providerCallId,
      tenantId: options.tenantId,
      callerNumber: options.callerNumber,
      calleeNumber: options.calleeNumber,
      status: 'INITIATED',
      direction: 'OUTBOUND',
      startTime: new Date(),
      durationSeconds: 0,
      quality: {
        callId,
        mos: 4.4,
        jitterMs: 10,
        packetLossPercent: 0.1,
        rttMs: 25,
        audioCodec: 'G722/16000',
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
      durationSeconds: 60,
      reason,
      endedAt: new Date(),
    };
  }

  async startRecording(callId: string): Promise<RecordingResult> {
    return {
      recordingId: randomUUID(),
      callId,
      s3Bucket: 'telnyx-recordings',
      s3Key: `telnyx/${callId}/recording.mp3`,
      durationSeconds: 0,
      channels: 2,
    };
  }

  async stopRecording(callId: string): Promise<RecordingResult> {
    return {
      recordingId: randomUUID(),
      callId,
      s3Bucket: 'telnyx-recordings',
      s3Key: `telnyx/${callId}/recording.mp3`,
      durationSeconds: 120,
      channels: 2,
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
      mos: 4.38,
      jitterMs: 11,
      packetLossPercent: 0.15,
      rttMs: 24,
      audioCodec: 'Opus/48000',
    };
  }
}
