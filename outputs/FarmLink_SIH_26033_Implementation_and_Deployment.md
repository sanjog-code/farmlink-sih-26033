# FarmLink SIH 26033: implementation and deployment brief

Source reviewed: `Farm_Link_SIH_2026_Complete13.pdf` (six slides). The project addresses Smart India Hackathon 2026 Problem Statement 26033: multiple intermediaries reduce farmer earnings and increase consumer prices. This brief distinguishes source requirements from sensible production decisions; it does not claim that external integrations are already certified or approved.

## 1. Requirement baseline extracted from the proposal

### Product outcome

FarmLink is a farmer-centric agricultural aggregation platform. It combines physical collection and warehousing with live, grade-aware inventory, market intelligence, logistics and direct market access. Its intended effect is to reduce forced/distress selling, improve price transparency and choice for farmers, and give consumers clearer availability, grade and price information before purchase/travel.

### Actors and access channels

| Actor | Required capabilities |
| --- | --- |
| Farmer | Register/profile, declare or bring produce, see stock and grade, see AI price/demand/shelf-life insights, choose sell or hold, request pickup, track sale/settlement, initiate finance enquiry/consent. |
| Consumer | Discover nearby stock, see variety/grade/price/availability, order retail quantities, pay, select delivery/pickup, track order, rate/report issues. |
| Bulk buyer (retailer, institution, wholesaler) | Verified organisation account, browse/filter live lots, request quote/negotiation, reserve/buy lots, schedule delivery, invoice and order tracking. |
| Warehouse operator | Assisted intake, farmer/lot verification, calibrated weighing, camera-assisted quality grading with human override, inventory updates, storage location, stock-age/spoilage alerts, dispatch and audit logs. |
| Operations/admin | Verify users/warehouses/buyers, catalogue and price-policy management, dispute/refund handling, logistics coordination, reporting, role management and audit review. |
| Voice caller | Toll-free or callback access in local languages for simple discovery, price insight, stock status and guided assisted-service requests. A voice assistant must not make an irreversible sale or credit decision without authenticated confirmation. |

### Functional requirements

1. **Clustered collection and logistics**: support FPO/village pickup requests, route pooling, nearby warehouse allocation and first-mile pickup status.
2. **Warehouse intake**: record farmer, crop/variety, source cluster, gross/tare/net weight, operator, time, photos, storage location, quality grade, lot/QR code and receiving note.
3. **Digital stock ledger**: keep an immutable event history for intake, grade changes, transfers, reservations, sales, losses and dispatches; show usable live stock by warehouse, lot, grade and age.
4. **Quality and grading**: capture camera images, run an assistive grading model/rules, expose confidence and defects, and require human verification/override for the operational grade.
5. **Market intelligence**: ingest permitted demand, supply, historical price, market trend, quality grade, inventory, season and stock-age data; surface explainable suggested price/range, demand signal and sell/hold considerations. MSP/policy constraints must be configurable, not hard-coded. The farmer is always the final decision maker.
6. **Market access**: consumer retail storefront, bulk-buyer marketplace and a seller/order adapter designed for ONDC integration. Build a sandbox-ready adapter; production ONDC participation needs separate network onboarding, compliance and certification.
7. **Order and fulfillment**: carts/quotes, order state machine, lot reservation, pickup/delivery slots, delivery assignment/tracking, proof of delivery, invoice/settlement and returns/dispute workflow.
8. **Finance / e-NWR workflow**: determine only indicative eligibility from stored-stock and warehouse attributes, collect explicit consent, generate an application packet, track partner/lender status and link the resulting finance record. Do not issue credit, promise approval or mint e-NWRs. Actual e-NWR issuance requires WDRA-compliant warehouse/participant processes and lender/partner integrations.
9. **Multilingual and low-literacy access**: Hindi plus a configurable Indian-language framework; plain-language web UI, accessible visual cues and toll-free IVR/callback integration. Voice intents should be constrained, confirmed and transferred to a human when uncertain.
10. **Notifications**: delivery, intake, grade, price-alert, low-stock, stock-age, finance-status and dispute messages by user consent through SMS/WhatsApp/push/voice callback adapters.
11. **Analytics**: farmer earnings comparison, consumer savings, fulfillment, spoilage/wastage, price/stock trends, grading variance, logistics and operations dashboards. The deck cites illustrative tomato economics, farmer gain of about INR 5/kg and consumer saving of INR 4-6/kg; treat these as hypotheses to validate, not guaranteed outcomes.

