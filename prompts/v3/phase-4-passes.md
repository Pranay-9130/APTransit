# v3 Phase 4 · Tickets and passes

**Owner:** Dev B (API tests and fixes), Dev A (E2E). **Branch:** `b/v3-p4-passes`. **PR title:** `Test group fares, zone passes and child cards`.
**Goal:** group tickets with child fares, zone passes, child cards, the 3 second QR and passengers per stage are correct from purchase to scan to report.

## Read first

- `AGENTS.md`, `progress/handoff.md`
- `prompts/v3/00-context.md` sections 1, 2 (items 6, 7, 10 to 14), 3, 4, 6, 7
- `docs/07-ticket-and-pass-rules.md` sections 4 (QR), 5 (scan order), 7a (group tickets), 8 (passes, zone, child cards)
- `docs/05-data-model.md` (`pass_types`, `passes`, `ticket_scans`), `docs/06-api-contract.md` (`POST /passes`, `POST /tickets/validate`, `GET /ops/trips/:id`, "v3 additive fields")
- `docs/18-open-decisions.md` "v3 values to confirm"
- `apps/api/README.md`, `packages/shared/README.md`

## Already built (do not rebuild)

- Fares: `packages/shared/src/fare.ts`: `CHILD_MAX_AGE` 12, `CHILD_FARE_PERCENT` 50, `passengerCategory`, `passengerFarePaise`, `groupFare`, `splitGroupTotal` (unit test in `fare.test.ts`). Used in `apps/api/src/modules/bookings/bookings.service.ts` (booking total) and `apps/api/src/modules/payments/booking-confirmation.service.ts` (each ticket's `farePaise`).
- Passes: `CreatePassInput` accepts `zoneDistrictId` and `child: { name, age }` (`CHILD_CARD_MAX_AGE` 18) next to the D-036 `homeStopId` and `destStopId`. `PassesService.create` requires and checks the district for `zoneScoped` types, stores `holderName` and `holderAge`; free travel ignores `child`. One active pass per kind per holder (`holderName` is part of the check in `activate`).
- Scans: `apps/api/src/modules/conductor/validate.service.ts`: `serviceEligible` is false when `pass.zoneDistrictId` differs from `ctx.districtId`; a VALID child card scan sets `childBoarded` and publishes `pass.child_boarded`; the scanner shows the child name. `apps/api/src/modules/notifications/notifications.subscriber.ts` sends `CHILD_BOARDED` to the parent (params `child`, `routeEn`, `routeTe`, `departureAt`).
- QR: `QR_PERIOD_SEC = 3` in `packages/shared/src/qr.ts`; `QrService.verifyCode` accepts steps current minus 1 to current plus 1.
- Stages: `OpsService.tripProfile` returns `stages` (booked from tickets, boarded from VALID scans grouped by `stopId`, alighting from tickets) and `passBoardings` (VALID scans with no `stopId`).
- Web: `apps/web/app/(citizen)/passes/buy/buy-view.tsx` (child card and zone district options above the list), `passes-view.tsx` (child card line), booking details age hint and review group line, ops trip "Passengers per stage" table, updates icon.
- Seed: Zone Day Pass (6000 paise, DAY, UNTIL_DAY_END) and Zone Monthly Pass (90000 paise, MONTHLY), `zoneScoped`, village services, sort orders 8 and 9.

## Tasks

1. API tests (Dev B). Extend `apps/api/test/gift-passes.test.ts` (it already fakes pass types, payments and passes) or add `apps/api/test/v3-passes.test.ts` with the same setup:
   - `POST /passes` for a zone type without `zoneDistrictId`: 400 `VALIDATION_FAILED`; with an unknown district id: 400; with a valid one: 201 and `zoneDistrictId` in the body.
   - `POST /passes` with `child: { name: "Anu", age: 18 }`: 400; with age 9: 201, `holderName` "Anu" and `holderAge` 9 in the body.
   - Two child cards of the same kind for two different children can both be activated; a second one for the same child is refused with `PASS_ALREADY_ACTIVE`.
2. Scan tests (Dev B), next to the existing ones in `apps/api/test/day12-validation.test.ts`:
   - Zone pass for the Kurnool district on a Kurnool depot route: VALID. On a route of another district: INVALID `SERVICE_NOT_ELIGIBLE`.
   - VALID scan of a child card: one `CHILD_BOARDED` notification for the parent, with `child` "Anu" and the route names. INVALID scan: none.
   - The scan result `ticket.passengerName` is the child's name, not the parent's.
3. Booking test (Dev B) in `apps/api/test/trips-bookings.test.ts` and `apps/api/test/payments.test.ts`: passengers aged 35, 33, 8 and 4. The booking `totalPaise` equals `groupFare(adult, ages).totalPaise`; after payment confirmation the four tickets' `farePaise` add up to the total, and each child ticket is half an adult ticket give or take one rupee.
4. Ops test (Dev B) in `apps/api/test/day13-ops.test.ts`: `GET /ops/trips/:id` returns one `stages` row per route stop in `seq` order; `boarded` equals the VALID scans with that `stopId`; VALID scans with no stop count in `passBoardings`; INVALID scans count nowhere.
5. E2E (Dev A):
   - Group booking: extend `E2E-2-book-and-pay.spec.ts` or add `v3-group-booking.spec.ts`. Book 2 adults and 1 child aged 8; the review shows "2 adults and 1 child" and the child fare.
   - Passes: extend `E2E-6-weekly-pass.spec.ts` or add `v3-passes.spec.ts`. Buy a Zone Day Pass for Kurnool district; then tick "This pass is for my child", enter "Anu" and 9, buy a Weekly Pass; `/passes` shows "Child card for Anu, age 9".
   - Conductor: extend `E2E-8-conductor.spec.ts`. Scanning the child card shows "Anu"; the parent's `/updates` shows "Anu boarded the bus".
6. Fix any bug the tests find. Do not touch the **(A)** values (`CHILD_MAX_AGE`, `CHILD_FARE_PERCENT`, zone prices, `CHILD_CARD_MAX_AGE`, `QR_PERIOD_SEC`): they wait for the owner (`human-tasks.md`).

## Prompt (paste after `prompts/_shared/context-preamble.md`)

```text
Today: v3 Phase 4, tickets and passes.

Read first: AGENTS.md, progress/handoff.md, prompts/v3/00-context.md (sections 1 to 4, 6, 7), prompts/v3/phase-4-passes.md, docs/07-ticket-and-pass-rules.md sections 4, 5, 7a and 8, docs/05-data-model.md (pass_types, passes, ticket_scans), docs/06-api-contract.md (POST /passes, POST /tickets/validate, GET /ops/trips/:id, "v3 additive fields"), docs/18-open-decisions.md "v3 values to confirm", apps/api/README.md, packages/shared/README.md.

The features are already built and merged (PR #9, decision D-042). Do not rebuild them.

On a new branch b/v3-p4-passes from main:
1. Write the API tests in tasks 1 to 4 of phase-4-passes.md, reusing the fakes and setup in apps/api/test (memory-prisma.ts, fake-redis.ts, and the existing pass, validation, booking, payment and ops tests).
2. Write or extend the E2E specs in task 5.
3. Fix any bug the tests find in the passes, validate, booking, booking confirmation, notifications or ops code.
Never change CHILD_MAX_AGE, CHILD_FARE_PERCENT, the zone pass prices, CHILD_CARD_MAX_AGE or QR_PERIOD_SEC: those wait for the owner.

Before the PR run: pnpm check:dashes, pnpm i18n:check, pnpm turbo lint, pnpm typecheck (at the root), pnpm test, pnpm build, node scripts/check-endpoints.cjs, and the new or extended E2E specs on Desktop Chrome and Pixel 7 against a seeded database (E2E_PAYMENTS_FAKE=1, --workers=1).
Show me your plan first and wait for my OK.
```

## Done when

- [ ] Every test in tasks 1 to 5 passes.
- [ ] QR field test done and recorded (`human-tasks.md`).
- [ ] Owner confirmed or changed the (A) values, recorded in docs/18 and D-042 (`human-tasks.md`).
- [ ] All "Before the PR" checks green; PR opened and the other dev mentioned.
