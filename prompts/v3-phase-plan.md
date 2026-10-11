# AP TransitOS v3 · Finish and verify the owner feedback round

**Who this is for:** the dev, or the dev's AI coding agent, completing v3.
**State:** the v3 code is on `main` (PR #9, decisions D-042 and D-043). It builds, typechecks, lints, and the unit tests pass. What is missing is test coverage, end to end checks, real world checks, and fixes for whatever those checks find.
**Goal:** take each of the four phases below from "code merged" to "signed off".

Work phase by phase, in order. Each phase has: the goal, what already exists, the tasks, a copy paste prompt for your AI agent, and a "Done when" list. One branch and one PR per phase.

---

## 0. Before you start

**Read first (in this order):** `AGENTS.md`, `progress/handoff.md`, decisions D-042 and D-043 in `progress/decisions-log.md`, `docs/07-ticket-and-pass-rules.md` sections 4, 7a, 7b and 8, and the README of every package you touch.

**Setup**

```bash
git checkout main
git pull
pnpm install
pnpm --filter api exec prisma generate
pnpm typecheck
```

**Local database without Docker:** see `progress/handoff.md` gotchas. In short: `npx -y @electric-sql/pglite-socket@latest --db=./data --port=5432 --host=127.0.0.1 --max-connections=1` in a scratch folder, `node scripts/dev-redis.mjs` with `REDIS_LISTEN=127.0.0.1:6379`, then `pnpm --filter api exec prisma migrate deploy` and `pnpm db:seed`.

**Rules that bite (full list in AGENTS.md)**

1. No em dash or en dash anywhere. `pnpm check:dashes`.
2. Every visible string in both `apps/web/messages/en.json` and `te.json`, same commit. `pnpm i18n:check`.
3. Tokens only: no raw hex, no arbitrary values, no inline styles. `pnpm check:classes` after a web build.
4. Business rules are not invented. The child fare, zone prices, child card age and QR period are **(A)** assumptions in docs/18. Do not change them without the owner.
5. No new dependency. This plan needs none.
6. Commits: title only, imperative, under 60 characters, no AI attribution lines.
7. On Windows, write files with LF line endings (CRLF breaks `tokens.test.ts`).

**Before every PR (the CI steps, in this order)**

```bash
pnpm check:dashes && pnpm i18n:check && pnpm turbo lint && pnpm typecheck && pnpm test && pnpm build
node scripts/check-endpoints.cjs && node scripts/check-classes.cjs
```

Run `pnpm typecheck` at the root, not only per package: the shared package has its own stricter typecheck (PR #9 failed CI on it once). If `pnpm test` times out on a slow laptop, rerun the failing package alone, or use `pnpm exec vitest run --maxWorkers=2` in `apps/api`.

---

## Phase 1 · Look and app shell

**Goal:** the light blue theme, the bus opening animation, login first and the terms page work for every user, on every screen size, with assistive tech.

**Already built**

- Tokens: `packages/ui/src/tokens.css` (colours, `animate-bus-drive`, `animate-wheel-spin`, `animate-road-slide`, `animate-splash-out`, `--dur-splash`). Contrast test: `packages/ui/src/tokens.test.ts`.
- Splash: `apps/web/components/bus-splash.tsx`, mounted in `apps/web/app/layout.tsx`.
- Login first: `"/"` in `PROTECTED_PREFIXES` in `apps/web/proxy.ts`; test in `apps/web/proxy.test.ts`.
- `/terms`: `apps/web/app/(citizen)/terms/page.tsx`. Account links: `apps/web/app/(citizen)/account/account-view.tsx`.

**Tasks**

1. Add E2E spec `apps/web/e2e/v3-shell.spec.ts`:
   - Logged out, `/` redirects to `/login?next=%2F`; after `login()` from `e2e/helpers.ts` it lands on `/`.
   - The splash (`data-testid="bus-splash"`) is in the DOM on first load and has `aria-hidden="true"`; the login button is clickable within 500 ms of load (the splash must never block input).
   - With `page.emulateMedia({ reducedMotion: "reduce" })` the splash is gone (computed `visibility: hidden`) within 1 s.
   - `/terms` renders 9 section headings, in English and in Telugu (`button[lang="te"]` switch, as in E2E-12).
2. Add `/terms` to the route sweep (`apps/web/e2e/route-sweep.spec.ts`) and the axe check (`apps/web/e2e/a11y.spec.ts`).
3. Run the whole route sweep at 360, 768 and 1280 px. Fix any screen where the new colours drop below AA, or where a light blue surface hides a border (use `border-strong` for inputs).
4. Dark mode: open home, login, terms and account with `data-theme="dark"`. The dark tokens keep the v2 dark palette with a sky blue primary; fix contrast if `tokens.test.ts` or axe complains.

**Prompt for your AI agent**

> Read AGENTS.md, progress/handoff.md, prompts/v3-phase-plan.md (Phase 1) and decision D-042. On a new branch `a/v3-p1-shell` from main: add the E2E spec `apps/web/e2e/v3-shell.spec.ts` exactly as Phase 1 task 1 describes, using the helpers in `apps/web/e2e/helpers.ts`. Add `/terms` to the route sweep and the axe spec. Run the route sweep at 360, 768 and 1280 px in English and Telugu, and fix any contrast, overflow or focus problem it finds using tokens only. Do not change token names or business rules. Run the full "Before every PR" list, then open a PR titled "Verify v3 shell, splash and login first".

**Done when**

- [ ] `v3-shell.spec.ts` passes on Desktop Chrome and Pixel 7.
- [ ] Route sweep and axe pass, including `/terms`, in both languages and all three widths.
- [ ] Splash never blocks a click; reduced motion hides it within 1 s.
- [ ] Dark mode checked on home, login, terms and account.

---

## Phase 2 · Sign in with Google

**Goal:** a citizen can sign in with Google on local, staging and production, safely.

**Already built**

- Web: `apps/web/components/google-sign-in.tsx` (loads Google Identity Services only when `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set), used in `apps/web/app/(auth)/login/login-form.tsx`. CSP entries in `apps/web/lib/csp.ts`.
- API: `POST /auth/google` in `apps/api/src/modules/auth/auth.controller.ts`; `AuthService.googleSignIn` checks the token with Google tokeninfo, then aud, issuer, expiry and `email_verified`, and shares `signIn()` with OTP. Env `GOOGLE_CLIENT_ID` (optional) in `apps/api/src/config/env.ts`.
- Test: `apps/api/test/auth.test.ts` covers 400 (bad body) and 403 (not set up) only.
- Setup steps: docs/15 "Google sign in setup".

**Tasks**

1. Unit tests for `googleSignIn` (new file `apps/api/src/modules/auth/google-sign-in.test.ts`). Stub `globalThis.fetch` with `vi.stubGlobal`; never call Google in tests. Cases:
   - Valid claims: creates a CITIZEN user with the email and name, returns tokens, writes `auth.login` audit with `after: { method: "google" }`.
   - Existing user with the same email (made by OTP): signs into that user, does not create a second.
   - `aud` is another client id: 401 `UNAUTHENTICATED`.
   - `email_verified` false, wrong `iss`, or `exp` in the past: 401.
   - tokeninfo answers 400, or the fetch throws or times out: 401 (never 500).
   - A deleted user (`deletedAt` set): 403 `FORBIDDEN`.
   - Email in mixed case is stored lower case.
2. The human (not the agent) creates the OAuth client (docs/15 steps 1 to 3) and sets `GOOGLE_CLIENT_ID` in `apps/api/.env`, Render, and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in `apps/web/.env.local` and Vercel. Redeploy the web: the value is read at build time.
3. Manual check on localhost and staging: new Google account, existing OTP account with the same email, and the browser console has no CSP errors on `/login`.
4. If the console shows a CSP error, add only the exact Google origin it names to `GOOGLE` in `apps/web/lib/csp.ts` and update the CSP expectation in `apps/web/proxy.test.ts`.

**Prompt for your AI agent**

> Read AGENTS.md, progress/handoff.md, prompts/v3-phase-plan.md (Phase 2), decision D-043 and docs/12 "Sign in with Google". On a new branch `a/v3-p2-google` from main: write `apps/api/src/modules/auth/google-sign-in.test.ts` covering every case in Phase 2 task 1. Build `AuthService` the way `apps/api/test/auth.test.ts` does (or construct it with fakes), and stub fetch with `vi.stubGlobal`; never reach Google. If a case fails, fix `AuthService.googleSignIn` so it answers 401 for every bad token and never 500. Do not add dependencies. Run the full "Before every PR" list, then open a PR titled "Test Google sign in token checks".

**Done when**

- [ ] All Phase 2 task 1 cases pass.
- [ ] Google sign in works on localhost and staging (new account and existing account).
- [ ] No CSP errors on `/login`; the button is hidden when the env vars are empty.

---

## Phase 3 · Map home and search

**Goal:** passengers pick From and To like Google Maps, and village journeys show village buses.

**Already built**

- Web: `apps/web/app/(citizen)/map-picker.tsx` (dynamic MapView, tap a dot for "Set as from" or "Set as to", "Use my location", keyboard list), used in `home-search.tsx`. "Next day" arrivals in `search/search-client.tsx`.
- UI: `packages/ui/src/components/map-view.tsx` has `onMarkerClick`, toned markers and `className`.
- API: `GET /places/nearby` (`NetworkService.nearbyPlaces`, `haversineKm`); `villageFit` in `network.service.ts` with unit tests; `villageEnd` column in `NetworkRepository.tripRows`.
- Seed: districts ELR and EGD; stops ELR, RJY, ANK; route VJA-VSP-01 with 21:00 and 22:30 night departures.

**Tasks**

1. Database test for the SQL `villageEnd` column (it only runs against Postgres): add to `apps/api/test/network.int.test.ts` (skipped without `TEST_DATABASE_URL`, like the others): Kurnool Bus Stand to Orvakal returns only `VILLAGE_SERVICE_TYPES`; Kurnool to Vijayawada still includes EXPRESS.
2. E2E spec `apps/web/e2e/v3-map-home.spec.ts` (logged in via `login()`):
   - The "Stops near you (list)" details opens; pressing "From" on a stop fills the From bar; same for "To"; Search goes to `/search` with both ids.
   - Mock geolocation (`context.grantPermissions(["geolocation"])`, `context.setGeolocation({ latitude: 15.67, longitude: 78.11 })`): "Use my location" fills From with Orvakal.
   - Denied geolocation shows the "could not find your location" alert.
   - Search Kurnool to Orvakal tomorrow: every trip card shows a village service name.
   - Search Vijayawada to Visakhapatnam tomorrow: the 21:00 trip arrival text contains "next day".
3. Manual check in a real browser (headless Chromium does not paint MapLibre tiles): street tiles show behind the dots on home; tapping a dot opens the chooser; the A and B pins move.
4. Accessibility: the map is `aria-hidden`; the list is the accessible path. Check with NVDA or TalkBack that the list buttons read as "From" and "To" with the stop name nearby. If they are ambiguous, add `aria-label` keys like `home.map.fromStop` ("From {stop}") in both languages.

**Prompt for your AI agent**

> Read AGENTS.md, progress/handoff.md, prompts/v3-phase-plan.md (Phase 3), decision D-042 and docs/07 section 7b. On a new branch `a/v3-p3-map` from main: add the database test in Phase 3 task 1 to `apps/api/test/network.int.test.ts`, and the E2E spec `apps/web/e2e/v3-map-home.spec.ts` covering every bullet in Phase 3 task 2, using Playwright geolocation mocks. If the list buttons are ambiguous for screen readers, add `aria-label` i18n keys in both languages (Phase 3 task 4). Fix any bug the tests find, keeping the service fit rule exactly as docs/07 section 7b states. Run the full "Before every PR" list, then open a PR titled "Test map home and village service fit".

**Done when**

- [ ] The database test passes against a seeded database.
- [ ] `v3-map-home.spec.ts` passes on Desktop Chrome and Pixel 7.
- [ ] Tiles, dot tapping and pins checked by a human in a real browser.
- [ ] The nearby list works with a screen reader.

---

## Phase 4 · Tickets and passes

**Goal:** group tickets with child fares, zone passes, child cards, the 3 second QR and per stage counts are correct end to end.

**Already built**

- Fares: `groupFare`, `splitGroupTotal`, `passengerFarePaise`, `CHILD_MAX_AGE` (12), `CHILD_FARE_PERCENT` (50) in `packages/shared/src/fare.ts`; used by `bookings.service.ts` (total) and `booking-confirmation.service.ts` (per ticket share).
- Passes: `zoneScoped` pass types, `zoneDistrictId`, `holderName`, `holderAge` on passes (migration `20261011000000_v3_passes_children`); `PassesService.create` checks the district; `CHILD_CARD_MAX_AGE` (18).
- Scans: `validate.service.ts` refuses a zone pass outside its district (`SERVICE_NOT_ELIGIBLE`) and publishes `pass.child_boarded`; `notifications.subscriber.ts` sends `CHILD_BOARDED`.
- QR: `QR_PERIOD_SEC = 3` in `packages/shared/src/qr.ts`; the server accepts the previous, current and next step.
- Stages: `OpsService.tripProfile` returns `stages` (booked, boarded from the boarding record, getting off) and `passBoardings` (scans with no stop); shown on `apps/web/app/ops/trips/[id]/trip-detail-client.tsx`.
- Web: pass buy (child card and zone district options), pass list (child card line), booking details hint and review group line.

**Tasks**

1. API tests (extend `apps/api/test/gift-passes.test.ts` and `apps/api/test/day12-validation.test.ts`, or add `apps/api/test/v3-passes.test.ts`):
   - `POST /passes` for a zone type without `zoneDistrictId`: 400; with an unknown district: 400; with a valid one: 201 and `zoneDistrictId` in the response.
   - `POST /passes` with `child: { name, age: 18 }`: 400; with age 9: 201, `holderName` and `holderAge` set.
   - Two child cards of the same kind for two different children can both be ACTIVE; two for the same child cannot.
   - Scan of a zone pass on a route of its district: VALID; of another district: `SERVICE_NOT_ELIGIBLE`.
   - VALID scan of a child card creates a `CHILD_BOARDED` notification for the parent with the child name and route; an INVALID scan creates none.
2. Booking test (`apps/api/test/trips-bookings.test.ts`): passengers aged 35, 33, 8 and 4: booking total = 2 adult fares + 2 child fares; after confirmation the four ticket `farePaise` add up to the total and each child share is about half an adult share.
3. Ops test: `GET /ops/trips/:id` returns one `stages` row per route stop in order; `boarded` matches VALID scans with that `stopId`; scans with no stop count in `passBoardings`.
4. E2E:
   - Extend E2E-2 (book and pay) or add `v3-group-booking.spec.ts`: book 2 adults and 1 child aged 8; the review shows "2 adults and 1 child" and the child fare.
   - Extend E2E-6 (weekly pass) or add `v3-passes.spec.ts`: buy a Zone Day Pass for Kurnool district, then a child card; the pass list shows "Child card for {name}".
   - Extend E2E-8 (conductor): scanning the child card shows the child name; the parent sees the update in `/updates`.
5. QR field test (human): on a low end Android phone and a slow network, the code changes every 3 s and the conductor scan still succeeds. If scans fail because of clock skew or latency, do not change the period yourself: log the result in `progress/decisions-log.md` under D-042 and ask the owner (docs/18).
6. Owner sign off of the **(A)** values in docs/18 (child age and fare, zone prices, child card age limit, QR period). Record the answer in docs/18 and D-042.

**Prompt for your AI agent**

> Read AGENTS.md, progress/handoff.md, prompts/v3-phase-plan.md (Phase 4), decision D-042 and docs/07 sections 4, 7a and 8. On a new branch `b/v3-p4-passes` from main: write the API tests in Phase 4 tasks 1 to 3 (use the fakes in `apps/api/test/memory-prisma.ts` and `fake-redis.ts` as the existing tests do), and the E2E coverage in task 4, extending the existing specs where they already set up the flow. Fix any bug the tests find in the passes, validate, booking confirmation or ops services. Never change the child age, fare percent, zone prices, child card age or QR period: those wait for the owner. Run the full "Before every PR" list, then open a PR titled "Test group fares, zone passes and child cards".

**Done when**

- [ ] Every test in tasks 1 to 4 passes.
- [ ] QR field test done and recorded.
- [ ] Owner confirmed or changed the (A) values, recorded in docs/18 and D-042.

---

## After all four phases

- [ ] Full `pnpm e2e` green on Desktop Chrome and Pixel 7 (one project at a time locally; see handoff for the OTP rate limit).
- [ ] Native Telugu review of every new key in `apps/web/messages/te.json` (search for `splash`, `terms`, `home.map`, `passBuy.zone`, `passBuy.child`, `opsApp.stages`, `search.nextDay`, `login.or`).
- [ ] TalkBack and NVDA pass on login, home, pass buy, booking review and ops trip page.
- [ ] `progress/handoff.md` "Current state" updated; daily log written; D-042 and D-043 status set to Accepted.