### Quality, governance and safety requirements

- Mobile-first, responsive and low-bandwidth resilient; key warehouse workflows should tolerate temporary loss of connectivity and reconcile safely.
- Role-based least-privilege access with separate farmer, buyer, warehouse, operations, finance-partner and platform-admin permissions.
- Consent, privacy notice, retention/deletion controls, data export and auditable consent records. Collect only data needed for each workflow.
- Indian privacy and consumer/e-commerce obligations must be reviewed by qualified counsel before launch; do not represent the system as legally compliant merely because a feature exists.
- No automated adverse finance decision, binding trade action or final grade solely from AI. Display model confidence, rationale/data freshness and escalation path.
- Secure authentication, MFA for privileged users, verified partner/buyer onboarding, tamper-evident audit trail, traceability, fraud/rate-limit controls and operational monitoring.

## 2. Recommended production architecture

Use a modular monolith first: it is faster and safer to ship, while boundaries let integrations later split into services.

```text
Next.js web/PWA (farmer, buyer, consumer, warehouse, admin)
        |
API / BFF (TypeScript, NestJS or Fastify) -- OpenAPI contracts
        |
PostgreSQL + PostGIS | Redis queues/cache | S3-compatible private object storage
        |
Modules: identity | catalogue/lots | ledger | orders | logistics | pricing | grading
         finance workflow | notifications | reporting | integrations
        |
Adapters: payment | SMS/WhatsApp/IVR | maps | ONDC sandbox | lender/WDRA partner | market data
```

Recommended implementation choices:

- **Frontend:** Next.js + TypeScript, accessible component library, PWA offline queue for intake, i18n translation files, Web Speech only as an optional convenience; use a telephony/IVR provider for genuine toll-free access.
- **Backend:** TypeScript + NestJS/Fastify; PostgreSQL migrations; transactional outbox for events; background workers for notifications, forecast refresh and media processing.
- **Data:** Postgres for authoritative transactional data; object storage for photos/documents; Redis for caching, idempotency and job queue. Never use AI output as the source of truth for a lot or price.
- **AI:** begin with explainable rules and baselines; persist feature snapshot, model version, input freshness, confidence and human override. Run camera grading asynchronously and keep original images private. No training on user media without explicit lawful consent.
- **Ledger:** append-only `inventory_events` with idempotency key and correlation ID; derive available quantity from events/reservations inside transactions to prevent overselling.
- **Integrations:** define provider interfaces and sandbox/mock adapters. Keep credentials in a managed secrets store. Make webhooks signed, replay-protected and idempotent.

## 3. Delivery plan

### Phase 0 - discovery and control design (1-2 weeks)

1. Confirm pilot geography, crops, warehouse/FPO partners, target languages, fulfillment scope and payment model.
2. Write user journeys and acceptance criteria with farmers, warehouse staff, consumers and bulk buyers.
3. Obtain permissions/data licences for market data; identify actual ONDC, telephony, payment, lender and e-NWR partner requirements.
4. Threat-model authentication, payments, finance documents, warehouse photos, webhooks and privileged operations.
5. Define grading rubric and who can override it; define price-insight guardrails, data freshness and disclaimers.

### Phase 1 - pilot MVP (6-8 weeks)

Ship farmer registration, warehouse intake/ledger, assisted manual grading, live stock, consumer storefront, bulk RFQ, basic pickup/delivery, operator/admin console, Hindi/English UI, consented notifications and rule-based price insight. Use sandboxed payments and mock/adaptor interfaces for ONDC, IVR and finance.

**Pilot exit criteria:** one warehouse can receive, grade, reserve and dispatch a lot; stock never becomes negative; buyer/consumer can trace a purchase to a lot; price guidance has visible source/freshness; every sensitive action is audited; farmer can decline the recommendation.

### Phase 2 - controlled integrations (4-6 weeks)

