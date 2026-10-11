# v3 prompts: finish the owner feedback round

The v3 features are merged on `main` (PR #9, decisions D-042 and D-043). These files take them from "code merged" to "signed off": tests, checks, and the fixes they reveal. Hand this folder to the dev or their AI agent.

## Files

| File | What it is |
| --- | --- |
| [00-context.md](00-context.md) | Full context: the owner's feedback, what was built for each item and where, assumed values, Google sign in, how to run locally, gotchas, phase map. **Read first, once.** |
| [phase-1-shell.md](phase-1-shell.md) | Theme, bus opening animation, login first, terms page. Dev A |
| [phase-2-google.md](phase-2-google.md) | Sign in with Google tests and live check. Dev B |
| [phase-3-map.md](phase-3-map.md) | Map home, nearby stops, village service fit, next day arrivals. Dev A and Dev B |
| [phase-4-passes.md](phase-4-passes.md) | Group child fares, zone passes, child cards, 3 s QR, passengers per stage. Dev B and Dev A |
| [human-tasks.md](human-tasks.md) | What only a person can do: Google OAuth client, real browser map check, QR phone test, owner sign off, Telugu and screen reader review |

## How to run a phase with an AI agent

1. `git checkout main && git pull && pnpm install`.
2. Read `00-context.md` and the phase file yourself (10 minutes).
3. Open your AI tool in the repo root. Paste `prompts/_shared/context-preamble.md` first.
4. Paste the phase file's "Prompt" block as the next message.
5. Let the agent show its plan. Push back on anything that breaks `AGENTS.md`, rebuilds what already exists, or changes an (A) value.
6. Small commits on the phase branch. Review every diff. Titles only, no AI attribution lines.
7. Run the phase's "Before the PR" list. Open the PR against `main` and mention the other dev (`@syedmukheeth` or `@Saadahmed05`) in a comment, since fork PRs do not notify by default.
8. Tick the phase's "Done when" boxes in the PR description. Write the end of day report (`prompts/_shared/end-of-day-report.md`) into `progress/daily-log.md`.

## Order

Phases 1, 2 and 4 can run in parallel. Phase 3 after Phase 1 is merged. `human-tasks.md` items can start any time; Phase 2 and Phase 4 sign off wait for them.
