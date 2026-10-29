# MASTER PROMPT — Unified Lead Bank + AI Call-Center Platform (white-label)

> How to use: put this file in the repo root as `SPEC.md`, put the 3 screenshots + the landing-page screenshot in `/reference/`, then tell the agent: "Read SPEC.md fully. Start with Section 0 and Phase 0 only."

---

## 0. Working rules for the agent (read first)

1. This is a large product. **Do not build everything in one pass.** Work strictly phase by phase (Section 9). Before each phase: write an implementation plan + task list, then execute. After each phase: run tests, run the app, verify the UI in the browser against `/reference/*.png`, produce a short walkthrough (what works, what is mocked, how to run it), then **stop and wait for my confirmation**.
2. Everything must run locally with `docker compose up` and seed/demo data. Anything that needs an external account (telephony, LLM, STT) must work in a **mock/sandbox mode** by default, so I can demo end-to-end without keys.
3. No hard-coded secrets. `.env.example` for every variable. No placeholder logic that silently pretends to work: if something is mocked, label it `MOCK` in code and in the UI.
4. **Branding is white-label.** Never reuse the brand name, logo, partner logos, or marketing copy of the reference sites ("Calendra", "Lead-Kontackt" etc.). Use a configurable `BRAND_NAME` ("YourBrand" placeholder), per-tenant logo upload, and write original copy. Copy the *functionality and layout structure*, not the identity or the text.
5. Language of code, comments, DB: English. UI languages: **DE (default), TR, EN**, switchable top right (DE/TR toggle visible as in the screenshot). All UI strings in i18n files, never inline.
6. Ask me only when blocked. Otherwise take the default from Section 10, record it as an ADR in `/docs/adr/`, and continue.

---

## 1. Mission

One platform ("one roof") that combines:

1. **Lead Bank / Marketplace** — upload or receive leads, validate, deduplicate, AI-score them, match them to the best-fitting buyer company (3–4 German employer/partner companies to start), sell them, resell the high-quality ones, price them dynamically.
2. **Integrated Cloud Dialer + CRM** — browser (WebRTC) outbound/inbound calling, campaigns, agent workspace with AI summaries, recording, live supervisor, wallboard.
3. **Multi-tenant call-center management** — many call centers (and their sub-companies) on one system, each managing its own users, teams, campaigns, wallet and branding.
4. **Two delivery regions via API:** **DE** (qualified leads are sent to German buyers) and **TR** (leads/dialer data go to Turkish call centers; the TR side is **AI-assisted**: prioritized call lists, call briefs, suggested scripts, post-call QC).
5. **Partner/Provider API** so lead suppliers can push leads in and other call centers can connect.

The admin panel must look and behave like the reference panel in the screenshots (Section 5). The public marketing site must follow the structure of the reference landing page (Section 7).

---

## 2. Reference analysis (what the screenshots/site show — replicate the structure)

### 2.1 Panel shell (from screenshots)
- **Top bar (dark navy):** "Willkommen, {user} · Modus wechseln" (switch between role modes, e.g. Manager ↔ Agent view), **company switcher** `Firma: {company} ▾`, language toggle `DE | TR`, a green **Live** indicator (websocket connected).
- **Left sidebar:** floating rounded card. Header: logo + brand, a small "customize/sliders" icon (reorder/hide menu items, saved per user). Search field **"Im Menü suchen…"**. Collapsible groups with uppercase small gray titles, an item **count** and a chevron. Active item = light-blue pill. Each item has a colored icon and a **tooltip on hover**.
- **Floating widgets bottom-right:** a "Guide/Rehber" button (opens in-app help/onboarding), a green round "add user" FAB (quick create), a notification bell with a **99+** badge.
- **Global toast/banner (bottom):** red low-balance warning, e.g. "Guthaben niedrig: 10.00 € — vor Anrufabbruch aufladen. [Aufladen →]" — dismissible, threshold configurable.