Add provider-backed payments, messaging, map/routing, IVR/callback, market-data feed, ONDC sandbox flow, lender application tracking and warehouse/e-NWR partner hand-off. Conduct security testing, reconciliation testing and disaster-recovery rehearsal.

### Phase 3 - scale and intelligence (ongoing)

Calibrate forecasting against pilot outcomes, introduce image-grading assistance after labelled-data validation, add regional languages, improve route optimization, build partner APIs and scale warehouse clusters. Monitor for price, grading and credit-access bias; retrain only with governance approval.

## 4. Acceptance criteria

- Every intake receives a unique lot ID, net weight, grade, timestamp, operator and event trail.
- Concurrent purchase/reservation attempts cannot sell more than available stock.
- A buyer can see grade, warehouse/location scope, stock age, price basis and fulfillment options without seeing unnecessary farmer personal data.
- Price recommendation displays a range, explanatory factors, data timestamp and "recommendation, not guarantee" language.
- Grade automation can be overridden with a reason; original and override are both auditable.
- Finance flow requires farmer consent and presents eligibility as preliminary until a partner responds.
- Voice flows authenticate before exposing personal/order data and confirm each request; unrecognised/low-confidence calls route to human support.
- Critical security tests pass: authorization isolation, input validation, webhook verification, rate limiting, file-upload controls, secrets scanning and dependency vulnerability checks.

## 5. Production-ready Opencode prompt

Copy this prompt into Opencode after creating an empty repository. Replace bracketed values only where you have real partner credentials or policies.

