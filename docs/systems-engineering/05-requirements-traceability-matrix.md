# 05 — Requirements Traceability Matrix (RTM)

**System:** Berlin AutoWorks web application  
**Baseline:** 2026-11-10, code `5ba429c`  
**Related:** [01 ConOps](01-concept-of-operations.md) · [02 SRS](02-system-requirements-specification.md) · [03 Architecture](03-system-architecture-design.md) · [04 ICD](04-interface-control-document.md) · [06 V&V](06-verification-validation-plan.md)

This matrix gives bidirectional traceability:

- **Forward:** stakeholder need (`SN-`) → system requirement (`SR-`/`NFR-`) → design element (`M-`, `C-`, `IF-`, `ADR-`, §) → code → test case (`TC-`).
- **Backward:** every requirement cites the need it serves; §3 shows every need is covered.

Test case IDs mirror requirement IDs (`SR-BOOK-003` → `TC-BOOK-003`) so a missing test is visible at a glance. Specifications for the test cases are in [06](06-verification-validation-plan.md).

**Verification state:** `Pass (inspection)` — verified by reading code/config at baseline; `Pending` — implemented, no automated test yet; `Blocked` — cannot be verified until implemented; `—` deferred.

> This file is generated from the SRS tables and a design/code map. When a requirement's status changes, update 02 and regenerate (or edit both in the same pull request).

## 1. Status summary

| Type | Total | ✅ Implemented | 🟡 Partial | ⬜ Not started / not verified | ⏸ Deferred |
| --- | --- | --- | --- | --- | --- |
| Functional (`SR-`) | 101 | 51 | 11 | 35 | 4 |
| Non-functional (`NFR-`) | 56 | 28 | 5 | 23 | 0 |
| **All** | **157** | **79** | **16** | **58** | **4** |

### 1.1 By area

| Area | Total | ✅ | 🟡 | ⬜ | ⏸ | Must-haves not implemented |
| --- | --- | --- | --- | --- | --- | --- |
| Public site (`SR-PUB`) | 10 | 9 | 1 | 0 | 0 | — |
| Scheduling and booking (`SR-BOOK`) | 12 | 7 | 0 | 5 | 0 | SR-BOOK-005 |
| Estimates (`SR-EST`) | 11 | 4 | 3 | 4 | 0 | SR-EST-004, SR-EST-005, SR-EST-006, SR-EST-007, SR-EST-009, SR-EST-011 |
| Repair orders (`SR-REP`) | 7 | 1 | 2 | 4 | 0 | SR-REP-001, SR-REP-002, SR-REP-004, SR-REP-006 |
| Billing and payments (`SR-BIL`) | 13 | 7 | 1 | 4 | 1 | SR-BIL-001, SR-BIL-007 |
| Customers and vehicles (`SR-CUS`) | 6 | 2 | 2 | 2 | 0 | SR-CUS-002 |
| Identity and access (`SR-IDN`) | 13 | 10 | 1 | 2 | 0 | SR-IDN-012 |
| Staff workspace (`SR-ADM`) | 9 | 0 | 0 | 9 | 0 | SR-ADM-001, SR-ADM-002, SR-ADM-004, SR-ADM-005, SR-ADM-006, SR-ADM-007, SR-ADM-008 |
| Audit (`SR-AUD`) | 3 | 0 | 1 | 2 | 0 | SR-AUD-001, SR-AUD-002, SR-AUD-003 |
| Files (`SR-FIL`) | 7 | 5 | 0 | 1 | 1 | — |
| Notifications (`SR-NTF`) | 6 | 4 | 0 | 1 | 1 | — |
| Locations (`SR-LOC`) | 4 | 2 | 0 | 1 | 1 | SR-LOC-003 |
| Performance (`NFR-PERF`) | 8 | 1 | 0 | 7 | 0 | NFR-PERF-001, NFR-PERF-002, NFR-PERF-003, NFR-PERF-004, NFR-PERF-005, NFR-PERF-006, NFR-PERF-007 |
| Reliability (`NFR-REL`) | 7 | 2 | 1 | 4 | 0 | NFR-REL-001, NFR-REL-002, NFR-REL-003, NFR-REL-004, NFR-REL-005 |
| Security (`NFR-SEC`) | 13 | 11 | 0 | 2 | 0 | NFR-SEC-006 |
| Privacy (`NFR-PRIV`) | 3 | 1 | 1 | 1 | 0 | NFR-PRIV-001, NFR-PRIV-003 |
| SEO (`NFR-SEO`) | 3 | 2 | 0 | 1 | 0 | NFR-SEO-003 |
| Accessibility (`NFR-A11Y`) | 5 | 1 | 2 | 2 | 0 | NFR-A11Y-001, NFR-A11Y-002, NFR-A11Y-003, NFR-A11Y-004 |
| Observability (`NFR-OBS`) | 4 | 0 | 1 | 3 | 0 | NFR-OBS-001, NFR-OBS-002, NFR-OBS-003, NFR-OBS-004 |
| Maintainability (`NFR-MNT`) | 5 | 4 | 0 | 1 | 0 | NFR-MNT-002 |
| Rendering and caching (`NFR-RND`) | 5 | 4 | 0 | 1 | 0 | NFR-RND-005 |
| Compliance (`NFR-CMP`) | 3 | 2 | 0 | 1 | 0 | — |

