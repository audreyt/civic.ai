# Vite+-Managed Runtime CI Design

Date: 2026-07-14
Status: Implemented
Supersedes: `bun-native-ci-design.md` (2026-07-10, Bun-native CI boundary)

## Problem

The Bun-native CI boundary made every repository-controlled JavaScript invocation in CI resolve through Bun's own runtime (`bun --bun install|run|test`), while official GitHub Actions kept their maintained Node.js internals. That design predates the project's separate migration of root dependency installation, linting, type checking, and the test suite onto [Vite+](https://viteplus.dev/) (`vp`), which pins its own managed Node.js runtime via `package.json#devEngines.runtime` (22.23.1) and runs Vitest with the `v8` coverage provider under an enforced 100%-statement/branch/function/line gate (`vite.config.ts`'s `test.coverage.thresholds`).

Bun does not implement the `node:inspector` API that Vitest's `coverage-v8` provider uses to collect coverage. Running `vp test` under Bun — by wrapping the invocation in `bun --bun run …` or setting a project-wide `bunfig.toml` `[run] bun = true` — silently forces the whole `vp` process tree onto Bun, and coverage collection fails outright. The CI workflows must invoke the root lifecycle (`vp install`, `vp check`, `vp test`, `vp build`, and the package-script validators) through the vp-managed Node.js runtime, not through Bun.

Bun has not left the picture. `package.json#devEngines.packageManager` still pins Bun as the package manager `vp install` provisions, and Bun remains the deliberate runtime for two things outside the vp-managed root lifecycle:

1. Standalone utility scripts (`pangu-format.mjs`, `scripts/*.mjs`) entered through `vp run <script>` — the script body, not the CI workflow, is what invokes `bun`.
2. The isolated `worker/` Cloudflare package, which keeps its own `bun.lock`, its own install entered through `vp install`, and its own `bun test` run, entirely separate from the root vp lifecycle.

## Goals

1. Bootstrap both workflows' root lifecycle through the same managed Node.js runtime `vp` uses locally, pinned by `package.json#devEngines.runtime` (22.23.1), via `voidzero-dev/setup-vp@v1`.
2. Install root dependencies with an explicit, frozen `vp install --frozen-lockfile` step, matching the sibling architecture already running in `plurality.net`.
3. Keep Bun as the configured package manager and as the separate runtime for utility scripts and `worker/`, while entering dependency installation and package scripts through `vp`.
4. Preserve every validator the prior Bun-native design ran: same-repository pull-request auto-formatting without granting privileged credentials to fork code, content/build validators (internal links, hybrid design, Astro output, search output, build parity), worker typecheck/test, GitHub Pages hidden-file preservation, and deployment retries.
5. Leave the fork-restriction and auto-format security model (`pull_request` trigger, `github.event.pull_request.head.repo.full_name == github.repository` gating) untouched — that boundary is orthogonal to the runtime cutover.

## Non-goals

- Re-litigate the fork/same-repository pull-request security boundary; it is unchanged from `bun-native-ci-design.md`.
- Change `worker/`'s package manager or test runner; it stays a separate Bun package while Vite+ supplies the pinned Bun executable and command entry point.
- Report current test/coverage/snapshot counts here. Those figures belong to the root suite and content-validator work tracked separately from this workflow-bootstrap cutover, and would go stale independently of it.
- Change build or deployment outputs.

## Considered approaches

### `voidzero-dev/setup-vp@v1` bootstrap + Vite+-managed Bun for `worker/` — selected

Both workflows use `voidzero-dev/setup-vp@v1` with `node-version: '22.23.1'` (matching `devEngines.runtime`), `cache: true`, and `run-install: false`, followed by explicit frozen `vp install` steps at the root and in `worker/`. Vite+ resolves the root `packageManager` pin and provisions Bun for both installs, so a separate `oven-sh/setup-bun` action is redundant. `worker/` still owns its lockfile and executes its typecheck and test under Bun.

### Global `bunfig.toml` `[run] bun = true`

Rejected in the prior design for forcing Wrangler onto Bun, and rejected again here for a second, sharper reason: it would force `vp test`'s Vitest `coverage-v8` provider onto Bun, which cannot collect coverage without `node:inspector`, breaking the 100% coverage gate outright.

### Keep `bun --bun run <script>` for every root command

This was the prior design's approach. It no longer fits the root lifecycle's move to `vp`: `package.json` no longer exposes a `check` script (type-aware checking moved into `vp lint`'s `typeAware`/`typeCheck` options), and the historical `bun test` root command has been replaced by `vp test`'s Vitest suite with an enforced coverage gate. Continuing to shell through Bun for those commands would either fail outright (missing script) or silently defeat coverage collection.

## Workflow design

### Root lifecycle bootstrap

In `.github/workflows/ci.yml` and `.github/workflows/static.yml`:

- `voidzero-dev/setup-vp@v1` with `node-version: '22.23.1'`, `cache: true`, `run-install: false`.
- `vp install --frozen-lockfile` as an explicit step.
- Native vp lifecycle commands are called directly: `vp check` (formatting + lint + type-aware checks) as the CI gate step, and `vp test`, `vp build`. `vp test`'s Vitest `globalSetup` (`tests/global-setup.ts`) additionally runs a full `tsc --noEmit`, the CJK-spacing gate (`pangu-format.mjs --check`), and the Mandarin-typography gate (`scripts/check-tw-typography.mjs`) once before any test executes — so those content gates still run in CI without a separate `vp run lint` step. Every other root package-script validator is entered via `vp run <script>` (`format`, `check-links`, `check:hybrid`, `check:astro-output`, `check:search`, `check:parity`, `worker:typecheck`, `worker:test`). The full `lint` package script (`vp fmt --check . && vp lint && bun pangu-format.mjs --check && bun scripts/check-tw-typography.mjs`) stays available as an optional scoped full check for local/manual use (`vp run lint`); it is not invoked as a separate CI step because `vp check` plus `vp test`'s global setup already cover the same ground in CI. The `vp staged` pre-commit hook runs its own staged-file config (`vite.config.ts`'s `staged` block: `vp fmt`, `pangu-format.mjs`, `scripts/check-tw-typography.mjs` on changed files), independent of the `lint` package script.

### Worker runtime, install, and test

`worker/` keeps its own `bun.lock` and Bun test runner. Its dependencies are installed with `working-directory: worker` and `vp install --frozen-lockfile`; the package manager resolves to the root `packageManager` pin provisioned by Vite+. The root `worker:typecheck`/`worker:test` package scripts — which `cd worker` and shell out to `bun run typecheck`/`bun run test` — are invoked via `vp run`, so the workflows need no separate package-manager setup action or direct Bun command.

### GitHub Action runtimes

Unchanged from the prior design: current generations of `actions/checkout@v7`, `actions/configure-pages@v6`, `actions/upload-pages-artifact@v5`, and `actions/deploy-pages@v5`. `voidzero-dev/setup-vp@v1` declares its own maintained action runtime; `.github/dependabot.yml`'s weekly `github-actions` update continues to surface future action-runtime transitions.

### Hidden Pages artifact compatibility

Unchanged: `actions/upload-pages-artifact@v5` sets `include-hidden-files: true` so `dist/.nojekyll` and `dist/.well-known/openclaw/SKILL.md` survive upload.

### Pull-request security and formatting

Unchanged: `pull_request` trigger (not `pull_request_target`), `github.head_ref` checkout with credential persistence gated on `github.event.pull_request.head.repo.full_name == github.repository`, `contents: write` declared explicitly, auto-format only runs and pushes for same-repository pull requests. The auto-format step now runs `vp run format` instead of `bun --bun run format`; the security gating that decides whether it runs at all is untouched.

### Deployment retries

Unchanged: the Pages `deploy` job in `static.yml` retries `actions/deploy-pages@v5` up to three additional times with 30s/60s/120s backoff on transient "Deployment failed, try again later." failures.

## Regression contract

Implementation is complete only after all of the following pass, matching the two final workflows exactly:

1. `vp fmt --check` validates the modified YAML and Markdown files.
2. `vp install --frozen-lockfile` succeeds at the pinned `node-version: '22.23.1'` in both workflows.
3. `worker/` installs with `vp install --frozen-lockfile` in its working directory and passes `vp run worker:typecheck` and `vp run worker:test` without a separate Bun setup action.
4. The complete root validation chain in `ci.yml`/`static.yml` runs in order: auto-format (same-repository pull requests only) → `vp check` → `vp run worker:typecheck` → `vp test` → `vp run worker:test` → `vp build` → `vp run check-links` → `vp run check:hybrid` → `vp run check:astro-output` → `vp run check:search` → `vp run check:parity`.
5. The Pages upload step sets `include-hidden-files: true`, preserving `.nojekyll` and `.well-known/openclaw/SKILL.md`.
6. A workflow search confirms no remaining `actions/setup-node`, `oven-sh/setup-bun`, `bun --bun`, or direct Bun workflow commands; no `pull_request_target`; and no reference to the removed root `check` package script.

Actual pass/fail counts, coverage percentages, and snapshot/file totals for the root suite and content validators are tracked with that migration, not restated here.

## Expected result

Both workflows bootstrap through the same managed Node.js runtime `vp` uses locally and install root and worker dependencies through explicit frozen `vp install` steps. Bun stays the configured package manager, the intentional runtime for utility scripts entered via `vp run`, and the runtime/test runner for the separate `worker/` package without a redundant setup action. Same-repository pull-request auto-formatting, fork restrictions, content/build validators, worker typecheck/test, Pages hidden-file preservation, and deployment retries are all preserved from `bun-native-ci-design.md`.
