# Berlin AutoWorks — Implementation Planning Document

**Product:** Pseudo enterprise-ready website + webapp for a full-service auto repair shop  
**Brand:** Berlin AutoWorks  
**Location (launch):** Single shop — Berlin, New Jersey (multi-location-ready data model)  
**Document purpose:** Site map & user flows, rendering strategy, confirmed tech stack, non-functional requirements  
**Audience:** Product, design, and engineering implementing v1  
**Status:** Planning baseline for launch scope

---

## Business snapshot (context)

| Item | Value |
|------|--------|
| Brand | Berlin AutoWorks — “Reliable repair. Straight answers. Ready for the road.” |
| Address (placeholder) | 123 Route 73, Berlin, NJ 08009 |
| Phone (placeholder) | (856) 555-0147 |
| Email (placeholder) | service@berlinautoworks.example |
| Hours | Mon–Fri 8:00 AM–6:00 PM; Sat 8:00 AM–3:00 PM; Sun closed |
| Core customer actions | Book service, request/approve estimates, track repairs, pay invoices |
| Architecture | Modular monolith; location-aware from day one |

**Services (content catalog for marketing + booking catalog):** preventive maintenance & oil changes; diagnostics & CEL; brakes; tires/alignment; battery/starter/alternator; suspension/steering; engine/transmission; HVAC; exhaust; pre-purchase & inspection prep; fleet maintenance.

---

## 1. Sitemap and user flows

### 1.1 Information architecture overview

Three surfaces share one codebase and one API boundary inside the modular monolith:

| Surface | Audience | Auth | Primary goals |
|---------|----------|------|----------------|
| Public marketing site | Prospects / drivers | None (optional soft login CTAs) | Trust, SEO, convert to book / estimate |
| Customer portal | Existing customers | Required | Book, estimates, repair status, invoices, vehicles/history |
| Staff / admin | Advisors, techs, managers, owner | Required + role | Schedule, estimates, RO lifecycle, invoices, content ops |

**Location model (launch vs later):** Every transactional record carries `locationId`. Launch UI and permissions assume one active location. Multi-location admin (location switcher, per-location hours/staff) is deferred but schemas and queries must not hard-code a single shop.

---

### 1.2 Public sitemap

```
/                         Home
/services                 Services index
/services/[slug]          Service detail (e.g. /services/brake-repair)
/about                    About the shop
/fleet                    Fleet maintenance (B2B landing)
/contact                  Contact + map + hours
/book                     Booking start (guest or account)
/estimate                 Estimate request start
/privacy                  Privacy policy
/terms                    Terms of use
/accessibility            Accessibility statement
```

**Launch out of scope (public):** blog/CMS articles, careers, multi-location store locator, native apps, live chat widget as a product dependency.

**Later additions:** `/locations`, `/locations/[slug]`, blog `/insights`, reviews aggregation page, gift cards, parts retail.

---

### 1.3 Customer portal sitemap

Base: `/account` (all routes require authenticated customer; noindex).

```
/account                        Dashboard (upcoming appointments, open estimates, active ROs, unpaid invoices)
/account/vehicles               Vehicle list
/account/vehicles/new           Add vehicle
/account/vehicles/[id]          Vehicle detail + service history
/account/vehicles/[id]/edit     Edit vehicle
/account/bookings               Appointment list
/account/bookings/new           Book service (account path)
/account/bookings/[id]          Appointment detail / cancel-reschedule
/account/estimates              Estimate list
/account/estimates/[id]         Estimate detail + approve / decline / request changes
/account/repairs                Repair orders (in progress / recent)
/account/repairs/[id]           Repair status timeline + photos (customer-safe)
/account/invoices               Invoice list
/account/invoices/[id]          Invoice detail + pay
/account/profile                Name, contact, notification prefs
/account/security               Password / sessions (if credential auth)
```

**Auth routes (shared):**

```
/login
/signup
/forgot-password
/reset-password
/verify-email
```

