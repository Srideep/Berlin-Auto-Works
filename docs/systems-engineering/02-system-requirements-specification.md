# 02 — System Requirements Specification (SRS)

**System:** Berlin AutoWorks web application
**Baseline:** 2026-11-10, code `5ba429c`
**Related:** [01 ConOps](01-concept-of-operations.md) · [05 RTM](05-requirements-traceability-matrix.md) · [06 V&V](06-verification-validation-plan.md)

## 1. Conventions

- "**shall**" is binding; "**should**" is a goal; "**may**" is permitted.
- **Source** is the stakeholder need (`SN-`) and the PLANNING.md section.
- **Priority** uses MoSCoW: **M**ust, **S**hould, **C**ould, **W**on't (launch).
- **Verif.** is the verification method: **T**est, **D**emonstration, **I**nspection, **A**nalysis.
- **Status** is the state of the code at the baseline (see [README](README.md#status-vocabulary)).

Every requirement is atomic and testable. Where the plan and the code differ,
the requirement states the plan and the status/notes state the difference.

## 2. System context

The system is one Next.js application (`C-01`) with a separate notification
worker (`C-02`), backed by Neon Postgres and integrating Auth.js, Redis/BullMQ,
Resend, S3-compatible storage, Stripe, and NHTSA vPIC. See
[03 §2](03-system-architecture-design.md#2-system-context).

---

## 3. Functional requirements

### 3.1 Public site — `PUB`

| ID | Requirement | Source | Pri | Verif. | Status |
| --- | --- | --- | --- | --- | --- |
| SR-PUB-001 | The system shall serve the public pages `/`, `/services`, `/services/[slug]`, `/about`, `/fleet`, `/contact`, `/book`, `/estimate`, `/privacy`, `/terms`, and `/accessibility` without authentication. | SN-01; Plan §1.2 | M | D | Implemented |
| SR-PUB-002 | The service catalog shall list the published `Service` rows of the active location ordered by `sortOrder`, then name. | SN-01; Plan §2.2 | M | T | Implemented |
| SR-PUB-003 | When no database is configured or no active location exists, the system shall serve the in-repository launch catalog and shop profile. | SN-13; MODE-02 | M | T | Implemented |
| SR-PUB-004 | A request for an unknown or unpublished service slug shall return HTTP 404. | SN-01; Plan §2.2 | M | T | Implemented |
| SR-PUB-005 | Shop name, address, phone, and email shall be read from the active `Location` record. | SN-01; Plan §2.2 | M | T | Implemented |
| SR-PUB-006 | Shop hours shown on public pages shall be read from the location's hours record. | SN-01; Plan §2.2 | S | T | Partial — hours are launch copy in `locations/profile.ts`, not a column |
| SR-PUB-007 | The system shall publish `sitemap.xml` listing every indexable public path and every published service. | SN-01; Plan §4.4 | M | T | Implemented |
| SR-PUB-008 | The system shall publish `robots.txt` that disallows `/account`, `/admin`, and auth routes. | SN-10; Plan §4.4 | M | T | Implemented |
| SR-PUB-009 | The home page shall include JSON-LD structured data describing the business (LocalBusiness / AutoRepair). | SN-01; Plan §4.4 | S | I | Implemented |
| SR-PUB-010 | The public site shall not publish reviews or ratings that are not genuine. | SN-09; Plan §4.4 | M | I | Implemented (none published) |

### 3.2 Scheduling and booking — `BOOK`

| ID | Requirement | Source | Pri | Verif. | Status |
| --- | --- | --- | --- | --- | --- |
| SR-BOOK-001 | A guest shall be able to submit a booking request with: service, preferred date, vehicle year/make/model, first/middle/last name, email, US phone, notes, and one optional photo. | SN-02; Flow A | M | T | Implemented |
| SR-BOOK-002 | The system shall reject a booking whose service slug is not in the published catalog of the active location. | SN-02 | M | T | Implemented |
| SR-BOOK-003 | The system shall validate booking input server-side: year 1980..current+1; names ≤ 40 chars; email ≤ 120 chars; phone exactly 10 US digits; notes ≤ 1000 chars. | SN-02, SN-10 | M | T | Implemented |
| SR-BOOK-004 | A successful booking shall create an `Appointment` with status `requested`, the active `locationId`, and links to a `Customer` and `Vehicle`. | SN-02, SN-09 | M | T | Implemented |
| SR-BOOK-005 | The system shall offer only slots that fall within location hours, outside blackout dates, and under slot limits. | SN-02; Flow A step 3 | M | T | Not started — only a preferred date is captured; `startsAt` is fixed at 13:00 UTC |
| SR-BOOK-006 | When no slot is available in range, the system shall show the next available dates and offer an estimate request or a call. | SN-02; Flow A exc. | S | D | Not started |
| SR-BOOK-007 | The system shall warn on a duplicate same-day booking for the same customer and vehicle. | SN-07; Flow A exc. | S | T | Not started |
| SR-BOOK-008 | The system shall send a `booking_received` email after a booking is saved; failure to send shall not roll back the booking. | SN-02, SN-13 | M | T | Implemented |
| SR-BOOK-009 | A signed-in customer shall see only their own appointments in the list and detail views. | SN-04, SN-10 | M | T | Implemented |
| SR-BOOK-010 | A signed-in customer shall be able to book from the portal with a vehicle on file prefilled. | SN-06; Flow E | S | D | Not started — placeholder |
| SR-BOOK-011 | A customer shall be able to cancel or request a reschedule of a `requested` or `confirmed` appointment. | SN-02 | S | T | Not started |
| SR-BOOK-012 | A guest's records shall be attachable to a new account only after proof of control of the email (verification or magic link). | SN-10; Flow A exc. | M | T | Implemented — linked only after a verification link or password reset (RSK-01 mitigated) |

### 3.3 Estimates — `EST`

| ID | Requirement | Source | Pri | Verif. | Status |
| --- | --- | --- | --- | --- | --- |
| SR-EST-001 | A guest shall be able to submit an estimate request with concern (10–2000 chars), vehicle, contact details, and one optional photo. | SN-03; Flow B | M | T | Implemented |
| SR-EST-002 | An estimate request shall create an `Estimate` in `draft` with the active `locationId`, linked customer and vehicle, and the concern as `customerNotes`. | SN-03 | M | T | Implemented (plan named an `EstimateRequest` entity; implemented as a draft `Estimate`) |
| SR-EST-003 | The system shall send an `estimate_received` email after the request is saved. | SN-03 | M | T | Implemented |
| SR-EST-004 | An advisor shall be able to compose estimate line items (labor, parts, taxes, fees) and send the estimate, setting status `sent`. | SN-03, SN-07 | M | T | Not started — no line-item model |
| SR-EST-005 | A customer shall be able to approve, decline (optional reason), or request changes to a `sent` estimate they own. | SN-03 | M | T | Not started |
| SR-EST-006 | An approved estimate shall be immutable; any price change shall create a new revision requiring re-approval. | SN-03; Flow B exc. | M | T | Partial — `revision` column only |
| SR-EST-007 | A revised estimate shall retain all prior revisions. | SN-03 | M | T | Partial — `revision` column only |
| SR-EST-008 | An estimate shall move to `expired` after a configurable TTL. | SN-03 | S | T | Not started |
| SR-EST-009 | Concurrent staff edits of an estimate shall be detected with the `version` field and surfaced as a conflict. | SN-07; Flow F exc. | M | T | Partial — `version` column only |
| SR-EST-010 | A customer shall see only their own estimates, and never `internalNotes`. | SN-10 | M | T | Implemented (list); detail is a placeholder |
| SR-EST-011 | An estimate opened by magic link shall not be shown when the link is expired or invalid. | SN-10; Flow B exc. | M | T | Not started |

### 3.4 Repair orders — `REP`

| ID | Requirement | Source | Pri | Verif. | Status |
| --- | --- | --- | --- | --- | --- |
| SR-REP-001 | An advisor shall be able to create a `RepairOrder` from an approved estimate or as a walk-in, linked to customer, vehicle, and location. | SN-07; Flow C | M | T | Not started |
| SR-REP-002 | Repair order status shall follow the launch chain `intake → diagnosis → waiting_parts → in_progress → quality_check → ready → delivered`, with `on_hold` and `cancelled` reachable from any non-terminal state. | SN-04, SN-07 | M | T | Partial — enum exists; transitions not enforced |
| SR-REP-003 | Cancelling a repair order shall require a reason. | SN-07; Flow C exc. | S | T | Not started |
| SR-REP-004 | A customer shall see a customer-safe timeline of their own repair orders, including `customerSummary` and ETA. | SN-04 | M | D | Not started — placeholder; `CustomerRepairView` type defined |
| SR-REP-005 | `internalNotes` on estimates and repair orders shall never be selected by any customer-portal query. | SN-10 | M | I, T | Implemented (by construction; no portal query selects it) |
| SR-REP-006 | A customer shall see only files with `visibility = customer`; staff shall see all files. | SN-10 | M | T | Partial — column enforced on write; no portal read path yet |
| SR-REP-007 | A status change or customer-visible note shall send a `repair_status` notification. | SN-04 | S | T | Not started — template defined |

### 3.5 Billing and payments — `BIL`

| ID | Requirement | Source | Pri | Verif. | Status |
| --- | --- | --- | --- | --- | --- |
| SR-BIL-001 | Staff shall be able to create an `Invoice` from completed work and set it `open`. | SN-05, SN-07 | M | T | Not started |
| SR-BIL-002 | A customer shall see only their own invoices in the list and detail views. | SN-05, SN-10 | M | T | Implemented |
| SR-BIL-003 | A customer shall pay the full balance of an owned invoice through the Stripe Payment Element; card data shall be entered only in provider-hosted fields. | SN-05, SN-10 | M | T, I | Implemented |
| SR-BIL-004 | The system shall create a payment intent only for invoices that are owned by the customer, in status `open` or `processing`, with `balanceDueCents > 0`. | SN-05 | M | T | Implemented |
| SR-BIL-005 | Payment intent creation shall use an idempotency key derived from the invoice id and reuse an existing non-cancelled intent. | SN-05 | M | T | Implemented |
| SR-BIL-006 | The webhook endpoint shall reject any request whose Stripe signature does not verify. | SN-05, SN-10 | M | T | Implemented |
| SR-BIL-007 | The webhook shall apply each Stripe event at most once, keyed by event id. | SN-05; Plan §4.2 | M | T | Partial — dedup row is written before the update and outside a transaction (RSK-08) |
| SR-BIL-008 | `payment_intent.processing` shall set the invoice to `processing`; `payment_intent.succeeded` shall set it to `paid` with zero balance and increment `version`. | SN-05 | M | T | Implemented |
| SR-BIL-009 | A failed or abandoned payment shall leave the invoice `open` and never mark it `paid`. | SN-05; Flow D exc. | M | T | Implemented (no state change on failure) |
| SR-BIL-010 | A manager shall be able to refund through the provider; the refund shall sync by webhook and write an audit event. | SN-05, SN-08 | S | T | Not started |
| SR-BIL-011 | A dispute event shall set the invoice to `disputed` and freeze related actions. | SN-05 | S | T | Not started |
| SR-BIL-012 | A paid invoice shall trigger a receipt email. | SN-05 | S | T | Not started |
| SR-BIL-013 | Partial payments. | SN-05 | W | — | Deferred |

### 3.6 Customers and vehicles — `CUS`

| ID | Requirement | Source | Pri | Verif. | Status |
| --- | --- | --- | --- | --- | --- |
| SR-CUS-001 | A customer shall see their vehicles and, per vehicle, the appointments recorded for it. | SN-06 | M | T | Implemented |
| SR-CUS-002 | A customer shall be able to add and edit a vehicle (year, make, model, plate required; VIN optional). | SN-06; Flow E | M | T | Not started — placeholder |
| SR-CUS-003 | Adding a vehicle whose VIN or plate matches an existing vehicle shall prompt a soft merge. | SN-06 | C | T | Not started |
| SR-CUS-004 | Vehicle history shall aggregate completed repair orders, invoices, and past appointments. | SN-06 | S | T | Partial — appointments only |
| SR-CUS-005 | Vehicle make and model choices shall come from NHTSA vPIC through a server proxy with a 24-hour cache. | SN-02 | S | T | Implemented |
| SR-CUS-006 | A customer shall be able to view and edit name, contact details, and notification preferences. | SN-06 | S | T | Partial — view only |

### 3.7 Identity and access — `IDN`

| ID | Requirement | Source | Pri | Verif. | Status |
| --- | --- | --- | --- | --- | --- |
| SR-IDN-001 | A visitor shall be able to sign up with name, email, and a password of 12–200 characters. | SN-06 | M | T | Implemented |
| SR-IDN-002 | Passwords shall be stored only as a salted scrypt hash and compared in constant time. | SN-10 | M | I, T | Implemented |
| SR-IDN-003 | Sign-in shall use Auth.js credentials with a JWT session in an `httpOnly`, `SameSite=Lax` cookie that is `Secure` in production. | SN-10 | M | I, T | Implemented |
| SR-IDN-004 | Every session read shall compare the token's `tokenVersion` with the user's current value and reject a mismatch. | SN-10 | M | T | Implemented |
| SR-IDN-005 | Password reset tokens shall be random (256-bit), stored hashed, single-use, valid for one hour, and a successful reset shall revoke all sessions. | SN-10; Flow E exc. | M | T | Implemented |
| SR-IDN-006 | The forgot-password response shall be identical whether or not the account exists. | SN-10 | M | T | Implemented |
| SR-IDN-007 | Email ownership shall be verified before an account gains access to records created under that email, or to staff access granted to that email. Verification links shall be random (256-bit), stored hashed, single-use, valid for 24 hours, and replaced when a new one is requested. | SN-10 | M | T | Implemented (`identity/verification.ts`) |
| SR-IDN-008 | Login, signup, forgot-password, reset-password, email verification, booking, estimate, and upload shall be rate limited per client (see NFR-SEC-008). | SN-10 | M | T | Implemented |
| SR-IDN-009 | Repeated failed logins for one account shall trigger a lockout or step-up. | SN-10; Flow E exc. | S | T | Not started — per-IP rate limit only |
| SR-IDN-010 | `/account/**` shall require a signed-in user with a verified email linked to a customer; an unverified user shall be sent to `/verify-email`, anyone else to `/login`. | SN-10 | M | T | Implemented |
| SR-IDN-011 | `/admin/**` shall require a signed-in user with a verified email and a `StaffMembership` at the active location; an unverified user shall be sent to `/verify-email`; otherwise return 403. | SN-08 | M | T | Implemented |
| SR-IDN-012 | Each admin route and mutation shall check the role capability map (advisor, technician, manager) and return 403 with no record when missing. | SN-08 | M | T | Partial — capability map defined, not enforced per route (RSK-15) |
| SR-IDN-013 | Staff shall be able to invite a customer who has no password to set one. | SN-07; Flow E exc. | S | T | Not started |

### 3.8 Staff workspace — `ADM`

| ID | Requirement | Source | Pri | Verif. | Status |
| --- | --- | --- | --- | --- | --- |
| SR-ADM-001 | The Today view shall list today's appointments, estimates awaiting customer decision, repair orders blocked or ready, and overdue invoices for the active location. | SN-07 | M | D | Not started |
| SR-ADM-002 | The calendar shall show appointments by day and bay and refresh at least every 30 seconds. | SN-07; Plan §2.2 | M | D | Not started |
| SR-ADM-003 | A double-booked bay shall raise a conflict warning; a manager override shall write an audit event. | SN-07, SN-08 | S | T | Not started |
| SR-ADM-004 | An advisor shall be able to mark an appointment `confirmed`, `no_show`, `cancelled`, or `completed`. | SN-07 | M | T | Not started |
| SR-ADM-005 | Staff shall be able to search customers and open a customer's vehicles and history. | SN-07 | M | D | Not started |
| SR-ADM-006 | A manager shall be able to create, edit, publish, and unpublish services; a change shall revalidate affected public pages on demand. | SN-08; Plan §2.2 | M | T | Not started |
| SR-ADM-007 | A manager shall be able to edit location hours and blackout dates. | SN-08 | M | T | Not started |
| SR-ADM-008 | A manager shall be able to add staff and change roles. | SN-08 | M | T | Not started |
| SR-ADM-009 | Every staff write that notifies the customer shall show "customer will be notified" before confirm. | SN-07; Plan §1.6 | S | D | Not started |

### 3.9 Audit — `AUD`

| ID | Requirement | Source | Pri | Verif. | Status |
| --- | --- | --- | --- | --- | --- |
| SR-AUD-001 | The system shall write an append-only audit event (location, actor, action, subject, time) for: estimate sent/approved/declined, repair-order status change, invoice created/paid/refunded, staff role change, hours change, catalog change. | SN-08; Plan §4.3 | M | T | Partial — action vocabulary defined; only `invoice.paid` is emitted, to stdout, not persisted (RSK-04) |
| SR-AUD-002 | Audit events shall be retained for at least one year. | SN-08 | M | I | Not started |
| SR-AUD-003 | A manager shall be able to view and filter the audit log. | SN-08 | M | D | Not started |

### 3.10 Files — `FIL`

| ID | Requirement | Source | Pri | Verif. | Status |
| --- | --- | --- | --- | --- | --- |
| SR-FIL-001 | The system shall issue a signed S3 `PUT` URL valid for 300 seconds, bound to the declared content type and byte length. | SN-10 | M | T | Implemented |
| SR-FIL-002 | Uploads shall be limited to JPEG, PNG, or WebP and 1 byte to 5 MB. | SN-10 | M | T | Implemented |
| SR-FIL-003 | Object keys shall be namespaced by location (`locations/<locationId>/uploads/<fileId>`). | SN-09 | M | I | Implemented |
| SR-FIL-004 | A file shall be attached to a record only with its one-time upload token, only once, and only after the object exists in the bucket. | SN-10 | M | T | Implemented |
| SR-FIL-005 | Image bytes shall be stored only in object storage; the database stores metadata. | SN-10; Plan §3.2 | M | I | Implemented |
| SR-FIL-006 | Uploaded files shall be scanned for malware. | SN-10 | C | T | Deferred |
| SR-FIL-007 | Uploads never attached to a record shall be removed after a retention window. | SN-12 | C | T | Not started (RSK-13) |

### 3.11 Notifications — `NTF`

| ID | Requirement | Source | Pri | Verif. | Status |
| --- | --- | --- | --- | --- | --- |
| SR-NTF-001 | When Redis is configured, outbound email shall be enqueued on the `notifications` BullMQ queue with 5 attempts and exponential backoff from 10 s. | SN-12, SN-13 | M | T | Implemented |
| SR-NTF-002 | When Redis is not configured, outbound email shall be sent on the request. | SN-13; MODE-04 | M | T | Implemented |
| SR-NTF-003 | A worker process (`npm run worker`) shall consume the queue and log failed jobs as structured JSON. | SN-12 | M | D | Implemented |
| SR-NTF-004 | When the email provider is not configured, send attempts shall be skipped without error. | SN-13; MODE-03 | M | T | Implemented |
| SR-NTF-005 | Customers shall be able to choose notification channels. | SN-06 | S | T | Not started |
| SR-NTF-006 | SMS notifications. | SN-04 | W | — | Deferred |

### 3.12 Locations — `LOC`

| ID | Requirement | Source | Pri | Verif. | Status |
| --- | --- | --- | --- | --- | --- |
| SR-LOC-001 | `Service`, `StaffMembership`, `Appointment`, `Estimate`, `RepairOrder`, `Invoice`, and `StoredFile` shall each carry a non-null `locationId`. | SN-09; Plan §4.8 | M | I | Implemented |
| SR-LOC-002 | No code path shall hard-code a location id; the active location shall be resolved from the database. | SN-09 | M | I | Implemented (oldest active location — see RSK-11) |
| SR-LOC-003 | Hours, blackout dates, and feature flags shall be stored per location. | SN-09 | M | I | Not started |
| SR-LOC-004 | Multi-location UI (location switcher, cross-location reporting). | SN-09 | W | — | Deferred |

---

## 4. Non-functional requirements

### 4.1 Performance — `PERF`

| ID | Requirement | Source | Pri | Verif. | Status |
| --- | --- | --- | --- | --- | --- |
| NFR-PERF-001 | Public pages shall have LCP ≤ 2.5 s at p75 on mobile. | SN-01; Plan §4.1 | M | A | Not verified |
| NFR-PERF-002 | Customer and staff dashboards shall have LCP ≤ 3.0 s at p75. | SN-04, SN-07 | M | A | Not verified |
| NFR-PERF-003 | All surfaces shall have INP ≤ 200 ms and CLS ≤ 0.1 at p75. | SN-11 | M | A | Not verified |
| NFR-PERF-004 | Cached public HTML shall have TTFB ≤ 800 ms at p75. | SN-01 | M | A | Not verified |
| NFR-PERF-005 | Simple authenticated API reads shall respond in ≤ 500 ms at p75. | SN-07 | M | A | Not verified |
| NFR-PERF-006 | The availability query shall respond in ≤ 700 ms at p95 under normal load. | SN-02 | M | A | Not verified (no availability API yet) |
| NFR-PERF-007 | The system shall pass a load test at 2× expected peak before go-live. | SN-12 | M | A | Not verified |
| NFR-PERF-008 | Payment and map scripts shall load only on routes that use them. | SN-01 | S | I | Implemented (Stripe loaded in the invoice component only) |

### 4.2 Reliability and availability — `REL`

| ID | Requirement | Source | Pri | Verif. | Status |
| --- | --- | --- | --- | --- | --- |
| NFR-REL-001 | Monthly availability of the web application shall be ≥ 99.5%. | SN-12; Plan §4.2 | M | A | Not verified |
| NFR-REL-002 | Database RPO shall be ≤ 1 hour. | SN-12 | M | A, D | Not verified (Neon PITR expected to meet it) |
| NFR-REL-003 | RTO shall be ≤ 8 hours. | SN-12 | M | D | Not verified — no runbook |
| NFR-REL-004 | Backups shall run daily and a restore drill shall run monthly. | SN-12 | M | D | Not verified |
| NFR-REL-005 | Notification and webhook processing shall be at-least-once with idempotency. | SN-12 | M | T | Partial — email jobs have no idempotency key; webhook dedup ordering issue (RSK-06, RSK-08) |
| NFR-REL-006 | A booking or estimate request shall be persisted even when the email provider is down. | SN-13 | M | T | Implemented |
| NFR-REL-007 | A missing optional secret shall disable only its feature; `npm run build` shall succeed with no secrets set. | SN-13 | M | T | Implemented |

### 4.3 Security — `SEC`

| ID | Requirement | Source | Pri | Verif. | Status |
| --- | --- | --- | --- | --- | --- |
| NFR-SEC-001 | All traffic shall be HTTPS; production responses shall carry HSTS (`max-age=63072000; includeSubDomains`). | SN-10 | M | I, T | Implemented |
| NFR-SEC-002 | All responses shall carry `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN`, and a restrictive `Permissions-Policy`. | SN-10 | M | T | Implemented |
| NFR-SEC-003 | A Content-Security-Policy shall be deployed report-only, then enforced. | SN-10 | S | T | Not started |
| NFR-SEC-004 | `/account`, `/admin`, and auth routes shall respond with `Cache-Control: private, no-store` and `X-Robots-Tag: noindex, nofollow`. | SN-10 | M | T | Implemented |
| NFR-SEC-005 | Every customer-portal query shall filter by the session's `customerId`; a request for another customer's record shall return 404. | SN-10 | M | T | Implemented |
| NFR-SEC-006 | Every staff query and mutation shall filter by the staff member's `locationId`. | SN-08, SN-09 | M | T | Not started (no staff queries yet) |
| NFR-SEC-007 | Card PAN and CVC shall never be stored, logged, or transmitted through application servers. | SN-10 | M | I | Implemented |
| NFR-SEC-008 | Rate limits shall be: login 5/15 min; signup, forgot, reset, resend verification 5/h; verify email 10/h; booking, estimate 8/h; upload 20/h; shared across instances when Redis is configured. | SN-10 | M | T | Implemented (client key trust — RSK-03) |
| NFR-SEC-009 | All external input shall be validated with Zod before use. | SN-10 | M | I | Implemented |
| NFR-SEC-010 | Public forms shall include a honeypot field that silently rejects bots. | SN-10 | S | T | Implemented (`company`) |
| NFR-SEC-011 | Mutations shall be protected against CSRF. | SN-10 | M | I | Implemented (Server Action origin check; Auth.js CSRF token) |
| NFR-SEC-012 | Secrets shall come only from the environment; server-only modules shall import `server-only`. | SN-10 | M | I | Implemented |
| NFR-SEC-013 | Route parameters used as record ids shall be validated (`[A-Za-z0-9_-]{1,128}`) and return 404 otherwise. | SN-10 | M | T | Implemented (`lib/record-id.ts`) |

### 4.4 Privacy — `PRIV`

| ID | Requirement | Source | Pri | Verif. | Status |
| --- | --- | --- | --- | --- | --- |
| NFR-PRIV-001 | Logs shall not contain passwords, tokens, full card data, or unnecessary PII. | SN-10 | M | I | Partial — no structured log policy yet |
| NFR-PRIV-002 | A privacy policy shall be published and describe a manual data export / delete process. | SN-10; Plan §4.3 | M | I | Implemented (`/privacy`) |
| NFR-PRIV-003 | An unauthenticated form shall not modify an existing customer's stored profile. | SN-10 | M | T | Not met — guest forms upsert name/phone by email (RSK-02) |

### 4.5 SEO — `SEO`

| ID | Requirement | Source | Pri | Verif. | Status |
| --- | --- | --- | --- | --- | --- |
| NFR-SEO-001 | Each public page shall have a unique title and description. | SN-01 | M | I | Implemented |
| NFR-SEO-002 | Service pages shall render meaningful content in the initial HTML. | SN-01 | M | T | Implemented (server-rendered, cached) |
| NFR-SEO-003 | Staging deployments shall be noindex. | SN-01 | M | I | Not verified |

### 4.6 Accessibility — `A11Y`

| ID | Requirement | Source | Pri | Verif. | Status |
| --- | --- | --- | --- | --- | --- |
| NFR-A11Y-001 | Public and customer flows shall conform to WCAG 2.2 Level AA; staff flows as far as practicable. | SN-11 | M | A, D | Not verified |
| NFR-A11Y-002 | All interactive flows shall be operable by keyboard with a visible focus indicator and no traps. | SN-11 | M | D | Not verified |
| NFR-A11Y-003 | Form fields shall have associated labels and announced error messages. | SN-11 | M | T | Partial — `role="alert"` on form status |
| NFR-A11Y-004 | Async results (booking, payment) shall be announced to assistive technology. | SN-11 | M | D | Partial |
| NFR-A11Y-005 | An accessibility statement with a contact path shall be published at `/accessibility`. | SN-11 | M | I | Implemented |

### 4.7 Observability — `OBS`

| ID | Requirement | Source | Pri | Verif. | Status |
| --- | --- | --- | --- | --- | --- |
| NFR-OBS-001 | Logs shall be structured and include `requestId`, `userId`/`staffId`, `locationId`, and route where present. | SN-12 | M | I | Partial — ad-hoc JSON in worker and webhook |
| NFR-OBS-002 | Errors shall be reported to an error tracker with release version. | SN-12 | M | D | Not started |
| NFR-OBS-003 | Metrics shall cover latency, 5xx rate, queue depth, webhook failures, payment success, and booking funnel. | SN-12 | M | D | Not started |
| NFR-OBS-004 | Alerts shall fire on 5xx spike, webhook failure rate, queue backlog, backup failure, and certificate expiry. | SN-12 | M | D | Not started |

### 4.8 Maintainability — `MNT`

| ID | Requirement | Source | Pri | Verif. | Status |
| --- | --- | --- | --- | --- | --- |
| NFR-MNT-001 | TypeScript shall run in strict mode with no `any`. | SN-15; Plan §3 | M | I | Implemented |
| NFR-MNT-002 | `npm run typecheck` and `npm run lint` shall pass before merge. | SN-15; Plan §3 | M | T | Not enforced — no CI (RSK-05) |
| NFR-MNT-003 | Domain logic shall live in `src/modules/*`, not in route handlers or components. | SN-15; Plan §2.4 | M | I | Implemented |
| NFR-MNT-004 | Schema changes shall be delivered as versioned Prisma migrations. | SN-15; Plan §3.1 | M | I | Implemented |
| NFR-MNT-005 | Only the App Router shall be used. | SN-15; Plan §3 | M | I | Implemented |

### 4.9 Rendering and caching — `RND`

| ID | Requirement | Source | Pri | Verif. | Status |
| --- | --- | --- | --- | --- | --- |
| NFR-RND-001 | Marketing pages shall be cached with `marketing` profile (stale 60 s, revalidate 300 s, expire 1 h). | SN-01; Plan §2.2 | M | I | Implemented |
| NFR-RND-002 | `/contact` shall revalidate within 120 s so hours stay current. | SN-01; Plan §2.2 | M | I | Implemented (`contact` profile) |
| NFR-RND-003 | Legal pages shall use the `legal` profile (revalidate weekly). | SN-01; Plan §2.2 | M | I | Implemented |
| NFR-RND-004 | `/account/**` and `/admin/**` shall be rendered per request and never cached. | SN-10; Plan §2.2 | M | T | Implemented (`connection()` in layouts + headers) |
| NFR-RND-005 | Availability data shall never be statically cached. | SN-02; Plan §2.3 | M | I | Not applicable yet (no availability API) |

### 4.10 Compliance — `CMP`

| ID | Requirement | Source | Pri | Verif. | Status |
| --- | --- | --- | --- | --- | --- |
| NFR-CMP-001 | Estimates and invoices shall support location-configurable disclosure text for NJ auto-repair consumer notices. | SN-14; Plan §4.9 | S | I | Not started |
| NFR-CMP-002 | The system shall operate within PCI DSS SAQ-A scope. | SN-10 | M | A | Implemented (hosted Payment Element) — formal SAQ not completed |
| NFR-CMP-003 | The product shall not claim SOC 2, HIPAA, or similar without evidence. | SN-10; Plan §4.9 | M | I | Implemented |

---

## 5. Requirement counts at baseline

| Area | Total | Implemented | Partial | Not started / not verified | Deferred |
| --- | --- | --- | --- | --- | --- |
| Functional (`SR-`) | 101 | 51 | 11 | 35 | 4 |
| Non-functional (`NFR-`) | 56 | 28 | 5 | 23 | 0 |
| **All** | **157** | **79** | **16** | **58** | **4** |

Counts come from [05 RTM §1](05-requirements-traceability-matrix.md#1-status-summary), which also breaks them down by area. Recompute both when a status changes.