### 2.2 Sidebar structure (exact groups/items — keep German labels as the DE strings)
| Group | Items |
|---|---|
| **ARBEIT** (6) | Anruf-Bildschirm · Rückrufe · Rota-Tafel · Excel · Team-Wallboard · HR-Zeit |
| **LEADS & KUNDEN** (1) | Lead-Kunden |
| **PROJEKTE & FRAGEN** (1) | Projekt-Verwaltung |
| **CALL-CENTER / DIALER** (4) | Datenbank · Kampagnen · Auto-Anruf-Einstellungen · Anrufaufzeichnungen |
| **FINANZEN** (group title not visible in the screenshot; use this name) | Kasa / Einnahmen · Guthaben / Kosten · Anrufübersicht |
| **BERICHTE** (3) | Benutzerstatistiken · Analytik & Konversion · Gesprächszeit-Bericht |
| **BENUTZER** (5) | Benutzerverwaltung · Neuer Benutzer · Neues Team · Firmenverwaltung · Firmenlogo |
| **ALLGEMEIN** (5) | Chat · Ankündigungen · Urlaub · Prämien · Profil |
| **LEAD-MARKTPLATZ** (NEW, not in screenshot) | Lead-Upload · KI-Matching · Qualitätspool (Resale) · Abnehmer · Preislisten · Rückläufer & Gutschriften · API & Webhooks |

Menu visibility is driven by RBAC (Section 6.E).

### 2.3 Dashboard (from screenshot)
- **KPI cards row** (icon tile + big number + label): Leads diesen Monat · In QC-Prüfung · Bestätigt (Monat) · Storno (Monat) · Offen (fällig) € · Nächster Monat € (expected payout/receivable). One more card to the left (e.g. "Heute").
- **Live panel (left):** badge "+N anrufen" (leads ready to dial), live dot; stat tiles: "Kunden werden gerade angerufen", "Mitarbeiter online", "Mitarbeiter wählen sich in die Leitung ein", "Wählt manuell".
- **"Aktive Mitarbeiter" (right):** view switcher (Liste/…), **Einfrieren** (freeze live updates), counter "2 online · 2 wartend", company filter dropdown **"Alle Firmen (eigene + Unterfirmen)"** (parent company sees sub-companies), one row per agent: status dot, name, status label, **timer** (mm:ss / hh:mm). Row color encodes duration in the current status: *hell 0–5 min, mittel 5–10 min, dunkel 10+ min*. Status legend with colored dots: Am Telefon · Nachbearbeitung · Wählt · Wählt sich ein · Bereit, wartet auf Anruf · Wartend · Pause.
- Everything on this page is **live via WebSocket**, with polling fallback.

---

## 3. Stack & architecture decisions (defaults — change only via ADR)

- **Monorepo (pnpm + Turborepo), TypeScript everywhere.**
  - `apps/web` — Next.js (App Router) + Tailwind + shadcn/ui. Panel + public site in one app (route groups).
  - `apps/api` — NestJS (REST + OpenAPI 3.1 generated, WebSocket gateway).
  - `apps/worker` — BullMQ workers (imports, scoring, webhooks, metering, pacing loop).
  - `packages/*` — `db` (Drizzle or Prisma + SQL migrations), `shared` (types, zod schemas), `i18n`, `telephony`, `ai`, `ui`.