```text
Build a production-quality, mobile-first web platform named "FarmLink" for Smart India Hackathon 2026 Problem Statement 26033. The problem is that multiple intermediaries reduce farmer earnings and raise consumer prices. FarmLink aggregates produce through village/FPO collection and warehouses, maintains live grade-aware inventory, provides AI-assisted price/demand/shelf-life insight, and enables farmer, consumer and verified bulk-buyer market access. The farmer retains the final decision to sell or hold.

Create a runnable monorepo using pnpm workspaces:
- apps/web: Next.js current stable + TypeScript, App Router, responsive PWA, accessible UI.
- apps/api: NestJS (or Fastify if simpler), TypeScript, OpenAPI, validation, Swagger in non-production.
- packages/shared: types, schemas and business rules shared only where safe.
- PostgreSQL + Prisma/Drizzle migrations; Redis for queue/cache; S3-compatible object storage interface; local Docker Compose development stack.
- Use strict TypeScript, ESLint, Prettier, unit/integration/e2e test setup, GitHub Actions CI, Dockerfiles and production Compose/Kubernetes-ready manifests.

Implement these roles with least privilege: farmer, consumer, bulk buyer, warehouse operator, operations admin, platform admin, finance partner (read-only to consented cases). Implement RBAC server-side on every endpoint; never rely only on frontend hiding.

Core modules and user flows:
1. Authentication/onboarding: phone/email OTP abstraction, secure sessions, profile verification states, consent records. Use seeded demo authentication locally; no real credentials in code.
2. Farmer portal: profile, produce/pickup request, lots and stock, grade history, price insight, sell/hold decision, orders/settlements, finance enquiry and notifications.
3. Warehouse portal: intake creates an immutable lot/event trail with farmer, crop/variety, gross/tare/net weight, timestamp, warehouse/storage bin, photos, manual grade, camera-assisted grade candidate, reviewer and QR/lot code. Support stock transfer, adjustment with reason, reservation, dispatch and spoilage/loss events.
4. Inventory ledger: append-only inventory_events plus derived available inventory. Use database transactions, idempotency keys and row locking/optimistic concurrency so concurrent orders cannot oversell. Add event/audit history UI.
5. Consumer portal: search/browse nearby available produce by crop, grade, price and warehouse; product/lot traceability view; cart, checkout, delivery/pickup slot, order tracking, mock payment provider and dispute request.
6. Bulk buyer marketplace: verified organisation onboarding, live-lot search, RFQ/negotiation request, reserve/buy lots, delivery scheduling, invoices and order tracking.
7. Logistics: clustered pickup requests, route/assignment records, statuses, driver/proof-of-delivery abstraction, map provider interface with mocked local implementation.
8. Pricing insights: a transparent, rule-based baseline using demand, supply, historical price, trend, quality grade, inventory, season and stock age. Return suggested range, factors, input timestamps, freshness, confidence and disclaimers. Persist model/version/feature snapshot. Do not call it a guarantee; do not automate sales or make financial/credit decisions. Make MSP/policy rules configurable through admin settings.
9. Grading: upload image safely, create asynchronous grading candidate with confidence and detected attributes; require human warehouse confirmation or override with reason. For the demo, use deterministic mock image-analysis rules rather than a hidden external model. Protect originals and do not train on images.
10. Multilingual/voice: English and Hindi UI dictionaries, architecture for additional Indian languages, plain-language UI. Create a telephony/IVR adapter with a sandbox/mock implementation for intents: price insight, stock status, pickup request and human-support handoff. Require OTP/PIN confirmation before personal data; do not let voice make irreversible transactions.
11. ONDC/finance: create clean adapter interfaces and sandbox/mock adapters. ONDC remains "ONDC-ready", not certified. Finance/e-NWR workflow may collect explicit consent, run preliminary eligibility checks and submit/track a partner case; it must never issue e-NWR, approve credit, promise a loan or claim WDRA compliance. Make real provider adapters environment-configured and disabled by default.
12. Admin/operations: user and warehouse verification, crop/catalogue management, pricing policy config, orders/disputes, alerts, analytics dashboard (inventory age, wastage, fulfillment, farmer sale choices, illustrative farmer/consumer benefit metrics) and audit-log viewer.

Security and reliability are mandatory:
- OWASP ASVS-inspired controls: Argon2 if passwords are ever used; HTTP-only secure SameSite cookies; CSRF protection for cookie auth; strict CORS/CSP/security headers; server-side input validation with Zod/class-validator; parameterized ORM queries; output encoding; rate limiting; request body limits; safe error messages.
- Validate file type by magic bytes, allow-list MIME/extensions, size limit, random filenames, private object storage, malware-scan hook, no public direct upload URLs without scoped signed access.
- Encrypt in transit; use managed encryption at rest in deployment; never log OTPs, tokens, PII, payment/finance data or secrets. Use .env.example only, secret manager in production, secret scanning and dependency auditing in CI.
- Signed webhooks with timestamp/replay defence and idempotency. Verify payment state server-side. Ensure all mutation endpoints accept idempotency keys where retries are expected.
- Audit authentication, role/permission changes, intake/stock corrections, grades, reservations, order/payment/finance status changes, consent and privileged configuration updates.
- Accessibility: keyboard navigation, labels, contrast, focus states, language switcher, loading/error/empty states.
- Privacy: data minimization, consent/version/timestamp storage, export/delete-request workflow, role-scoped PII, configurable retention policy.

Data model must include users, roles, organisations/FPOs, warehouses, storage locations, crops/varieties, farmer produce requests, lots, grades, inventory events, stock reservations, price observations/insights, orders/order items, RFQs, deliveries, finance cases/consents, notifications, documents, audit logs and integration events. Provide a realistic idempotent seed dataset for a Rajasthan pilot (tomato plus two other crops), but label all prices and insights as demo data.

Deliver:
1. A polished working UI with role-specific demo entry points and seed credentials documented in README.
2. REST API documented in OpenAPI and endpoint authorization tests.
3. Docker Compose for local web/api/postgres/redis/minio; `.env.example`; migration/seed commands.
4. Tests for ledger oversell prevention, authorization isolation, pricing disclaimer/freshness, finance-consent gating, grade override audit, file upload validation and signed webhook replay prevention.
5. CI that runs lint, typecheck, unit/integration tests, build, dependency audit and secret scan.
6. Infrastructure documentation for deploying web/API/workers to [AWS ap-south-1 or equivalent India region], managed Postgres, managed Redis, private object storage, secrets manager, CDN/WAF, observability, backups and rollback.

First inspect the generated repository. Then implement in small coherent commits/steps. Before declaring done, run the full test suite, fix failures, and provide: architecture summary, exact local run commands, demo URLs/credentials, test results, unresolved external integration prerequisites, and a short security review. Do not invent external credentials, regulatory approvals, live price data, ONDC certification, lender approval or e-NWR issuance.
```

