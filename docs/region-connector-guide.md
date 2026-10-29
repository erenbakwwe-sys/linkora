# Region Connector Guide (DE & TR Delivery Bridges)

> **Scope:** Onboarding German Buyer APIs (`connector-de`) and Turkish Call-Center Dialers (`connector-tr`).

---

## 1. Overview

Per `SPEC.md` Section 6.F, Linkora provides two regional delivery connectors:
1. **DE Delivery Bridge (`connector-de`):** Delivers qualified and scored leads to German employer/partner companies (e.g. Solar Direkt, ThermaClean, EnergieSanierung Nord, Vitalis Care) via anonymous Ping and post delivery.
2. **TR Delivery Bridge (`connector-tr`):** Bridges prioritized leads, bilingual call briefs, and suggested objection scripts directly into Turkish call-center dialers (e.g. in Istanbul, Izmir, Antalya).

---

## 2. Onboarding a New German Lead Buyer

1. **Register Buyer in Marketplace:**
   - Navigate to [`/buyers`](http://localhost:3000/buyers) and click **"Neuen Abnehmer anlegen"**.
   - Fill in:
     - **Name:** e.g. *"Bavaria Solar AG"*
     - **API / Webhook Endpoint:** `https://api.bavariasolar.de/v1/leads`
     - **Signing Secret:** 32-character secret for HMAC SHA-256 header validation.
     - **Ping-Post Enabled:** Set `true` if buyer supports anonymous pre-bids.
     - **Daily / Monthly Caps:** Maximum leads accepted per day/month.
     - **Return Window:** Default 7 days (max return rate 15%).
2. **Assign Price List & Criteria:**
   - Link project IDs (`Photovoltaik`, `Wärmepumpe`) and postal code filters (e.g. `80***`, `81***`).
   - Define minimum lead score threshold (e.g. $\ge 80$ Band A).

---

## 3. Onboarding a Turkish Call-Center (TR Connector)

1. **Provision Sub-Company:**
   - Navigate to [`/company-management`](http://localhost:3000/company-management) and click **"Unterfirma anlegen"** (executes in &lt; 10ms).
   - Enter call-center name, admin user, and initial seed wallet balance.
2. **AI-Assisted Feed Activation:**
   - Leads assigned to the TR dialer are automatically pre-processed by the TR AI-Assist engine:
     - Call list sorted by conversion probability.
     - Turkish summary of the German prospect's requirements.
     - Suggested opening line and objection responses tailored to the project questionnaire.
