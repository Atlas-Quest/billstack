# Billstack

**MVP experiment** for a multi-tenant **billing and subscription middleware** — an educational exercise to build a layer other developers embed in their own applications.

Billstack is **not** a consumer-facing billing app with its own login UI. Integrators call a **server-to-server API** from their backend to manage subscriptions, usage, and invoices for _their_ customers.

---

## Compra Facil (value proposition)

It defines **who the MVP is for** and **what outcome we optimize for**: making it straightforward for SaaS products to adopt a correct, tenant-safe billing layer without rebuilding metering, subscriptions, and invoicing in-house.

Use Compra Facil as the lens for scope decisions: if a feature does not serve that proposition for our segment, it is out of MVP scope.

---

## Who we serve

**SaaS platforms (integrators)** that need an internal billing and subscription API, not a full payments processor replacement.

They keep their own product UI and end-user authentication. Billstack provides:

- Tenant-scoped billing operations (subscriptions, metering, invoices)
- Deterministic money logic and auditability
- Webhooks and events for downstream systems (later phases)

---

## Product shape: middleware, not a GUI app

| Integrator owns                        | Billstack owns                                      |
| -------------------------------------- | --------------------------------------------------- |
| End-user login, passwords, SSO         | API authentication (keys / tokens)                  |
| Customer-facing checkout and UX        | Subscription, usage, and invoice logic              |
| Payment capture (Stripe, etc.) — later | Billing records, proration, tax rules on line items |

A **client GUI** for Billstack (developer portal) is optional and post-MVP. The primary interface is **HTTP API + webhooks**.

---

## Identity model (core principle)

Separate two concepts and never conflate them:

### 1. Who calls Billstack (integrator / platform)

- A **tenant** represents one integrator or environment (e.g. Acme SaaS production).
- Access is **server-to-server**: API keys or OAuth-style client credentials — not end-user passwords in request bodies.
- Secrets are **hashed at rest** (same care as passwords); the raw key is shown once at creation.
- Optional later: a **developer portal** where humans manage keys — portal login is separate from billing API auth.

### 2. Who gets billed (integrator’s customer)

- Modeled as **customers** (or equivalent) with an `external_id` from the integrator’s system.
- Billstack does **not** store or verify login passwords for these people unless we explicitly add a portal product later.
- The integrator’s backend identifies customers when calling Billstack; we enforce **tenant isolation** on every row and query.

**Rule:** credentials for the API ≠ identities of people being billed.

Phase 0 `users` / `tenants` in the repo are early scaffolding toward tenancy and isolation; naming and models will align with this split as the API matures.

---

## MVP definition

A **working billing core** that integrators can call for real subscription workflows.

### MVP must deliver

| Capability                 | MVP intent                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------------- |
| **Tenant isolation**       | Every billable resource is scoped to a tenant; no cross-tenant data access.                        |
| **Integrator auth**        | Authenticate API requests per tenant (API keys or equivalent); reject missing/invalid credentials. |
| **Usage metering**         | Record usage events and aggregate them for billing periods.                                        |
| **Subscription lifecycle** | Create, renew, change, and cancel subscriptions tied to plans.                                     |
| **Invoice generation**     | Produce invoices from subscription + usage for a billing period.                                   |
| **Proration**              | Handle mid-cycle plan changes with correct partial charges.                                        |
| **Tax / VAT**              | Apply tax rules to line items (start with a simple, explicit model).                               |
| **RBAC & audit**           | Role-based access to billing operations; audit trail for financial actions.                        |

### MVP success criteria (high level)

- An integrator (tenant) can authenticate, create a customer by `external_id`, subscribe them to a plan, record usage, and receive a correct invoice.
- Proration on plan change is correct and auditable.
- Operations are tenant-scoped and testable end-to-end (API + persistence), with CI on real PostgreSQL.

### Explicitly out of scope for MVP

- **End-user login UI** for Billstack (no signup/login flows for integrators’ customers).
- **Password-based auth** for billed customers in the billing API (integrators handle that in their app).
- Production-grade **payment capture** (Stripe/Adyen) — billing logic first, payments integrated later.
- Full event-sourcing / CQRS rebuild of all domains — use events where they add clarity.
- Multi-region HA, advanced observability, and full Terraform production pipelines.

