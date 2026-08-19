# Civic AI — 6-Pack of Care

Source for **[civic.ai](https://civic.ai/)** — the bilingual (British English/Traditional Mandarin) static site for the **6-Pack of Care**, a Civic AI governance framework by [Audrey Tang](https://afp.oxford-aiethics.ox.ac.uk/people/ambassador-audrey-tang) and [Caroline Green](https://www.oxford-aiethics.ox.ac.uk/caroline-emmer-de-albuquerque-green) at the [Oxford Institute for Ethics in AI](https://www.oxford-aiethics.ox.ac.uk/).

<p align="center">
  <a href="https://civic.ai/comics/"><img src="img/overview-small.jpg" alt="The 6-Pack of Care, illustrated by Nicky Case" width="420"></a>
</p>

Civic AI is artificial intelligence that answers to the people it affects: many small, bounded local stewards — each a **Kami** — that a community can own, inspect, correct, and switch off, instead of one system built to govern everyone. The 6-Pack of Care is the governance framework — six plain-language tests for AI a community can actually trust.

- **The idea** → start with the [Manifesto](https://civic.ai/manifesto/); the six packs run [1](https://civic.ai/1/) · [2](https://civic.ai/2/) · [3](https://civic.ai/3/) · [4](https://civic.ai/4/) · [5](https://civic.ai/5/) · [6](https://civic.ai/6/), with [Measures](https://civic.ai/measures/) and the [FAQ](https://civic.ai/faq/). The full site — illustrations, audio, case studies — is **[civic.ai](https://civic.ai/)**.
- **Working in the codebase** → build, architecture, and conventions live in [AGENTS.md](AGENTS.md).
- **This README** → how the repository is laid out, and how to run and contribute to it.

Built with [Astro 7](https://astro.build/) and [Vite+](https://viteplus.dev/).

## Quickstart

Install the global Vite+ CLI, then install project dependencies:

```bash
curl -fsSL https://vite.plus | bash
vp install
```

If the current shell has not refreshed its PATH, use the installed binary at `~/.vite-plus/bin/vp`.

## Development

```bash
vp dev     # Astro dev server → http://127.0.0.1:4321
vp build   # production build → dist/
```

## Checks and tests

```bash
vp check
vp test
```

`vp check` runs formatting, linting, and type-aware checks. `vp test` is the root test suite — the renderer, root-content loader, search corpus, and static client contracts — under a 100% statement/branch/function/line coverage gate; its global setup also runs a full TypeScript compile check, the CJK-spacing gate, and the Mandarin typography gate before any test executes (this project keeps canonical content in root `*.md`/`tw-*.md`, not Astro content collections, so no `astro sync` step runs).

## Scripts

| Command                                  | What it does                                                                                             |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `vp dev`                                 | Sync generated public assets, then start Astro with live reload at `http://127.0.0.1:4321`.              |
| `vp build`                               | Production build of the static site, minified HTML, and Pagefind index → `dist/`.                        |
| `vp check`                               | Formatting check, linting, and type-aware checks.                                                        |
| `vp test`                                | Root test suite (100% coverage gate).                                                                    |
| `vp run lint`                            | Formatting check + lint + type-aware checks + CJK spacing check + Mandarin typography check.             |
| `vp run format`                          | Auto-fix formatting and CJK spacing.                                                                     |
| `vp run check-links`                     | After a build, validate internal links and anchors across `dist/`.                                       |
| `vp run check:hybrid`                    | After a build, validate the hybrid Astro/legacy-content design contract.                                 |
| `vp run check:astro-output`              | After a build, validate Astro-specific output shape.                                                     |
| `vp run check:search`                    | After a build, validate the search overlay, Pagefind markup, and `/tw/search-index.json`.                |
| `vp run check:parity`                    | After a build, validate output parity against the historical build baseline.                             |
| `vp run polis:refresh -- --commit <sha>` | Refresh the checked-in Polis snapshot from one immutable upstream commit.                                |
| `vp run sensemaker:extract`              | Print canonical narrative evidence derived from the checked-in Polis snapshot.                           |
| `vp run sensemaker:regenerate`           | Generate each report locale twice with local Ollama and write only byte-identical canonical results.     |
| `vp run sensemaker:regenerate:wasm`      | Replay each locale twice in Chrome with the pinned public GGUF and wllama WASM runtime.                  |
| `vp run sensemaker:verify`               | Verify snapshot, prompt, narrative, rendered report, and manifest hashes without contacting a model.     |
| `vp run sensemaker:test`                 | Run the isolated offline grounding and replay tests in `sensemaker/`.                                    |
| `vp run vectorize:sync-site`             | Upsert the Civic AI search corpus into the `civic-ai-site` Cloudflare Vectorize index.                   |
| `vp run worker:typecheck`                | Type-check the isolated `worker/` Cloudflare `/au` package.                                              |
| `vp run worker:test`                     | Run the isolated `worker/` route, RAG, and citation tests.                                               |
| `vp run en`/`vp run tw`                  | Copy the canonical English/Mandarin page set to the clipboard for translation review (macOS `pbcopy`).   |
| `vp run import-comics`                   | Re-import and optimise Nicky Case's comic pages into `img/` (maintenance helper, not part of the build). |

A Vite+ **pre-commit hook** runs `vp staged` (formatting + CJK spacing + Mandarin typography checks) on staged files, and re-validates build parity when content or build files change.

### Deterministic conference replay

`/conference/sensemaking/` and `/conference/report/` use the same checked-in Polis snapshot. A normal build is offline: the sensemaking view derives directly from verified CSVs, while the report consumes verified bilingual narrative artifacts bound to the same snapshot ID.

Anyone can verify and rebuild both published views without a model:

```bash
vp run sensemaker:test
vp run sensemaker:verify
vp build
```

Refreshing the source or replaying the local batch-one narrative inference is an explicit maintenance operation. The canonical replay uses a public content-pinned GGUF through a pinned wllama WebAssembly runtime; Ollama remains available for intentionally creating candidates with different provenance. See [`sensemaker/README.md`](sensemaker/README.md) for the immutable-source workflow, model and runtime digests, deterministic decoding settings, bilingual evidence rules, and exact regeneration commands.

Search uses Pagefind for English pages, a Fuse-backed Traditional Mandarin sidebar from `/tw/search-index.json`, and a separately configured `worker/` `/au/:question` API for streamed answers — see `worker/README.md` for that package's own setup. The Worker retrieves from Cloudflare Vectorize binding `SITE_VECTORIZE` (`civic-ai-site`) and uses `AUDREY_MODEL=nemotron-ultra` with `BASETEN_API_KEY` plus optional `CF_AIG_TOKEN` to stream Nemotron Ultra through the Cloudflare AI Gateway; without those secrets it returns a deterministic excerpt/stub response for tests and local development.

## Repository layout

| Path                            | What it is                                                                                                        |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `src/`                          | Astro source: typed root-content loader, custom Markdown renderer, layouts, components, routes, search endpoints. |
| `_data/`                        | Global data plus the SHA-verified, immutable Polis snapshot used by both conference views.                        |
| `*.md` (root)                   | Canonical Markdown content, British English. Front-matter `permalink` sets the URL.                               |
| `tw-*.md`                       | Traditional Mandarin twin of each English page (served under `/tw/…`); kept in parity.                            |
| `assets/js/`                    | Source client scripts for the search overlay and `/au` answer stream, copied into generated `public/`.            |
| `img/`, `fonts/`, `audio`       | Source static assets copied through generated `public/` into the build.                                           |
| `worker/`                       | Isolated Cloudflare Worker for the `/capacity` and streaming `/au/:question` answer API, with its own README.     |
| `sensemaker/`                   | Isolated local-inference, evidence, rendering, replay-manifest, verification, and test package.                   |
| `scripts/`                      | Content, validation, search, Vectorize, build, and migration helper scripts (see [Scripts](#scripts)).            |
| `styles.css`                    | All site styles (mobile-first; CSS custom properties).                                                            |
| `astro.config.mjs`              | Astro static build config: custom-domain root, directory URLs, `dist/` output.                                    |
| `openclaw.md`, `tw-openclaw.md` | Human OpenClaw bootstrap guides; machine-readable endpoint is generated from `_data/openclaw_bootstrap.js`.       |
| `specs/`                        | Internal design & implementation notes (unpublished).                                                             |
| `public/`                       | **Generated** Astro public directory from `scripts/sync-public.mjs` — never edit by hand (gitignored).            |
| `dist/`                         | **Generated** build output — never edit by hand (gitignored).                                                     |

## Authoring content

- Each page is a single Markdown file with YAML front matter. `permalink` sets the URL — e.g. `1.md` → `/1/`, `manifesto.md` → `/manifesto/`.
- Every English page `foo.md` has a Traditional Mandarin twin `tw-foo.md` served at `/tw/foo/`. The two link to each other through the `alt_lang_url` front-matter key — **keep them in parity** when you change either.
- Front-matter keys in use: `layout`, `title`, `meta_description`, `summary`, `lang`, `permalink`, `alt_lang_url`.
- Formatting rules (em dashes, four-space YAML, locked Mandarin terminology) are enforced in CI by `vp check` and `vp test`'s global setup, and locally by the pre-commit hook (staged files) or `vp run lint` (full repo); details in [AGENTS.md](AGENTS.md).

## Contributing

Pull requests are welcome. By contributing, you agree to release your work under the [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/) public-domain dedication ([`LICENSE`](LICENSE)).

Keep English (`*.md`) and Traditional Mandarin (`tw-*.md`) variants in parity, and reuse the project's locked Mandarin terminology rather than coining new translations.

Part of the [Accelerator Fellowship Programme](https://afp.oxford-aiethics.ox.ac.uk/), [Oxford Institute for Ethics in AI](https://www.oxford-aiethics.ox.ac.uk/).
