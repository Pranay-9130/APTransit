# v3 context: everything the next dev needs

Read this whole file once before any v3 phase. It explains what the owner asked for, what was built, where it lives, what was assumed, and what is still open. The phase files (`phase-1-shell.md` to `phase-4-passes.md`) assume you know this.

---

## 1. Where we are

| Item | State |
| --- | --- |
| v3 code | On `main`, merged in PR #9 (`Add v3 citizen features and Google sign in`) on top of v2 P1 to P4 (minimal UI, states, boarding record, pass catalog) |
| Decisions | D-042 (v3 citizen features) and D-043 (Sign in with Google) in `progress/decisions-log.md` |
| Docs | Updated in PR #9: 01, 02, 05, 06, 07, 09, 11, 12, 15, 18, 19 |
| Checks at merge | Typecheck, lint, dashes, i18n, endpoints, classes, `next build` green. Tests: API 484 (6 database tests skipped), shared 129, ui 106, web 44. Migrations and seed run on a fresh database |
| Not done | New tests for v3 behaviour, the full E2E suite, real browser and phone checks, Google client id, Telugu review, owner sign off of assumed values |

The remaining work is mostly tests, checks and the fixes they reveal. It is split into four phases in this folder.

---

## 2. What the owner asked for

The product owner sent this feedback (mixed English, Telugu and Hindi). The English meaning is in the second column.

| # | Owner's words | Meaning |
| --- | --- | --- |
| 1 | "Kurnool to orvakal rakhe toh other buses shouldn't be shown" | Searching Kurnool to Orvakal must not list unrelated buses (the express that passes through) |
| 2 | "Village ki taggatuga bus choopiyaali" | Show the buses that suit the village (village services) |
| 3 | "We should modify UI UX" | Refresh the look and the flow |
| 4 | "We should get to and from like Google Maps (2 search bars, from and to)" | Two bars, From and To, like Google Maps |
| 5 | "Google Maps ke waisa map aana instead of user entering location manually" | A map to pick places on, instead of only typing |
| 6 | "Ticket should cover one zone (in a district)" | Zone tickets valid inside one district |
| 7 | "Monthly ticket, daily ticket, etc" | Day and monthly passes |
| 8 | "Terms and conditions, account, etc should be added" | A terms page and a fuller account page |
| 9 | "App should be implemented for long journeys also" | Long, overnight journeys |
| 10 | "We should mention single tickets also" | Single tickets stated clearly |
| 11 | "Ey stage paina enta mandi ekkinaaru, we should have the data" | How many people boarded at each stage (stop): we need that data |
| 12 | "QR code should expire in 2 to 3 seconds to avoid duplication" | QR must change every 2 to 3 seconds so screenshots are useless |
| 13 | "For children, they can board with card and the message will go to their parents" | Child cards: a message to the parent when the child boards |
| 14 | "Group tickets should also be there (adults, children with ages, etc)" | Group tickets with each person's age |
| 15 | Lead dev's request | Light blue and white look, a moving bus animation on opening, login first, Sign in with Google |

---

## 3. What was built, item by item