- **PostgreSQL** with **Row-Level Security** for tenant isolation (decision: RLS, not schema-per-tenant). Every tenant-owned table has `tenant_id`; the API sets `app.current_tenant` per request/transaction; **tests must prove cross-tenant reads are impossible**. Tenants form a **tree** (parent company ↔ sub-companies, as in "eigene + Unterfirmen").
- **Redis** (queues, pub/sub, pacing state), **S3-compatible storage** (MinIO locally) for recordings/uploads.
- **Event backbone:** domain events + **transactional outbox** table, dispatched through a thin `EventBus` interface (BullMQ/Redis in v1, swappable for Kafka/RabbitMQ). Services do not call each other's DB tables directly.
- **Telephony behind an interface** `TelephonyProvider` (`originate`, `bridge`, `hangup`, `amd`, `record`, `listen/whisper/barge`, `numberPool`, webhooks→events). Adapters: `MockProvider` (default, simulates calls/AMD/outcomes), `TelnyxProvider` (default real one), `TwilioProvider`, `GenericSipFreeSwitchProvider` (stub with docs), `GitasisProvider` (stub — API unknown, document what is needed). **ADR-001: v1 = CPaaS adapter, not self-hosted Asterisk/FreeSWITCH** (6–8 weeks vs 6–9 months; self-hosted stays an option behind the same interface). Browser softphone via the provider's WebRTC SDK or SIP.js/JsSIP.
- **AI behind an interface** `LlmProvider` / `SttProvider` (default: Gemini API; mock provider for dev). Never call a model directly from business code.
- Observability: OpenTelemetry traces, structured logs, health/readiness endpoints, Prometheus metrics. CI (lint, typecheck, unit, integration, e2e with Playwright), IaC-ready Dockerfiles, `dev/staging/prod` env separation.

---

## 4. Core domain model (design the schema first — these separations are mandatory)

- `tenants` (tree), `users`, `roles`, `user_roles`, `teams`, `api_keys`, `sso_connections` (OIDC/SAML-ready).
- `projects` (a product/campaign type: Photovoltaik, Wärmepumpe, Treppenlift, Energieberatung, Fenster & Sanierung, Strom, Gas, Pflegebox, + custom), `questionnaires` + `questionnaire_versions` + `questions` (per project, versioned), `lead_answers`.
- `lead_batches` (batch id, file hash → idempotency), `leads` (the person/request, **owned data**), `lead_provenance` (source, campaign, opt-in timestamp, IP, landing page, consent text/version), `lead_consents` (type, channel, granted/revoked timestamps), `lead_events` (append-only timeline), `quarantine_records`.
- **`lead_sales` is a separate table from `leads`** (one lead can be sold multiple times; status, buyer, price, exclusivity, sold_at, return status). Never model "sold" as a column on `leads`.
- `lead_scores` — **every score row stores `model_id`, `prompt_version`, `inputs_hash`, `confidence`, `score_0_100`, `explanation`**; scores are immutable, new run = new row.
- `lead_outcomes` (final result: confirmed / storno / sold / returned, with reason) → feeds calibration.
- `buyers` (Abnehmer = partner companies), `buyer_criteria` (regions, products, age band, min score, daily cap, capacity, exclusivity, priority), `pings`, `posts`, `waterfall_runs`.
- `price_lists` (versioned, effective-from), `price_rules` (score band → price, floor/ceiling), `wallets`, `ledger_entries` (double-entry style, immutable), `metering_events` (idempotent: delivered lead, call minute, AI call), `invoices`, `credit_notes`, `returns`.
- `campaigns`, `call_lists`, `call_list_entries`, `calls` (CDR), `call_recordings` (dual-channel), `transcripts`, `agent_sessions`, `agent_status_log`, `wrapup_codes`, `callbacks`, `number_pool`, `number_reputation`, `dnc_entries` (global / tenant / buyer scope).
- `audit_log` — **append-only, tamper-evident (hash chain)**: who viewed/changed which lead, when, from where. No UPDATE/DELETE grants.
- `webhook_endpoints`, `webhook_deliveries` (retry, DLQ, replay).
- HR/ops: `shifts` (Rota), `time_entries` (HR-Zeit), `leave_requests` (Urlaub), `bonus_rules` + `bonus_awards` (Prämien), `announcements`, `chat_channels`, `chat_messages`.

---

## 5. Panel — page-by-page spec

Design system: dark navy header (`#0b1220`), warm amber/yellow accent, white rounded cards (≈16 px radius, soft shadow), light-blue active nav pill, teal/amber/green/red KPI icon tiles, Inter-like font, responsive (desktop first, tablet OK), light mode default. Build a shared component library (KpiCard, StatusDot, DataTable with saved filters, FilterBar, SlideOver, Toast, EmptyState, LiveBadge) before building pages.

