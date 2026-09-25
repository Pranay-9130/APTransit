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

## Current state (end of Day 3, 2026-09-25)

### Git

| Branch | Contains | Status |
| --- | --- | --- |
| `main` | Day 1 code | Baseline |
| `b/schema-v1` | Schema v1, shared additions, deterministic seed, trip generator | Ready / merged |
| `a/ui-primitives` | 12 UI primitive groups, test setup, showcase page | Ready / merged |
| `b/auth` | Backend auth, JWT, OTP, refresh rotation, guards, rate limits, audit | Ready / merged |
| `a/shells-i18n` | 6 app shells, next-intl, Telugu line height, /design gallery, error/404 | Ready / merged |

**Day 4 starts from `main`:** branch `a/<topic>` or `b/<topic>` for citizen search and booking flow, network lookup APIs.

### Works today (verified)

- `pnpm install`, `pnpm lint` (includes `check:dashes`), `pnpm i18n:check`, `pnpm typecheck`, `pnpm test`, `pnpm build` all pass on Windows with Node 22.20 and pnpm 11.10.
- `packages/shared`: `schemas/auth.ts` (OtpRequestInput, OtpVerifyInput, MeDto, UpdateMeInput), `messages/en.json` and `te.json`, `codes.ts`, `polyline.ts`, `time.ts`, `permissions.ts`, `seat-layout.ts`. 46 tests passing.
- `packages/ui`: all 12 primitive groups exist (Button, IconButton, Field, Input, Textarea, Select, Checkbox, RadioGroup, Switch, Card, StatusBadge, ToneChip, Skeleton, Spinner, EmptyState, ErrorState, Dialog, Sheet, Toaster, Tabs, Tooltip, DropdownMenu) styled exclusively with design tokens, forwardRef, full accessibility, with 10 unit tests passing.
- `apps/web`: layout shells for all 6 surfaces ((citizen), driver, conductor, ops, gov, admin) with skip links and landmarks, next-intl with cookie-based locale (en, te) and Telugu line height, cookie-based theme without flash, `/design` component gallery, not-found and error handling, 8 routes compiling cleanly in production build.
- `apps/api`: full Prisma schema v1, auth module (OTP request, verify, refresh rotation, reuse detection, logout, /me, /me update), ZodValidationPipe, JwtAuthGuard with @Public and @Can, ScopeService, RateLimitService, AuditService, ResendEmailProvider. 39 tests passing (2 integration tests skipped when Neon is offline).
- `scripts`: `check-dashes.mjs` and `check-i18n.mjs` with 5 unit tests passing.

### Not done yet (blocked on accounts or scheduled later)

| Item | Why | When |
| --- | --- | --- |
| Neon, Upstash, Razorpay test, Resend accounts | Must be created by a human (docs/15) | Needed for live deployment and e2e |
| `apps/api/.env`, `apps/web/.env.local` | Need credentials from cloud accounts | Before live testing |
| Apply `schema_v1` on Neon test branch | Needs `TEST_DATABASE_URL` in CI | CI setup with cloud secrets |
| Citizen search and booking UI | Scheduled for Day 4 | Day 4 (Dev A) |
| Search and network APIs | Scheduled for Day 4 | Day 4 (Dev B) |
| Worker queues | Scheduled for Day 5 | Day 5 (Dev B) |

### Decisions taken on Day 1, Day 2, and Day 3

All in `progress/decisions-log.md`: D-001 to D-011.

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
  src/schemas/health.ts        HealthDto
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
  src/generated/prisma/        generated Prisma client (git ignored, created by `pnpm --filter api generate`)
  prisma/schema.prisma         only the settings table so far
  prisma/migrations/           20260923000000_init
  test/                        setup-env.ts, test-env.ts, http.test.ts (pipeline), health.int.test.ts (Neon)

apps/web                       Next.js 16 App Router
  app/layout.tsx               fonts (Inter, Noto Sans Telugu), metadata title template
  app/globals.css              Tailwind + tokens + @source for packages/ui
  app/page.tsx                 temporary token check page (delete Day 3)
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
4. Public routes get `@Public()` (the global auth guard arrives on Day 3). Everything else will need login by default.
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

## Gotchas (all hit on Day 1)

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

## Day 3 notes

### Dev A (citizen shell and search screens)
- Move temporary showcase from `apps/web/app/page.tsx` to `apps/web/app/(citizen)/design/page.tsx`.
- Wire up `next-intl` (English and Telugu) with routing. All UI copy must have keys in `apps/web/messages/en.json` and `te.json`.
- Build the citizen shell: navigation bar, mobile tab bar, language switcher, offline banner.
- Build route search and timetable screens using the Day 2 primitives (`Field`, `Input`, `Select`, `Button`, `Card`, `StatusBadge`).

### Dev B (auth and session endpoints)
- Implement citizen phone OTP authentication flow (`POST /api/v1/auth/otp/request` and `POST /api/v1/auth/otp/verify`).
- Session management with JWT and Redis blacklist.
- Role guard and permission guard using `@aptransit/shared` permissions.