| # | Built | Where (main files) | Decision, doc |
| --- | --- | --- | --- |
| 1, 2 | **Service fit**: if the from or the to stop is a village stop (no bus stand), search lists only village services (`VILLAGE_SERVICE_TYPES`: Pallevelugu, Ultra Pallevelugu, City Ordinary, Metro Express) when at least one runs; otherwise every service, so an express only village is not left empty | `villageFit` in `apps/api/src/modules/network/network.service.ts`; `villageEnd` column in `NetworkRepository.tripRows`; `VILLAGE_SERVICE_TYPES` in `packages/shared/src/enums.ts` | D-042, docs/07 section 7b |
| 3, 15 | **Light blue and white theme** (token values only; every token name kept, AA contrast test passes) | `packages/ui/src/tokens.css`, `packages/ui/src/tokens.test.ts` | D-042, docs/09 |
| 15 | **Bus opening animation** on every full page load: CSS only, server rendered, `aria-hidden`, never blocks clicks, short under reduced motion | `apps/web/components/bus-splash.tsx`, mounted in `apps/web/app/layout.tsx`; utilities `animate-bus-drive`, `animate-wheel-spin`, `animate-road-slide`, `animate-splash-out`, token `--dur-splash` | D-042, docs/09 "Opening animation" |
| 15 | **Login first**: `/` needs a session; search, track and timetable stay public | `"/"` in `PROTECTED_PREFIXES`, `apps/web/proxy.ts` | D-042, docs/11 |
| 15 | **Sign in with Google** | See section 5 | D-043, docs/12, docs/15 |
| 4, 5 | **Google Maps style home**: From and To bars, swap, date, Search; "Pick on the map" (every stop is a dot, tap one, then "Set as from" or "Set as to"); "Use my location" (nearest stop as From); a keyboard list of nearby stops (the map is hidden from screen readers) | `apps/web/app/(citizen)/map-picker.tsx`, `home-search.tsx`; `MapView` gained `onMarkerClick`, `tone` on markers and `className`; `GET /places/nearby` (`nearbyPlaces`, `haversineKm`); `PlaceDto` gained optional `lat`, `lng` | D-042, docs/06, docs/11 |
| 6 | **Zone passes**: Zone Day (60 rupees) and Zone Monthly (900 rupees), village and city ordinary services, valid only inside the district picked at purchase; a scan elsewhere returns `SERVICE_NOT_ELIGIBLE` | `pass_types.zoneScoped`, `passes.zoneDistrictId`; `PassesService.create`; zone check in `apps/api/src/modules/conductor/validate.service.ts`; seed pass types in `apps/api/prisma/seed.ts` | D-042, docs/07 section 8 |
| 7 | **Day and monthly passes** already existed from v2 P4 (D-036: Day, Weekly, Monthly, Family, School, Annual, Free travel). The zone passes reuse the `DAY` and `MONTHLY` kinds | D-036 files | D-036 |
| 8 | **Terms page** `/terms` (9 plain language sections) and account links (my passes, buy a pass or child card, help, terms) | `apps/web/app/(citizen)/terms/page.tsx`, `apps/web/app/(citizen)/account/account-view.tsx` | D-042, docs/11 |
| 9 | **Long journeys**: overnight route VJA-VSP-01 Vijayawada to Visakhapatnam (350 km, 07:00, 21:00 Garuda AC, 22:30) with new districts ELR and EGD and stops ELR, RJY, ANK; search shows arrivals on a later date as "06:15, next day" | `apps/api/prisma/seed-data.ts`; `apps/web/app/(citizen)/search/search-client.tsx` | D-042, docs/19 |
| 10 | **Single tickets** described in docs/07 section 7a and on `/terms` | docs/07, terms page | D-042 |
| 11 | **Passengers per stage** on the ops trip page: booked here, boarded (from the D-035 boarding record, so pass holders count at their stop), getting off; scans without a recorded stop shown as a total | `OpsService.tripProfile` (`stages`, `passBoardings`), `StageBoardingDto` in `packages/shared/src/schemas/ops.ts`, `apps/web/app/ops/trips/[id]/trip-detail-client.tsx` | D-042, docs/06 |
| 12 | **QR every 3 seconds** (was 30). The server accepts the previous, current and next step, so a code dies within about 6 to 9 seconds | `QR_PERIOD_SEC = 3` in `packages/shared/src/qr.ts`; `qr.periodSec` seed setting; admin policy form | D-042, docs/07 section 4 |
| 13 | **Child cards**: a parent buys any paid pass for a child under 18 (name and age); the conductor sees the child name; every VALID scan publishes `pass.child_boarded` and the parent gets `CHILD_BOARDED` (in app and email) with route and time | `passes.holderName`, `passes.holderAge`; `CHILD_CARD_MAX_AGE`; `validate.service.ts`; `notifications.subscriber.ts`; `apps/web/app/(citizen)/updates/updates-view.tsx` (icon) | D-042, docs/07 section 8 |
| 14 | **Group tickets with ages**: each passenger gives an age; under 12 pays 50 percent of the adult ticket (fare plus reservation fee, rounded to the rupee); the booking total is the sum; on confirmation each ticket gets its share by age | `groupFare`, `splitGroupTotal`, `passengerFarePaise`, `CHILD_MAX_AGE`, `CHILD_FARE_PERCENT` in `packages/shared/src/fare.ts`; `bookings.service.ts`; `booking-confirmation.service.ts`; booking details hint and review line | D-042, docs/07 section 7a |

Database: one additive migration, `apps/api/prisma/migrations/20261011000000_v3_passes_children` (`CHILD_BOARDED` notification type, `pass_types.zoneScoped`, `passes.zoneDistrictId`, `passes.holderName`, `passes.holderAge`).

New strings: `splash`, `terms`, `home.map`, `login.or`, `login.terms`, `login.googleFailed`, `account.more`, `account.links`, `passBuy.zone*`, `passBuy.child*`, `passBuy.forChild`, `passes.childCard`, `book.details.childHint`, `book.review.group`, `opsApp.stages`, `search.nextDay` in `apps/web/messages/en.json` and `te.json`; `CHILD_BOARDED` in `packages/shared/src/messages/*.json`.

---

## 4. Assumed values (owner must confirm)

These are **(A)** in docs/18. Never change them in code without the owner's answer; record the answer in docs/18 and D-042.

| Item | Value used | Where it lives |
| --- | --- | --- |
| Child age and fare | Under 12 pays 50 percent | `CHILD_MAX_AGE`, `CHILD_FARE_PERCENT` in `packages/shared/src/fare.ts` |
| Zone day and monthly prices | 60 and 900 rupees | `apps/api/prisma/seed.ts` (admins can change at `/admin/policies/pass-types`) |
| Child card age limit | Under 18 | `CHILD_CARD_MAX_AGE` in `packages/shared/src/schemas/passes.ts` |
| QR period | 3 s, one step either side | `QR_PERIOD_SEC` in `packages/shared/src/qr.ts`, `qr.periodSec` setting |
| Service fit | Village stop lists village services when any exist | `villageFit` |

