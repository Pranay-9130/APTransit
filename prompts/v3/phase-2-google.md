# v3 Phase 2 · Sign in with Google

**Owner:** Dev B (tests and fixes), plus a person with Google Cloud access (OAuth client, see `human-tasks.md`). **Branch:** `b/v3-p2-google`. **PR title:** `Test Google sign in token checks`.
**Goal:** citizens can sign in with Google on localhost, staging and production, and every bad token is refused safely.

## Read first

- `AGENTS.md`, `progress/handoff.md`
- `prompts/v3/00-context.md` sections 1, 5, 6, 7
- Decision D-043 in `progress/decisions-log.md`
- `docs/12-security.md` "Sign in with Google" and the rate limit table
- `docs/15-env-setup.md` "Google sign in setup"
- `apps/api/README.md` (auth, limits, audit, tests)

## Already built (do not rebuild)

- `apps/api/src/modules/auth/auth.service.ts`: `googleSignIn(credential, ip, userAgent)` and the shared private `signIn(where, create, ip, userAgent, method)` that OTP verify also uses.
- `apps/api/src/modules/auth/auth.controller.ts`: `POST /auth/google`, `@Public()`, `@Throttle` 10 per minute, sets the refresh cookie.
- `apps/api/src/config/env.ts`: optional `GOOGLE_CLIENT_ID`. `apps/api/test/test-env.ts` leaves it unset.
- `packages/shared/src/schemas/auth.ts`: `GoogleSignInInput` (strict, `credential` 20 to 4096 chars).
- `apps/api/test/auth.test.ts`: covers 400 (bad body) and 403 (not set up) only.
- Web: `apps/web/components/google-sign-in.tsx`, used in `apps/web/app/(auth)/login/login-form.tsx`; CSP in `apps/web/lib/csp.ts`, asserted in `apps/web/proxy.test.ts`.

## Tasks

1. New test file `apps/api/src/modules/auth/google-sign-in.test.ts`. Build `AuthService` with fakes (look at how `apps/api/test/auth.test.ts` mocks Prisma, Redis and audit), give the config a `GOOGLE_CLIENT_ID` like `123-abc.apps.googleusercontent.com`, and stub `fetch` with `vi.stubGlobal("fetch", ...)`. Never call Google. Cases:
   - Valid claims (`aud` matches, `iss` `https://accounts.google.com`, `exp` in the future, `email_verified` `"true"`, `email`, `name`): creates a CITIZEN user with that email and name, returns access and refresh tokens, writes an `auth.login` audit with `after: { method: "google" }`.
   - An existing user with the same email (created by OTP): signs into that user; no second user is created.
   - `aud` is another client id: 401 `UNAUTHENTICATED`.
   - `email_verified` false, `iss` wrong, or `exp` in the past: 401.
   - tokeninfo answers 400, or `fetch` throws, or it times out: 401, never 500.
   - The user has `deletedAt` set: 403 `FORBIDDEN`.
   - `Email@Example.COM` is stored as `email@example.com`.
   - No `GOOGLE_CLIENT_ID`: 403 before any fetch (assert `fetch` was not called).
2. If a case fails, fix `googleSignIn` so every bad token ends as 401 and never 500. Keep the no new dependency rule (no Google SDK).
3. HTTP test in `apps/api/test/auth.test.ts`: `POST /auth/google` 11 times from one IP answers 429 on the 11th (the limit is 10 per minute). Reset the limit as `resetIpLimit` does.
4. After the person in `human-tasks.md` has created the OAuth client and set the env vars: on localhost and staging, sign in with a new Google account and with an account whose email already exists from OTP. The browser console must show no CSP errors on `/login`. If it does, add only the exact origin it names to `GOOGLE` in `apps/web/lib/csp.ts` and update the expectation in `apps/web/proxy.test.ts`.

## Prompt (paste after `prompts/_shared/context-preamble.md`)

```text
Today: v3 Phase 2, Sign in with Google.

Read first: AGENTS.md, progress/handoff.md, prompts/v3/00-context.md (sections 1, 5, 6, 7), prompts/v3/phase-2-google.md, decision D-043 in progress/decisions-log.md, docs/12-security.md ("Sign in with Google", rate limits), docs/15-env-setup.md ("Google sign in setup"), apps/api/README.md.

The feature is already built and merged (PR #9). Do not rebuild it and do not add a Google SDK or any dependency.

On a new branch b/v3-p2-google from main:
1. Write apps/api/src/modules/auth/google-sign-in.test.ts covering every case in task 1 of phase-2-google.md. Build AuthService with fakes the way apps/api/test/auth.test.ts does and stub fetch with vi.stubGlobal. Never reach Google from a test.
2. If any case fails, fix AuthService.googleSignIn so every bad token answers 401 UNAUTHENTICATED and never 500. A deleted user answers 403. Missing GOOGLE_CLIENT_ID answers 403 without calling fetch.
3. Add the rate limit test in task 3 to apps/api/test/auth.test.ts.

Before the PR run: pnpm check:dashes, pnpm i18n:check, pnpm turbo lint, pnpm typecheck (at the root), pnpm test, pnpm build, node scripts/check-endpoints.cjs.
Show me your plan first and wait for my OK.
```

## Done when

- [ ] Every case in task 1 passes, and the rate limit test passes.
- [ ] OAuth client created and env vars set locally, on Render and on Vercel (`human-tasks.md`).
- [ ] Google sign in works on localhost and staging, for a new account and for an existing OTP account.
- [ ] No CSP errors on `/login`; the button is hidden when the env vars are empty.
- [ ] All "Before the PR" checks green; PR opened and the other dev mentioned.