Automated tests at baseline: **none** (no test runner configured). Every `Pending` row is a test to write; see [06 §5](06-verification-validation-plan.md#5-launch-gates).

## 2. Forward traceability

Columns: **Req** · **Need** · **Pri** · **Design** · **Implementation / evidence** · **Verif.** method · **Test case** · **Status** · **Verification state**

### Public site — `SR-PUB`

| Req | Need | Pri | Design | Implementation / evidence | Verif. | Test case | Status | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SR-PUB-001 | SN-01 | M | C-01 | `src/app/(marketing)/*/page.tsx` | D | TC-PUB-001 | ✅ Implemented | Pending |
| SR-PUB-002 | SN-01 | M | M-CAT, IF-01 | `src/modules/catalog/published.ts` | T | TC-PUB-002 | ✅ Implemented | Pending |
| SR-PUB-003 | SN-13 | M | M-CAT, M-LOC, ADR-06 | `catalog/published.ts`, `locations/public-shop.ts` | T | TC-PUB-003 | ✅ Implemented | Pending |
| SR-PUB-004 | SN-01 | M | M-CAT | `src/app/(marketing)/services/[slug]/page.tsx` | T | TC-PUB-004 | ✅ Implemented | Pending |
| SR-PUB-005 | SN-01 | M | M-LOC, IF-01 | `src/modules/locations/public-shop.ts` | T | TC-PUB-005 | ✅ Implemented | Pending |
| SR-PUB-006 | SN-01 | S | M-LOC | `locations/profile.ts` (hours hard-coded) | T | TC-PUB-006 | 🟡 Partial | Blocked |
| SR-PUB-007 | SN-01 | M | C-01 | `src/app/sitemap.ts` | T | TC-PUB-007 | ✅ Implemented | Pending |
| SR-PUB-008 | SN-10 | M | C-01 | `src/app/robots.ts` | T | TC-PUB-008 | ✅ Implemented | Pending |
| SR-PUB-009 | SN-01 | S | C-01 | `src/app/(marketing)/page.tsx` (ld+json) | I | TC-PUB-009 | ✅ Implemented | Pass (inspection) |
| SR-PUB-010 | SN-09 | M | — | Content inspection | I | TC-PUB-010 | ✅ Implemented | Pass (inspection) |

### Scheduling and booking — `SR-BOOK`

| Req | Need | Pri | Design | Implementation / evidence | Verif. | Test case | Status | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SR-BOOK-001 | SN-02 | M | M-SCH, IF-13 | `src/app/(marketing)/book/actions.ts`, `scheduling/booking-request.ts` | T | TC-BOOK-001 | ✅ Implemented | Pending |
| SR-BOOK-002 | SN-02 | M | M-SCH, M-CAT | `bookingRequestSchemaFor()` | T | TC-BOOK-002 | ✅ Implemented | Pending |
| SR-BOOK-003 | SN-02, SN-10 | M | M-SCH, IF-13 | `scheduling/booking-request.ts`, `lib/phone.ts` | T | TC-BOOK-003 | ✅ Implemented | Pending |
| SR-BOOK-004 | SN-02, SN-09 | M | M-SCH, M-LOC, IF-01 | `scheduling/save-booking.ts` | T | TC-BOOK-004 | ✅ Implemented | Pending |
| SR-BOOK-005 | SN-02 | M | M-SCH, M-LOC | — | T | TC-BOOK-005 | ⬜ Not started | Blocked |
| SR-BOOK-006 | SN-02 | S | M-SCH | — | D | TC-BOOK-006 | ⬜ Not started | Blocked |
| SR-BOOK-007 | SN-07 | S | M-SCH | — | T | TC-BOOK-007 | ⬜ Not started | Blocked |
| SR-BOOK-008 | SN-02, SN-13 | M | M-NTF, IF-06, IF-14 | `save-booking.ts` → `notifications/queue.ts` | T | TC-BOOK-008 | ✅ Implemented | Pending |
| SR-BOOK-009 | SN-04, SN-10 | M | M-IDN, IF-15 | `src/app/account/bookings/page.tsx`, `[id]/page.tsx` | T | TC-BOOK-009 | ✅ Implemented | Pending |
| SR-BOOK-010 | SN-06 | S | M-SCH, M-CUS | `src/app/account/bookings/new/page.tsx` (placeholder) | D | TC-BOOK-010 | ⬜ Not started | Blocked |
| SR-BOOK-011 | SN-02 | S | M-SCH | — | T | TC-BOOK-011 | ⬜ Not started | Blocked |
| SR-BOOK-012 | SN-10 | M | M-IDN, M-CUS | `registerCustomer`, `markEmailVerified` (RSK-01) | T | TC-BOOK-012 | ✅ Implemented | Pending |

### Estimates — `SR-EST`

| Req | Need | Pri | Design | Implementation / evidence | Verif. | Test case | Status | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SR-EST-001 | SN-03 | M | M-EST, IF-13 | `src/app/(marketing)/estimate/actions.ts`, `estimates/estimate-request.ts` | T | TC-EST-001 | ✅ Implemented | Pending |
| SR-EST-002 | SN-03 | M | M-EST, M-LOC, IF-01 | `estimates/save-request.ts` | T | TC-EST-002 | ✅ Implemented | Pending |
| SR-EST-003 | SN-03 | M | M-NTF, IF-06 | `estimates/save-request.ts` | T | TC-EST-003 | ✅ Implemented | Pending |
| SR-EST-004 | SN-03, SN-07 | M | M-EST | `src/app/admin/estimates/*` (placeholder) | T | TC-EST-004 | ⬜ Not started | Blocked |
| SR-EST-005 | SN-03 | M | M-EST | `src/app/account/estimates/[id]/page.tsx` (placeholder) | T | TC-EST-005 | ⬜ Not started | Blocked |
| SR-EST-006 | SN-03 | M | M-EST, §7.2 | `Estimate.revision` | T | TC-EST-006 | 🟡 Partial | Blocked |
| SR-EST-007 | SN-03 | M | M-EST, §7.2 | `Estimate.revision` | T | TC-EST-007 | 🟡 Partial | Blocked |
| SR-EST-008 | SN-03 | S | M-EST | — | T | TC-EST-008 | ⬜ Not started | Blocked |
| SR-EST-009 | SN-07 | M | M-EST, §6.3 | `Estimate.version` | T | TC-EST-009 | 🟡 Partial | Blocked |
| SR-EST-010 | SN-10 | M | M-IDN, §6.2 | `src/app/account/estimates/page.tsx` | T | TC-EST-010 | ✅ Implemented | Pending |
| SR-EST-011 | SN-10 | M | M-IDN | — | T | TC-EST-011 | ⬜ Not started | Blocked |

### Repair orders — `SR-REP`

| Req | Need | Pri | Design | Implementation / evidence | Verif. | Test case | Status | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SR-REP-001 | SN-07 | M | M-REP | `src/app/admin/repairs/new/page.tsx` (placeholder) | T | TC-REP-001 | ⬜ Not started | Blocked |
| SR-REP-002 | SN-04, SN-07 | M | M-REP, §7.1 | `repairs/customer-view.ts` (enum; RSK-16) | T | TC-REP-002 | 🟡 Partial | Blocked |
| SR-REP-003 | SN-07 | S | M-REP | — | T | TC-REP-003 | ⬜ Not started | Blocked |
| SR-REP-004 | SN-04 | M | M-REP | `CustomerRepairView`; `account/repairs/*` (placeholder) | D | TC-REP-004 | ⬜ Not started | Blocked |
| SR-REP-005 | SN-10 | M | §6.2 | No `internalNotes` select under `src/app/account` | I, T | TC-REP-005 | ✅ Implemented | Pending |
| SR-REP-006 | SN-10 | M | M-FIL, §6.2 | `StoredFile.visibility` | T | TC-REP-006 | 🟡 Partial | Blocked |
| SR-REP-007 | SN-04 | S | M-NTF | template `repair_status` | T | TC-REP-007 | ⬜ Not started | Blocked |

### Billing and payments — `SR-BIL`

| Req | Need | Pri | Design | Implementation / evidence | Verif. | Test case | Status | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SR-BIL-001 | SN-05, SN-07 | M | M-BIL | `src/app/admin/invoices/*` (placeholder) | T | TC-BIL-001 | ⬜ Not started | Blocked |
| SR-BIL-002 | SN-05, SN-10 | M | M-BIL, M-IDN | `src/app/account/invoices/page.tsx`, `[id]/page.tsx` | T | TC-BIL-002 | ✅ Implemented | Pending |
| SR-BIL-003 | SN-05, SN-10 | M | M-BIL, IF-03, IF-05, ADR-04 | `billing/stripe.ts`, `components/account/pay-invoice.tsx` | T, I | TC-BIL-003 | ✅ Implemented | Pending |
| SR-BIL-004 | SN-05 | M | M-BIL | `paymentIntentForInvoice()` | T | TC-BIL-004 | ✅ Implemented | Pending |
| SR-BIL-005 | SN-05 | M | M-BIL, IF-03 | `paymentIntentForInvoice()` | T | TC-BIL-005 | ✅ Implemented | Pending |
| SR-BIL-006 | SN-05, SN-10 | M | M-BIL, IF-04 | `applyStripeEvent()`, `api/webhooks/stripe/route.ts` | T | TC-BIL-006 | ✅ Implemented | Pending |
| SR-BIL-007 | SN-05 | M | M-BIL, IF-04 | `applyStripeEvent()`, `StripeEvent` (RSK-08) | T | TC-BIL-007 | 🟡 Partial | Blocked |
| SR-BIL-008 | SN-05 | M | M-BIL, IF-04, §7.3 | `applyStripeEvent()` | T | TC-BIL-008 | ✅ Implemented | Pending |
| SR-BIL-009 | SN-05 | M | M-BIL, §7.3 | `applyStripeEvent()` | T | TC-BIL-009 | ✅ Implemented | Pending |
| SR-BIL-010 | SN-05, SN-08 | S | M-BIL, M-AUD | — | T | TC-BIL-010 | ⬜ Not started | Blocked |
| SR-BIL-011 | SN-05 | S | M-BIL | — | T | TC-BIL-011 | ⬜ Not started | Blocked |
| SR-BIL-012 | SN-05 | S | M-BIL, M-NTF | — | T | TC-BIL-012 | ⬜ Not started | Blocked |
| SR-BIL-013 | SN-05 | W | — | — | — | — | ⏸ Deferred | — |

### Customers and vehicles — `SR-CUS`

| Req | Need | Pri | Design | Implementation / evidence | Verif. | Test case | Status | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SR-CUS-001 | SN-06 | M | M-CUS, M-IDN | `src/app/account/vehicles/page.tsx`, `[id]/page.tsx` | T | TC-CUS-001 | ✅ Implemented | Pending |
| SR-CUS-002 | SN-06 | M | M-CUS | `account/vehicles/new`, `[id]/edit` (placeholder) | T | TC-CUS-002 | ⬜ Not started | Blocked |
| SR-CUS-003 | SN-06 | C | M-CUS | — | T | TC-CUS-003 | ⬜ Not started | Blocked |
| SR-CUS-004 | SN-06 | S | M-CUS | `src/app/account/vehicles/[id]/page.tsx` | T | TC-CUS-004 | 🟡 Partial | Blocked |
| SR-CUS-005 | SN-02 | S | IF-09, IF-12 | `lib/nhtsa-vpic.ts`, `api/vehicle-catalog/*` | T | TC-CUS-005 | ✅ Implemented | Pending |
| SR-CUS-006 | SN-06 | S | M-CUS | `src/app/account/profile/page.tsx` | T | TC-CUS-006 | 🟡 Partial | Blocked |

### Identity and access — `SR-IDN`

| Req | Need | Pri | Design | Implementation / evidence | Verif. | Test case | Status | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SR-IDN-001 | SN-06 | M | M-IDN, IF-13 | `src/app/(auth)/actions.ts`, `identity/accounts.ts`, `identity/credentials.ts` | T | TC-IDN-001 | ✅ Implemented | Pending |
| SR-IDN-002 | SN-10 | M | M-IDN | `identity/password.ts` | I, T | TC-IDN-002 | ✅ Implemented | Pending |
| SR-IDN-003 | SN-10 | M | M-IDN, IF-10, IF-15, ADR-08 | `src/auth.ts`, `identity/session.ts` | I, T | TC-IDN-003 | ✅ Implemented | Pending |
| SR-IDN-004 | SN-10 | M | M-IDN, ADR-08 | `readSignedInUser()` | T | TC-IDN-004 | ✅ Implemented | Pending |
| SR-IDN-005 | SN-10 | M | M-IDN, M-NTF | `requestPasswordReset()`, `resetPassword()` | T | TC-IDN-005 | ✅ Implemented | Pending |
| SR-IDN-006 | SN-10 | M | M-IDN | `submitForgotPassword` | T | TC-IDN-006 | ✅ Implemented | Pending |
| SR-IDN-007 | SN-10 | M | M-IDN, M-NTF, IF-06, IF-13 | `identity/verification.ts`, `src/app/(auth)/verify-email/page.tsx` (RSK-01) | T | TC-IDN-007 | ✅ Implemented | Pending |
| SR-IDN-008 | SN-10 | M | M-IDN, IF-02 | `identity/rate-limit.ts`, `lib/form-action.ts` | T | TC-IDN-008 | ✅ Implemented | Pending |
| SR-IDN-009 | SN-10 | S | M-IDN | — | T | TC-IDN-009 | ⬜ Not started | Blocked |
| SR-IDN-010 | SN-10 | M | M-IDN | `requireCustomer()`, `account/layout.tsx` | T | TC-IDN-010 | ✅ Implemented | Pending |
| SR-IDN-011 | SN-08 | M | M-IDN, ADR-07 | `requireStaff()`, `admin/layout.tsx`, `admin/forbidden.tsx` | T | TC-IDN-011 | ✅ Implemented | Pending |
| SR-IDN-012 | SN-08 | M | M-IDN | `identity/roles.ts` (not called by routes) | T | TC-IDN-012 | 🟡 Partial | Blocked |
| SR-IDN-013 | SN-07 | S | M-IDN, M-NTF | — | T | TC-IDN-013 | ⬜ Not started | Blocked |

### Staff workspace — `SR-ADM`

| Req | Need | Pri | Design | Implementation / evidence | Verif. | Test case | Status | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SR-ADM-001 | SN-07 | M | C-01 | `src/app/admin/page.tsx` (placeholder) | D | TC-ADM-001 | ⬜ Not started | Blocked |
| SR-ADM-002 | SN-07 | M | M-SCH | `src/app/admin/calendar/page.tsx` (placeholder) | D | TC-ADM-002 | ⬜ Not started | Blocked |
| SR-ADM-003 | SN-07, SN-08 | S | M-SCH, M-AUD | — | T | TC-ADM-003 | ⬜ Not started | Blocked |
| SR-ADM-004 | SN-07 | M | M-SCH, §7.4 | `src/app/admin/appointments/*` (placeholder) | T | TC-ADM-004 | ⬜ Not started | Blocked |
| SR-ADM-005 | SN-07 | M | M-CUS | `src/app/admin/customers/*` (placeholder) | D | TC-ADM-005 | ⬜ Not started | Blocked |
| SR-ADM-006 | SN-08 | M | M-CAT, ADR-05 | `src/app/admin/services/page.tsx` (placeholder) | T | TC-ADM-006 | ⬜ Not started | Blocked |
| SR-ADM-007 | SN-08 | M | M-LOC | `src/app/admin/hours/page.tsx` (placeholder) | T | TC-ADM-007 | ⬜ Not started | Blocked |
| SR-ADM-008 | SN-08 | M | M-IDN | `src/app/admin/staff/page.tsx` (placeholder) | T | TC-ADM-008 | ⬜ Not started | Blocked |
| SR-ADM-009 | SN-07 | S | C-01 | — | D | TC-ADM-009 | ⬜ Not started | Blocked |

### Audit — `SR-AUD`

| Req | Need | Pri | Design | Implementation / evidence | Verif. | Test case | Status | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SR-AUD-001 | SN-08 | M | M-AUD, IF-16 | `audit/event.ts`; stdout line in `billing/stripe.ts` | T | TC-AUD-001 | 🟡 Partial | Blocked |
| SR-AUD-002 | SN-08 | M | M-AUD | — | I | TC-AUD-002 | ⬜ Not started | Blocked |
| SR-AUD-003 | SN-08 | M | M-AUD | `src/app/admin/audit/page.tsx` (placeholder) | D | TC-AUD-003 | ⬜ Not started | Blocked |

### Files — `SR-FIL`

| Req | Need | Pri | Design | Implementation / evidence | Verif. | Test case | Status | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SR-FIL-001 | SN-10 | M | M-FIL, IF-07, IF-08, IF-11 | `files/storage.ts` `createSignedUpload()`, `api/files/sign/route.ts` | T | TC-FIL-001 | ✅ Implemented | Pending |
| SR-FIL-002 | SN-10 | M | M-FIL, IF-11 | `files/storage.ts` | T | TC-FIL-002 | ✅ Implemented | Pending |
| SR-FIL-003 | SN-09 | M | M-FIL, ADR-02 | `files/storage.ts` | I | TC-FIL-003 | ✅ Implemented | Pass (inspection) |
| SR-FIL-004 | SN-10 | M | M-FIL, IF-07 | `attachUploadedFile()` | T | TC-FIL-004 | ✅ Implemented | Pending |
| SR-FIL-005 | SN-10 | M | M-FIL, §6.2 | `StoredFile` model | I | TC-FIL-005 | ✅ Implemented | Pass (inspection) |
| SR-FIL-006 | SN-10 | C | M-FIL | — | T | — | ⏸ Deferred | — |
| SR-FIL-007 | SN-12 | C | M-FIL | — | T | TC-FIL-007 | ⬜ Not started | Blocked |

### Notifications — `SR-NTF`

| Req | Need | Pri | Design | Implementation / evidence | Verif. | Test case | Status | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SR-NTF-001 | SN-12, SN-13 | M | M-NTF, IF-02, IF-14, ADR-03 | `notifications/queue.ts` | T | TC-NTF-001 | ✅ Implemented | Pending |
| SR-NTF-002 | SN-13 | M | M-NTF, ADR-03 | `enqueueEmail()` | T | TC-NTF-002 | ✅ Implemented | Pending |
| SR-NTF-003 | SN-12 | M | C-02, IF-14 | `src/worker.ts` (RSK-07) | D | TC-NTF-003 | ✅ Implemented | Pending |
| SR-NTF-004 | SN-13 | M | M-NTF, IF-06, ADR-06 | `notifications/deliver.ts` | T | TC-NTF-004 | ✅ Implemented | Pending |
| SR-NTF-005 | SN-06 | S | M-NTF, M-CUS | — | T | TC-NTF-005 | ⬜ Not started | Blocked |
| SR-NTF-006 | SN-04 | W | IF-17 | — | — | — | ⏸ Deferred | — |

### Locations — `SR-LOC`

| Req | Need | Pri | Design | Implementation / evidence | Verif. | Test case | Status | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SR-LOC-001 | SN-09 | M | ADR-02, §6.1 | `prisma/schema.prisma` | I | TC-LOC-001 | ✅ Implemented | Pass (inspection) |
| SR-LOC-002 | SN-09 | M | M-LOC, ADR-02 | `locations/active.ts` | I | TC-LOC-002 | ✅ Implemented | Pass (inspection) |
| SR-LOC-003 | SN-09 | M | M-LOC | — | I | TC-LOC-003 | ⬜ Not started | Blocked |
| SR-LOC-004 | SN-09 | W | — | — | — | — | ⏸ Deferred | — |

### Performance — `NFR-PERF`

| Req | Need | Pri | Design | Implementation / evidence | Verif. | Test case | Status | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| NFR-PERF-001 | SN-01 | M | ADR-05 | Lighthouse / CrUX | A | TC-PERF-001 | ⬜ Not started | Blocked |
| NFR-PERF-002 | SN-04, SN-07 | M | ADR-05 | Lighthouse | A | TC-PERF-002 | ⬜ Not started | Blocked |
| NFR-PERF-003 | SN-11 | M | ADR-05 | Lighthouse / CrUX | A | TC-PERF-003 | ⬜ Not started | Blocked |
| NFR-PERF-004 | SN-01 | M | ADR-05, C-01 | Netlify analytics | A | TC-PERF-004 | ⬜ Not started | Blocked |
| NFR-PERF-005 | SN-07 | M | C-01, IF-01 | Load test | A | TC-PERF-005 | ⬜ Not started | Blocked |
| NFR-PERF-006 | SN-02 | M | M-SCH | Load test | A | TC-PERF-006 | ⬜ Not started | Blocked |
| NFR-PERF-007 | SN-12 | M | C-01..C-04 | Load test | A | TC-PERF-007 | ⬜ Not started | Blocked |
| NFR-PERF-008 | SN-01 | S | IF-05 | `pay-invoice.tsx` imported only by invoice page | I | TC-PERF-008 | ✅ Implemented | Pass (inspection) |

### Reliability — `NFR-REL`

| Req | Need | Pri | Design | Implementation / evidence | Verif. | Test case | Status | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| NFR-REL-001 | SN-12 | M | §3.1 | Uptime monitor | A | TC-REL-001 | ⬜ Not started | Blocked |
| NFR-REL-002 | SN-12 | M | C-03 | Neon PITR config | A, D | TC-REL-002 | ⬜ Not started | Blocked |
| NFR-REL-003 | SN-12 | M | C-03 | Runbook | D | TC-REL-003 | ⬜ Not started | Blocked |
| NFR-REL-004 | SN-12 | M | C-03 | Restore drill log | D | TC-REL-004 | ⬜ Not started | Blocked |
| NFR-REL-005 | SN-12 | M | ADR-03, ADR-04 | `notifications/queue.ts`, `billing/stripe.ts` | T | TC-REL-005 | 🟡 Partial | Blocked |
| NFR-REL-006 | SN-13 | M | ADR-06 | `save-booking.ts`, `save-request.ts` (email try/catch) | T | TC-REL-006 | ✅ Implemented | Pending |
| NFR-REL-007 | SN-13 | M | ADR-06 | `*Configured()` guards; `npm run build` | T | TC-REL-007 | ✅ Implemented | Pending |

### Security — `NFR-SEC`

| Req | Need | Pri | Design | Implementation / evidence | Verif. | Test case | Status | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| NFR-SEC-001 | SN-10 | M | C-01 | `next.config.ts` | I, T | TC-SEC-001 | ✅ Implemented | Pending |
| NFR-SEC-002 | SN-10 | M | C-01 | `next.config.ts` | T | TC-SEC-002 | ✅ Implemented | Pending |
| NFR-SEC-003 | SN-10 | S | C-01 | — | T | TC-SEC-003 | ⬜ Not started | Blocked |
| NFR-SEC-004 | SN-10 | M | ADR-05 | `next.config.ts` `privateRouteSources`; layouts `robots` | T | TC-SEC-004 | ✅ Implemented | Pending |
| NFR-SEC-005 | SN-10 | M | M-IDN, §6.2 | `where: { customerId }` in all `src/app/account/**` | T | TC-SEC-005 | ✅ Implemented | Pending |
| NFR-SEC-006 | SN-08, SN-09 | M | M-IDN | — | T | TC-SEC-006 | ⬜ Not started | Blocked |
| NFR-SEC-007 | SN-10 | M | ADR-04, IF-05 | `Invoice` has `paymentIntentId` only | I | TC-SEC-007 | ✅ Implemented | Pass (inspection) |
| NFR-SEC-008 | SN-10 | M | M-IDN, IF-02 | `identity/rate-limit.ts` `rateLimitPolicies` | T | TC-SEC-008 | ✅ Implemented | Pending |
| NFR-SEC-009 | SN-10 | M | IF-11..13 | Zod schemas in modules and handlers | I | TC-SEC-009 | ✅ Implemented | Pass (inspection) |
| NFR-SEC-010 | SN-10 | S | IF-13 | `lib/form-action.ts` (`company`) | T | TC-SEC-010 | ✅ Implemented | Pending |
| NFR-SEC-011 | SN-10 | M | IF-10, IF-13 | Next.js Server Actions, Auth.js | I | TC-SEC-011 | ✅ Implemented | Pass (inspection) |
| NFR-SEC-012 | SN-10 | M | — | `import "server-only"`; `.env.example` | I | TC-SEC-012 | ✅ Implemented | Pass (inspection) |
| NFR-SEC-013 | SN-10 | M | — | `lib/record-id.ts` | T | TC-SEC-013 | ✅ Implemented | Pending |

### Privacy — `NFR-PRIV`

| Req | Need | Pri | Design | Implementation / evidence | Verif. | Test case | Status | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| NFR-PRIV-001 | SN-10 | M | — | Log review | I | TC-PRIV-001 | 🟡 Partial | Blocked |
| NFR-PRIV-002 | SN-10 | M | C-01 | `src/app/(marketing)/privacy/page.tsx` | I | TC-PRIV-002 | ✅ Implemented | Pass (inspection) |
| NFR-PRIV-003 | SN-10 | M | M-CUS | `save-booking.ts`, `save-request.ts` upsert (RSK-02) | T | TC-PRIV-003 | ⬜ Not started | Blocked |

### SEO — `NFR-SEO`

| Req | Need | Pri | Design | Implementation / evidence | Verif. | Test case | Status | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| NFR-SEO-001 | SN-01 | M | C-01 | `metadata` exports | I | TC-SEO-001 | ✅ Implemented | Pass (inspection) |
| NFR-SEO-002 | SN-01 | M | ADR-05 | Server-rendered service pages | T | TC-SEO-002 | ✅ Implemented | Pending |
| NFR-SEO-003 | SN-01 | M | C-01 | Netlify deploy-preview config | I | TC-SEO-003 | ⬜ Not started | Blocked |

### Accessibility — `NFR-A11Y`

| Req | Need | Pri | Design | Implementation / evidence | Verif. | Test case | Status | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| NFR-A11Y-001 | SN-11 | M | — | axe + manual audit | A, D | TC-A11Y-001 | ⬜ Not started | Blocked |
| NFR-A11Y-002 | SN-11 | M | — | Manual keyboard pass | D | TC-A11Y-002 | ⬜ Not started | Blocked |
| NFR-A11Y-003 | SN-11 | M | — | `components/forms/*` | T | TC-A11Y-003 | 🟡 Partial | Blocked |
| NFR-A11Y-004 | SN-11 | M | — | `components/forms/preview-form.tsx` | D | TC-A11Y-004 | 🟡 Partial | Blocked |
| NFR-A11Y-005 | SN-11 | M | C-01 | `src/app/(marketing)/accessibility/page.tsx` | I | TC-A11Y-005 | ✅ Implemented | Pass (inspection) |

### Observability — `NFR-OBS`

| Req | Need | Pri | Design | Implementation / evidence | Verif. | Test case | Status | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| NFR-OBS-001 | SN-12 | M | — | `src/worker.ts`, `billing/stripe.ts` | I | TC-OBS-001 | 🟡 Partial | Blocked |
| NFR-OBS-002 | SN-12 | M | — | — | D | TC-OBS-002 | ⬜ Not started | Blocked |
| NFR-OBS-003 | SN-12 | M | — | — | D | TC-OBS-003 | ⬜ Not started | Blocked |
| NFR-OBS-004 | SN-12 | M | — | — | D | TC-OBS-004 | ⬜ Not started | Blocked |

### Maintainability — `NFR-MNT`

| Req | Need | Pri | Design | Implementation / evidence | Verif. | Test case | Status | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| NFR-MNT-001 | SN-15 | M | — | `tsconfig.json` | I | TC-MNT-001 | ✅ Implemented | Pass (inspection) |
| NFR-MNT-002 | SN-15 | M | — | `package.json` scripts | T | TC-MNT-002 | ⬜ Not started | Blocked |
| NFR-MNT-003 | SN-15 | M | §4 | `src/modules/*` | I | TC-MNT-003 | ✅ Implemented | Pass (inspection) |
| NFR-MNT-004 | SN-15 | M | IF-01 | `prisma/migrations/*` | I | TC-MNT-004 | ✅ Implemented | Pass (inspection) |
| NFR-MNT-005 | SN-15 | M | — | `src/app/` only | I | TC-MNT-005 | ✅ Implemented | Pass (inspection) |

### Rendering and caching — `NFR-RND`

| Req | Need | Pri | Design | Implementation / evidence | Verif. | Test case | Status | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| NFR-RND-001 | SN-01 | M | ADR-05 | `next.config.ts` `cacheLife.marketing` | I | TC-RND-001 | ✅ Implemented | Pass (inspection) |
| NFR-RND-002 | SN-01 | M | ADR-05 | `cacheLife.contact`, `src/app/(marketing)/contact/page.tsx` | I | TC-RND-002 | ✅ Implemented | Pass (inspection) |
| NFR-RND-003 | SN-01 | M | ADR-05 | `cacheLife.legal` | I | TC-RND-003 | ✅ Implemented | Pass (inspection) |
| NFR-RND-004 | SN-10 | M | ADR-05 | `connection()` in `account/layout.tsx`, `admin/layout.tsx` | T | TC-RND-004 | ✅ Implemented | Pending |
| NFR-RND-005 | SN-02 | M | M-SCH | — | I | TC-RND-005 | ⬜ Not started | Blocked |

### Compliance — `NFR-CMP`

| Req | Need | Pri | Design | Implementation / evidence | Verif. | Test case | Status | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| NFR-CMP-001 | SN-14 | S | M-EST, M-BIL | — | I | TC-CMP-001 | ⬜ Not started | Blocked |
| NFR-CMP-002 | SN-10 | M | ADR-04 | SAQ-A self-assessment | A | TC-CMP-002 | ✅ Implemented | Pending |
| NFR-CMP-003 | SN-10 | M | — | Content inspection | I | TC-CMP-003 | ✅ Implemented | Pass (inspection) |

## 3. Backward traceability — need coverage

Every stakeholder need must trace to at least one requirement. A need is **satisfied** at baseline only when all of its Must requirements are implemented.

| Need | Requirements | Must reqs | Must implemented | Coverage at baseline |
| --- | --- | --- | --- | --- |
| SN-01 | 16 | 13 | 10 | 77% of Must |
| SN-02 | 11 | 8 | 5 | 62% of Must |
| SN-03 | 8 | 7 | 3 | 43% of Must |
| SN-04 | 6 | 4 | 1 | 25% of Must |
| SN-05 | 13 | 9 | 7 | 78% of Must |
| SN-06 | 8 | 3 | 2 | 67% of Must |
| SN-07 | 16 | 11 | 0 | 0% of Must |
| SN-08 | 11 | 9 | 1 | 11% of Must |
| SN-09 | 8 | 7 | 5 | 71% of Must |
| SN-10 | 43 | 39 | 35 | 90% of Must |
| SN-11 | 6 | 6 | 1 | 17% of Must |
| SN-12 | 13 | 12 | 2 | 17% of Must |
| SN-13 | 7 | 7 | 7 | Satisfied |
| SN-14 | 1 | 0 | 0 | No Must requirements |
| SN-15 | 5 | 5 | 4 | 80% of Must |

Needs with no requirement: none.

## 4. Design element coverage

Reverse view: which requirements each module allocates. A module with only unimplemented rows is a build gap; a module with no rows would be unjustified design.

| Module | Requirements allocated | ✅ | 🟡 | ⬜ |
| --- | --- | --- | --- | --- |
| M-IDN | SR-BOOK-009, SR-BOOK-012, SR-EST-010, SR-EST-011, SR-BIL-002, SR-CUS-001, SR-IDN-001, SR-IDN-002, SR-IDN-003, SR-IDN-004, SR-IDN-005, SR-IDN-006, SR-IDN-007, SR-IDN-008, SR-IDN-009, SR-IDN-010, SR-IDN-011, SR-IDN-012, SR-IDN-013, SR-ADM-008, NFR-SEC-005, NFR-SEC-006, NFR-SEC-008 | 17 | 1 | 5 |
| M-LOC | SR-PUB-003, SR-PUB-005, SR-PUB-006, SR-BOOK-004, SR-BOOK-005, SR-EST-002, SR-ADM-007, SR-LOC-002, SR-LOC-003 | 5 | 1 | 3 |
| M-CAT | SR-PUB-002, SR-PUB-003, SR-PUB-004, SR-BOOK-002, SR-ADM-006 | 4 | 0 | 1 |
| M-SCH | SR-BOOK-001, SR-BOOK-002, SR-BOOK-003, SR-BOOK-004, SR-BOOK-005, SR-BOOK-006, SR-BOOK-007, SR-BOOK-010, SR-BOOK-011, SR-ADM-002, SR-ADM-003, SR-ADM-004, NFR-PERF-006, NFR-RND-005 | 4 | 0 | 10 |
| M-EST | SR-EST-001, SR-EST-002, SR-EST-004, SR-EST-005, SR-EST-006, SR-EST-007, SR-EST-008, SR-EST-009, NFR-CMP-001 | 2 | 3 | 4 |
| M-REP | SR-REP-001, SR-REP-002, SR-REP-003, SR-REP-004 | 0 | 1 | 3 |
| M-BIL | SR-BIL-001, SR-BIL-002, SR-BIL-003, SR-BIL-004, SR-BIL-005, SR-BIL-006, SR-BIL-007, SR-BIL-008, SR-BIL-009, SR-BIL-010, SR-BIL-011, SR-BIL-012, NFR-CMP-001 | 7 | 1 | 5 |
| M-CUS | SR-BOOK-010, SR-BOOK-012, SR-CUS-001, SR-CUS-002, SR-CUS-003, SR-CUS-004, SR-CUS-006, SR-ADM-005, SR-NTF-005, NFR-PRIV-003 | 2 | 2 | 6 |
| M-NTF | SR-BOOK-008, SR-EST-003, SR-REP-007, SR-BIL-012, SR-IDN-005, SR-IDN-007, SR-IDN-013, SR-NTF-001, SR-NTF-002, SR-NTF-004, SR-NTF-005 | 7 | 0 | 4 |
| M-AUD | SR-BIL-010, SR-ADM-003, SR-AUD-001, SR-AUD-002, SR-AUD-003 | 0 | 1 | 4 |
| M-FIL | SR-REP-006, SR-FIL-001, SR-FIL-002, SR-FIL-003, SR-FIL-004, SR-FIL-005, SR-FIL-006, SR-FIL-007 | 5 | 1 | 1 |

## 5. Interface coverage

| Interface | Requirements |
| --- | --- |
| IF-01 | SR-PUB-002, SR-PUB-005, SR-BOOK-004, SR-EST-002, NFR-PERF-005, NFR-MNT-004 |
| IF-02 | SR-IDN-008, SR-NTF-001, NFR-SEC-008 |
| IF-03 | SR-BIL-003, SR-BIL-005 |
| IF-04 | SR-BIL-006, SR-BIL-007, SR-BIL-008 |
| IF-05 | SR-BIL-003, NFR-PERF-008, NFR-SEC-007 |
| IF-06 | SR-BOOK-008, SR-EST-003, SR-IDN-007, SR-NTF-004 |
| IF-07 | SR-FIL-001, SR-FIL-004 |
| IF-08 | SR-FIL-001 |
| IF-09 | SR-CUS-005 |
| IF-10 | SR-IDN-003, NFR-SEC-011 |
| IF-11 | SR-FIL-001, SR-FIL-002, NFR-SEC-009 |
| IF-12 | SR-CUS-005, NFR-SEC-009 |
| IF-13 | SR-BOOK-001, SR-BOOK-003, SR-EST-001, SR-IDN-001, SR-IDN-007, NFR-SEC-009, NFR-SEC-010, NFR-SEC-011 |
| IF-14 | SR-BOOK-008, SR-NTF-001, SR-NTF-003 |
| IF-15 | SR-BOOK-009, SR-IDN-003 |
| IF-16 | SR-AUD-001 |
| IF-17 | SR-NTF-006 |

## 6. Risk linkage

Requirements whose status is limited by an open risk in [07](07-risk-register.md):

| Risk | Requirements |
| --- | --- |
| RSK-01 | SR-BOOK-012, SR-IDN-007 |
| RSK-02 | NFR-PRIV-003 |
| RSK-03 | NFR-SEC-008 |
| RSK-04 | SR-AUD-001 |
| RSK-05 | NFR-MNT-002 |
| RSK-06 | NFR-REL-005 |
| RSK-07 | SR-NTF-003 |
| RSK-08 | SR-BIL-007, NFR-REL-005 |
| RSK-11 | SR-LOC-002 |
| RSK-13 | SR-FIL-007 |
| RSK-15 | SR-IDN-012 |
| RSK-16 | SR-REP-002 |
