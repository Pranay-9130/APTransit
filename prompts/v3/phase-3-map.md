# v3 Phase 3 · Map home and search

**Owner:** Dev A (E2E and web fixes), Dev B (database test). **Branch:** `a/v3-p3-map`. **PR title:** `Test map home and village service fit`.
**Goal:** passengers pick From and To like Google Maps, village journeys show village buses, and long journeys show next day arrivals.

## Read first

- `AGENTS.md`, `progress/handoff.md`
- `prompts/v3/00-context.md` sections 1, 2 (items 1, 2, 4, 5, 9), 3, 6, 7
- `docs/07-ticket-and-pass-rules.md` section 7b (service fit)
- `docs/06-api-contract.md` (`GET /places/search`, `GET /places/nearby`, `GET /search/trips`)
- `docs/11-screens.md` (`/`, `/search`), `docs/19-seed-data.md` "v3 additions"
- `apps/web/README.md`, `apps/api/README.md`, `packages/ui/README.md`

## Already built (do not rebuild)

- `apps/web/app/(citizen)/map-picker.tsx`: dynamic `MapView`, every stop a dot, tap opens a chooser ("Set as from", "Set as to"), "Use my location" (nearest stop as From), and a `<details>` list "Stops near you (list)" with From and To buttons per stop. Used in `apps/web/app/(citizen)/home-search.tsx`.
- `packages/ui/src/components/map-view.tsx`: `onMarkerClick`, marker `tone` (`from` shows A, `to` shows B, `stop` a small dot), `className`.
- `GET /places/nearby?lat&lng&limit` (`NetworkService.nearbyPlaces`, `haversineKm`, cached `allStops`); test in `apps/api/test/network.test.ts`.
- `villageFit` in `apps/api/src/modules/network/network.service.ts` with unit tests in `network.service.test.ts`; the SQL `villageEnd` column in `NetworkRepository.tripRows`. The SQL path is not tested against a real database yet.
- `apps/web/app/(citizen)/search/search-client.tsx`: arrival on a later IST date shows `search.nextDay` ("06:15, next day").
- Seed: route VJA-VSP-01 (VJA, ELR, RJY, ANK, DWK) with 07:00, 21:00 and 22:30 departures, and the reverse VSP-VJA-02.

## Tasks

1. Database test (Dev B), in `apps/api/test/network.int.test.ts`, skipped without `TEST_DATABASE_URL` like the others there:
   - Kurnool Bus Stand to Orvakal on a seeded date: every trip's `serviceType` is in `VILLAGE_SERVICE_TYPES`, and there is at least one trip.
   - Kurnool Bus Stand to Vijayawada PNBS: at least one EXPRESS or higher service (bus stand to bus stand is unchanged).
   - Vijayawada PNBS to Dwaraka Bus Station: the 21:00 trip arrives on the next IST date.
2. E2E spec (Dev A) `apps/web/e2e/v3-map-home.spec.ts`, logged in with `login()` first:
   - Open "Stops near you (list)", press "From" on Kurnool Bus Stand and "To" on Orvakal: both bars show the names; "Search buses" goes to `/search?from=...&to=...`.
   - Every trip card on that search shows a village service name (Pallevelugu, Ultra Pallevelugu, City Ordinary or Metro Express).
   - Geolocation granted: `context.grantPermissions(["geolocation"])` and `context.setGeolocation({ latitude: 15.67, longitude: 78.11 })`; "Use my location" fills From with Orvakal.
   - Geolocation denied (`context.clearPermissions()`): "Use my location" shows the alert "We could not find your location...".
   - Search Vijayawada to Visakhapatnam (Dwaraka) for tomorrow: the 21:00 card's arrival contains "next day".
3. Screen reader names: the list buttons read only "From" and "To". Add `aria-label` keys `home.map.fromStop` ("From {stop}") and `home.map.toStop` ("To {stop}") in both `en.json` and `te.json` and use them on those buttons. Update the spec to find them by the new names.
4. A person checks the map in a real browser (see `human-tasks.md`): headless Chromium does not paint MapLibre tiles, so this cannot be automated here.

## Prompt (paste after `prompts/_shared/context-preamble.md`)

```text
Today: v3 Phase 3, map home and search.

Read first: AGENTS.md, progress/handoff.md, prompts/v3/00-context.md (sections 1 to 3, 6, 7), prompts/v3/phase-3-map.md, docs/07-ticket-and-pass-rules.md section 7b, docs/06-api-contract.md (places and search rows), docs/11-screens.md (/ and /search), docs/19-seed-data.md "v3 additions", apps/web/README.md, apps/api/README.md, packages/ui/README.md.

The features are already built and merged (PR #9, decision D-042). Do not rebuild them.

On a new branch a/v3-p3-map from main:
1. Add the database tests in task 1 of phase-3-map.md to apps/api/test/network.int.test.ts (skipped without TEST_DATABASE_URL, like the rest of that file).
2. Write apps/web/e2e/v3-map-home.spec.ts covering every bullet in task 2, using login from apps/web/e2e/helpers.ts and Playwright geolocation mocks. Do not depend on map tiles or clicking map dots: use the "Stops near you (list)" buttons.
3. Add the aria-label keys in task 3 in both en.json and te.json and use them on the list buttons.
4. Fix any bug the tests find. Keep the service fit rule exactly as docs/07 section 7b states.

Before the PR run: pnpm check:dashes, pnpm i18n:check, pnpm turbo lint, pnpm typecheck (at the root), pnpm test, pnpm build, node scripts/check-endpoints.cjs, node scripts/check-classes.cjs, and the new E2E spec on Desktop Chrome and Pixel 7 against a seeded database.
Show me your plan first and wait for my OK.
```

## Done when

- [ ] Database tests pass against a seeded database.
- [ ] `v3-map-home.spec.ts` passes on Desktop Chrome and Pixel 7.
- [ ] List buttons have clear screen reader names in both languages.
- [ ] A person confirmed tiles, dot tapping and the A and B pins in a real browser.
- [ ] All "Before the PR" checks green; PR opened and the other dev mentioned.
