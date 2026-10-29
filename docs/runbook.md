# Linkora Operations Runbook & Incident Response

> **Audience:** DevOps Engineers, Platform Administrators, Site Reliability Engineers (SRE).

---

## 1. Service Health & Readiness Telemetry

| Service | Port | Endpoint | Expected Response | Remediation if Failing |
|---|---|---|---|---|
| **API Gateway** | 3001 | `GET /api/projects` | `HTTP 200 OK` | Check Node process `main.js`, restart container |
| **Web Frontend** | 3000 | `GET /` | `HTTP 200 OK` | Verify Next.js standalone server status |
| **PostgreSQL** | 5432 | `pg_isready -h localhost` | `accepting connections` | Check disk space, review Postgres logs |
| **Redis** | 6379 | `redis-cli ping` | `PONG` | Clear memory or inspect queue backlogs |
| **MinIO / S3** | 9000 | `GET /minio/health/live` | `HTTP 200 OK` | Verify S3 storage mount credentials |

---

## 2. Key Alert Thresholds & Automated Mitigations

### 2.1 Abandon Rate Cap Breach (&gt; 3.0%)
- **Trigger:** Realtime pacing engine detects that campaign abandon rate approaches or exceeds 3.0%.
- **Action Taken Automatically:** Pacing engine throttles line multiplier back to 1.0x (1 line per free agent) and logs a regulatory incident.
- **Manual Intervention:** Open [`/auto-dial-settings`](http://localhost:3000/auto-dial-settings) and lower the campaign Tempo slider.

### 2.2 Low Wallet Balance Warning (&le; 10.00 €)
- **Trigger:** Tenant balance falls below configurable threshold (default €10.00).
- **Action Taken Automatically:** Panel shell displays persistent red warning banner:
  > *"Guthaben niedrig: 10.00 € — vor Anrufabbruch aufladen. [Aufladen →]"*
- **Auto-Stop Rule:** If balance reaches €0.00, outbound dialing pauses automatically while active connected calls are permitted a 60-second grace window to finish wrap-up.

### 2.3 Carrier Line Quality Degradation (MOS &lt; 3.5)
- **Trigger:** WebRTC telephony telemetry records packet loss &gt; 2.5% or jitter &gt; 40ms.
- **Action:** Agent workspace displays "Minderwertige Leitung" indicator with 1-click line report button.

---

## 3. Disaster Recovery & Database Restoration Drill

To execute the automated disaster recovery drill:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/backup-restore-drill.ps1
```
- **RPO Target:** &lt; 15 minutes.
- **RTO Target:** &lt; 30 minutes.
- Validates the tamper-evident SHA-256 audit log chain continuity.