## 6. Deployment guide

### Target topology

For an India pilot, deploy in an India region such as AWS `ap-south-1` (or a comparable Indian-region provider), subject to data residency and partner requirements. Use a separate production account/project and at least staging + production environments.

| Layer | Recommended managed service pattern |
| --- | --- |
| Edge | DNS, CDN, TLS certificate, WAF, rate limits and bot rules. |
| Web/API/worker | Containers on ECS Fargate, Cloud Run equivalent, or Kubernetes only if the team already operates it. Separate API and worker processes. |
| Database | Managed PostgreSQL with private networking, automated backups, point-in-time recovery and multi-AZ for production. |
| Cache/queue | Managed Redis with TLS and restricted network access. |
| Media/documents | Private S3-compatible bucket, encryption, lifecycle policies, versioning, signed URLs, upload scanning queue. |
| Secrets | Managed secret store with workload identity; rotate provider keys. |
| Observability | Centralized structured logs with PII redaction, metrics, traces, uptime checks, error tracking and alert routing. |

### Release sequence

1. Establish domains: `app`, `api`, `staging`, and a non-public admin/ops access path. Enforce HTTPS and HSTS.
2. Provision infrastructure as code (Terraform/CDK/Pulumi). Put database, Redis and object storage on private networks; expose only the load balancer/API gateway.
3. Create production secrets and environment configuration. Do not place any credential in repository files, CI logs or frontend environment variables.
4. Run database migrations as an explicit, logged deployment job; use backward-compatible expand/migrate/contract changes. Take a verified backup first.
5. Deploy to staging, run migrations, seed only non-production demo data, execute smoke and end-to-end tests including an authorization test.
6. Run a controlled production rollout (canary/blue-green where available), monitor error rate, queue depth, database health and purchase/reservation failures, then promote.
7. Roll back application version if needed; do not blindly roll back database schema. Use tested forward fixes or a compatible migration plan.

### CI/CD gates

On every pull request: format/lint, typecheck, unit tests, integration tests with ephemeral database, build, dependency/SBOM/vulnerability scan, secret scan and infrastructure lint/plan. Before production: reviewed change, migration plan, test evidence, backup/restore confirmation, security review for authentication/payment/finance/integration changes, and named on-call owner.

### Operations runbook essentials

- Test restore of database and documents quarterly; set RPO/RTO targets before launch.
- Alert on error spikes, auth abuse, unusual price/config changes, negative inventory invariant violations, failed webhooks, queue lag, worker failure, storage scanning failures and backup failures.
- Reconcile payment/order/inventory events daily; isolate mismatches for human review.
- Maintain incident response, user-support escalation, vulnerability patching and partner-outage procedures.
- Start live integrations only after their own onboarding, contractual, legal, security and certification requirements are met. Keep sandbox and production keys segregated.

## 7. Decisions needed before a real production launch

1. Pilot geography, first crops, warehouse/FPO operating partner and fulfillment coverage.
2. The actual legal entity, marketplace terms, payment/settlement flow and tax/invoicing model.
3. Which languages, telephony provider, market-data source, payment provider and mapping/logistics provider will be used.
4. Whether the warehouse/partner is eligible for the intended e-NWR and finance workflow; responsible compliance owner and lender partner.
5. ONDC participant role and onboarding plan. "ONDC-ready" in the first release should mean adapter/sandbox readiness only.
6. Data retention, privacy notices, grievance officer/support process and incident-response ownership.

## 8. Source fidelity notes

The PDF explicitly proposes public aggregation, warehouse intake, live stock, AI market insight, consumer and bulk sales, camera-assisted grading, multilingual toll-free voice access, ONDC/finance partner APIs and an e-NWR-compatible workflow. It also emphasizes farmer choice, warehouse aggregation rather than another profit-seeking intermediary, and stock-age/spoilage awareness. The detailed software architecture, security controls, test plan, delivery phases and cloud topology in this brief are recommended implementation decisions needed to make those ideas safe and deployable.