---

## 5. Sign in with Google (D-043)

- Web: `apps/web/components/google-sign-in.tsx` loads Google Identity Services (`https://accounts.google.com/gsi/client`) only when `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set, renders the official button in popup mode, and posts the ID token to the API. Used above the email and phone tabs in `apps/web/app/(auth)/login/login-form.tsx`.
- API: `POST /auth/google { credential }` (public, 10 per IP per minute). `AuthService.googleSignIn` asks Google tokeninfo (`https://oauth2.googleapis.com/tokeninfo`), then checks `aud` equals `GOOGLE_CLIENT_ID`, issuer, expiry and `email_verified`. It finds the user by email or creates a CITIZEN, then calls the same `signIn()` as OTP (refresh cookie, `auth.login` audit with `method: google`). No new dependency.
- Env: `GOOGLE_CLIENT_ID` (api, optional, must end with `.apps.googleusercontent.com`) and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (web, same value, read at build time). Unset: no button, the endpoint answers 403.
- CSP (`apps/web/lib/csp.ts`): script `https://accounts.google.com/gsi/client`, style `/gsi/style`, connect and frame `/gsi/`.
- Setup steps for the OAuth client: docs/15 "Google sign in setup".

---

## 6. Run it locally

```bash
git checkout main && git pull
pnpm install
pnpm --filter api exec prisma generate
```

Database and Redis, either:

- Docker (as in the Day 15 log): Postgres 16 on 5432, Redis 7 on 6379, or
- No Docker (what v3 was tested with):
  ```bash
  # in a scratch folder outside the repo
  npx -y @electric-sql/pglite-socket@latest --db=./data --port=5432 --host=127.0.0.1 --max-connections=1
  # in the repo, another terminal
  REDIS_LISTEN=127.0.0.1:6379 node scripts/dev-redis.mjs
  ```

Then:

```bash
pnpm --filter api exec prisma migrate deploy
pnpm db:seed
pnpm dev          # web :3000, api :4000
```

`apps/api/.env` needs `OTP_DEV_ECHO=1` and `PAYMENTS_FAKE=1` locally: the login page then shows the code, and payments are faked. Add `GOOGLE_CLIENT_ID` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` only after the OAuth client exists.

Quick smoke test of the v3 search rule against the running API:

```bash
K=$(curl -s "localhost:4000/api/v1/places/search?q=Kurnool" | node -pe "JSON.parse(require('fs').readFileSync(0))[0].id")
O=$(curl -s "localhost:4000/api/v1/places/search?q=Orvakal" | node -pe "JSON.parse(require('fs').readFileSync(0))[0].id")
D=$(node -pe "new Date(Date.now()+86400000+19800000).toISOString().slice(0,10)")
curl -s "localhost:4000/api/v1/search/trips?from=$K&to=$O&date=$D" | node -pe "[...new Set(JSON.parse(require('fs').readFileSync(0)).map(t=>t.serviceType))]"
# expected: only PALLEVELUGU and ULTRA_PALLEVELUGU
```

---

## 7. Gotchas met during v3

| Symptom | Cause | Fix |
| --- | --- | --- |
| CI fails "Relative import paths need explicit file extensions" in `packages/shared` | A test used `await import("./fare")`; the shared package typechecks with `nodenext` | Static imports only. Run `pnpm typecheck` at the root before every PR, not only per package |
| `tokens.test.ts` cannot parse the tokens | A script on Windows wrote CRLF line endings | Write files with LF |
| Map shows dots but no streets in Playwright | Headless Chromium has no GPU for MapLibre tiles | Check tiles by hand in a real browser |
| `pnpm test` fails a ui test once under load | All packages run in parallel on a slow laptop | Rerun the package alone; `--maxWorkers=2` for the API |
| PGlite crashes during seed | Old `pglite-socket` version | `@latest` with `--max-connections=1` |
| E2E opening `/` lands on `/login` | Login first (D-042) | Call `login()` from `e2e/helpers.ts` before `page.goto("/")` (E2E-1 and a11y already do) |
| Google button missing | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` empty, or the web was not rebuilt | Set it and rebuild or restart |
| Fork PR gets no review notification | Fork PRs do not notify the owner by default | Mention `@syedmukheeth` in a PR comment |

---

## 8. How the phases fit together

| Phase | File | Branch | Owner | Depends on |
| --- | --- | --- | --- | --- |
| 1 Look and app shell | `phase-1-shell.md` | `a/v3-p1-shell` | Dev A | nothing |
| 2 Sign in with Google | `phase-2-google.md` | `b/v3-p2-google` | Dev B, plus a human for the OAuth client | nothing |
| 3 Map home and search | `phase-3-map.md` | `a/v3-p3-map` | Dev A (web), Dev B (database test) | Phase 1 merged (E2E login helper use) |
| 4 Tickets and passes | `phase-4-passes.md` | `b/v3-p4-passes` | Dev B (API), Dev A (E2E) | nothing |

Phases 1, 2 and 4 can run in parallel. Tasks only a person can do are collected in `human-tasks.md`.
