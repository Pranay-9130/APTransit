# Prompts

> **Next work: v3.** The owner feedback round is merged on `main` (PR #9). Start with [v3/README.md](v3/README.md): full context, four phase prompts and the human only tasks.

One file per day, `day-01.md` to `day-20.md`. Each file has a prompt for **Dev A (frontend)** and one for **Dev B (backend)**, a sync point, and a "Done when" checklist.

## How to run a day

1. Pull `main`. Read the whole day file (5 minutes), both halves, so you know what the other dev is building.
2. Open your AI tool in the repo root (Claude Code, Codex, Cursor, anything).
3. Paste `_shared/context-preamble.md` first. It makes the tool read `progress/handoff.md` (the current state of the repo) before anything else.
4. Paste your prompt block (the fenced `text` block under your name) as the next message.
5. Let the tool plan first. Read its plan. Push back on anything that breaks `AGENTS.md` or the docs.
6. Work in small commits on your branch (`a/...` or `b/...`). Review every diff yourself before committing. You own the code, not the tool.
7. At the sync point: demo to each other, merge in the order given, tick "Done when".
8. Write your end of day report with `_shared/end-of-day-report.md` into `progress/daily-log.md`, and update the "Current state" section of `progress/handoff.md` (the dev who merges last does this).

## Rules for using these prompts

- The prompts point at the docs instead of repeating them. If the tool guesses instead of reading, tell it to open the doc.
- If a prompt conflicts with a doc, the doc wins. Log the conflict in `progress/decisions-log.md`.
- Unfinished work carries over to the next morning **before** the new day's prompt. Note it in the daily log.
- Never let the tool edit `docs/`, add dependencies outside `docs/04-tech-stack.md`, or add AI attribution to commits.
- "Optional skill hints" at the bottom of a day are Claude Code skills available on the lead dev's machine. Skip them if you use another tool.

## Time box

About 8 focused hours per dev per day. Tasks inside each prompt are ordered by importance. If a day is clearly too big by midday, cut from the bottom of the list and move the rest to "Carry over" in the log.

## Calendar

| Day | Phase | Dev A (frontend) | Dev B (backend) |
| --- | --- | --- | --- |
| [01](day-01.md) | Foundation | Accounts, web scaffold, tokens v0 | Monorepo, API skeleton, Prisma, CI |
| [02](day-02.md) | Foundation | Design system primitives | Full schema, migrations, seed |
| [03](day-03.md) | Foundation | App shells, i18n, `/design` gallery | Auth, RBAC, rate limits, audit |
| [04](day-04.md) | Citizen | Home, login, account | Network, search, fare |
| [05](day-05.md) | Citizen | Search results, bus details, timetable | Trips, seats, bookings, holds |
| [06](day-06.md) | Citizen | Booking flow | Payments (Razorpay test) |
| [07](day-07.md) | Citizen | Payment, confirmation, My tickets | Tickets: QR, activate, cancel, refund |
| [08](day-08.md) | Citizen | Ticket detail, live QR, activate, cancel | Gifting, passes, eligibility |
| [09](day-09.md) | Citizen | Gift, passes, free travel, notifications | Notifications, background jobs |
| [10](day-10.md) | Integration | PWA, citizen e2e, bug bash | Staging deploy, e2e support |
| [11](day-11.md) | Live | Driver app | GPS ingest, sockets, simulator |
| [12](day-12.md) | Live | Live tracking map | ETA, delay, validate, manifest |
| [13](day-13.md) | Live | Conductor scanner | Ops APIs, incidents, replacement |
| [14](day-14.md) | Ops | Depot dashboard, fleet, trips, incidents | Admin APIs, policies, audit |
| [15](day-15.md) | Ops | Bus profile, trip detail, replacement, admin UI | Analytics, reports |
| [16](day-16.md) | Gov | Command center and drill down | Feedback, complaints, offline scan pack |
| [17](day-17.md) | Gov | Analytics, reports, feedback UI | Security hardening, load tests |
| [18](day-18.md) | Polish | Telugu, accessibility, responsive, dark mode | Observability, backups, retention |
| [19](day-19.md) | Release | Both: full e2e, bug bash, performance | Both |
| [20](day-20.md) | Demo | Both: demo, handover, backlog | Both |

## After Day 20

| Round | Files |
| --- | --- |
| v2 journey plan | [v2-journey-plan.md](v2-journey-plan.md), [v2-design-spec.md](v2-design-spec.md) |
| v3 owner feedback | [v3/README.md](v3/README.md) (context, phases 1 to 4, human tasks) |