**ARBEIT**
- **Anruf-Bildschirm (agent workspace):** WebRTC softphone (mic check, mute, hold, transfer), current lead card, **product questionnaire** (project selectable; fields change per project), **AI panel** (summary, suitability %, suggested next question/objection hints, matched buyer), script viewer, notes, wrap-up code selector (mandatory → ACW), schedule callback, call timer, "ready/pause" toggle. Shows live line quality (MOS/jitter/loss) with a "report bad line" button that attaches the metrics.
- **Rückrufe:** due/overdue list with time-zone aware windows, filters, one-click dial, reassign.
- **Rota-Tafel:** weekly shift planner (drag & drop), per team, conflicts with approved leave highlighted.
- **Excel:** import/export center — upload CSV/XLSX, **field-mapping UI**, preview, validation report, quarantine, saved mapping templates; exports of leads/calls/reports.
- **Team-Wallboard:** full-screen TV mode: calls today, talk time, conversions, leaderboard, live agent states.
- **HR-Zeit:** clock in/out, auto-linked to agent sessions, daily/weekly totals, manager approval.

**LEADS & KUNDEN — Lead-Kunden:** table + detail drawer: timeline (`lead_events`), answers per project, consent/provenance block, score history, sale history (`lead_sales`), recordings/transcript, status pipeline `NEW → QC_PENDING → CONFIRMED | STORNO → ROUTED → SOLD → RETURNED`. QC reviewer actions: approve / reject / request re-call (with reason).

**PROJEKTE & FRAGEN — Projekt-Verwaltung:** CRUD for projects; **questionnaire builder** (text, select, multi-select, number, date, yes/no, conditional visibility, required, validation, versioning); seed questionnaires for PV, Wärmepumpe, Treppenlift, Energieberatung, Fenster & Sanierung, Strom, Gas, Pflegebox. When capturing/creating a lead anywhere, **the project must be selectable** and drives the questionnaire and routing.

**CALL-CENTER / DIALER**
- **Datenbank:** lead/call-data lists (the "data bank"), list status, counts, dedup stats, assign list → campaign.
- **Kampagnen:** campaign CRUD: project, lists, scripts, calling window (time-zone rules), caller-ID pool, **Tempo 1–10 slider that applies live**, dialing mode (preview / progressive / power / predictive), teams/agents, status.
- **Auto-Anruf-Einstellungen:** ring timeout, retry rules, max attempts, AMD on/off + action, **max abandon rate**, min free agents, line cap, recording on/off, number rotation (weekly / every 2 weeks).
- **Anrufaufzeichnungen:** dual-channel player with waveform, transcript (DE/TR) with speaker diarization, AI QC score + notes, tags, download (permission-gated), retention policy.

**FINANZEN**
- **Kasa / Einnahmen:** income entries (lead sales, minute fees, manual), commissions/payouts per lead partner, "Offen (fällig)" and "Nächster Monat" calculations, CSV/PDF export.
- **Guthaben / Kosten:** wallet balance, top-up (manual + payment-provider adapter, mock default), per-minute cost (default **0.04 € / min excl. VAT, per-tenant configurable**), usage breakdown, low-balance threshold (default 10 €), **auto-stop of dialing when balance ≤ 0** with a grace rule.
- **Anrufübersicht:** CDR table (who, when, duration, cost, outcome, recording link) with filters and export.

**BERICHTE:** Benutzerstatistiken (per agent/team), **Analytik & Konversion** (funnel by source / campaign / buyer / agent; **predicted vs. actual conversion per score band** = calibration chart; cost per lead & revenue per lead), Gesprächszeit-Bericht (talk/wrap/pause time). Agent scorecard incl. AI call-quality score. PDF + Excel export.

**BENUTZER:** Benutzerverwaltung, Neuer Benutzer (invite by e-mail), Neues Team, **Firmenverwaltung** (tenant tree, create sub-company, provisioning in < 10 min incl. defaults), **Firmenlogo** (per-tenant branding: logo, accent color, name — applied without redeploy).