---

## Core components (product map)

1. **Tenancy & credentials** — tenants, API keys, request authentication
2. **Customers** — integrator’s subscribers (`external_id`, billing profile)
3. **Catalog** — plans, prices, billable metrics
4. **Subscriptions** — lifecycle state machine
5. **Metering** — ingestion, aggregation, rating inputs
6. **Invoicing** — line items, totals, tax, proration
7. **Governance** — RBAC (platform/tenant ops), audit logs, signed webhooks

---

## Architectural principles

- **Middleware-first** — optimize for integrator backends, idempotent APIs, clear errors, and stable contracts.
- **Financial correctness** — deterministic money math; no silent rounding surprises.
- **Event-driven architecture** — domain events for subscription/invoice/metering changes (Kafka later).
- **Multi-tenancy** — `tenant_id` on all billable paths; enforced in queries and middleware.
- **Security boundaries** — authenticate every request; secrets from environment; never commit `.env`.
- **Domain-driven design** — bounded contexts (tenancy, customers, subscriptions, metering, invoicing).
- **CQRS / event sourcing (selective)** — where auditability or replay adds value.

---

## Tech stack

| Layer                  | Choice                                |
| ---------------------- | ------------------------------------- |
| Runtime                | Node.js, TypeScript                   |
| API                    | Express                               |
| Primary store          | PostgreSQL                            |
| Migrations             | dbmate (SQL files, language-agnostic) |
| Cache / coordination   | Redis                                 |
| Messaging              | Kafka                                 |
| Infra (local / deploy) | Docker, Terraform                     |

Stack items beyond Postgres + Express are adopted as each capability needs them.

---

## Delivery phases

**Phase 0 (current)** is foundation only — not the MVP itself.

| Phase                               | Focus                                                         | Status      |
| ----------------------------------- | ------------------------------------------------------------- | ----------- |
| **0 — Foundation**                  | Tenancy scaffolding, HTTP API, Postgres, dbmate, test harness | In progress |
| **1 — Credentials & customers**     | API keys, customer `external_id`, tenant-scoped CRUD          | Not started |
| **2 — Catalog & subscriptions**     | Plans, subscription CRUD, lifecycle                           | Not started |
| **3 — Metering**                    | Usage events, aggregation                                     | Not started |
| **4 — Invoicing**                   | Invoice generation, line items                                | Not started |
| **5 — Proration, tax & governance** | Mid-cycle changes, tax on lines, audit log                    | Not started |

Do not mark the MVP complete until phases 1–5 meet the success criteria above.

---

## Current progress (Phase 0 only)

| Item                           | Notes                                                    |
| ------------------------------ | -------------------------------------------------------- |
| `POST /users`, `POST /tenants` | Early routes; not yet aligned with middleware auth model |
| `createUser`, `createTenant`   | SQL services (tenant validates user exists)              |
| Docker Postgres + dbmate       | Local DB and `src/db/migrations`                         |
| AVA tests                      | HTTP tests with in-process server helper                 |

This is **scaffolding** — not the integrator-facing billing API.

---

## Testing strategy

| Layer                     | Approach                                                            |
| ------------------------- | ------------------------------------------------------------------- |
| **Local / fast feedback** | HTTP + service tests; stub persistence where useful                 |
| **CI (required on PR)**   | Docker Postgres → `pnpm db:migrate` → integration tests             |
| **Financial paths**       | Real DB in CI for subscription, metering, and invoice flows         |
| **Auth**                  | Tests use tenant API keys (or test helpers), not end-user passwords |

---

## Local development

```bash
docker compose up -d db
pnpm db:migrate
pnpm dev
pnpm test
```

Use `.env` for database credentials (never commit secrets). Add `.env.example` with placeholders for contributors.

---

## Repository layout (today)

```
src/
  index.ts              # Express app
  services/db.ts        # Postgres client
  db/migrations/        # dbmate SQL migrations
  users/                # Phase 0 scaffolding
  tenants/              # Phase 0 scaffolding
  tests/
db/
  schema.sql            # generated schema snapshot (optional in git)
```

New domains (`customers/`, `api_keys/`, `subscriptions/`, etc.) land in later phases.
