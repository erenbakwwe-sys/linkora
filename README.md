# 🚀 Linkora — Enterprise B2B Lead Management & Call-Center Platform

Modern, multi-tenant B2B Lead Management, Executive Call-Center Dialing, and Real-Time Telephony platform built with **Next.js 15 (App Router)**, **NestJS**, **PostgreSQL**, **Redis**, and **WebRTC/SIP**.

---

## 🌟 Key Features

- **Executive Call Center & Arbeitsbildschirm (`/call-screen`)**:
  - Live 3-column dialer with audio test tone, input level monitoring, and WebRTC integration.
  - Automatic dialer queue (Start / Pause) with campaign selection.
  - Customer registration form (`+ Kunde hinzufügen`) with live postal validation & project tagging.
  - Real-time agent daily metrics (Searches, Sales, Talk Time) and live countdown leaderboards.
  - Company live chat & low-balance alerts.

- **Benutzerverwaltung (`/users`)**:
  - 1:1 pixel-accurate role & user management (Firmen-Admin, Teamleiter, Agent).
  - Quick metric KPI cards, status filters, and active/inactive toggle switch.
  - Caller-ID allocation management (auto-freed when agent is deactivated).
  - Secure credential editing with scrypt hashing.

- **Projektmanagement (`/projects`)**:
  - Company-specific custom project creator & global project activation matrix.
  - Lead distribution analytics with percentage progress bars.
  - Team assignment workflows.

- **Firmenverwaltung (`/company-management`)**:
  - Multi-tenant sub-company hierarchy & automatic revenue-share calculation.
  - Sub-company admin user creation & commission overview.

- **Wallboard & Rota (`/wallboard`, `/rota`)**:
  - Mission control floor wallboard with live radar pulse and agent status matrix.
  - Weekly shift schedule (Rota-Tafel) with vacation conflict prevention.

---

## 🏗️ Architecture

```
linkora/
├── apps/
│   ├── web/          # Next.js 15 TailwindCSS UI (Vercel Ready)
│   └── api/          # NestJS REST & WebSocket API Gateway
└── packages/
    ├── db/           # Drizzle ORM Schema, Migrations & Seeders
    ├── telephony/    # WebRTC, Asterisk/Kamailio SIP abstractions
    ├── redis/        # Distributed caching & pub/sub
    ├── logger/       # Structured audit & transaction logging
    └── tsconfig/     # Shared TypeScript configurations
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js >= 20.x
- pnpm >= 9.x
- PostgreSQL >= 16.x
- Redis >= 7.x

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Database Setup
```bash
# Generate migrations
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Seed sample data
pnpm db:seed
```

### 4. Run Development Servers
```bash
# Starts both API (3001) and Web (3000)
pnpm dev
```

---

## ☁️ Vercel Deployment Guide

To deploy the frontend to **Vercel**:

1. **Import the repository** `https://github.com/erenbakwwe-sys/linkora` into your Vercel Dashboard.
2. In Project Settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Include source files outside Root Directory**: Ensure this is **Enabled / Checked** (for monorepo packages).
3. **Configure Environment Variables** in Vercel:
   ```env
   NEXT_PUBLIC_API_URL=https://your-deployed-api.yourdomain.com
   BACKEND_API_URL=https://your-deployed-api.yourdomain.com
   ```
4. Click **Deploy**!

---

## 🔒 Security & Compliance
- Passwords securely hashed with **scrypt** and salt.
- Full multi-tenant isolation via tenant IDs.
- Zero credential exposure in frontend bundles.

---

## 📄 License
Private & Proprietary. All rights reserved.