**ALLGEMEIN:** Chat (channels + DMs, realtime), Ankündigungen (pinned announcements, read receipts), Urlaub (request/approve, feeds Rota), Prämien (configurable bonus rules, e.g. per confirmed lead; awards list), Profil (password, MFA, language, notification prefs).

**LEAD-MARKTPLATZ (new):** see Section 6.C.

---

## 6. Modules — behavior requirements

### A. Lead ingestion (quality is won here)
- Channels: manual single entry, CSV/XLSX bulk, **Provider Push API** (`POST /v1/leads`, API-key auth, idempotency key), and optional pull connector. Every channel produces the same normalized `lead` + `lead_provenance`.
- Pipeline: parse → **field mapping** → **phone normalization to E.164 + line-type detection** (mobile/landline/VoIP, via libphonenumber, provider lookup behind an interface) → validation → **dedup (exact + fuzzy** on phone/e-mail/name+postcode; same person from 3 sources merges into one lead with multiple provenance rows) → **DNC/suppression check** → quarantine for bad rows (never silently delete; reviewable, fixable, re-importable) → batch report.
- **Idempotency:** same file hash or same idempotency key twice = second one ignored with a clear message.
- **Provenance and consent are mandatory fields**: source, campaign, opt-in timestamp, IP, landing page URL, consent text + version, consent channel (phone/e-mail). A lead without consent proof can be stored but is flagged `NO_CONSENT_PROOF` and **cannot be dialed or sold** (hard rule in the rule engine and in the dialer).

### B. AI layer (scoring, matching, QC)
- **Separation (hard rule):** a deterministic **rule engine** decides eligibility, capacity, daily caps, exclusivity, region/product fit, DNC. The **LLM only produces a score, summary, extracted fields and explanation.** The LLM never does routing math, price math or eligibility decisions.
- Score = 0–100 conversion probability + band (e.g. A ≥ 80, B 60–79, C 40–59, D < 40; bands configurable) + confidence. Store `model_id`, `prompt_version`, `inputs_hash` on every score. Prompts live in versioned files (`packages/ai/prompts/*.v{n}.md`) with a changelog; evaluation set + regression tests per prompt version.
- **Low confidence → human review queue** (QC). **Fallback:** if the LLM/provider fails, a simple deterministic scoring ruleset keeps the system running and flags scores `FALLBACK`.
- **Prompt-injection defense:** all free-text fields are treated as untrusted data (delimited, length-capped, instruction-stripped, never concatenated into system prompts); output is schema-validated (zod) and rejected otherwise.
- **PII masking before any LLM/STT call** (names, phones, e-mails, addresses → tokens); mapping stays server-side.
- **Cost control:** per-tenant token budget, caching by `inputs_hash`, batch jobs, usage metered into `metering_events`.
- **Conversation analysis pipeline:** dual-channel recording → STT (**German + Turkish**, diarization) → PII-masked transcript → LLM: summary, questionnaire auto-fill suggestions, compliance checklist (consent statement read? price/no-obligation said?), call-quality score, objection tags → shown in agent screen (live hints optional, post-call mandatory) and in QC queue.
- **Calibration loop:** every lead's final outcome (confirmed/storno/sold/returned) is written back to `lead_outcomes`; a monthly job produces a **calibration report** ("of leads scored ~80, how many really converted?"), flags drift, and the pricing engine can warn when a band is miscalibrated. Same feedback produces **agent coaching data** (which questions/objections correlate with wins).
- **TR AI-assist:** for the TR region, AI prepares the call list: priority order, best time to call, a short brief in TR/DE, suggested next questions, and flags likely-low-quality leads before they burn dial minutes.

### C. Marketplace: matching, ping-post, pricing, wallet, returns
- **Ping–Post (design in from day 1, v1 behind a feature flag per buyer):**
  1. **Ping** = anonymous payload (region/city, age band, product, score band, consent flag; **no personal data**) sent to eligible buyers in parallel with a timeout.
  2. Buyer answers accept/reject (+ optional bid). Rule engine ranks by priority/price/capacity.
  3. **Post** = full lead data only to the winning buyer.
  4. **Waterfall:** reject/timeout → next buyer automatically. Unsold leads go back to the pool (`POOL`), never lost.
  - Fallback mode for buyers without ping support: direct post.