**Launch out of scope (customer):** chat with advisor inside portal, financing marketplace, parts shopping cart, insurance claim filing.

---

### 1.4 Staff / admin sitemap

Base: `/admin` (staff auth + RBAC; noindex; not linked from public nav).

```
/admin                              Ops dashboard (today’s appointments, awaiting estimate approval, ROs blocked, overdue invoices)
/admin/calendar                     Shop calendar / bay schedule
/admin/appointments                 Appointment queue
/admin/appointments/[id]            Appointment detail
/admin/customers                    Customer search/list
/admin/customers/[id]               Customer profile + vehicles + history
/admin/vehicles/[id]                Vehicle record
/admin/estimates                    Estimate queue (draft / sent / approved / declined)
/admin/estimates/new                Create estimate
/admin/estimates/[id]               Edit / send estimate
/admin/repairs                      Repair order list
/admin/repairs/new                  Create RO (from estimate or walk-in)
/admin/repairs/[id]                 RO workspace (status, labor, parts, notes, photos)
/admin/invoices                     Invoice list
/admin/invoices/[id]                Invoice detail / send / record payment / refunds (via PSP)
/admin/services                     Service catalog CRUD
/admin/hours                        Location hours & blackout dates
/admin/staff                        Staff users & roles (owner/manager)
/admin/settings                     Location profile, notifications, integrations
/admin/audit                        Audit log viewer (manager+)
```

**Roles (launch):**

| Role | Typical access |
|------|----------------|
| Service advisor | Calendar, appointments, customers, estimates, ROs (status/notes), invoices send |
| Technician | Assigned ROs, status updates, internal notes, photo upload |
| Manager / owner | All advisor + staff, hours, services, settings, audit, refunds policy |
| Read-only office (optional later) | Reports only |

**Launch out of scope (admin):** full inventory/parts purchasing, payroll, deep accounting export beyond CSV/QuickBooks-ready invoice export, multi-location rollup dashboards.

---

### 1.5 User flows — happy paths and key exceptions

#### Flow A — Guest books a service (public → optional account)

**Happy path**

1. User lands on `/` or `/services/[slug]` → CTA “Book service”.
2. `/book`: select service category/service, preferred date/time window, vehicle basics (year/make/model/mileage), contact info, optional notes/photos.
3. System checks location capacity rules (hours, blackouts, slot limits) and offers available slots.
4. User confirms; system creates `Appointment` (status `requested` or `confirmed` per shop policy) scoped to `locationId`.
5. Confirmation email/SMS; optional prompt to create account to track repair.
6. Staff sees appointment on `/admin/calendar` and `/admin/appointments`.

**Key exceptions**

| Exception | Behavior |
|-----------|----------|
| No slots in range | Show next available dates; offer estimate-only / call shop |
| Outside hours / holiday | Block slot; show hours and contact |
| Duplicate same-day booking | Warn; allow with reason or route to advisor |
| Upload fails | Keep booking; mark attachments pending retry |
| Notification send fails | Persist appointment; queue retry; staff still sees it |
| Guest later claims booking | Magic link / verify phone-email match to attach to account |

#### Flow B — Customer requests estimate

**Happy path**

1. `/estimate` or `/account/estimates` → describe issue, vehicle, preferred contact, optional photos.
2. System creates `EstimateRequest` → staff notified.
3. Advisor builds line items on `/admin/estimates/[id]` (labor, parts, taxes, fees) → status `sent`.
4. Customer opens `/account/estimates/[id]` (or magic link) → reviews totals and notes.
5. Customer **approves** → estimate locked; RO can be created; appointment may be scheduled/converted.
6. Customer receives confirmation; staff calendar/RO queue updates.

**Key exceptions**

