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

export class MockTelephonyProvider implements TelephonyProvider {
  readonly providerName = 'MOCK_CPaaS';
  private activeSessions = new Map<string, CallSession>();
  private activeRecordings = new Map<string, RecordingResult>();

  async originate(options: OriginateCallOptions): Promise<CallSession> {
    const callId = randomUUID();
    const providerCallId = `mock_cpaas_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    // Simulate AMD detection
    const isMachine = Math.random() < 0.15; // 15% voicemail/machine
    const amdResult = options.enableAmd ? (isMachine ? 'MACHINE' : 'HUMAN') : undefined;

    const session: CallSession = {
      callId,
      providerCallId,
      tenantId: options.tenantId,
      callerNumber: options.callerNumber,
      calleeNumber: options.calleeNumber,
      status: 'ANSWERED',
      direction: 'OUTBOUND',
      startTime: new Date(),
      answerTime: new Date(),
      durationSeconds: 0,
      amdResult,
      quality: {
        callId,
        mos: 4.35,
        jitterMs: 12,
        packetLossPercent: 0.2,
        rttMs: 28,
        audioCodec: 'Opus/48000',
      },
    };

    this.activeSessions.set(callId, session);

    if (options.enableRecording) {
      this.activeRecordings.set(callId, {
        recordingId: randomUUID(),
        callId,
        s3Bucket: 'linkora-recordings',
        s3Key: `tenants/${options.tenantId}/calls/${callId}/dual_channel.wav`,
        durationSeconds: 0,
        channels: 2,
        url: `/mock-audio/demo-pv-call.mp3`,
      });
    }

    return session;
  }

  async bridge(callId: string, agentId: string): Promise<BridgeResult> {
    const session = this.activeSessions.get(callId);
    if (session) {
      session.status = 'BRIDGED';
      session.assignedAgentId = agentId;
    }

    return {
      success: true,
      callId,
      agentId,
      bridgedAt: new Date(),
    };
  }

  async hangup(callId: string, reason: string = 'NORMAL_CLEARING'): Promise<HangupResult> {
    const session = this.activeSessions.get(callId);
    const endTime = new Date();
    const duration = session?.startTime
      ? Math.max(1, Math.round((endTime.getTime() - session.startTime.getTime()) / 1000))
      : 45;

    if (session) {
      session.status = 'COMPLETED';
      session.endTime = endTime;
      session.durationSeconds = duration;
    }

    return {
      success: true,
      callId,
      durationSeconds: duration,
      reason,
      endedAt: endTime,
    };
  }

  async startRecording(callId: string): Promise<RecordingResult> {
    const rec: RecordingResult = {
      recordingId: randomUUID(),
      callId,
      s3Bucket: 'linkora-recordings',
      s3Key: `calls/${callId}/recording.wav`,
      durationSeconds: 0,
      channels: 2,
      url: `/mock-audio/sample.mp3`,
    };
    this.activeRecordings.set(callId, rec);
    return rec;
  }

  async stopRecording(callId: string): Promise<RecordingResult> {
    const rec = this.activeRecordings.get(callId) || {
      recordingId: randomUUID(),
      callId,
      s3Bucket: 'linkora-recordings',
      s3Key: `calls/${callId}/recording.wav`,
      durationSeconds: 95,
      channels: 2,
    };
    rec.durationSeconds = 95;
    return rec;
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
    const session = this.activeSessions.get(callId);
    if (session?.quality) {
      return session.quality;
    }

    return {
      callId,
      mos: 4.28,
      jitterMs: 14,
      packetLossPercent: 0.35,
      rttMs: 32,
      audioCodec: 'Opus/48000',
    };
  }
}
