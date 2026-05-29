# Billstack

**MVP experiment** for a multi-tenant billing and subscription platform — an educational exercise to build the billing layer for our minimum viable segment.

---

## Compra Facil (value proposition)

It defines **who the MVP is for** and **what outcome we optimize for**: making it straightforward for SaaS products to adopt a correct, tenant-safe billing layer without rebuilding metering, subscriptions, and invoicing in-house.

Use Compra Facil as the lens for scope decisions: if a feature does not serve that proposition for our segment, it is out of MVP scope.

---

## Who we serve

**SaaS platforms** that need an internal billing and subscription layer, not a full payments processor replacement.

They need to model customers, isolate tenants, meter usage, manage subscriptions, and produce correct invoices — without rebuilding that layer in every product.

---

## MVP definition

It is a **working billing core** that products in our minimum viable segment (as defined by the Compra Facil value proposition) can integrate against for real subscription workflows.

### MVP must deliver

| Capability                 | MVP intent                                                                  |
| -------------------------- | --------------------------------------------------------------------------- |
| **Tenant isolation**       | Every billable resource is scoped to a tenant; no cross-tenant data access. |
| **Usage metering**         | Record usage events and aggregate them for billing periods.                 |
| **Subscription lifecycle** | Create, renew, change, and cancel subscriptions tied to plans.              |
| **Invoice generation**     | Produce invoices from subscription + usage for a billing period.            |
| **Proration**              | Handle mid-cycle plan changes with correct partial charges.                 |
| **Tax / VAT**              | Apply tax rules to line items (start with a simple, explicit model).        |
| **RBAC & audit**           | Role-based access to billing operations; audit trail for financial actions. |

### MVP success criteria (high level)

- A tenant can subscribe to a plan, accrue usage, receive an invoice, and see proration on plan change.
- Operations are auditable and tenant-scoped.
- The system is testable end-to-end (API + persistence), with CI running against real PostgreSQL.

### Explicitly out of scope for MVP

- Production-grade payment capture (Stripe/Adyen orchestration) — integrate later; MVP focuses on **billing logic**, not card processing.
- Full event-sourcing / CQRS rebuild of all domains — use events where they add clarity, not as a prerequisite.
- Multi-region HA, advanced observability, and full Terraform production pipelines.

---

## Core components (product map)

These are the **domains** the MVP is built around:

1. **Identity & tenancy** — users, tenants, isolation boundaries
2. **Catalog** — plans, prices, billable metrics
3. **Subscriptions** — lifecycle state machine
4. **Metering** — ingestion, aggregation, rating inputs
5. **Invoicing** — line items, totals, tax, proration
6. **Governance** — RBAC, audit logs

---

## Architectural principles

Concepts we apply while building the MVP (not deferred “later ideas”):

- **Financial correctness** — deterministic money math; no silent rounding surprises.
- **Event-driven architecture** — domain events for subscription/invoice/metering changes.
- **Multi-tenancy** — tenant ID on all billable paths; enforced in queries and APIs.
- **Security boundaries** — authn/authz at API edge; secrets from environment.
- **Domain-driven design** — bounded contexts (tenancy, subscriptions, metering, invoicing).
- **CQRS / event sourcing** — where auditability or replay adds value.

---

## Tech stack

| Layer                  | Choice              |
| ---------------------- | ------------------- |
| Runtime                | Node.js, TypeScript |
| API                    | Express             |
| Primary store          | PostgreSQL          |
| Cache / coordination   | Redis               |
| Messaging              | Kafka               |
| Infra (local / deploy) | Docker, Terraform   |

---

## Delivery phases

The repo will grow in slices. **Phase 0 (current)** is foundation only — not the MVP itself.

| Phase                           | Focus                                             | Status      |
| ------------------------------- | ------------------------------------------------- | ----------- |
| **0 — Foundation**              | Users, tenants, HTTP API, DB access, test harness | In progress |
| **1 — Catalog & subscriptions** | Plans, subscription CRUD, lifecycle               | Not started |
| **2 — Metering**                | Usage events, aggregation                         | Not started |
| **3 — Invoicing**               | Invoice generation, line items                    | Not started |
| **4 — Proration & tax**         | Mid-cycle changes, tax on lines                   | Not started |
| **5 — Governance**              | RBAC, audit log                                   | Not started |

Do not mark the MVP complete until phases 1–5 meet the success criteria above (at minimum viable depth per capability).

---

## Current progress (Phase 0 only)

What exists in the codebase today:

| Item                           | Notes                                                     |
| ------------------------------ | --------------------------------------------------------- |
| `POST /users`, `POST /tenants` | Routes present; not yet fully wired to persistence layer  |
| `createUser`, `createTenant`   | Service functions with SQL (tenant validates user exists) |
| Docker Postgres + Adminer      | Local database via Compose                                |
| AVA tests                      | HTTP tests with in-process server helper                  |

This is **scaffolding** toward tenant isolation and API patterns — not evidence that the billing MVP is done.

---

## Testing strategy

| Layer                     | Approach                                                                               |
| ------------------------- | -------------------------------------------------------------------------------------- |
| **Local / fast feedback** | HTTP + service tests; mock or stub persistence where useful during development         |
| **CI (required on PR)**   | Docker PostgreSQL integration tests — migrations, real writes, tenant isolation checks |
| **Financial paths**       | Prefer real DB in CI for subscription, metering, and invoice flows                     |

---

## Local development

```bash
docker compose up -d db
pnpm dev
pnpm test
```

Use `.env` for database credentials (never commit secrets).

---

## Repository layout (today)

```
src/
  index.ts           # Express app
  services/db.ts     # Postgres client
  users/             # User domain (Phase 0)
  tenants/           # Tenant domain (Phase 0)
  tests/             # AVA + server test helper
```

New domains (`subscriptions/`, `metering/`, `invoicing/`, etc.) land in later phases as the MVP scope is implemented.
