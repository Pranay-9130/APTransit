# v3 Phase 1 · Look and app shell

**Owner:** Dev A. **Branch:** `a/v3-p1-shell`. **PR title:** `Verify v3 shell, splash and login first`.
**Goal:** the light blue theme, the bus opening animation, login first and the terms page work for every user, at every width, in both languages, with a keyboard and a screen reader.

## Read first

- `AGENTS.md`, `progress/handoff.md`
- `prompts/v3/00-context.md` sections 1, 3 (rows 3, 8, 15), 6, 7
- `docs/09-design-system.md` ("Colour: light", "Opening animation", "Accessibility")
- `docs/11-screens.md` (`/`, `/login`, `/terms`, `/account`)
- `packages/ui/README.md`, `apps/web/README.md`

## Already built (do not rebuild)

- `packages/ui/src/tokens.css`: light blue tokens; `animate-bus-drive`, `animate-wheel-spin`, `animate-road-slide`, `animate-splash-out`; `--dur-splash` (2.2 s); reduced motion fades the splash after 0.4 s.
- `apps/web/components/bus-splash.tsx` (has `data-testid="bus-splash"`, `aria-hidden="true"`, `pointer-events-none`), mounted in `apps/web/app/layout.tsx`.
- `apps/web/proxy.ts`: `"/"` in `PROTECTED_PREFIXES`; `apps/web/proxy.test.ts` covers it.
- `apps/web/app/(citizen)/terms/page.tsx` (9 sections: tickets, groups, passes, children, qr, refunds, conduct, privacy, account).
- `apps/web/app/(citizen)/account/account-view.tsx`: "Passes, help and terms" section.
- `apps/web/e2e/E2E-1-guest-search.spec.ts` and `a11y.spec.ts` already log in before `/`.

## Tasks

1. New E2E spec `apps/web/e2e/v3-shell.spec.ts`, using `login` and `uniqueEmail` from `e2e/helpers.ts`:
   - Logged out, `page.goto("/")` ends on `/login?next=%2F`; after `login()` the URL is `/`.
   - On first load `getByTestId("bus-splash")` exists with `aria-hidden="true"`, and a click on "Send code" works within 500 ms of `goto` (the splash must never block input).
   - With `page.emulateMedia({ reducedMotion: "reduce" })`, the splash has computed `visibility: hidden` within 1 s.
   - `/terms` shows 9 `h2` headings in English, and in Telugu after `page.locator('button[lang="te"]').click()` (as in E2E-12).
2. Add `/terms` to `apps/web/e2e/route-sweep.spec.ts` and to the axe pages in `apps/web/e2e/a11y.spec.ts`.
3. Run the route sweep at 360, 768 and 1280 px in English and Telugu. Fix any contrast, overflow or focus problem with tokens only. Inputs must keep `border-strong`.
4. Dark mode (`data-theme="dark"`): check home, login, terms and account. If axe or `tokens.test.ts` reports contrast below AA, fix the value in all three theme blocks of `tokens.css` together.
5. Update `progress/handoff.md` if you learned a new gotcha.

## Prompt (paste after `prompts/_shared/context-preamble.md`)

```text
Today: v3 Phase 1, look and app shell.

Read first: AGENTS.md, progress/handoff.md, prompts/v3/00-context.md (sections 1, 3, 6, 7), prompts/v3/phase-1-shell.md, docs/09-design-system.md ("Colour: light", "Opening animation", "Accessibility"), docs/11-screens.md (/, /login, /terms, /account), packages/ui/README.md, apps/web/README.md.

The features are already built and merged (PR #9, decision D-042). Do not rebuild them. Your job is to prove they work and fix what the checks reveal.

On a new branch a/v3-p1-shell from main:
1. Write apps/web/e2e/v3-shell.spec.ts exactly as task 1 of phase-1-shell.md describes, using login and uniqueEmail from apps/web/e2e/helpers.ts.
2. Add /terms to route-sweep.spec.ts and to the axe pages in a11y.spec.ts.
3. Run the route sweep at 360, 768 and 1280 px in English and Telugu and fix every contrast, overflow or focus problem using tokens only.
4. Check dark mode on home, login, terms and account; fix contrast in all three theme blocks of tokens.css together if needed.

Do not change token names, business rules or copy meaning. No new dependencies.
Before the PR run: pnpm check:dashes, pnpm i18n:check, pnpm turbo lint, pnpm typecheck (at the root), pnpm test, pnpm build, node scripts/check-classes.cjs, and the new E2E spec on Desktop Chrome and Pixel 7.
Show me your plan first and wait for my OK.
```

## Done when

- [ ] `v3-shell.spec.ts` passes on Desktop Chrome and Pixel 7.
- [ ] Route sweep and axe pass, including `/terms`, in both languages and all three widths.
- [ ] The splash never blocks a click; reduced motion hides it within 1 s.
- [ ] Dark mode checked on home, login, terms and account.
- [ ] All "Before the PR" checks green; PR opened and the other dev mentioned.