| Exception | Behavior |
|-----------|----------|
| Customer declines | Capture reason optional; status `declined`; advisor can revise → new version |
| Request changes | Status `changes_requested`; advisor edits; re-send as new version (keep history) |
| Estimate expires | Configurable TTL; status `expired`; CTA to request refresh |
| Price change after approve | Require re-approval of revised estimate before additional work |
| Unauthenticated magic link expired | Force login / re-send link; do not expose estimate without proof |

#### Flow C — Repair status tracking

**Happy path**

1. Approved estimate or walk-in → staff creates `RepairOrder` linked to customer, vehicle, location, optional estimate.
2. Status machine (launch): `intake` → `diagnosis` → `waiting_parts` → `in_progress` → `quality_check` → `ready` → `delivered` (plus `cancelled` / `on_hold`).
3. Customer views `/account/repairs/[id]`: customer-safe timeline, ETA if set, approved scope, select photos.
4. Status changes and customer-visible notes trigger notifications (email/SMS per prefs).
5. When `ready`, prompt pickup + invoice if balance due.

**Key exceptions**

| Exception | Behavior |
|-----------|----------|
| Waiting on customer approval mid-job | Status `on_hold`; notify customer; block further billable work until decision |
| Parts delay | Status `waiting_parts`; update ETA; notify |
| Internal-only notes | Never shown in customer portal |
| Photo privacy | Customer sees only `visibility=customer`; staff sees all |
| Cancelled RO | Require reason; cancel linked unfinished invoice lines per policy |

#### Flow D — Invoice and payment

**Happy path**

1. From completed/approved work, staff generates `Invoice` (or auto from RO when policy says so).
2. Customer notified → `/account/invoices/[id]`.
3. Pay via payment provider hosted checkout / Payment Element (card data never touches app servers).
4. Webhook confirms payment → invoice `paid`; receipt email; RO can move to `delivered` if applicable.
5. Staff sees payment on `/admin/invoices/[id]`.

**Key exceptions**

| Exception | Behavior |
|-----------|----------|
| Payment fails / abandoned | Invoice remains `open`; retry CTA; no false “paid” |
| Partial payment (later) | Launch: full balance only; document partial as later |
| Refund | Manager initiates via PSP; webhook syncs; audit log |
| Webhook delay | Idempotent webhook handler; UI shows `processing` until confirmed |
| Dispute | Mark `disputed`; freeze related actions; manual resolution |

#### Flow E — Customer account, vehicles, history

**Happy path**

1. Sign up / login → `/account`.
2. Add vehicles → VIN optional; year/make/model/plate required at launch.
3. History aggregates completed ROs, invoices, past appointments per vehicle.
4. Re-book from vehicle history with prefilled vehicle.

**Key exceptions**

| Exception | Behavior |
|-----------|----------|
| Duplicate vehicle | Soft-merge prompt by VIN/plate |
| Staff-created customer without password | Invite email to set password / magic link |
| Account takeover attempts | Rate limit auth; lockout policy; session revoke on password reset |

#### Flow F — Staff daily operations (advisor)

**Happy path**

1. Morning: `/admin` → today’s appointments, estimates awaiting customer, ROs ready for pickup.
2. Check in appointment → create/link RO → update status through day.
3. Send estimate → monitor approvals → schedule work.
4. Close RO → generate/send invoice → confirm payment/pickup.

**Key exceptions**

| Exception | Behavior |
|-----------|----------|
| No-show | Mark appointment `no_show`; optional fee policy later |
| Double-book bay | Calendar conflict warning; manager override with audit |
| Unauthorized role | 403 page; no data leakage in API |
| Concurrent edit of estimate | Optimistic locking / version field; show conflict UI |

---

### 1.6 Cross-cutting UX rules

- All customer and admin pages: clear empty states and next actions.
- Every write action that notifies the customer should show “customer will be notified” confirmation for staff.
- Phone-first layouts for public + customer; admin optimized for desktop but usable on tablet.
- Prefer progressive disclosure on booking/estimate forms (3–5 steps max).

---

## 2. Architecture recommendations (rendering per route)

