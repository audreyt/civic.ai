# Bun-Native CI Design (superseded)

Date: 2026-07-10
Status: Superseded 2026-07-12 by the Vite+-managed runtime cutover — see `vp-runtime-ci-design.md`. Kept as the historical record of the Bun-native boundary that preceded it; the workflow design and validation steps below no longer match `.github/workflows/ci.yml`/`static.yml`.

## Problem

The GitHub Actions run `29059112124` succeeded but warned that `actions/checkout@v4` declares a Node.js 20 action runtime and was being forced onto Node.js 24 by the runner.

The warning concerns the private runtime of a GitHub Action, not the runtime selected by repository commands. Both workflows still use `actions/checkout@v4`. The Pages workflow also uses Node.js 20 generations of `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages`.

Repository commands are currently Bun-led but not uniformly Bun-runtime-native. Bun normally respects package executable shebangs. Astro's executable declares `#!/usr/bin/env node`, so a plain `bun run build` launches Astro with Node. The selected boundary is:

> All repository-controlled JavaScript in CI runs under Bun. Maintained GitHub Actions may continue to use GitHub's bundled runtime internally.

## Goals

1. Remove every Node.js 20 action warning from both GitHub workflows.
2. Execute install hooks, package scripts, tests, Astro, TypeScript, Prettier, Pagefind, and repository scripts under Bun in CI.
3. Keep GitHub Pages deployment on the supported official action chain.
4. Prevent future action-runtime migrations from becoming surprise warnings.
5. Preserve same-repository pull-request auto-formatting without granting privileged credentials to fork code.

## Non-goals

- Eliminate GitHub's internal Node runtime from JavaScript actions.
- Force every local or Cloudflare command to use Bun.
- Remove `.node-version`, `.nvmrc`, `.tool-versions`, or `engines.node`; they remain compatibility pins for local Wrangler and Cloudflare workflows.
- Replace the GitHub Pages actions with custom shell or API deployment machinery.
- Change the build, test, or deployment outputs.

## Considered approaches

### Job-scoped `bun --bun` commands — selected

Prefix each Bun invocation in CI with `bun --bun`. Bun then places its own `node` alias first in `PATH` recursively, including for package executables with Node shebangs. This makes the runtime choice explicit at each workflow boundary and does not alter local worker deployment.

### Project-wide `bunfig.toml`

Setting `[run] bun = true` would provide a shorter global invariant. It would also affect local commands and could force the worker's Wrangler development and deployment CLI onto Bun. Wrangler does not officially support Bun as its runtime, so this is broader and riskier than the CI request.

### Action upgrades only

Updating action versions would remove the deprecation warning but leave Astro and other Node-shebang tools running under Node. This does not satisfy the selected Bun-native CI boundary.

## Workflow design

### Repository command runtime

In `.github/workflows/ci.yml` and `.github/workflows/static.yml`:

- `bun install` becomes `bun --bun install`.
- `bun run <script>` becomes `bun --bun run <script>`.
- `bun test` becomes `bun --bun test`.

The `--bun` option is placed before the subcommand so it controls shebang resolution. Its effect propagates through nested scripts, including root scripts that enter `worker/`.

No global Bun configuration is added.

### GitHub Action runtimes

Use the current Node.js 24 generations of the official actions:

| Action                          | Existing | Target |
| ------------------------------- | -------- | ------ |
| `actions/checkout`              | `v4`     | `v7`   |
| `oven-sh/setup-bun`             | `v2`     | `v2`   |
| `actions/configure-pages`       | `v5`     | `v6`   |
| `actions/upload-pages-artifact` | `v3`     | `v5`   |
| `actions/deploy-pages`          | `v4`     | `v5`   |

`oven-sh/setup-bun@v2` already declares a Node.js 24 action runtime and remains unchanged.

### Hidden Pages artifact compatibility

`actions/upload-pages-artifact@v5` excludes dotfiles and dot-directories by default. This build deliberately emits `dist/.nojekyll` and `dist/.well-known/openclaw/SKILL.md`; omitting either changes deployed behavior even though local `dist/` checks still pass. Set `include-hidden-files: true` on the upload action so the v5 archive retains both paths. The existing Astro-output and parity checks continue to assert that both files exist before upload, while workflow inspection asserts that the upload action preserves them.

### Pull-request security and formatting

The current CI workflow uses `pull_request_target`, explicitly checks out the pull request head, installs its dependencies, and executes its scripts. That combines untrusted fork code with the base repository's privileged workflow context, the GitHub Security Lab's documented "pwn request" pattern. Checkout v7 blocks this combination by default.

Change the trigger to `pull_request` so fork code runs with GitHub's restricted pull-request token and without repository secrets.

Checkout behavior:

- Pushes use the event branch.
- Fork pull requests use the pull-request event ref and do not persist credentials.
- Same-repository pull requests check out `github.head_ref` as a branch and may persist the token, because the auto-format step must push to that branch and the contributor already has repository write access.

Declare `contents: write` explicitly for the CI workflow. GitHub downgrades the token for fork pull requests; the same-repository condition remains the only path that performs `git push`.

Change the auto-format condition from `pull_request_target` to `pull_request` while retaining the same-repository check. Checking out `github.head_ref` also fixes the existing latent detached-HEAD failure in the bare `git push` path.

### Dependency automation

Add `.github/dependabot.yml` with a weekly `github-actions` ecosystem update rooted at `/`. This covers action major-version migrations, including future bundled-runtime changes. Dependabot opens reviewable pull requests; it does not auto-merge major action changes.

## Validation

Implementation is complete only after all of the following pass:

1. Prettier checks the modified YAML and JSON/configuration files.
2. `actionlint` validates both workflows.
3. The complete repository validation chain runs with `bun --bun`:
    - dependency installation with frozen lockfiles in root and `worker/`
    - lint
    - root and worker typechecks
    - root and worker tests
    - production build
    - internal-link check
    - hybrid-design check
    - Astro-output check
    - search-output check
    - build-parity check
4. The Pages upload step sets `include-hidden-files: true`, preserving `.nojekyll` and `.well-known/openclaw/SKILL.md` in the deployment artifact.
5. A workflow search confirms no remaining references to the old action generations or `pull_request_target`.

A pre-design feasibility run already passed under Bun 1.3.14: production build, lint, both typechecks, 40 root tests, 13 worker tests, links, 68 hybrid assertions, 11 Astro-output assertions, search checks, and parity across 80 HTML snapshots and 172 required files.

## Expected result

Repository-controlled CI code runs under Bun. Official actions run on their maintained Node.js 24 internals. The Node.js 20 deprecation warning disappears, fork pull requests lose the privileged execution path, same-repository formatting remains push-capable, and Dependabot surfaces future action-runtime transitions before GitHub forces them.
