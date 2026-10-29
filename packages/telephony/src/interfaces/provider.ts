export type AmdResult = 'HUMAN' | 'MACHINE' | 'FAX' | 'NOT_SURE';

export type SupervisionMode = 'LISTEN' | 'WHISPER' | 'BARGE';

export interface CallQualityMetrics {
  callId: string;
  mos: number; // Mean Opinion Score (1.0 to 5.0, e.g. 4.3)
  jitterMs: number;
  packetLossPercent: number;
  rttMs: number;
  audioCodec: string;
}

export interface OriginateCallOptions {
  tenantId: string;
  campaignId?: string;
  leadId?: string;
  callerNumber: string;
  calleeNumber: string;
  enableAmd?: boolean;
  enableRecording?: boolean;
  ringTimeoutSeconds?: number;
  metadata?: Record<string, any>;
}

export interface CallSession {
  callId: string;
  providerCallId: string;
  tenantId: string;
  callerNumber: string;
  calleeNumber: string;
  status: 'INITIATED' | 'RINGING' | 'ANSWERED' | 'BRIDGED' | 'COMPLETED' | 'FAILED' | 'BUSY' | 'NO_ANSWER';
  direction: 'OUTBOUND' | 'INBOUND';
  startTime: Date;
  answerTime?: Date;
  endTime?: Date;
  durationSeconds: number;
  amdResult?: AmdResult;
  assignedAgentId?: string;
  quality?: CallQualityMetrics;
}

export interface BridgeResult {
  success: boolean;
  callId: string;
  agentId: string;
  bridgedAt: Date;
}

export interface HangupResult {
  success: boolean;
  callId: string;
  durationSeconds: number;
  reason: string;
  endedAt: Date;
}

export interface RecordingResult {
  recordingId: string;
  callId: string;
  s3Bucket: string;
  s3Key: string;
  durationSeconds: number;
  channels: number;
  url?: string;
}

export interface SupervisionResult {
  success: boolean;
  callId: string;
  supervisorId: string;
  mode: SupervisionMode;
  connectedAt: Date;
}

export interface TelephonyProvider {
  readonly providerName: string;

  originate(options: OriginateCallOptions): Promise<CallSession>;
  bridge(callId: string, agentId: string): Promise<BridgeResult>;
  hangup(callId: string, reason?: string): Promise<HangupResult>;
  startRecording(callId: string): Promise<RecordingResult>;
  stopRecording(callId: string): Promise<RecordingResult>;
  supervise(callId: string, supervisorId: string, mode: SupervisionMode): Promise<SupervisionResult>;
  getCallQuality(callId: string): Promise<CallQualityMetrics>;
}