### 2.1 Principles

| Strategy | Use when |
|----------|----------|
| **SSG** | Pure marketing content, rarely changes, max CDN cache |
| **ISR** | Marketing pages that update occasionally (services, hours snippet) without full redeploy |
| **SSR** | SEO-relevant pages needing fresh or personalized-but-public data at request time |
| **SSR + auth gate** or **static shell + client fetch** | Authenticated portals (never cache personalized HTML at CDN) |
| **Client-side fetching / RSC with `no-store`** | Dashboards, calendars, live queues |

**Defaults for this product**

- Public marketing: **ISR** (revalidate on CMS/admin publish or time-based fallback).
- Booking/estimate entry pages: **SSR** or dynamic rendering for availability freshness; availability API always dynamic.
- Customer + admin: **dynamic, uncached**, `Cache-Control: private, no-store`; **noindex, nofollow**.
- Prefer App Router Server Components for data loading; Client Components for interactive widgets (calendar, payment element, photo upload).

Avoid microservices at launch. Background work runs in the same deployable via a worker process sharing modules/DB.

---

### 2.2 Route-by-route rendering matrix

| Route | Rendering | Caching / revalidation | Indexing | Notes |
|-------|-----------|------------------------|----------|-------|
| `/` | ISR | `revalidate` 60–300s; on-demand when services/hours change | index | Hero CTAs to `/book`, `/estimate` |
| `/services` | ISR | 300s + on-demand | index | List from service catalog |
| `/services/[slug]` | ISR | 300s + on-demand per slug | index | 404 for unknown slug |
| `/about` | ISR or SSG | On-demand / build | index | Mostly static copy |
| `/fleet` | ISR | 300s + on-demand | index | B2B landing |
| `/contact` | ISR | Short (60–120s) so hours stay honest | index | Embed map; hours from location record |
| `/privacy`, `/terms`, `/accessibility` | SSG | Rebuild on legal change | index | Stable URLs |
| `/book` | Dynamic (SSR) | No CDN cache of slot results; page shell may be dynamic | index (thin) or `noindex` if thin duplicate of services | Slots via API `no-store` |
| `/estimate` | Dynamic (SSR) | Form page; submissions POST to API | index (light) | Prefer account for tracking |
| `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email` | Dynamic | `no-store` | **noindex** | CSRF/session hardened |
| `/account/**` | Dynamic | `private, no-store` | **noindex** | Auth required |
| `/account/invoices/[id]` pay UI | Dynamic + client | `no-store` | **noindex** | Payment Element client-only |
| `/admin/**` | Dynamic | `private, no-store` | **noindex** | Auth + RBAC |
| `/admin/calendar` | Dynamic + client | Poll or short SWR 15–30s | **noindex** | Real-time-ish ops |
| API routes / Server Actions | N/A | Sensible `Cache-Control` per endpoint; mutations never cached | N/A | Rate limit public POSTs |
| Webhooks (`/api/webhooks/*`) | Dynamic | N/A | N/A | Signature verify; idempotent |

**On-demand revalidation triggers (launch):** service catalog create/update/delete; location hours/profile update; legal page publish. Call `revalidatePath` / `revalidateTag` from admin mutations.

**SEO HTML for public:** ensure service pages render meaningful content in initial HTML (ISR/SSR), not client-only shells.

---

### 2.3 Data fetching patterns

```
Public page (ISR)
  └─ Server Component reads published catalog/location via Prisma (or cached tag)
       └─ CDN serves HTML until revalidate

Booking slots
  └─ Client or Server Action → availability module → DB (+ Redis lock/cache of slot occupancy)
       └─ Never ISR-cache slot JSON as if static

Customer dashboard
  └─ Session → authorize → Prisma queries scoped by customerId (+ locationId)
       └─ Optional React Query/SWR for interactive refresh

Admin RO workspace
  └─ Session + role → Prisma → optimistic UI for status updates
       └─ Mutations write audit log + enqueue notifications
```

