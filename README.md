# CostPulse AI

An AI-assisted company cost intelligence and optimization platform: expense tracking, SaaS/subscription auditing, asset & property utilization, vendor management, procurement approvals, budgets, and AI-generated savings recommendations.

This started as an AI Studio prototype. It has since been rebuilt with a **real backend**: a Postgres database, real multi-tenant accounts, and real authentication — replacing the original browser-localStorage-only version.

## What's real vs. what's a fallback

| Area | Status |
|---|---|
| Data persistence | **Real.** Postgres via Drizzle ORM. Each signed-up company is an isolated tenant. |
| Authentication | **Real.** bcrypt-hashed passwords, signed session cookies (JWT, httpOnly). |
| Multi-tenancy | **Real.** Every API call is scoped to the signed-in user's account — never trusts client-supplied IDs. |
| AI features (cost audits, chat analyst, executive reports, receipt OCR) | **Real if you supply a `GEMINI_API_KEY`.** Otherwise the app runs on deterministic fallback logic (still useful, just not LLM-generated) — see `server.ts`. |
| "Demo Sandbox" mode | Local-only, in-browser sample data for exploring the UI without creating an account. No server calls. |

## Architecture

- **Frontend**: React 19 + Vite + Tailwind, in `src/`.
- **Backend**: Express + TypeScript, in `server.ts` (AI endpoints) and `server/` (auth, workspace, team routes).
- **Database**: Postgres, accessed via [Drizzle ORM](https://orm.drizzle.team) (`server/schema.ts`, `server/db.ts`). Drizzle was chosen over Prisma specifically because it has no native binary to download — it's pure TypeScript, which makes it trivial to deploy anywhere.
- **Data model**: each signed-up company is an `accounts` row. Its entire operational ledger (expenses, subscriptions, assets, vendors, budgets, departments, etc.) is stored as one JSON document on that row — this mirrors the shape the frontend already used, so the 30+ existing dashboard/view components didn't need a rewrite to move off localStorage. Each `users` row is a real login (email + bcrypt hash) belonging to one account.
  - **Next step for scale**: normalize the JSON ledger into real relational tables (one per entity) once you have real usage patterns to design indexes and queries around. The JSON-document approach is a legitimate, common way to ship a real v1 fast; it isn't the end state for a mature product.

## Local setup

**Prerequisites:** Node.js 20+, a Postgres database (local or hosted).

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` — your Postgres connection string
   - `JWT_SECRET` — any long random string (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
   - `GEMINI_API_KEY` — optional, for real AI responses
3. Push the schema to your database:
   ```
   npm run db:push
   ```
4. Run the app:
   ```
   npm run dev
   ```
   Visit `http://localhost:3000`. Sign up to create a real company account, or click "Try the interactive demo sandbox" to explore without an account.

## Deploying

This is a single Node process (serves both the API and the built frontend) plus a Postgres database, so it fits cleanly on **Railway** or **Render** — both give you a Postgres instance and a Node web service in the same project with minimal config, and don't require splitting your backend into serverless functions.

1. Push this project to a GitHub repo.
2. Create a new Postgres database on your host of choice.
3. Create a new Web Service pointing at your repo:
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
   - Environment variables: `DATABASE_URL` (from the Postgres instance), `JWT_SECRET`, `NODE_ENV=production`, optionally `GEMINI_API_KEY`.
4. Run `npm run db:push` once against the production `DATABASE_URL` (from your machine, or a one-off deploy shell) to create the tables.

(Vercel works too, but since this is a stateful Express server rather than serverless functions, Railway/Render need less restructuring to deploy as-is.)

## Security notes

- Passwords are hashed with bcrypt (cost factor 12), never stored or logged in plaintext.
- Sessions are signed JWTs in httpOnly, sameSite cookies — not readable by client-side JS, reducing XSS token theft risk.
- Every `/api/workspace` and `/api/team` call derives the tenant (`accountId`) from the verified session cookie, never from the request body — one tenant cannot read or write another's data by crafting a request.
- `JWT_SECRET` must be set in production; the server refuses to start without it rather than silently signing tokens with a weak default.

## Known limitations / roadmap

- The operational ledger (expenses, assets, etc.) is stored as one JSON blob per account rather than normalized tables — fine for a single company's data volume, but will want proper relational tables + indexes before this scales to very large ledgers or needs server-side filtering/pagination.
- "Team" management (adding teammates with their own logins/roles) has a basic API (`/api/team`) but no dedicated UI screen yet — the original UI's `AddEditDepartmentUserModal` manages the *display-only* mock department roster, not real login accounts.
- Password reset / email verification isn't implemented yet (no email-sending service is configured).
- The many industry-vertical-specific data types in `src/types.ts` (construction job costing, hospital supply expiry, salon color usage, etc.) are currently only used for demo-mode sample data and aren't wired into the real per-tenant ledger.
