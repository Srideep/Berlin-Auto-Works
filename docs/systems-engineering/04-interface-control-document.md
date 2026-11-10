# 04 — Interface Control Document (ICD)

**System:** Berlin AutoWorks web application
**Baseline:** 2026-11-10, code `5ba429c`
**Related:** [03 Architecture](03-system-architecture-design.md#2-system-context) · [05 RTM](05-requirements-traceability-matrix.md)

This document defines every interface that crosses a component boundary.
A change to any contract below requires an update here and, if behaviour
changes, an ADR in [03](03-system-architecture-design.md#8-architecture-decision-records).

## 1. Interface register

| ID | Interface | Provider | Consumer | Direction | Protocol | Owner module | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| IF-01 | Database | Neon Postgres | C-01, C-02 | Bi | Postgres wire over TLS (Prisma + `pg`) | all | Implemented |
| IF-02 | Cache and queue | Redis | C-01, C-02 | Bi | RESP (ioredis), BullMQ | M-IDN, M-NTF | Implemented |
| IF-03 | Payments API | Stripe | C-01 | Out | HTTPS REST (stripe-node) | M-BIL | Implemented |
| IF-04 | Payments webhook | C-01 | Stripe | In | HTTPS POST, signed | M-BIL | Implemented |
| IF-05 | Payment Element | Stripe.js | Customer browser | Bi | Browser ↔ Stripe | M-BIL | Implemented |
| IF-06 | Email send | Resend | C-01, C-02 | Out | HTTPS REST (resend SDK) | M-NTF | Implemented |
| IF-07 | Object storage control | S3 API | C-01 | Out | HTTPS (AWS SDK v3): presign, HEAD | M-FIL | Implemented |
| IF-08 | Object upload | S3 API | Browser | Out | HTTPS `PUT` to presigned URL | M-FIL | Implemented |
| IF-09 | Vehicle catalog | NHTSA vPIC | C-01 | Out | HTTPS GET JSON | lib | Implemented |
| IF-10 | Auth endpoints | C-01 (Auth.js) | Browser | Bi | HTTPS `GET/POST /api/auth/*` | M-IDN | Implemented |
| IF-11 | Upload signing API | C-01 | Browser | In | HTTPS `POST /api/files/sign` JSON | M-FIL | Implemented |
| IF-12 | Vehicle catalog proxy | C-01 | Browser | In | HTTPS `GET /api/vehicle-catalog/*` JSON | lib | Implemented |
| IF-13 | Server Actions | C-01 | Browser | In | Next.js Server Action (POST, `FormData`) | various | Implemented |
| IF-14 | Notification job | M-NTF producer | C-02 | Internal | BullMQ job on queue `notifications` | M-NTF | Implemented |
| IF-15 | Session claims | Auth.js | C-01 | Internal | JWT in cookie `baw_session` | M-IDN | Implemented |
| IF-16 | Audit event | modules | audit store | Internal | In-process call → table | M-AUD | Planned |
| IF-17 | SMS | Twilio (TBD) | C-02 | Out | HTTPS | M-NTF | Deferred |

---

## 2. External interfaces

### IF-01 — Database (Neon Postgres)

| Item | Specification |
| --- | --- |
| Endpoints | `DATABASE_URL` (pooled, host contains `-pooler`) for runtime and seed; `DIRECT_URL` (direct) for `prisma migrate` |
| Client | `PrismaClient` with `PrismaPg` adapter, singleton on `globalThis` (`src/lib/db.ts`) |
| Schema | `prisma/schema.prisma`; generated client in `src/generated/prisma` |
| Migrations | `prisma/migrations/*`; applied with `prisma migrate deploy` (prod) / `migrate dev` (local) |
| Absent | `getDb()` throws; every caller checks `process.env.DATABASE_URL` first (MODE-02) |
| Invariants | Transactional rows carry `locationId`; referential actions `Restrict` except `SetNull` for optional links and `Cascade` for reset tokens |

### IF-02 — Redis and BullMQ

| Item | Specification |
| --- | --- |
| Endpoint | `REDIS_URL` |
| Clients | Two ioredis clients: rate limit (`maxRetriesPerRequest: 1`), queue (`maxRetriesPerRequest: null`, required by BullMQ) |
| Rate-limit keys | `rl:<policy>:<clientIp>:<windowBucket>`; `INCR`, `PEXPIRE windowMs` on first hit; fixed-window |
| Queue | Name `notifications`; job name = template; payload per IF-14 |
| Job options | `attempts: 5`, `backoff: exponential, delay 10 000 ms`, `removeOnComplete: 100` |
| Absent | Rate limit falls back to in-process sliding window; email sent inline (MODE-04) |

### IF-03 — Stripe PaymentIntents API

| Operation | When | Request | Idempotency |
| --- | --- | --- | --- |
| `paymentIntents.retrieve(id)` | Invoice already has `paymentIntentId` | — | Read |
| `paymentIntents.create` | No reusable intent | `amount = balanceDueCents`, `currency = invoice.currency`, `automatic_payment_methods.enabled = true`, `metadata.invoiceId` | Header `Idempotency-Key: invoice-<invoiceId>-intent` |

| Item | Specification |
| --- | --- |
| Auth | `STRIPE_SECRET_KEY` (server only) |
| Persisted | `Invoice.paymentIntentId` only. Never PAN, CVC, or payment method details |
| Precondition | Invoice owned by session customer, status `open` or `processing`, balance > 0 |
| Absent | `paymentIntentForInvoice` returns `null`; page shows "Card payment is not configured" (MODE-06) |

> Note: the idempotency key is constant per invoice. If the balance changes
> after the first intent was created (e.g. a revised invoice), Stripe will
> return the original intent with the original amount for 24 h. Include the
> invoice `version` in the key when invoice editing is built.

### IF-04 — Stripe webhook

| Item | Specification |
| --- | --- |
| Endpoint | `POST /api/webhooks/stripe` |
| Body | Raw request text (must not be parsed before verification) |
| Auth | `Stripe-Signature` header verified with `STRIPE_WEBHOOK_SECRET` via `stripe.webhooks.constructEvent` |
| Dedup | Insert `StripeEvent(id = event.id)`; unique violation (`P2002`) → return 200 without applying |
| Handled events | `payment_intent.processing` → invoice `processing`, `version+1`; `payment_intent.succeeded` → `paid`, `balanceDueCents = 0`, `version+1`, audit line `invoice.paid` |
| Matching | `Invoice.id = metadata.invoiceId AND Invoice.paymentIntentId = intent.id`; no match or already `paid` → 200, no change |
| Ignored (200) | All other event types |
| Responses | `400` missing config / signature / verification failure; `200` accepted or ignored; `500` unhandled error (Stripe retries) |
| Planned events | `payment_intent.payment_failed`, `charge.refunded`, `charge.dispute.created`, `charge.dispute.closed` |

**Known defect (RSK-08):** dedup insert and invoice update are not in one
transaction. If the update throws after the insert, Stripe's retry hits the
unique key and returns 200, losing the event. Required fix: wrap both in
`$transaction` or insert the dedup row last.

### IF-05 — Stripe Payment Element (browser)

| Item | Specification |
| --- | --- |
| Component | `src/components/account/pay-invoice.tsx` (`"use client"`) |
| Inputs | `clientSecret` (from IF-03), `returnUrl = <site>/account/invoices/<id>` |
| Key | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| Data boundary | Card fields are Stripe-hosted iframes; the app never receives card data |
| Loading | Stripe.js loads only on the invoice detail route (NFR-PERF-008) |

### IF-06 — Resend email

| Item | Specification |
| --- | --- |
| Call | `resend.emails.send({ from: EMAIL_FROM, to, subject, text })` |
| Auth | `RESEND_API_KEY` |
| Format | Plain text only at baseline |
| Success | `result.error === null`; failure returns `false` (worker does not throw → **BullMQ does not retry a provider-side rejection**; only thrown errors retry) |
| Absent | `deliverEmail` returns `false` without sending (MODE-03) |

Templates (subject defaults, `src/modules/notifications/message.ts`):

| Template | Subject | Triggered by | Status |
| --- | --- | --- | --- |
| `booking_received` | We received your appointment request | SR-BOOK-008 | Implemented |
| `estimate_received` | We received your estimate request | SR-EST-003 | Implemented |
| `password_reset` | Reset your Berlin AutoWorks password | SR-IDN-005 | Implemented |
| `estimate_sent` | Your estimate is ready | SR-EST-004 | Not started |
| `repair_status` | Your repair status changed | SR-REP-007 | Not started |
| `invoice_ready` | Your invoice is ready | SR-BIL-001 | Not started |

### IF-07 — S3 control plane

| Operation | Use | Parameters |
| --- | --- | --- |
| `getSignedUrl(PutObjectCommand)` | Issue upload URL | `Bucket`, `Key = locations/<locationId>/uploads/<fileId>`, `ContentType`, `ContentLength`, `expiresIn: 300` |
| `HeadObjectCommand` | Confirm object exists before attach | `Bucket`, `Key` |

| Item | Specification |
| --- | --- |
| Auth | `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_REGION`; optional `S3_ENDPOINT` (path-style when set, for R2/MinIO) |
| Bucket policy (required) | Private; no public read; CORS allows `PUT` from the site origin only |
| Absent | Signing returns "Photo upload is not configured" (MODE-07) |

### IF-08 — Browser upload to bucket

`PUT <uploadUrl>` with `Content-Type` and `Content-Length` equal to the signed
values. Any mismatch is rejected by the provider (signature covers them).

### IF-09 — NHTSA vPIC

| Call | URL | Cache |
| --- | --- | --- |
| Makes | `GET https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json` | `revalidate: 86400` |
| Models | `GET …/GetModelsForMakeYear/make/<make>/modelyear/<year>?format=json` | `revalidate: 86400` |

Output normalised to `{ value, label }[]`, de-duplicated, sorted, labels
title-cased. Non-2xx → throws → proxy returns 502 (MODE-08).

---

## 3. System-provided interfaces

### IF-10 — Auth.js endpoints

| Item | Specification |
| --- | --- |
| Route | `GET/POST /api/auth/[...nextauth]` |
| Provider | Credentials (`email`, `password`) |
| Session | JWT strategy; cookie per IF-15 |
| Absent | `503 Sign-in is not configured.` (MODE-05) |

### IF-11 — `POST /api/files/sign`

Request (`application/json`):

```json
{ "contentType": "image/jpeg", "byteSize": 482113 }
```

| Field | Rule |
| --- | --- |
| `contentType` | string ≤ 100; must be `image/jpeg`, `image/png`, or `image/webp` |
| `byteSize` | integer, 1 ≤ n ≤ 5 000 000 |

Responses:

| Status | Body | When |
| --- | --- | --- |
| 200 | `{ "fileId": string, "token": string, "uploadUrl": string }` | Signed |
| 400 | `{ "error": "Send a photo description." }` | Non-JSON or schema fail |
| 422 | `{ "error": string }` | Type/size rejected, storage or DB not configured |
| 429 | `{ "error": "Too many uploads. Try again later." }` | Upload rate limit (20/h) |

The `token` is shown once; only its SHA-256 is stored. The form submits
`fileId` + `fileToken` with the booking/estimate to attach (SR-FIL-004).

### IF-12 — Vehicle catalog proxy

| Route | Query | 200 body | Errors |
| --- | --- | --- | --- |
| `GET /api/vehicle-catalog/makes` | — | `{ "makes": [{ "value", "label" }] }` | 502 `{ "error" }` |
| `GET /api/vehicle-catalog/models` | `make` (1–80), `year` (1980..current+1) | `{ "models": [{ "value", "label" }] }` | 400 invalid query; 502 upstream |

### IF-13 — Server Actions

All actions accept `FormData`, return `ActionState`:

```ts
interface ActionState {
  status: "idle" | "invalid" | "limited" | "unavailable" | "success";
  message: string;
  fieldErrors: Record<string, string>;
}
```

Every action runs `parseFormAction(policy, schema, formData)`: rate limit →
Zod → honeypot (`company` must be empty).

| Action | File | Rate policy | Schema | Effect |
| --- | --- | --- | --- | --- |
| `submitBookingRequest` | `src/app/(marketing)/book/actions.ts` | `booking` | `bookingRequestSchemaFor(publishedSlugs)` | `saveBookingRequest` |
| `submitEstimateRequest` | `src/app/(marketing)/estimate/actions.ts` | `estimate` | `estimateRequestSchema` | `saveEstimateRequest` |
| `submitLogin` | `src/app/(auth)/actions.ts` | `login` | `loginSchema` | Auth.js `signIn` → `/account` |
| `submitSignup` | same | `signup` | `signupSchema` | `registerCustomer`, then sign in |
| `submitForgotPassword` | same | `forgotPassword` | `forgotPasswordSchema` | `requestPasswordReset` (same response either way) |
| `submitResetPassword` | same | `resetPassword` | `resetPasswordSchema` | `resetPassword` |
| `signOutAction` | same | — | — | Auth.js `signOut` → `/` |

Field contracts — booking (`bookingRequestSchema`):

| Field | Type / rule |
| --- | --- |
| `serviceSlug` | non-empty; in published catalog |
| `preferredDate` | `YYYY-MM-DD`, valid date |
| `vehicleYear` | int 1980..current+1 |
| `vehicleMake`, `vehicleModel` | 1..80 |
| `contactFirstName`, `contactLastName` | 1..40 |
| `contactMiddleName` | 0..40 |
| `contactEmail` | email ≤ 120 |
| `contactPhone` | 10 US digits (formatted `xxx-xxx-xxxx`) |
| `notes` | 0..1000 |
| `fileId`, `fileToken` | optional, ≤ 40 / ≤ 200 |
| `company` | must be empty (honeypot) |

Estimate request replaces `serviceSlug`, `preferredDate`, `notes` with
`concern` (10..2000). Credentials: `email` ≤ 120; `password` 12..200;
`name` 1..80; reset `token` 1..256.

---

## 4. Internal interfaces

### IF-14 — Notification job payload

```ts
interface OutboundEmail {
  to: string;
  template: "booking_received" | "estimate_received" | "estimate_sent"
          | "repair_status" | "invoice_ready" | "password_reset";
  locationId: string;   // "account" for account-level mail
  subjectId: string;    // id of the record the mail is about
  subject: string;
  text: string;
}
```

Producer: `enqueueEmail` (M-NTF). Consumer: `startNotificationWorker` (C-02).
Backward compatibility: the worker must accept payloads from the previous
release during a rolling deploy; add fields as optional only.

### IF-15 — Session claims

| Claim | Source | Use |
| --- | --- | --- |
| `sub` | `User.id` | Identity |
| `email`, `name` | `User` | Display; staff membership match |
| `tokenVersion` | `User.tokenVersion` at sign-in | Compared on every read (SR-IDN-004) |

Cookie: `baw_session`, `HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` in
production.

`readSignedInUser()` → `SignedInUser { id, email, name, customerId }`;
`requireCustomer()` adds non-null `customerId`; `requireStaff()` →
`StaffContext { user, locationId, role }`.

### IF-16 — Audit event (planned)

```ts
interface AuditEvent {
  locationId: string;
  actorId: string;      // staff user id, customer user id, or "stripe"
  action: "estimate.sent" | "estimate.approved" | "estimate.declined"
        | "repair_order.status_changed" | "invoice.created" | "invoice.paid"
        | "invoice.refunded" | "staff.role_changed"
        | "location.hours_changed" | "catalog.changed";
  subjectType: string;
  subjectId: string;
  createdAt: string;    // ISO 8601
}
```

Needs: an `AuditEvent` table (insert-only; no update/delete grants), written
in the same transaction as the change it records.

## 5. Interface N² summary

Rows send to columns.

| From \ To | Browser | C-01 Web | C-02 Worker | Neon | Redis | S3 | Stripe | Resend | vPIC |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Browser** | — | IF-10..13 | | | | IF-08 | IF-05 | | |
| **C-01 Web** | HTML, JSON | — | | IF-01 | IF-02 | IF-07 | IF-03 | IF-06 | IF-09 |
| **C-02 Worker** | | | — | IF-01 | IF-02 | | | IF-06 | |
| **Redis** | | | IF-14 | | — | | | | |
| **Stripe** | IF-05 | IF-04 | | | | | — | | |