- **Buyers (Abnehmer):** profile, API/webhook endpoint + signing secret, criteria (`buyer_criteria`), daily/monthly caps, exclusivity, status, contract terms (return window, max return rate).
- **Resale pool (Qualitätspool):** high-band leads filtered into a separate pool; can be re-offered to new buyers/campaigns later via new `lead_sales` rows; respects exclusivity, age (freshness decay) and consent validity.
- **Pricing engine (separate service/module):** versioned price lists with effective-from dates, score band → price mapping, per-product and per-buyer overrides, floor/ceiling rules, optional demand-based dynamic adjustment. Everything priced via API (`POST /v1/pricing/quote`) and stored with the sale.
- **Metering:** every delivered lead, call minute and AI call becomes an **idempotent** `metering_event` → ledger.
- **Wallet / prepaid:** credit limit, top-up, balance checks before dialing and before AI/lead purchase; automatic stop at limit.
- **Returns / credits (in the data model from day 1):** buyer flags a lead as defective with a reason code → return window check → auto-credit via `credit_notes` + ledger → per-buyer return-rate cap → lead goes back to pool or is retired. Defaults (configurable, owner to confirm): window 7 days, max return rate 15 %.

### D. Dialer
- Modes: **preview, progressive, power, predictive.** v1 must ship preview + progressive + power fully working with the mock provider and the real CPaaS adapter; predictive implemented behind a flag with simulation tests.
- **Campaign pacing ("Tempo 1–10"):** the engine dials per **campaign**, not per agent: `lines = f(free_agents, answer_rate, tempo)`; changes apply instantly to running campaigns; hard cap on **abandon rate** (default 3 %, configurable); answered calls are bridged to the next free agent immediately. Provide a deterministic pacing simulator + unit tests.
- **AMD** (answering-machine detection) with configurable action (hang up / voicemail drop / route to agent).
- **Agent state machine:** `OFFLINE → READY → DIALING/RINGING → ON_CALL → ACW(wrap-up) → READY`, plus `PAUSE` (with reason), `WAITING`, `MANUAL_DIAL`, `JOINING_LINE` — matches the dashboard legend. All transitions logged in `agent_status_log` (feeds HR-Zeit and reports).
- **Number pool + CLI reputation:** pool of DE (+49) numbers, scheduled rotation (weekly / every 2 weeks), per-number answer-rate tracking, automatic quarantine of numbers whose answer rate collapses.
- **Supervisor tools:** live listen, whisper, barge (permission-gated and audit-logged), live wallboard, force-pause.
- **Callbacks / scheduling:** calling-window engine with time-zone rules, retry rules, due callbacks outrank fresh leads.
- **Recording:** dual-channel, consent announcement configurable, retention policy, access audit-logged.
- **Real-time DNC/suppression check before every dial** (global + tenant + buyer scope) and a hard stop if consent proof is missing (Section 6.A).
- **WebRTC quality monitoring:** MOS, jitter, packet loss stored per call.
- Inbound: queue/IVR-lite (route by number → campaign → ring group), same agent states.

### E. Multi-tenant, RBAC, SSO
- RLS isolation (Section 3), tenant tree with parent visibility ("eigene + Unterfirmen").
- Roles (extensible, permission-based): **SuperAdmin** (platform), **CompanyAdmin**, **TeamLead (Teamleiter)**, **QC-Reviewer**, **Agent**, **LeadPartner** (external call center selling leads — sees only own leads, status, returns, credits), **Buyer** (API + small portal).
- Per-tenant quotas and rate limits, per-tenant feature flags, per-tenant config (branding, languages, defaults) without code deploys. OIDC/SAML SSO scaffolding, optional TOTP MFA.
- **Provisioning:** one action/API call creates a tenant with admin user, default roles, wallet, wrapup codes, sample project — in minutes.

