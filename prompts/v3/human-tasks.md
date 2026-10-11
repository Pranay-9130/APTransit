# v3 tasks only a person can do

An AI agent cannot do these: they need accounts, real devices, a human eye, or the owner's decision. Tick each box in the PR that records the result.

## 1. Google OAuth client (blocks Phase 2 manual checks)

1. https://console.cloud.google.com: create or pick the project `AP TransitOS`.
2. APIs and services, OAuth consent screen (or Google Auth Platform, Branding): External, app name `AP TransitOS`, support and developer email. While the app is in Testing mode, add the Google accounts you will test with under Test users.
3. Credentials, Create credentials, OAuth client ID, Web application, name `AP TransitOS web`.
4. Authorised JavaScript origins: `http://localhost:3000`, `http://localhost`, the Vercel staging URL, the production URL. No redirect URI (popup mode). No client secret is used.
5. Put the client id in `apps/api/.env` as `GOOGLE_CLIENT_ID` and in `apps/web/.env.local` as `NEXT_PUBLIC_GOOGLE_CLIENT_ID`. Same value in Render (api) and Vercel (web). Redeploy the web: the value is read at build time.

| Problem | Fix |
| --- | --- |
| No button | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` empty, or the web was not rebuilt |
| `origin_mismatch` in the popup | Add the exact origin (with port) in step 4 |
| "Access blocked" | Add the account as a test user, or publish the consent screen |
| 401 "Google sign in failed" | The api `GOOGLE_CLIENT_ID` differs from the web value |
| 403 "not set up" | `GOOGLE_CLIENT_ID` missing in the api env |

- [ ] OAuth client created; env vars set locally, on Render and on Vercel.

## 2. Map in a real browser (Phase 3)

Headless Chromium does not paint MapLibre tiles, so the E2E specs cannot see them.

- [ ] Home in Chrome (desktop) and on an Android phone: street tiles show behind the stop dots.
- [ ] Tapping a dot opens the chooser; "Set as from" and "Set as to" fill the bars; the pins show A and B.
- [ ] "Use my location" on the phone picks a sensible nearest stop.

## 3. QR field test (Phase 4)

- [ ] On a low end Android phone with a slow network, the ticket QR changes every 3 seconds and the conductor scan still succeeds.
- [ ] A screenshot of the QR, scanned 15 seconds later, is refused (`STALE_CODE`).
- [ ] Result written under D-042 in `progress/decisions-log.md`. If scans fail, report to the owner; do not change the period without them.

## 4. Owner sign off (Phase 4)

Ask the product owner and record the answers in `docs/18-open-decisions.md` ("v3 values to confirm") and under D-042:

- [ ] Child age and fare (now: under 12 pays 50 percent).
- [ ] Zone day and zone monthly prices (now: 60 and 900 rupees) and which services they cover.
- [ ] Child card age limit (now: under 18).
- [ ] QR period (now: 3 seconds).
- [ ] Service fit rule (now: a village stop lists village buses when any run).

If a value changes, the agent updates the constant or the seed in one small PR (see `00-context.md` section 4 for where each lives).

## 5. Language and accessibility

- [ ] A native Telugu speaker reviews every new key in `apps/web/messages/te.json`: `splash`, `terms`, `home.map`, `login.or`, `login.terms`, `login.googleFailed`, `account.more`, `account.links`, `passBuy.zone*`, `passBuy.child*`, `passBuy.forChild`, `passes.childCard`, `book.details.childHint`, `book.review.group`, `opsApp.stages`, `search.nextDay`, and `CHILD_BOARDED` in `packages/shared/src/messages/te.json`.
- [ ] TalkBack (Android) and NVDA (Windows) pass on login, home, pass buy, booking review and the ops trip page.

## 6. Repo housekeeping

- [ ] Vercel asks a team member to authorise preview deploys of fork PRs: approve them if you want preview links.
- [ ] After all phases: `progress/handoff.md` "Current state" updated, daily log written, D-042 and D-043 status set to Accepted.
