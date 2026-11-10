# 06 — Verification and Validation Plan

**System:** Berlin AutoWorks web application
**Baseline:** 2026-11-10, code `5ba429c`
**Related:** [02 SRS](02-system-requirements-specification.md) · [05 RTM](05-requirements-traceability-matrix.md) · [07 Risks](07-risk-register.md)

- **Verification** — *did we build the system right?* Each requirement in 02 is
  shown to be met by test, demonstration, inspection, or analysis.
- **Validation** — *did we build the right system?* Real stakeholders run the
  operational scenarios in [01](01-concept-of-operations.md#4-operational-scenarios)
  and confirm the system meets their needs.

## 1. Current state

| Item | State at baseline |
| --- | --- |
| Test runner | None configured |
| Automated tests | 0 |
| CI pipeline | None (`.github/workflows` absent); Netlify runs `npm run build` only |
| Static checks | `npm run typecheck`, `npm run lint` exist; run manually |
| Requirements verified by inspection | 22 (see RTM "Pass (inspection)") |
| Requirements implemented but unverified | 55 ("Pending" in RTM) |
| Requirements blocked on implementation | 76 ("Blocked" in RTM) |

Closing this gap is risk **RSK-05**. §6 gives the order of work.

## 2. Verification levels and tooling

| Level | Scope | Tool (recommended) | Runs in | Typical requirements |
| --- | --- | --- | --- | --- |
| Static | Types, lint, import boundaries | `tsc --noEmit`, ESLint (add `no-restricted-imports` for module boundaries) | CI, every push | NFR-MNT-* |
| Unit | Pure functions and schemas: Zod schemas, phone parsing, role map, rate-limit window, password/token hashing, state-transition guards | Vitest | CI, every push | SR-BOOK-003, SR-IDN-002, SR-IDN-012, SR-REP-002 |
| Integration | Module + real Postgres: save booking, reset password, webhook apply, signed upload, scoping | Vitest + Postgres (Docker service or Neon branch per CI run); Stripe SDK `generateTestHeaderString` for signed payloads; S3 via MinIO | CI, every push | SR-BIL-006..009, SR-FIL-004, NFR-SEC-005 |
| End-to-end | Browser through the deployed app | Playwright (`--trace off` by default) against `next start` with seeded DB | CI on PR; nightly on staging | SR-BOOK-001, SR-BIL-003, SR-IDN-010/011 |
| Contract | Third-party behaviour | Stripe CLI `stripe trigger`; Resend test mode; vPIC recorded fixtures | Nightly / pre-release | IF-03..IF-09 |
| Security | Authz negatives (IDOR), headers, rate limits | Playwright + `fetch`; OWASP ZAP baseline on staging | CI (authz), weekly (ZAP) | NFR-SEC-* |
| Accessibility | WCAG 2.2 AA | `@axe-core/playwright` on critical pages; manual keyboard + NVDA/VoiceOver pass | CI (axe), pre-release (manual) | NFR-A11Y-* |
| Performance | CWV, latency, load | Lighthouse CI (mobile profile); k6 for load at 2× peak | Pre-release; staging | NFR-PERF-* |
| Operational | Backup restore, worker failover, degraded modes | Runbook drills | Monthly | NFR-REL-* , MODE-* |

### 2.1 Test environments

| Env | Database | Integrations | Purpose |
| --- | --- | --- | --- |
| Local | Docker Postgres or Neon dev branch | Optional; MODE-02..08 exercisable by unsetting vars | Developer loop |
| CI | Ephemeral Postgres seeded by `npm run db:seed` | Stripe test keys, MinIO, Redis service; Resend disabled | Automated gates |
| Staging | Neon staging branch | Stripe test mode, real Resend to allow-listed inboxes, R2 staging bucket, worker running | E2E, a11y, perf, UAT; `noindex` (NFR-SEO-003) |
| Production | Neon main | Live keys | Smoke tests only |

### 2.2 Test data

- Seed: one active location (`berlin`), the 11 published services.
- Fixtures per suite: two customers (A, B) each with a user, vehicle,
  appointment, estimate (with `internalNotes` set), repair order (with
  `internalNotes`), `open` invoice, one `customer` and one `internal` file;
  one staff member per role.
- Customer B's records exist to prove A can never see them (IDOR tests).

## 3. Test case specifications

Test case IDs mirror requirement IDs (see [05](05-requirements-traceability-matrix.md)).
The cases below are specified in full because they cover Must requirements
that are already implemented, or close a known risk. Remaining `TC-` IDs follow
the same pattern from the requirement text.

### 3.1 Booking and estimate intake

| TC | Req | Level | Procedure | Expected result |
| --- | --- | --- | --- | --- |
| TC-BOOK-001 | SR-BOOK-001 | E2E | Fill `/book` with a valid service, date, vehicle (via vPIC fixture), contact, notes; submit | Success message; one `Appointment` row |
| TC-BOOK-002 | SR-BOOK-002 | Integration | Call action with `serviceSlug` not in published catalog; then with an unpublished slug | `invalid`, field error on `serviceSlug`; no rows written |
| TC-BOOK-003 | SR-BOOK-003 | Unit | Table-driven schema test: year 1979/1980/current+1/current+2; name 0/40/41 chars; phone 9/10/11-with-1 digits; notes 1001 chars | Accept/reject exactly at the boundaries |
| TC-BOOK-004 | SR-BOOK-004 | Integration | `saveBookingRequest` with valid input | Appointment `requested`, `locationId` = active location, linked customer and vehicle; second call reuses vehicle |
| TC-BOOK-008 | SR-BOOK-008, NFR-REL-006 | Integration | (a) Redis set: job enqueued with template `booking_received`. (b) Mock `deliverEmail` to throw | (a) one job, attempts 5. (b) Booking still saved, action returns success |
| TC-BOOK-012 | SR-BOOK-012, SR-IDN-007 | E2E | Guest books with `victim@example.test`; attacker signs up with the same email without verifying | Attacker's portal shows **no** appointment. *Fails today (RSK-01)* |
| TC-EST-002 | SR-EST-002 | Integration | `saveEstimateRequest` valid | `Estimate` `draft`, `customerNotes` = concern, `locationId` set |
| TC-PRIV-003 | NFR-PRIV-003 | Integration | Existing customer "Ana", phone X; guest submits booking with Ana's email, name "Mallory", phone Y | Ana's `Customer.name`/`phone` unchanged. *Fails today (RSK-02)* |

### 3.2 Identity and access

| TC | Req | Level | Procedure | Expected result |
| --- | --- | --- | --- | --- |
| TC-IDN-001 | SR-IDN-001 | E2E | Sign up with 11-char then 12-char password | 11 rejected with message; 12 creates user and lands on `/account` |
| TC-IDN-002 | SR-IDN-002 | Unit | `hashPassword` twice same input; `verifyPassword` right/wrong/malformed | Different salts; true/false/false |
| TC-IDN-003 | SR-IDN-003 | E2E | Sign in; inspect `Set-Cookie` | `baw_session`; `HttpOnly`; `SameSite=Lax`; `Secure` in prod build |
| TC-IDN-004 | SR-IDN-004 | Integration | Sign in; increment `tokenVersion` in DB; load `/account` | Redirect to `/login` |
| TC-IDN-005 | SR-IDN-005 | Integration | Request reset; use token; reuse token; use a token aged 61 min; check old session | Second use and expired token rejected; old session rejected |
| TC-IDN-006 | SR-IDN-006 | E2E | Forgot password for existing and non-existing email | Identical message and status; timing within noise |
| TC-IDN-008 | SR-IDN-008, NFR-SEC-008 | Integration | Six logins from one IP in 15 min (Redis on and off) | Sixth returns `limited` with retry seconds |
| TC-IDN-010 | SR-IDN-010 | E2E | Anonymous `GET /account/invoices` | Redirect to `/login` |
| TC-IDN-011 | SR-IDN-011 | E2E | Signed-in customer without membership opens `/admin` | 403 page; no staff data in HTML |
| TC-IDN-012 | SR-IDN-012 | E2E | Technician opens `/admin/staff`, `/admin/audit`, `/admin/invoices` | 403 for each. *Fails today (RSK-15)* |

### 3.3 Billing

| TC | Req | Level | Procedure | Expected result |
| --- | --- | --- | --- | --- |
| TC-BIL-002 | SR-BIL-002, NFR-SEC-005 | E2E | Customer A requests `/account/invoices/<B's id>` | 404; B's amounts absent from response |
| TC-BIL-003 | SR-BIL-003, NFR-SEC-007 | E2E | Pay A's open invoice with Stripe test card `4242…` | Payment Element iframe from `js.stripe.com`; no card fields in app DOM or network to app origin |
| TC-BIL-004 | SR-BIL-004 | Integration | Call `paymentIntentForInvoice` for draft, void, paid, zero-balance, and B-owned invoices | Error result for each; no Stripe call |
| TC-BIL-005 | SR-BIL-005 | Integration | Call twice for the same invoice | Same `paymentIntentId`; one Stripe create |
| TC-BIL-006 | SR-BIL-006 | Integration | POST webhook with missing, wrong, and valid signature | 400, 400, 200 |
| TC-BIL-007 | SR-BIL-007, NFR-REL-005 | Integration | (a) Deliver same `succeeded` event twice. (b) Make invoice update throw once, then redeliver | (a) one state change. (b) Second delivery applies the change. *(b) fails today (RSK-08)* |
| TC-BIL-008 | SR-BIL-008 | Integration | Deliver `processing` then `succeeded` | `processing` → `paid`, balance 0, `version` +2 |
| TC-BIL-009 | SR-BIL-009 | Integration | Deliver `payment_intent.payment_failed` | Invoice remains `open` |

### 3.4 Files

| TC | Req | Level | Procedure | Expected result |
| --- | --- | --- | --- | --- |
| TC-FIL-001 | SR-FIL-001 | Integration (MinIO) | Sign; PUT within 300 s; PUT after 300 s; PUT with different Content-Type | First succeeds; others rejected by bucket |
| TC-FIL-002 | SR-FIL-002 | Integration | Sign `image/gif`; `image/png` 0 B; 5 000 001 B; 21 requests/h | 422, 422, 422, 429 |
| TC-FIL-004 | SR-FIL-004 | Integration | Attach with wrong token; before PUT; correct; attach again | false, false, true, false |

### 3.5 Data protection by construction

| TC | Req | Level | Procedure | Expected result |
| --- | --- | --- | --- | --- |
| TC-REP-005 | SR-REP-005 | Static + E2E | (a) CI grep fails if `internalNotes` appears under `src/app/account` or `src/components/account`. (b) Render every portal page for customer A with fixture notes containing a sentinel string | (a) No match. (b) Sentinel absent from all HTML |
| TC-SEC-004 | NFR-SEC-004 | E2E | `HEAD` each private route and `/login` | `Cache-Control: private, no-store`; `X-Robots-Tag: noindex, nofollow` |
| TC-SEC-002 | NFR-SEC-001/002 | E2E | `HEAD /` on production build | HSTS, nosniff, Referrer-Policy, X-Frame-Options, Permissions-Policy present |
| TC-SEC-013 | NFR-SEC-013 | E2E | `/account/invoices/..%2F`, `/account/invoices/<129 chars>` | 404 |

### 3.6 Degraded modes

| TC | Mode | Procedure | Expected result |
| --- | --- | --- | --- |
| TC-REL-007 | MODE-02, NFR-REL-007 | `npm run build` with no env vars | Build succeeds; public pages render launch copy |
| TC-MODE-03 | MODE-03 | Unset Resend vars; submit booking | Saved; success message |
| TC-MODE-04 | MODE-04 | Unset `REDIS_URL`; submit booking with Resend mocked | Email sent inline; rate limit in memory |
| TC-MODE-05 | MODE-05 | Unset `AUTH_SECRET`; open `/account`, `/admin`, `/api/auth/session` | Preview banner, no records; API 503 |
| TC-MODE-06 | MODE-06 | Unset Stripe vars; open invoice; POST webhook | Balance shown, no Element; webhook 400 |

### 3.7 Analysis and inspection activities

| ID | Reqs | Activity | Pass criterion |
| --- | --- | --- | --- |
| AN-PERF-01 | NFR-PERF-001..004 | Lighthouse CI, mobile, 5 runs median on `/`, `/services`, `/services/brakes`, `/book`, `/account`, `/account/invoices/<id>` | Thresholds in NFR-PERF |
| AN-PERF-02 | NFR-PERF-005..007 | k6: 2× peak (est. 40 staff VUs, 20 customer RPS) for 15 min against staging | p75/p95 thresholds met; error rate < 0.5% |
| AN-A11Y-01 | NFR-A11Y-001..004 | axe on all critical pages + manual keyboard and screen-reader pass on book, estimate approve, pay invoice | Zero serious/critical axe issues; manual checklist complete |
| AN-SEC-01 | NFR-SEC-* | Threat model (STRIDE) of IF-04, IF-08, IF-10, IF-13; ZAP baseline | No High findings open |
| AN-REL-01 | NFR-REL-002..004 | Restore Neon PITR to a branch, run smoke suite against it | Restore < RTO; data loss < RPO |
| AN-CMP-01 | NFR-CMP-002 | Complete PCI SAQ-A | Signed SAQ on file |

## 4. Validation (user acceptance)

Validation uses the operational scenarios with real or proxy stakeholders on
staging. Each session records task success, time on task, and issues.

| ID | Scenario | Participants | Acceptance criterion |
| --- | --- | --- | --- |
| VAL-01 | OS-01 Research the shop | 5 drivers, phone | ≥ 4/5 find hours and a service and start a booking unaided |
| VAL-02 | OS-02 Guest booking | 5 drivers, phone | ≥ 4/5 complete in < 3 min; zero data-entry errors uncaught |
| VAL-03 | OS-03 Estimate decision | 3 customers + 1 advisor | Customer can approve/decline without calling; advisor sees result |
| VAL-04 | OS-04 Follow a repair | 3 customers | Customers can state current status and next step |
| VAL-05 | OS-05 Pay invoice | 3 customers | Payment completes; receipt received; staff sees `paid` |
| VAL-06 | OS-07 Advisor's day | 2 advisors, 1 technician, half day on staging with scripted volume | Advisors run the day without paper fallback; ≤ 2 workarounds logged |
| VAL-07 | OS-08 Owner admin | 1 manager | Changes hours and a service; public site reflects within 5 min |
| VAL-08 | Assistive technology | 1–2 screen-reader users | Complete VAL-02 and VAL-05 |

## 5. Launch gates

All gates must pass on the release candidate in staging.

| Gate | Criterion | Covers |
| --- | --- | --- |
| GATE-01 | CI green: typecheck, lint, unit, integration, E2E | NFR-MNT-002, all `Pending` Must requirements |
| GATE-02 | Security smoke: TC-BOOK-012, TC-PRIV-003, TC-IDN-010..012, TC-BIL-002, TC-REP-005, TC-SEC-* pass; no High/Critical risks open in 07 | Plan §4.7 "Security smoke" |
| GATE-03 | Payment: TC-BIL-002..009 pass against Stripe test mode, incl. duplicate and failed-then-retried webhooks | SN-05 |
| GATE-04 | Accessibility: AN-A11Y-01 passes; VAL-08 done | NFR-A11Y-* |
| GATE-05 | Performance: AN-PERF-01 and AN-PERF-02 pass | NFR-PERF-* |
| GATE-06 | Operability: worker hosted and alerting; AN-REL-01 drill done; runbook written; error tracker receiving events | NFR-REL-*, NFR-OBS-* |
| GATE-07 | Validation: VAL-01..07 meet criteria | SN-01..SN-08 |
| GATE-08 | Every Must requirement in 02 is Implemented, or Deferred with owner sign-off recorded in 07 | RTM §1.1 |

Exit criteria for a release: GATE-01..08 pass; zero open Severity 1 or 2
defects; RTM regenerated and committed.

## 6. Recommended order of work

1. **Add CI** (GitHub Actions): `npm ci`, `typecheck`, `lint`, `build` with no secrets (TC-REL-007). Cheapest, protects everything after.
2. **Add Vitest** with unit tests for schemas, phone, roles, password/tokens (TC-BOOK-003, TC-IDN-002).
3. **Integration harness** with a Postgres service and seed; write TC-BIL-004..009 and TC-FIL-* first — money and uploads.
4. **Write the failing tests for open risks** (TC-BOOK-012, TC-PRIV-003, TC-BIL-007b, TC-IDN-012), then fix RSK-01, RSK-02, RSK-08, RSK-15.
5. **Playwright E2E** for SN-02 and SN-05 happy paths and the authz negatives.
6. Lighthouse CI and axe once the staff screens stabilise.

## 7. Defect severity

| Severity | Definition | Example |
| --- | --- | --- |
| 1 — Critical | Data exposure across customers, payment state wrong, data loss | Customer sees another's invoice; invoice marked paid without payment |
| 2 — High | Must requirement fails with no workaround | Booking cannot be submitted |
| 3 — Medium | Must requirement fails with workaround, or Should fails | Email not sent but booking saved |
| 4 — Low | Cosmetic, copy | Label typo |