### F. Partner / Provider API
- OpenAPI 3.1 doc served at `/docs`, **sandbox environment** with test keys, API-key + HMAC-signed **webhooks** (signature header, timestamp, replay protection), exponential retry, **DLQ**, delivery receipts, manual **replay** UI under "API & Webhooks".
- Endpoints (v1): leads (create/bulk/status), projects/questionnaires (read), buyers (admin), pings/posts (buyer side), returns (buyer flags defective), pricing quote, wallet balance, campaigns & call-list ingest (for the TR connector), outcomes writeback.
- **Region connectors:** `connector-de` (deliver qualified leads to German buyers via ping-post/webhook) and `connector-tr` (deliver/feed leads + AI-prepared call data to Turkish call centers/dialers). Both are adapters behind one `RegionConnector` interface with mock implementations and contract tests.

### G. Reporting & analytics
- Funnel by source / campaign / buyer / agent; predicted-vs-actual conversion per score band; CPL and revenue per lead; agent scorecards; AI call-quality aggregates; scheduled PDF/Excel e-mail reports (mock mailer by default).

### H. Compliance & safety (technical enforcement only)
- Consent/provenance model, suppression/DNC engine, opt-out handling, recording access audit, data retention + deletion/export per data subject, encrypted PII at rest, least-privilege RBAC, immutable audit log, all enforced in code paths (not just UI). Legal wording/texts are placeholders to be reviewed by a lawyer — do not invent legal claims.

---

## 7. Public website (separate route group, DE + EN)

Follow the **section order** of the reference landing page (`/reference/landing-fullpage.png`), with original copy and placeholder brand:
Header nav (Leistungen, Leads verkaufen, Dialer, Preise, Ablauf, Karriere, FAQ, DE/EN, **Login → `/auth/index`**, CTA "Beratung anfragen") → Hero (headline, subline, 2 CTAs, 3 trust ticks, **live campaign preview card** with tempo, free agents, lines, connected/ringing/voicemail rows labeled "Beispielansicht") → 3 feature cards (Teams · Leads · Technologie) → trust-logo marquee (placeholders only) → "Lead partners" section (4 steps) → proof stats → three building blocks with bullet lists → benefits + "we take care of everything" checklist → dialer features grid (Tempo 1–10, AMD, browser telephony, recording, live supervisor, QC, callbacks) → **pricing** (0.04 €/min example, 1k/5k/10k minute tiles, number-rotation visual; configurable from admin) → modules (CRM only / Dialer only / Complete) → 4-step process → industries → career → topic links → FAQ accordion (with FAQ JSON-LD) → contact form → footer.
- Contact form: first choose "I am: Company / Looking for work / Private person" → conditional fields (company: Material/Leads · Collaboration · Dialer; products loaded from `projects`), explicit consent checkbox with versioned text, honeypot + rate limit, stores a lead with provenance and notifies admins.
- SEO landing pages: `/de/leads-verkaufen-deutschland`, `/de/photovoltaik-leads`, `/de/waermepumpen-leads`, `/de/deutschsprachiges-callcenter`; sitemap, canonical/hreflang, OG tags, structured data, Impressum + Datenschutz placeholder pages. Dark navy + amber accent, fast (Lighthouse ≥ 90).

---

## 8. Non-functional requirements
- Security: argon2id, session/JWT hardening, CSRF, rate limiting, input validation (zod) on every endpoint, secrets via env/secret manager, dependency audit in CI.
- Performance targets: dashboard live updates < 1 s; lead import ≥ 50k rows without blocking the UI (queued, progress bar); pagination/virtualization on big tables.
- Reliability: backups + documented RPO/RTO targets, graceful degradation when AI/telephony is down, load-test script for concurrent calls (against mock provider).
- Testing: unit (pacing, pricing, rule engine, dedup, E.164), integration (RLS isolation, ping-post waterfall, returns/credits, idempotency), Playwright e2e for the golden path.
- Docs: `/docs` with architecture, ADRs, runbook, API guide, "how to connect a real telephony provider", "how to add a new buyer / region connector".

