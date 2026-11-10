# 03 — System Architecture and Design Description

**System:** Berlin AutoWorks web application
**Baseline:** 2026-11-10, code `5ba429c`
**Related:** [02 SRS](02-system-requirements-specification.md) · [04 ICD](04-interface-control-document.md) · [05 RTM](05-requirements-traceability-matrix.md)

## 1. Architectural drivers

The architecture is shaped mainly by these requirements:

| Driver | Requirements | Architectural response |
| --- | --- | --- |
| One small team, one shop, fast iteration | SN-07, NFR-MNT-003 | Modular monolith with in-process domain modules ([ADR-01](#adr-01--modular-monolith)) |
| Grow to more locations without rewrite | SN-09, SR-LOC-001..003 | `locationId` on every transactional row; staff access as per-location membership ([ADR-02](#adr-02--location-scoped-data-from-day-one)) |
| Payment data out of PCI scope | SR-BIL-003, NFR-SEC-007 | Stripe Payment Element; app stores intent id only ([ADR-04](#adr-04--hosted-payment-element-and-webhook-as-source-of-truth)) |
| Keep taking bookings when a provider fails | SN-13, NFR-REL-006/007 | Every integration is optional and checked per call ([ADR-06](#adr-06--every-integration-is-optional)) |
| Fast, indexable public site; private portals | NFR-PERF-001, NFR-SEC-004, NFR-RND-* | Cache Components with named `cacheLife` profiles for public; `connection()` + `no-store` for private ([ADR-05](#adr-05--rendering-split-by-surface)) |
| Slow I/O off the request path | NFR-REL-005 | Redis + BullMQ queue with a separate worker process ([ADR-03](#adr-03--queue-with-a-separate-worker-and-an-inline-fallback)) |

## 2. System context

```mermaid
flowchart LR
  driver([Driver / prospect])
  customer([Customer])
  staff([Staff: advisor, technician, manager])
  operator([Operator])

  subgraph BAW["Berlin AutoWorks system"]
    web["C-01 Next.js web app<br/>(Netlify)"]
    worker["C-02 Notification worker<br/>(npm run worker)"]
  end

  neon[("C-03 Neon Postgres")]
  redis[("C-04 Redis")]
  s3[("C-05 S3-compatible bucket")]
  stripe["Stripe"]
  resend["Resend"]
  vpic["NHTSA vPIC"]

  driver -->|HTTPS| web
  customer -->|HTTPS| web
  staff -->|HTTPS| web
  operator -.->|deploy, migrate, env| web
  web <-->|IF-01 SQL/TLS| neon
  worker <-->|IF-01| neon
  web <-->|IF-02 rate limits, queue| redis
  worker <-->|IF-02 queue| redis
  web -->|IF-03 PaymentIntents API| stripe
  stripe -->|IF-04 signed webhook| web
  customer -->|IF-05 card data, browser to Stripe| stripe
  web -->|IF-06 send| resend
  worker -->|IF-06 send| resend
  web -->|IF-07 presign, HEAD| s3
  driver -->|IF-08 signed PUT, browser to bucket| s3
  web -->|IF-09 makes, models| vpic
```

Card data (IF-05) and photo bytes (IF-08) go **directly from the browser to
the provider**; neither passes through `C-01`.

## 3. Physical (runtime) components

| ID | Component | Technology | Runs on | Responsibility | Statefulness |
| --- | --- | --- | --- | --- | --- |
| C-01 | Web application | Next.js 16 App Router, React 19, TypeScript | Netlify (Node 20) | All HTTP: pages, Server Actions, route handlers, webhooks | Stateless (in-memory rate-limit fallback only) |
| C-02 | Notification worker | Node + `tsx src/worker.ts`, BullMQ | Long-running host (not Netlify) | Consume `notifications` queue, send email | Stateless |
| C-03 | Database | Neon Postgres via Prisma 7 + `@prisma/adapter-pg` | Neon (pooled for app, direct for migrate) | System of record | Durable |
| C-04 | Cache / queue | Redis (ioredis), BullMQ | Managed Redis | Rate-limit counters, job queue | Ephemeral |
| C-05 | Object storage | S3 API (AWS S3, R2, MinIO) | Provider | Photo bytes | Durable |
| C-06 | Payment provider | Stripe | SaaS | Card capture, payment state | External |
| C-07 | Email provider | Resend | SaaS | Transactional email delivery | External |
| C-08 | Vehicle catalog | NHTSA vPIC public API | Government SaaS | Makes and models | External |

### 3.1 Deployment view

```mermaid
flowchart TB
  subgraph Netlify
    edge["CDN / edge<br/>security headers, cached public HTML"]
    fn["Next.js server functions<br/>(C-01)"]
    edge --> fn
  end
  subgraph WorkerHost["Worker host (Render, Fly, VM)"]
    wk["C-02 worker"]
  end
  subgraph Data
    neonPool[("Neon pooled endpoint<br/>DATABASE_URL")]
    neonDirect[("Neon direct endpoint<br/>DIRECT_URL, migrations only")]
    rds[("Redis<br/>REDIS_URL")]
    bucket[("S3 bucket<br/>S3_*")]
  end
  fn --> neonPool
  wk --> neonPool
  fn --> rds
  wk --> rds
  fn --> bucket
  ci["Operator / CI<br/>prisma migrate deploy"] --> neonDirect
```

**Constraint:** Netlify does not run long-lived processes. If `REDIS_URL` is
set on Netlify, a worker **must** run elsewhere or queued email will never be
delivered (RSK-07).

### 3.2 Configuration items

| Variable | Used by | Feature gated | Required for build |
| --- | --- | --- | --- |
| `DATABASE_URL` | C-01, C-02, seed | All persistence | No |
| `DIRECT_URL` | Prisma Migrate | Migrations | No |
| `NEXT_PUBLIC_SITE_URL` | C-01 | Canonical URLs, sitemap, email links | No (defaults to localhost) |
| `AUTH_SECRET`, `AUTH_URL` | C-01 | Sign-in, `/account`, `/admin` | No |
| `REDIS_URL` | C-01, C-02 | Shared rate limits, queued email | No |
| `RESEND_API_KEY`, `EMAIL_FROM` | C-01, C-02 | Email | No |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | C-01 | Payments | No |
| `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_ENDPOINT` | C-01 | Photo upload | No |

## 4. Logical decomposition

### 4.1 Layers

```mermaid
flowchart TB
  subgraph Presentation["Presentation — src/app, src/components"]
    pub["(marketing) public pages"]
    auth["(auth) login, signup, reset"]
    acct["account/** customer portal"]
    adm["admin/** staff workspace"]
    api["api/** route handlers"]
  end
  subgraph Boundary["API boundary"]
    sa["Server Actions<br/>lib/form-action.ts: rate limit → Zod → module"]
    rh["Route handlers<br/>Zod → module"]
  end
  subgraph Domain["Domain modules — src/modules"]
    direction LR
    IDN[identity] --- LOC[locations] --- CAT[catalog] --- SCH[scheduling]
    EST[estimates] --- REP[repairs] --- BIL[billing] --- CUS[customers]
    NTF[notifications] --- AUD[audit] --- FIL[files]
  end
  subgraph Infra["Infrastructure — src/lib, src/generated"]
    db["lib/db.ts Prisma client"]
    redis["lib/redis.ts"]
    vpic["lib/nhtsa-vpic.ts"]
  end
  Presentation --> Boundary --> Domain --> Infra
```

Rule: presentation never talks to infrastructure for writes; it calls a
module. (Portal *read* pages currently call `getDb()` directly with a
`customerId` filter — acceptable for reads, but see the note in §4.3.)

### 4.2 Domain modules

| ID | Module | Path | Responsibility | Owns (tables) | Status |
| --- | --- | --- | --- | --- | --- |
| M-IDN | identity | `src/modules/identity` | Credentials, password hashing, sessions, reset and email verification tokens, roles/capabilities, rate limits, `requireCustomer` / `requireStaff` | `User`, `PasswordResetToken`, `EmailVerificationToken`, `StaffMembership` (read) | Implemented core; RBAC per-route pending |
| M-LOC | locations | `src/modules/locations` | Active location, public shop profile, hours | `Location` | Implemented (hours in code) |
| M-CAT | catalog | `src/modules/catalog` | Published services, fallback catalog | `Service` | Read path implemented; admin CRUD pending |
| M-SCH | scheduling | `src/modules/scheduling` | Booking schema, save booking, visit display | `Appointment` | Request intake implemented; capacity pending |
| M-EST | estimates | `src/modules/estimates` | Estimate request schema and save | `Estimate` | Request intake implemented; compose/decide pending |
| M-REP | repairs | `src/modules/repairs` | RO statuses, customer-safe view type | `RepairOrder` | Types only |
| M-BIL | billing | `src/modules/billing` | Payment intents, Stripe webhook application | `Invoice`, `StripeEvent` | Payment implemented; invoicing pending |
| M-CUS | customers | `src/modules/customers` | Customer/staff scope types | `Customer`, `Vehicle` | Types only (writes happen in M-SCH/M-EST/M-IDN) |
| M-NTF | notifications | `src/modules/notifications` | Templates, enqueue, deliver, worker | — (Redis) | Implemented |
| M-AUD | audit | `src/modules/audit` | Audit action vocabulary and event shape | — (none yet) | Types only |
| M-FIL | files | `src/modules/files` | Signed upload, attach, visibility | `StoredFile` | Implemented |

### 4.3 Module dependency graph (as built)

```mermaid
flowchart LR
  SCH[scheduling] --> LOC[locations]
  SCH --> FIL[files]
  SCH --> NTF[notifications]
  EST[estimates] --> LOC
  EST --> FIL
  EST --> NTF
  FIL --> LOC
  FIL --> IDN[identity]
  IDN --> LOC
  IDN --> NTF
  CAT[catalog]
  BIL[billing]
  REP[repairs]
  CUS[customers]
  AUD[audit]
```

Observations:

- `files` depends on `identity` only for `createToken`/`hashToken`; these are
  generic crypto helpers and could move to `src/lib`.
- `scheduling` and `estimates` both upsert `Customer` and find-or-create
  `Vehicle` with duplicated code. That logic belongs in `customers` (M-CUS) —
  and is where the RSK-02 fix should live.
- `billing` writes an audit line to stdout directly instead of calling `audit`.
  When `audit` gains persistence, billing should call it.

### 4.4 Allocation of functional areas to components and modules

| Area | Module(s) | Component(s) | Interfaces |
| --- | --- | --- | --- |
| PUB | M-CAT, M-LOC | C-01, C-03 | IF-01 |
| BOOK | M-SCH, M-FIL, M-NTF | C-01, C-02, C-03, C-04, C-05 | IF-01, IF-02, IF-06, IF-07, IF-08, IF-09 |
| EST | M-EST, M-FIL, M-NTF | C-01, C-02, C-03, C-04, C-05 | IF-01, IF-02, IF-06, IF-07, IF-08 |
| REP | M-REP, M-FIL, M-NTF | C-01, C-03 | IF-01 |
| BIL | M-BIL | C-01, C-03, C-06 | IF-01, IF-03, IF-04, IF-05 |
| CUS | M-CUS | C-01, C-03, C-08 | IF-01, IF-09 |
| IDN | M-IDN | C-01, C-03, C-04 | IF-01, IF-02, IF-06, IF-10 |
| ADM | all | C-01, C-03 | IF-01 |
| AUD | M-AUD | C-01, C-03 | IF-01 |
| FIL | M-FIL | C-01, C-03, C-05 | IF-07, IF-08 |
| NTF | M-NTF | C-01, C-02, C-04, C-07 | IF-02, IF-06 |
| LOC | M-LOC | C-01, C-03 | IF-01 |

## 5. Surfaces and route map

| Surface | Base | Gate | Rendering | Headers |
| --- | --- | --- | --- | --- |
| Public | `/` | None | Cache Components; `cacheLife` `marketing` / `contact` / `legal` | Security headers |
| Auth | `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email` | None | Dynamic | + `private, no-store`, noindex |
| Customer portal | `/account/**` | `requireCustomer()` → redirect `/login` | Dynamic (`connection()`) | + `private, no-store`, noindex |
| Staff workspace | `/admin/**` | `requireStaff()` → redirect `/login` or `forbidden()` | Dynamic (`connection()`) | + `private, no-store`, noindex |
| API | `/api/**` | Per handler | Dynamic | Security headers |

Full route list: [PLANNING.md §1.2–1.4](../PLANNING.md#1-sitemap-and-user-flows).

## 6. Data architecture

### 6.1 Entity relationships

```mermaid
erDiagram
  Location ||--o{ Service : offers
  Location ||--o{ StaffMembership : employs
  Location ||--o{ Appointment : schedules
  Location ||--o{ Estimate : issues
  Location ||--o{ RepairOrder : performs
  Location ||--o{ Invoice : bills
  Location ||--o{ StoredFile : stores
  Customer ||--o{ Vehicle : owns
  Customer ||--o{ Appointment : books
  Customer ||--o{ Estimate : receives
  Customer ||--o{ RepairOrder : has
  Customer ||--o{ Invoice : owes
  Customer ||--o| User : "signs in as"
  Vehicle ||--o{ Appointment : for
  Vehicle ||--o{ Estimate : for
  Vehicle ||--o{ RepairOrder : for
  Estimate ||--o{ RepairOrder : authorizes
  RepairOrder ||--o{ Invoice : billed_by
  Appointment ||--o{ StoredFile : attaches
  Estimate ||--o{ StoredFile : attaches
  User ||--o{ PasswordResetToken : resets
  User ||--o{ EmailVerificationToken : verifies
```

`StripeEvent` stands alone (primary key = Stripe event id) as the webhook
dedup ledger. `StaffMembership` is matched to `User` by email, not by foreign
key ([ADR-07](#adr-07--staff-access-by-email-matched-membership)).

### 6.2 Data classification

| Class | Examples | Handling |
| --- | --- | --- |
| Public | Service copy, shop NAP, hours | Cached at the edge |
| Customer-confidential | Name, email, phone, vehicles, appointments, estimates, invoices, `customerSummary`, `visibility=customer` files | Only to the owning customer (by `customerId`) or staff at the location |
| Staff-internal | `internalNotes`, `visibility=internal` files, audit events | Never selected by a portal query |
| Secret | `passwordHash`, `tokenVersion`, reset and verification `tokenHash`, `uploadTokenHash`, env secrets | Never rendered; hashes only |
| Out of scope | Card PAN, CVC | Never present — held by Stripe |

### 6.3 Concurrency control

`Appointment`, `Estimate`, `RepairOrder`, and `Invoice` carry an integer
`version` for optimistic locking. The intended write pattern is
`update … where { id, version } data { …, version: { increment: 1 } }` and a
conflict UI on zero rows updated. Today only the Stripe webhook increments
`version`; it does not condition on it.

## 7. Behaviour

### 7.1 Repair order state machine (SR-REP-002)

```mermaid
stateDiagram-v2
  [*] --> intake
  intake --> diagnosis
  diagnosis --> waiting_parts
  diagnosis --> in_progress
  waiting_parts --> in_progress
  in_progress --> quality_check
  quality_check --> in_progress: rework
  quality_check --> ready
  ready --> delivered
  delivered --> [*]
  intake --> on_hold
  diagnosis --> on_hold
  waiting_parts --> on_hold
  in_progress --> on_hold
  on_hold --> intake: resume
  on_hold --> diagnosis: resume
  on_hold --> waiting_parts: resume
  on_hold --> in_progress: resume
  intake --> cancelled
  diagnosis --> cancelled
  waiting_parts --> cancelled
  in_progress --> cancelled
  on_hold --> cancelled
  cancelled --> [*]
```

> **Design decision needed (open):** PLANNING.md §1.4.1 draws the linear chain
> without a resume path out of `on_hold`, a `diagnosis → in_progress` skip, or
> a `quality_check` rework loop. The diagram above proposes them. Confirm
> before implementing the transition guard (tracked as RSK-16).

### 7.2 Estimate state machine (SR-EST-004..009)

```mermaid
stateDiagram-v2
  [*] --> draft: request or staff create
  draft --> sent: advisor sends
  sent --> approved: customer approves
  sent --> declined: customer declines
  sent --> changes_requested: customer asks for changes
  sent --> expired: TTL elapsed
  changes_requested --> sent: new revision sent
  declined --> sent: new revision sent
  expired --> sent: refreshed revision sent
  approved --> [*]
```

A new revision increments `revision`; an approved revision is never edited.

### 7.3 Invoice state machine (SR-BIL-*)

```mermaid
stateDiagram-v2
  [*] --> draft
  draft --> open: staff issues
  draft --> void
  open --> processing: payment_intent.processing
  open --> paid: payment_intent.succeeded
  processing --> paid: payment_intent.succeeded
  processing --> open: payment failed
  open --> void
  paid --> disputed: charge.dispute.created
  disputed --> paid: dispute won
  paid --> [*]
  void --> [*]
```

Implemented transitions: `open/processing → processing` and
`open/processing → paid` (webhook). Others are planned.

### 7.4 Appointment state machine

```mermaid
stateDiagram-v2
  [*] --> requested: guest or customer books
  requested --> confirmed: advisor confirms
  requested --> cancelled
  confirmed --> completed: checked in and served
  confirmed --> no_show
  confirmed --> cancelled
```

### 7.5 Request pipeline for a public form

```mermaid
flowchart LR
  form["Form POST (Server Action)"] --> rl{"enforceRateLimit(policy)<br/>Redis or in-memory"}
  rl -- limited --> r429["state: limited"]
  rl -- ok --> zod{"Zod safeParse"}
  zod -- honeypot filled --> silent["state: invalid, no field hints"]
  zod -- invalid --> fields["state: invalid + fieldErrors"]
  zod -- ok --> mod["Domain module save"]
  mod -- DB not configured --> unavail["state: unavailable"]
  mod -- saved --> mail["enqueueEmail (errors swallowed)"] --> ok["state: success"]
```

## 8. Architecture decision records

### ADR-01 — Modular monolith

- **Status:** Accepted
- **Context:** One shop, one small team, launch scope is a few CRUD-heavy flows.
- **Decision:** One Next.js deployable with in-process modules under `src/modules`; a worker process reuses the same modules.
- **Consequences:** Simple deployment and transactions. Module boundaries are by convention, not enforced; consider an ESLint import rule. Rejected: per-domain microservices, GraphQL federation.

### ADR-02 — Location-scoped data from day one

- **Status:** Accepted
- **Decision:** `locationId` on every transactional table; staff access as `StaffMembership(locationId, email, role)`.
- **Consequences:** No migration needed for location two. Today `getActiveLocation()` returns the oldest active row, which becomes ambiguous once two exist (RSK-11).

### ADR-03 — Queue with a separate worker and an inline fallback

- **Status:** Accepted
- **Decision:** BullMQ on Redis for email; `npm run worker` consumes. Without `REDIS_URL`, send inline.
- **Consequences:** Request latency stays low with Redis; the worker must be hosted outside Netlify (RSK-07). Jobs lack an idempotency key (RSK-06).

### ADR-04 — Hosted Payment Element and webhook as source of truth

- **Status:** Accepted
- **Decision:** Stripe Payment Element in the browser; server creates PaymentIntents with `metadata.invoiceId`; invoice reaches `paid` only through a signed webhook; `StripeEvent` dedups.
- **Consequences:** SAQ-A scope; no false "paid". Webhook ordering bug (RSK-08) must be fixed by making dedup and state change one transaction.

### ADR-05 — Rendering split by surface

- **Status:** Accepted
- **Decision:** `cacheComponents: true`. Public data functions use `"use cache"` with named `cacheLife` profiles; private layouts call `connection()`; `next.config.ts` adds `private, no-store` and `noindex` headers to private routes.
- **Consequences:** CDN-fast public pages; personalised HTML never cached. On-demand revalidation from admin writes still to be added (SR-ADM-006).

### ADR-06 — Every integration is optional

- **Status:** Accepted
- **Decision:** Each integration has an `xConfigured()` check; missing config yields a user-safe message and no crash; the build needs no secrets.
- **Consequences:** Easy local dev and previews (MODE-02..08). Risk of silently running in a degraded mode in production — add a startup/health report of which integrations are active (NFR-OBS).

### ADR-07 — Staff access by email-matched membership

- **Status:** Accepted
- **Decision:** One `User` table for staff and customers. Staff authority comes from a `StaffMembership` row with the same email (case-insensitive) at the active location.
- **Consequences:** Staff can be provisioned before they sign up. Because the match is by email, `requireStaff()` honours a membership only after the user has verified that email (SR-IDN-007); without that check, anyone who registered a staff member's email first would gain staff access (RSK-01, mitigated).

### ADR-08 — JWT sessions with a revocation counter

- **Status:** Accepted
- **Decision:** Auth.js JWT strategy; each request re-reads `User.tokenVersion` and rejects stale tokens.
- **Consequences:** Password reset revokes all sessions without a session table. Costs one DB read per authenticated request.
