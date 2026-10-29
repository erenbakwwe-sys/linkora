# Telephony Provider Integration Guide

> **Scope:** Connecting Real CPaaS Providers (Telnyx, Twilio) and Self-Hosted SIP Trunks (FreeSWITCH / Asterisk).

---

## 1. Architecture: The `TelephonyProvider` Interface

All business code interacts with telephony strictly through the `TelephonyProvider` interface in `packages/telephony`:

```typescript
export interface TelephonyProvider {
  readonly providerName: string;
  originate(options: OriginateCallOptions): Promise<CallSession>;
  bridge(callId: string, agentSessionId: string): Promise<BridgeResult>;
  hangup(callId: string, reason?: string): Promise<HangupResult>;
  startRecording(callId: string, dualChannel?: boolean): Promise<RecordingResult>;
  supervise(callId: string, mode: SupervisionMode, supervisorSessionId: string): Promise<SupervisionResult>;
  getQualityMetrics(callId: string): Promise<CallQualityMetrics>;
}
```

---

## 2. Telnyx Integration (Default Real Provider)

1. **Obtain Telnyx Credentials:**
   - Create a Telnyx account at [telnyx.com](https://telnyx.com).
   - Generate a Voice API V2 token and configure a TeXML or Call Control application.
2. **Set Environment Variables:**
   ```bash
   TELEPHONY_PROVIDER=telnyx
   TELNYX_API_KEY=KEY01...
   TELNYX_CONNECTION_ID=1234567890
   TELNYX_WEBHOOK_SECRET=secret_...
   ```
3. **Configure Webhook URL:**
   - In your Telnyx Mission Control Portal, set your inbound webhook to:
     `https://your-domain.com/api/telephony/webhooks/telnyx`
   - Telnyx automatically posts `call.answered`, `call.hangup`, and `call.machine.detection.ended` events, which are converted to standard internal domain events.

---

## 3. Connecting Self-Hosted FreeSWITCH / Asterisk SIP Trunks

For large-scale on-premise call centers (e.g. 500+ concurrent agents):
1. Configure an ESL (Event Socket Library) or ARI (Asterisk REST Interface) gateway adapter implementing `TelephonyProvider`.
2. Point softphones to the local WebRTC SIP WSS endpoint (`wss://sip.internal:7443`).
3. Retain identical pacing formulas and agent state transitions without changing frontend UI code.