---

### 2.4 Modular monolith layout (logical modules)

| Module | Responsibility |
|--------|----------------|
| `identity` | Auth, sessions, roles, invites |
| `locations` | Location profile, hours, blackouts, future multi-site |
| `catalog` | Services, pricing display rules |
| `scheduling` | Appointments, capacity, calendar |
| `estimates` | Requests, versions, approvals |
| `repairs` | RO lifecycle, notes, photos metadata |
| `billing` | Invoices, PSP integration, webhooks |
| `customers` | Customers, vehicles, history views |
| `notifications` | Email/SMS templates, job enqueue |
| `audit` | Append-only security/business events |
| `files` | Signed upload URLs, object storage |

Modules communicate in-process (function calls / domain services), not via network RPC at launch.

---

## 3. Tech stack confirmation

### 3.1 Confirmed stack

| Layer | Choice | Responsibility | Rationale |
|-------|--------|----------------|-----------|
| App framework | **Next.js (App Router) + TypeScript** | Public site, customer portal, admin UI, Route Handlers / Server Actions | One codebase for SSR/ISR/SSG; strong DX; fits modular monolith |
| UI | **React** + accessible component library (e.g. Radix-based) + CSS approach team prefers (Tailwind common) | Consistent a11y primitives | Faster WCAG compliance |
| API boundary | Server Actions + Route Handlers | Mutations, webhooks, public forms | Colocate with UI; keep domain logic in modules not in components |
| ORM / DB access | **Prisma** | Schema, migrations, type-safe queries | Fits Postgres; clear migrations for multi-location fields early |
| Database | **PostgreSQL** | System of record | Relational integrity for customers, ROs, invoices, approvals |
| Cache / jobs | **Redis** + queue (**BullMQ** or equivalent) | Session optional, rate limits, slot locks, email/SMS/webhook retries | Separates slow I/O from request path |
| Object storage | **S3-compatible** (AWS S3, Cloudflare R2, etc.) | Repair photos, estimate attachments | Signed URLs; no binary in DB |
| Payments | **Stripe** (or equivalent mature PSP) | Checkout, webhooks, refunds | PCI SAQ-A friendly when using hosted elements; don’t store PANs |
| Email | Transactional provider (e.g. Resend, Postmark, SES) | Confirmations, magic links, receipts | Deliverability + templates |
| SMS (launch optional) | Twilio or similar | Appointment reminders | Feature-flag; email-first acceptable for MVP |
| Auth | **Auth.js (NextAuth)** or Clerk/Auth0 | Credentials + magic link; staff vs customer | Prefer magic link + password; SSO later |
| Hosting | Node-capable host (Vercel, Fly, Render, or container on AWS) | Web + separate worker | Worker must run for queues |
| Observability | OpenTelemetry-friendly APM + structured logs + error tracker (e.g. Sentry) | Traces, errors, metrics | Required for ops NFR |
| CDN / WAF | Provider CDN + WAF/bot protection | Edge cache for public ISR, TLS | Protect `/book` and auth endpoints |

### 3.2 What each piece must / must not do

- **Next.js:** rendering and HTTP edge; **not** long-running cron inside serverless alone — use worker for jobs.
- **Postgres:** source of truth for money and approvals; **not** a dump for large media.
- **Redis:** ephemeral/cache/queue; **not** sole store for invoices or approvals.
- **PSP:** card data and payment state machine; app stores payment intents/charge ids and invoice status only.
- **Object storage:** blobs; app stores keys, MIME, visibility, checksums.

### 3.3 Sensible alternatives (only where useful)

| If constraint… | Alternative | Tradeoff |
|----------------|-------------|----------|
| Team already on Remix/Nuxt | Remix + Postgres still fine | Lose some Next ISR ergonomics; principles unchanged |
| Prefer Drizzle over Prisma | Drizzle ORM | Lighter SQL; less generated client |
| Heavy real-time bay board later | Add WebSockets/SSE for admin only | Still same monolith |
| SMS not needed at launch | Email-only notifications | Lower cost; document SMS as phase 2 |
| Host forbids long workers | Separate small worker service **same repo/modules** | Not a microservice domain split |

