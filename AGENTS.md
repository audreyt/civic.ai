# Agent Notes

Finish the current request. An explicit user instruction in this conversation overrides this file, except: do not wrap `vp` lifecycle commands in Bun; do not edit `dist/` or generated `public/`; keep British English and Traditional Mandarin pairs in parity (including the em-dash convention below). Do not push or deploy unless explicitly requested (pushing `main` deploys `dist/` to Pages).

Treat action requests as authorization to edit. Do not stop at a plan or an offer to continue. If missing information would materially change the outcome, ask before acting; otherwise proceed and finish the local work.

Delegate independent slices in parallel when that would save time. Keep replies short. Match verification to the change.

## Build & Development

**Root lifecycle:** [Vite+](https://viteplus.dev/) (`vp`), running under its own managed Node.js runtime (pinned via `package.json#devEngines.runtime`, currently 22.23.1). Bun remains the configured package manager (`package.json#devEngines.packageManager`) and is the intentional runtime for standalone utility scripts (`pangu-format.mjs`, `scripts/*.mjs`) entered through `vp run <script>`, and for the isolated `worker/` Cloudflare package, which keeps its own `bun.lock`, install, and test run, entirely separate from the root `vp` lifecycle — see `worker:typecheck`/`worker:test` below. Never wrap a `vp` lifecycle command (`vp test`, `vp check`, `vp build`) in Bun's own runner: it silently forces `vp test`'s Vitest coverage-v8 provider onto Bun, which does not implement the `node:inspector` API coverage collection needs, and the run fails outright.

**Static site generator:** Astro 7

```bash
vp install              # install dependencies
vp dev                  # local Astro dev server at http://127.0.0.1:4321
vp check                # formatting check + lint + type-aware checks
vp test                 # root test suite, 100% coverage gate
vp build                # production build → ./dist/
vp run check-links      # validate built internal links in ./dist/
vp run worker:typecheck # isolated worker/ Cloudflare package
vp run worker:test      # isolated worker/ tests
```

Match verification to the change. Markdown: content and typography gates. Code or layout: `vp check`, the focused test the change can break, and `vp build`. Tests moved: `vp test`. `worker/` moved: `vp run worker:typecheck` and `vp run worker:test`. After those pass, broaden only if something failed or the change grew. Do not add tests that restate a reversible copy edit.

## Architecture

**Build pipeline:** root Markdown/HTML sources + `_data/*` → custom `markdown-it` renderer and Astro layouts/components/routes → static HTML in `dist/`.

**Content files** remain top-level Markdown with YAML front matter. Do not move canonical content into `src/content/`; `scripts/review-set.mjs`, `scripts/check-tw-typography.mjs`, and the Vite+ staged-file hook (`vp staged`) rely on root `*.md`/`tw-*.md` files.

**Astro source** lives in `src/`:

- `src/lib/legacyMarkdown.ts` — markdown-it, footnotes, anchors, and the CJK emphasis patch formerly in Eleventy
- `src/lib/pages.ts` — typed root-content loader and URL derivation
- `src/lib/shortcodes.ts` — explicit replacements for former Liquid/Nunjucks include shortcodes
- `src/components/` — shared head, navigation, footer, client scripts, Polis report, colophon
- `src/layouts/` — `DefaultShell.astro`, `Default.astro`, `Chapter.astro`, `Conference.astro`
- `src/pages/` — Astro routes and machine endpoints (`robots.txt`, `llms.txt`, `sitemap.xml`, `.well-known/openclaw/SKILL.md`)

**Site data:** `_data/site.json` (title, description, URL, languages), plus `_data/paths.json`, `_data/comics.json`, `_data/glossary.json`, `_data/openclaw_bootstrap.js`, and Polis data/UI loaders.

**Static assets:** source assets live in `img/`, `fonts/`, `audio/`, `styles.css`, `CNAME`, `.nojekyll`, and favicons. `scripts/sync-public.mjs` regenerates `public/` before dev/build; Astro copies `public/` to `dist/`.

**Config:** `astro.config.mjs` — custom-domain root site, static output, directory URLs, `dist/` output.

**Deployment:** GitHub Actions (`.github/workflows/static.yml`) auto-deploys `dist/` to GitHub Pages on push to main.

## Conventions

- Front matter: YAML, four-space indent, `snake_case` keys, double-quoted strings with spaces
- CSS: all styles in `styles.css`, mobile-first, use existing custom properties
- Commits: short imperative style (e.g. `add manifesto link`, `ch7: fix anchor ids`)
- Never edit `dist/` or generated `public/`; they are build artifacts
- Optimize images before committing; reuse existing typography tokens in CSS
- When adding/editing content, maintain parity between British English and Traditional Mandarin variants. `vp run en`/`vp run tw` cat the paired page sets to the clipboard and warn on stderr about any page missing its twin — see `scripts/review-set.md`.
- Em dashes: English files use `—` (spaced single); Mandarin `tw-*.md` files use `——` (double, no spaces)

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Match verification to the change. Markdown: content and typography gates. Code or layout: `vp check`, the focused test the change can break, and `vp build`. Tests moved: `vp test`. `worker/` moved: `vp run worker:typecheck` and `vp run worker:test`. After those pass, broaden only if something failed or the change grew. Do not add tests that restate a reversible copy edit.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for the change, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->
