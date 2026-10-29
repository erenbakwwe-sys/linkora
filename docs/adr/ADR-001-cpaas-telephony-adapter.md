# ADR-001: CPaaS Telephony Adapter First Architecture

## Status
Accepted

## Context
The platform requires cloud dialer capabilities (WebRTC browser telephony, AMD, progressive/power/predictive dialing, live listen/whisper/barge, dual-channel recording).
Two primary implementation paths exist:
1. Self-hosting an Asterisk/FreeSWITCH SIP cluster with WebRTC gateways and media servers (estimated 6–9 months maintenance/scaling overhead).
2. Using a CPaaS provider (e.g. Telnyx or Twilio) behind a strict internal `TelephonyProvider` abstraction with a local `MockProvider` for testing (estimated 6–8 weeks to ship).

## Decision
For v1, implement telephony strictly behind the `TelephonyProvider` interface with:
1. `MockProvider`: Default provider for local development, CI tests, and demo mode (simulates WebRTC events, AMD detection, call timers, audio streams).
2. `TelnyxProvider`: The primary real CPaaS provider for production calls.
3. Asterisk/FreeSWITCH remains an optional downstream adapter behind the exact same `TelephonyProvider` contract.

## Consequences
- No external keys are needed for local end-to-end demos.
- High scalability and zero SIP server maintenance during initial launch.
- Clean separation of business dialer logic from the underlying carrier protocol.