**Explicitly not recommended at launch:** Kubernetes microservices per domain, event-sourcing-first billing, headless CMS mandatory (simple admin catalog is enough), native mobile apps, GraphQL federation.

### 3.4 Launch vs later (stack)

| Launch | Later |
|--------|-------|
| Single Postgres primary | Read replicas if needed |
| One web + one worker | Scale workers independently |
| Stripe Checkout / Payment Element | Saved cards, financing, ACH for fleet |
| Email notifications | SMS + push |
| Admin-managed service content | Optional headless CMS |
| Single location active | Location switcher + org roles |

---

## 4. Non-functional requirements

Targets below are **measurable launch acceptance criteria** unless marked **later**.

### 4.1 Performance and Core Web Vitals

| Metric | Public marketing | Authenticated portals |
|--------|------------------|------------------------|
| LCP | ≤ 2.5s (p75, mobile) | ≤ 3.0s (p75) for primary dashboards |
| INP | ≤ 200ms (p75) | ≤ 200ms (p75) for common actions |
| CLS | ≤ 0.1 | ≤ 0.1 |
| TTFB (HTML) | ≤ 800ms p75 for ISR/CDN hits | N/A (dynamic OK); API p75 ≤ 500ms for simple reads |

**Budgets (launch)**

- Initial JS for public home: keep framework + page reasonable; defer admin-only code via route splits.
- Images: responsive `next/image` (or equiv), modern formats, explicit dimensions.
- Third parties: payment and map scripts load only on routes that need them.
- Booking availability API: p95 ≤ 700ms under normal load.

**Load assumption (launch):** single shop — design for tens of concurrent staff users and hundreds of daily customer sessions; document capacity test with 2× expected peak before go-live.

### 4.2 Availability and reliability

| Requirement | Target |
|-------------|--------|
| Monthly availability (web) | ≥ 99.5% launch; 99.9% aspirational later |
| Planned maintenance | Off-peak; banner if >15 min |
| RPO (database) | ≤ 1 hour (automated backups) |
| RTO | ≤ 8 hours launch; tighten later with runbooks |
| Backup | Daily automated Postgres backups + point-in-time if provider allows; monthly restore drill |
| Job durability | Notification and webhook processing at-least-once with idempotency keys |
| Dependency failure | Degraded mode: accept bookings into DB even if email provider down; surface “confirmation pending” |

### 4.3 Security and privacy

| Area | Requirement |
|------|-------------|
| Transport | HTTPS only; HSTS |
| Auth | Secure cookies (`HttpOnly`, `Secure`, `SameSite`); password hashing with modern KDF if passwords used; session rotation on login |
| Authorization | Server-side RBAC on every mutation/query; customer can only access own resources; staff scoped to location |
| PCI | No card PAN/CVC storage; PSP Elements/Checkout only; webhook signature verification |
| PII | Encrypt secrets at rest (provider KMS); minimize PII in logs; retention policy documented |
| Uploads | Authz checks; MIME/size limits; malware scanning later; signed URLs short-lived |
| Abuse | Rate limits on login, signup, booking, estimate, password reset; CAPTCHA/bot protection on public forms if abuse appears |
| Headers | CSP (start report-only then enforce), CSRF protection for cookie sessions |
| Privacy | Privacy policy; data export/delete request process (manual OK at launch; automate later) |
| Secrets | Env/secret manager; never commit keys |

**Auditability:** append-only audit events for login failures (aggregated), estimate send/approve, RO status changes, invoice create/pay/refund, role changes, hour/catalog changes. Retain ≥ 1 year launch.

### 4.4 SEO