---

## 9. Phases (stop after each one)

**Phase 0 — Foundation:** monorepo, docker compose (Postgres, Redis, MinIO), CI, schema + migrations for Section 4 (core tables), RLS + isolation tests, auth, RBAC, tenant tree, audit log, i18n (DE/TR/EN), design system + panel shell (header, sidebar with search/groups/counts/tooltips, toasts, Live badge), seed data. *Done when:* login works, sidebar matches the reference, two tenants can't see each other's data (test proves it).

**Phase 1 — CRM core:** projects + questionnaire builder (seeded products), lead model, import wizard (mapping, E.164, dedup, quarantine, idempotency), provider push API, Lead-Kunden list/detail, Excel center, Rückrufe, consent/provenance, DNC engine. *Done when:* importing the same file twice is a no-op; bad rows land in quarantine; lead without consent proof cannot be dialed.

**Phase 2 — Dialer:** telephony interface + Mock + one real adapter, agent state machine, softphone, Anruf-Bildschirm, campaigns, Tempo 1–10 pacing, auto-dial settings, AMD, recording, supervisor tools, live dashboard + Team-Wallboard, number pool. *Done when:* a mock campaign runs end-to-end with live agent statuses and recordings, and the pacing simulator tests pass.

**Phase 3 — AI:** LlmProvider/SttProvider, versioned prompts, scoring + bands, low-confidence queue, fallback scoring, injection defense, PII masking, transcript + QC pipeline, calibration job + report, TR AI-assist call prep. *Done when:* every score row carries model+prompt version; killing the LLM keeps the system running on fallback scores.

**Phase 4 — Marketplace:** buyers + criteria, rule engine, ping-post + waterfall, resale pool, pricing engine, wallet + ledger + metering, returns/credits, partner API docs + sandbox + signed webhooks + DLQ/replay, region connectors DE/TR. *Done when:* a lead flows upload → score → ping → accept → post → sale → return → credit with a correct ledger, and a second sale of the same lead works without schema changes.

**Phase 5 — Back-office & reports:** Finanzen pages, Berichte, Rota-Tafel, HR-Zeit, Urlaub, Prämien, Chat, Ankündigungen, Firmenverwaltung/branding/provisioning, Guide ("Rehber"), notifications.

**Phase 6 — Public site + hardening:** landing + SEO pages + contact form, load/security review, backup/restore drill, docs, production deploy guide.

---

## 10. Defaults I'm choosing (change via ADR if I say otherwise)
- Dialer: CPaaS adapter first (ADR-001); self-hosted SIP later behind the same interface.
- Tenant isolation: Postgres RLS.
- Ping–Post: in v1, behind a per-buyer flag; direct post remains available.
- Returns: 7-day window, 15 % max return rate per buyer (configurable).
- Score bands: A ≥ 80, B 60–79, C 40–59, D < 40.
- Abandon-rate cap 3 %; low-balance warning 10 €; default minute price 0.04 € excl. VAT.
- "DE and TR delivery via API" is interpreted as two region connectors (Section 6.F). If I meant something else, I'll tell you.
- "Modus wechseln" = switch between role views (Manager/Agent).

## 11. Don'ts
- Don't let the LLM decide routing, eligibility or prices.
- Don't store "sold" on the lead row; don't merge `leads` and `lead_sales`.
- Don't delete bad import rows; don't skip idempotency, provenance, consent, or audit logging "for now".
- Don't copy brand names, logos, partner logos or marketing text from reference sites.
- Don't call external services without a mock fallback; don't commit secrets.
- Don't start the next phase before I confirm the current one.

## 12. Your first task right now
Read this file and `/reference/*`. Then output only: (1) the implementation plan for **Phase 0**, (2) the repo structure, (3) the full DB schema draft for Section 4 (tables, key columns, indexes, RLS policies), (4) a list of any assumptions or questions that truly block you. Do not write application code yet.
