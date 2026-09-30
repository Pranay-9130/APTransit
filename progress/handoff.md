# Handoff: current state of the repo

**Every AI session and every human starts here.** This is the living "where are we" file. The locked docs in `docs/` say what we are building. This file says what exists today, how it works, and what trips people up.

**Rule:** at the end of every day, the dev who merges last updates the "Current state" section below (it is part of the end of day report). If this file is stale, fix it before starting new work.

Read order for a new session:

1. `AGENTS.md` (hard rules)
2. This file
3. Today's `prompts/day-NN.md`
4. The docs that prompt lists under "Read first"
5. The README of every package you will touch (`apps/api`, `apps/web`, `packages/shared`, `packages/ui`)

---

## Current state (Day 4 built, 2026-09-30)

### Git

| Branch | Contains | Status |
| --- | --- | --- |
| `main` | Day 1 to Day 4 (Day 4 fast forwarded from `b/network-search` then `a/home-login`, no PR, at the owner's request) | Baseline |

**Day 5 starts from `main`.**

### Works today (verified 2026-09-30)

- `pnpm lint`, `pnpm i18n:check`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm check:dashes` pass on Windows (Node 22.20, pnpm 11.10).
- Tests: shared 91, api 108 (+6 database tests skipped without `TEST_DATABASE_URL`), ui 21, web 33, scripts 6.
- The 6 database tests (seed twice, health, real search SQL with p95 under 250 ms) passed against a local PGlite database, not Neon yet.
- Public network API: places search (English and Telugu, bus stands first), districts, bus stands, routes, timetable, trip search with fares from `fare.ts` and seats left. Kurnool to Vijayawada tomorrow gives the 6 docs/19 trips, Express Rs 541.
- Web, checked in the browser against the real API: home (combobox, swap, date chips and calendar, validation, form kept after Back), login (email OTP, paste, wrong code, resend timer), session kept after a full reload with one refresh call, `next` redirect, account (name, language saved to the account, theme, logout), 403 for a citizen on `/ops`, manager allowed. 360, 768, 1280 px, English and Telugu.

### Not done yet

| Item | Why | When |
| --- | --- | --- |
| Neon, Upstash, Razorpay test, Resend accounts, real `.env` files | Must be created by a human (docs/15) | Before deployment and e2e in CI |
| `TEST_DATABASE_URL` in CI | Needs the Neon test branch | CI setup |
| `/search` results page (home already links to it) | Scheduled | Day 5 (Dev A) |
| Ops and gov scope switcher with names | MeDto has only depot and district ids | Needs a small `/me` or scope endpoint, decide at sync |
| Short Telugu label for "Track bus" | D-015, needs a native speaker | Open |
| 403 state has no `h1` (EmptyState renders `h3`) | S3 polish | When EmptyState gets a heading level prop |
| Worker queues, seat holds | Scheduled | Day 5 (Dev B) |

### Decisions

All in `progress/decisions-log.md`. D-012 and D-016 are built as proposed, D-013 and D-014 unchanged, D-015 open, D-017 (web deps) and D-018 (network contract details, seed alignment) new. Review all at the Day 4 sync.

--- | --- | --- |
| `main` | Day 1 to Day 3 (PR #1 day-2, PR #2 day-3) plus the Day 3 review fixes (`bf95d63`, pushed directly at the owner's request; see `progress/daily-log.md`, "Day 03 review") | Baseline |

**Day 4 starts from `main`:** `a/home-login` (Dev A), `b/network-search` (Dev B). Agree D-016 first (the web route guard cannot see `apt_rt`).

### Works today (verified 2026-09-27)

- `pnpm install`, `pnpm lint` (includes `check:dashes`), `pnpm i18n:check`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm audit --prod --audit-level high` all pass on Windows with Node 22.20 and pnpm 11.10.
- Tests: shared 47, api 56 (+2 Neon tests skipped without `TEST_DATABASE_URL`), ui 10, scripts 6.
- `apps/api` auth: OTP request and verify (atomic consume and attempts, 5 attempts then 15 min lock, lock also enforced from the DB when Redis is down), refresh rotation with atomic claim and reuse detection, logout revokes the family, `/me` and `PATCH /me`, soft deleted users refused. Refresh cookie per docs/06 (Secure outside local development), cleared on a failed refresh.
- `apps/api` platform: global `JwtAuthGuard` (`@Public`, `@Can`), global throttler (120 per user or IP per minute, Redis, `@Throttle` per route, fails open), `RateLimitService` for the OTP target limits, `@Audit(action)` through `AuditInterceptor`, `ScopeService`. OTP codes reach the log only when APP_ENV is development.
- `apps/web`: six shells render in English and Telugu, light and dark, at 360, 768 and 1280 px with no horizontal scroll (checked in the browser). Skip link, header, nav and main landmarks, 44 px targets, visible focus. Theme and locale from cookies without a flash. `/design` gallery (development only), 404 and error pages. Landing pages of ops, gov, admin, driver and conductor are placeholders (`components/coming-soon.tsx`).
- `packages/ui`: every class used in `apps/web` and `packages/ui` exists in the token theme (checked against the built CSS). New token `bg-scrim`.

### Not done yet (blocked on accounts or scheduled later)

| Item | Why | When |
| --- | --- | --- |
| Neon, Upstash, Razorpay test, Resend accounts | Must be created by a human (docs/15) | Needed for live deployment and e2e |
| `apps/api/.env`, `apps/web/.env.local` | Need credentials from cloud accounts | Before live testing (Day 4 sync needs the real API) |
| Apply `schema_v1` on Neon test branch | Needs `TEST_DATABASE_URL` in CI | CI setup with cloud secrets |
| Scope switcher and account name in staff shells | Needs the Day 4 session (`useMe`) | Day 4 (Dev A) |
| Real logout in the account menu | Link to `/` until `AuthProvider.logout()` exists | Day 4 (Dev A) |
| Short Telugu label for "Track bus" in the bottom nav | Glossary question D-015 | Day 4 sync |
| Session marker cookie for the web route guard | Question D-016 (`apt_rt` path hides it from pages) | Before Day 4 work |
| Worker queues | Scheduled for Day 5 | Day 5 (Dev B) |

### Decisions

All in `progress/decisions-log.md`: D-001 to D-011 from Days 1 to 3, D-012 to D-016 proposed by the Day 3 review (D-016 blocks the Day 4 route guard).

---

## Repo map (as built)

```
AGENTS.md                      rules for every tool and human (hard rules, commits, commands)
CLAUDE.md                      imports AGENTS.md
package.json                   root scripts, pnpm 11 pinned in packageManager
pnpm-workspace.yaml            workspaces, allowBuilds, overrides, shellEmulator (read the comments)
turbo.json                     task graph: generate, build, dev, lint, typecheck, test
.github/workflows/ci.yml       install, dashes, lint, typecheck, test, build, audit
scripts/check-dashes.mjs       fails on em or en dash in any tracked or new file

packages/config                tsconfig.base.json, eslint.base.mjs (base, sharedIgnores, sharedRules, nestParserOptions), prettier
packages/shared                zod contracts used by web and api. Compiled to CommonJS in dist/
  src/enums.ts                 every enum from docs/05
  src/errors.ts                ErrorCode, ERROR_HTTP_STATUS, ErrorResponse
  src/status.ts                STATUS_MAP, deriveTripDisplayStatus, busDisplayStatus, TICKET_STATUS_MAP, colourOfDay
  src/money.ts                 paise helpers, Paise schema
  src/fare.ts                  calculateFare, refundQuote (the only fare math)
  src/schemas/                 health, auth, seat-layout, search (SearchTripsQuery, TripSummaryDto), network (places, districts, routes, timetable)
packages/ui                    design tokens and (from Day 2) components. Source only, compiled by Next
  src/tokens.css               ALL raw colour values live here and nowhere else
  src/cn.ts                    class joiner that knows our token names

apps/api                       NestJS 11
  src/main.ts                  HTTP entry
  src/worker.ts                worker entry (WORKER=1), no queues yet
  src/http-app.ts              configureHttpApp(): prefix, helmet, CORS, body limit, logger. Used by main and tests
  src/app.module.ts            ConfigModule (zod), LoggerModule (pino), Prisma, Redis, Health, global error filter
  src/config/env.ts            EnvSchema and validateEnv (every env var)
  src/common/                  AppError, AllExceptionsFilter, @Public(), logger params (redaction, request ids)
  src/prisma/                  PrismaService (Prisma 7 + pg adapter, lazy connect), global module
  src/redis/                   RedisService (ioredis, lazy, TLS ready), global module
  src/modules/health/          the reference module: controller, service, tests
  src/modules/network/         Day 4 public network and search: repository (queries), service (rules), trip-summary.ts
  src/generated/prisma/        generated Prisma client (git ignored, created by `pnpm --filter api generate`)
  prisma/schema.prisma         full schema v1 from docs/05 (seed in prisma/seed.ts)
  prisma/migrations/           20260923000000_init
  test/                        setup-env.ts, test-env.ts, http.test.ts (pipeline), health.int.test.ts (Neon)

apps/web                       Next.js 16 App Router
  app/layout.tsx               fonts (Inter, Noto Sans Telugu), metadata title template
  app/globals.css              Tailwind + tokens + @source for packages/ui
  app/(citizen)/               citizen shell, home (home-search.tsx), account
  app/(auth)/login/            login (email or phone OTP)
  proxy.ts                     route guard on the apt_session marker (D-016)
  lib/                         api.ts (fetch wrapper, refresh), session.ts (token store), roles.ts, recent-places.ts, query-keys.ts
  components/                  providers, auth-provider (useAuth, useMe), require-auth (RequireAuth, RequirePermission), place-combobox
  app/{driver,conductor,ops,gov,admin}/  staff shells (components/field-shell.tsx, management-shell.tsx)
  i18n/request.ts              locale from cookie, then Accept-Language; merges web and shared messages
  next.config.ts               /api/v1 rewrite to API_URL, agentRules off, transpilePackages ui
```

---

## How things work

### Build graph (Turborepo)

- `packages/shared` must be **built** before anything imports it (`dist/`). Turbo does it for you: `build`, `dev`, `lint`, `typecheck` and `test` all depend on `^build`.
- `apps/api` runs `generate` (Prisma client) before `build`, `dev`, `lint`, `typecheck` and `test`.
- Changed something in `packages/shared` while `pnpm dev` runs? The shared `dev` task (`tsc --watch`) rebuilds `dist/`. Next picks it up by itself. The API does not (Nest only watches `apps/api/src`): save any file in `apps/api/src` or restart `pnpm dev`. If types look stale in your editor, run `pnpm --filter @aptransit/shared build`.
- `packages/ui` is **not** built. Next compiles it from source (`transpilePackages`).

### API request pipeline

1. `pino-http` gives every request an id: incoming `x-request-id` if it looks safe, else `req_<uuid>`. Sent back in the `x-request-id` header.
2. helmet headers, CORS only for `WEB_ORIGIN` (with credentials), JSON body limit 100 kb, `trust proxy` 1.
3. Global prefix `api/v1`.
4. Controllers. Anything thrown ends in `AllExceptionsFilter`, which always answers the docs/06 shape `{ error: { code, message, details?, requestId } }`. `AppError(code, message, details)` sets the code and the HTTP status from `ERROR_HTTP_STATUS`. 5xx never leak the real message.

### Config

- `src/config/env.ts` is the single list of env vars. `ConfigModule` validates at **import time** of `AppModule`. Missing or bad values stop the boot with a list of variable names (never values).
- Read values with `ConfigService<Env, true>`: `config.get("PORT", { infer: true })`.
- `APP_ENV` (development, staging, production) gates dev only features. `NODE_ENV=test` makes Nest ignore `.env` files in tests.

### Database and Redis

- Prisma 7 with the new `prisma-client` generator, output `src/generated/prisma`, CommonJS. Import with `import { PrismaClient, Prisma } from "../generated/prisma/client"` (relative path from your file).
- `PrismaService` extends the client and uses `@prisma/adapter-pg` with the **pooled** `DATABASE_URL`. The CLI uses the **direct** `DIRECT_URL` from `prisma.config.ts`, which loads `.env` with `process.loadEnvFile`.
- Both Prisma and Redis connect lazily, so the API boots even when they are down. Health tells the truth.
- Redis errors are logged at most once per 30 s (Upstash retries forever otherwise).

### Web styling

- `app/globals.css` imports Tailwind, then `@aptransit/ui/tokens.css`. The tokens file **removes** Tailwind's default palette, font sizes, radii, shadows and easings. Only our tokens exist. See `packages/ui/README.md` for the class list.
- Theme: tokens switch on `data-theme="dark"` on `<html>`, or on the OS preference when there is no `data-theme="light"`. The cookie based theme arrives on Day 3.
- Telugu: any element with `lang="te"` (or inside one) gets 15 percent taller line heights automatically.

---

## Patterns to copy

### Add an API endpoint (the health module is the template)

1. Request and response zod schemas in `packages/shared/src/schemas/<area>.ts`, exported from `src/index.ts`. Names: `<Thing>Input`, `<Thing>Dto`, `<Thing>Query`.
2. `apps/api/src/modules/<area>/` with `<area>.module.ts`, `<area>.controller.ts`, `<area>.service.ts`, `<area>.service.test.ts`. Register the module in `app.module.ts`.
3. Business failures: `throw new AppError("SEAT_TAKEN", "Seat 18 is no longer available", { seatNo: "18" })`. Only codes from `packages/shared/src/errors.ts`. Need a new code? Add it there with its HTTP status and add the message to both i18n files (Day 3 onwards).
4. Public routes get `@Public()`. Everything else needs login (global `JwtAuthGuard`). Permissions with `@Can`, limits with `@Throttle`, audit with `@Audit` (see `apps/api/README.md`).
5. Inject classes with **value imports** (`import { PrismaService } from ...`), not `import type`, or Nest DI breaks. ESLint already knows this (`nestParserOptions`).
6. Tests: unit tests next to the file; HTTP tests in `apps/api/test/` using `configureHttpApp` like `http.test.ts`, overriding `PrismaService` and `RedisService` when you do not need real ones.
7. Update `docs/06` only through a decision if the built shape differs.

### Add an env var

1. `apps/api/src/config/env.ts` (with a clear error message).
2. `apps/api/.env.example` with a fake value.
3. `apps/api/test/test-env.ts` with a fake value, or every API test fails at import.
4. docs/15 through a decision entry. Tell the other dev to update their `.env`.

### Change the database

1. Edit `apps/api/prisma/schema.prisma` (docs/05 is the source of truth).
2. `pnpm db:migrate` (runs `prisma migrate dev` against your own Neon branch) and name the migration.
3. Without a database you can still preview the SQL by diffing the committed schema against yours (run in `apps/api`):
   `git show HEAD:apps/api/prisma/schema.prisma > old.prisma` then `pnpm exec prisma migrate diff --from-schema old.prisma --to-schema prisma/schema.prisma --script`, then delete `old.prisma`. (`--from-migrations` needs a shadow database, so it does not work offline.)
4. Commit the migration folder. Never edit an applied migration.

### Add a UI token or utility

1. Raw value in `packages/ui/src/tokens.css` (light and both dark blocks when it changes by theme).
2. Map it in `@theme inline` (colours) or `@theme` (sizes), or add an `@utility`.
3. If it creates a new class family that could clash (a new font size, z layer, spacing name), register it in `packages/ui/src/cn.ts`, otherwise `cn()` may drop classes silently.
4. Document it in `packages/ui/README.md`.

### React state from the browser

The Next lint config includes the React Compiler rules. `setState` directly inside `useEffect` is an error. Read browser state (theme, media queries, time) with `useSyncExternalStore`, and change things in event handlers. See `apps/web/app/_token-check/token-check.tsx`.

---

## Gotchas (Day 1 to Day 3)

| Symptom | Cause | Fix |
| --- | --- | --- |
| `ERR_PNPM_IGNORED_BUILDS` on install | pnpm 11 blocks install scripts | Add the package to `allowBuilds` in `pnpm-workspace.yaml` (true only if it really needs its script) and log it |
| pnpm adds lines to `minimumReleaseAgeExclude` | pnpm 11 protects against very new releases | Keep them, they are pinned versions we chose |
| `WORKER=1 nest start` fails on Windows | cmd.exe | Already solved: `shellEmulator: true` |
| `pnpm --filter api prisma ...` says no script | pnpm runs scripts, not binaries | `pnpm --filter api exec prisma ...` or the `db:*` scripts |
| All API tests fail with "Invalid environment" | Config validates at import time | Add the new var to `test/test-env.ts` |
| Nest cannot resolve a dependency | Injected class imported with `import type` | Use a value import |
| `cn("text-h1 text-muted")` loses a class | tailwind-merge did not know a token name | Register it in `packages/ui/src/cn.ts` |
| `bg-white`, `text-lg`, `bg-gray-100` do nothing | Defaults removed on purpose | Use tokens (`bg-surface-raised`, `text-body-lg`, `bg-surface`) |
| Horizontal scroll at 360 px in Telugu | Long compound words | Base layer wraps long words; in grids and flex rows add `min-w-0` to text cells |
| `next dev` creates AGENTS.md and CLAUDE.md in apps/web | Next 16 writes agent files | Already off: `agentRules: false` |
| Port 3000 or 4000 busy after stopping a server | Windows keeps the child process | `netstat -ano \| findstr :3000` then `taskkill /PID <pid> /F` |
| Prisma prints "Update available 8.x" | Prisma 8 is a release candidate | Ignore, we stay on 7 (D-003). `generate` already hides it |
| CRLF warnings on commit | Global `core.autocrlf` | Harmless: `.gitattributes` stores LF |
| Neon test skipped in `pnpm test` | No `TEST_DATABASE_URL` | Expected until the secret exists |
| A class like `text-text`, `rounded-control`, `border-border-default` does nothing, build still green | Tailwind silently skips names that are not in our theme | Use the names in `packages/ui/README.md` (`text-fg`, `rounded-md`, `border-default`). Check rendered styles in the browser |
| "Functions cannot be passed directly to Client Components" | A server layout passed `icon: Bus` to a client component | Pass `icon: <Bus />` |
| "Event handlers cannot be passed to Client Component props" | A `packages/ui` component with handlers lacks `"use client"` | Add the directive at the top of the component file |
| Page title "X · AP TransitOS · AP TransitOS" | Nested layout used `title.default` under the root template | Use `title.absolute` in nested layouts |
| React Compiler lint: "This value cannot be modified" on `document.cookie` | Writing a global inside a component | Use `lib/preferences.ts` |
| Web page 401 loops or never refreshes | Calling fetch directly | Always go through `api()` in `lib/api.ts`; pass `redirectOn401: false` for public data |
| `useSearchParams` breaks `pnpm build` (needs Suspense) | Client component on a static page | Read `window.location` in an effect, or take `searchParams` in the server page and pass it down |
| Form reads localStorage and hydration fails | Server and first client render differ | Render the form only after mount (`useSyncExternalStore` mounted flag, see `home-search.tsx`) |
| Local API waits about 4 s per request | No Redis running, commands time out, then fail open | Expected without Upstash. Everything still works |
| Want a real database without Neon | No Postgres on the machine | `npx` PGlite socket server in your scratch folder, point `DATABASE_URL` and `DIRECT_URL` at it, `prisma migrate deploy`, `pnpm db:seed`. Never commit it |
| API test gets 429 unexpectedly | Tests share one IP and the 10 per IP per hour OTP limit | Reset the IP counter in the fake Redis (see `resetIpLimit` in `test/auth.test.ts`) |

---

## Commands

```bash
pnpm install                      # pnpm 11 required: npm i -g pnpm@11 (or corepack enable)
pnpm dev                          # web :3000 and api :4000
pnpm dev:worker                   # worker process (WORKER=1)
pnpm lint                         # eslint everywhere + check:dashes
pnpm typecheck
pnpm test                         # vitest in shared and api + script tests
pnpm build
pnpm check:dashes
pnpm db:migrate                   # prisma migrate dev on your Neon branch
pnpm --filter api generate        # regenerate the Prisma client
pnpm --filter api exec prisma studio
pnpm --filter @aptransit/shared build
pnpm audit --prod --audit-level high
```

---

## Day 2 notes

### Dev A (design system primitives)

- `packages/ui` has no test setup and no React dependencies yet. Add Vitest, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom` and `jsdom` as dev dependencies of `packages/ui` (decision D-010), a `vitest.config.mts` with `environment: "jsdom"`, and a `test` script so Turbo picks it up.
- Radix, `lucide-react`, `class-variance-authority`, `sonner`, `vaul` are allowed by docs/04. Add them to `packages/ui` (not `apps/web`).
- shadcn CLI expects a single app. Easiest: copy each component's source from the shadcn site into `packages/ui/src/components/` and restyle it with our tokens. Never keep shadcn's colour variables (`bg-background`, `text-foreground` and friends do not exist here).
- Components must export from `packages/ui/src/index.ts`. Show them on the Day 1 token page for now (it becomes `/design` on Day 3).
- Anything with state in the browser: follow the `useSyncExternalStore` pattern above.

### Dev B (schema and seed)

- `schema.prisma` has only `Setting`. Add everything from docs/05 in one migration named `schema_v1`, on top of `20260923000000_init`.
- Replace the `db:seed` and `db:reset` placeholders in `apps/api/package.json`. Use `tsx` (allowed by docs/04) and add the seed command to `prisma.config.ts` (`migrations.seed`).
- `db:reset` must refuse to run when `DATABASE_URL` points at the Neon `main` branch.
- New shared files (codes, polyline, time, permissions) go in `packages/shared/src/` with tests and exports in `index.ts`.
- `packages/shared` must stay free of Node only APIs (the web imports it too). Use `Intl` for time zones, not a date library.

---

## Day 3 notes (done, kept for history)

- Dev A: shells, next-intl with cookie locale, `/design`, 404 and error pages.
- Dev B: OTP auth, refresh rotation, guards, rate limits, audit.
- The review on 2026-09-27 fixed the bugs listed in `progress/daily-log.md` ("Day 03 review").

## Day 4 notes (done, kept for history)

- Dev B: fare.ts, network and search endpoints, apt_session marker (D-016), seed aligned with docs/19 (D-018).
- Dev A: api client and session, proxy guard, home, login, account, OtpInput and DatePicker in packages/ui.

## Day 5 notes

### Dev A (search results, bus details, timetable)

- Read the query string with the server page `searchParams` prop and pass it to a client component. The home form already sends `/search?from=<stopId>&to=<stopId>&date=YYYY-MM-DD`.
- Fetch with `api(path, { schema, query, redirectOn401: false })` inside `useQuery`. Response schemas: `SearchTripsResponse`, `TimetableDto`, `RouteDto` from `@aptransit/shared`.
- `farePaise` is the total per passenger, reservation fee included. Times are ISO UTC: show them with the shared IST helpers.
- Place names: `placeName(place, locale)` in `components/place-combobox.tsx`.

### Dev B (trip details, seats, holds)

- Reuse `NetworkRepository.tripRows` (it already joins the fare rule for a stop pair) and `toTripSummary`.
- Seats: `SEAT_TAKING_STATUSES` in the repository; add Redis holds on top.
- New endpoints that read a lot: put queries in the repository so HTTP tests can use `test/network-fixture.ts`.