| Requirement | Detail |
|-------------|--------|
| Indexable routes | Home, services index/detail, about, fleet, contact, legal |
| Non-indexable | `/account/**`, `/admin/**`, auth pages, payment return URLs |
| Technical | Unique titles/meta per service; canonical URLs; `sitemap.xml`; `robots.txt`; JSON-LD LocalBusiness + Service where accurate |
| Content | Real hours/NAP consistency; no doorway spam |
| Performance | CWV targets above support SEO |
| Placeholders | Do not publish fake reviews; mark staging `noindex` |

### 4.5 Accessibility (WCAG 2.2 AA)

| Requirement | Detail |
|-------------|--------|
| Conformance target | WCAG 2.2 Level AA for public + customer flows; admin AA as far as practicable |
| Keyboard | All interactive flows operable without pointer |
| Focus | Visible focus; logical order; no keyboard traps (modals) |
| Forms | Associated labels, error identification, accessible names |
| Contrast | Text/UI contrast AA |
| Media | Alt text for meaningful images; decorative ignored |
| Status | Aria-live or equivalent for async booking/payment results |
| Testing | Automated axe/lighthouse a11y on critical pages + manual keyboard/screen reader pass on book, estimate approve, pay invoice before launch |
| Statement | Public `/accessibility` page with contact for issues |

### 4.6 Observability

- Structured logs with `requestId`, `userId`/`staffId` (when present), `locationId`, route.
- Error tracking with release versioning.
- Metrics: request latency, 5xx rate, queue depth, webhook failures, payment success rate, booking conversion funnel counts.
- Alerts: 5xx spike, webhook failure rate, queue backlog, disk/backup failure, certificate expiry.

### 4.7 Testing requirements (launch gate)

| Layer | Expectation |
|-------|-------------|
| Unit | Domain rules: estimate versioning, RO status transitions, RBAC helpers |
| Integration | Prisma repositories; webhook idempotency; availability conflicts |
| E2E | Critical paths: book, estimate approve, pay invoice, staff status update |
| Security smoke | Authz negative tests (IDOR attempts on invoice/RO ids) |
| A11y | Critical path checks as above |

### 4.8 Multi-location readiness (without building multi-location UI yet)

| Must do at launch | Defer |
|-------------------|--------|
| `locationId` on appointments, estimates, ROs, invoices, staff memberships, catalog overrides | Location picker UX |
| Hours/blackouts per location | Cross-location reporting |
| Permissions as membership(s) in a location | Org-wide super-admin UX beyond owner |
| Config/feature flags per location | Franchise billing |

**Non-goal:** splitting into per-location microservices.

### 4.9 Compliance posture (practical)

- Not claiming SOC2/HIPAA/etc. without evidence.
- NJ auto-repair consumer notice practices: allow content blocks for required shop disclosures on estimates/invoices (legal review by operator).
- Accessibility and privacy statements published.

---

## Appendix A — Suggested launch MVP cut line

**In launch**

- Public marketing pages + service catalog  
- Guest + account booking  
- Estimate request → staff compose → customer approve/decline/request changes  
- RO status timeline (customer-safe) + photo upload (staff)  
- Invoices + full payment via PSP  
- Customer vehicles + history  
- Staff calendar, customers, estimates, ROs, invoices, basic settings/hours/catalog  
- Email notifications + Redis jobs  
- RBAC, audit log, backups, observability basics  

**Explicitly later**

- Multi-location UI, fleet portals, SMS-first, partial payments, financing, inventory/PO, deep accounting sync, blog/CMS, native apps, live chat productization, real-time bay TV boards  

---

## Appendix B — Placeholder contact block (content)

Use until real NAP is provided:

- **Berlin AutoWorks**  
- 123 Route 73, Berlin, NJ 08009  
- (856) 555-0147  
- service@berlinautoworks.example  
- Mon–Fri 8:00 AM–6:00 PM; Sat 8:00 AM–3:00 PM; Sun closed  

---

*End of planning document.*
