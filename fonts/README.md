# Self-hosted fonts

The browser and production build make no font requests to third parties.

## Refreshing sources

- `vp run fonts:latin` fetches Google Fonts' desktop-Chrome CSS2 WOFF2 `latin`
  and `latin-ext` slices for Literata normal/italic (variable weight 400–700)
  and IBM Plex Mono 400/500/600. `latin-manifest.json` records the CSS query,
  resolved URLs, byte sizes and Unicode ranges. Keep these ranges in the
  contiguous charter block of `styles.css` in sync if Google changes them.
- `vp run fonts:zh` fetches the pinned OFL Noto Serif TC upstream source,
  instances weights 400 and 600 with HarfBuzz, and retains the site's Han,
  CJK punctuation and Bopomofo superset from `tw-*.md`, `_data/`, `src/`
  and `sensemaker/{generated,source}/`.
  Only the resulting WOFF2 files and licence/manifest in `fonts/src/` belong
  in the repository; the full upstream TTF is never written to disk.
- `vp run comics:vector -- --src ../civic-ai-comics` (see
  `scripts/comics-vector.mjs`) cuts `patrick-hand-comics.woff2`,
  `patrick-hand-sc-comics.woff2`, `anton-comics.woff2` and `oswald-comics.woff2` from the OFL
  copies in Nicky Case's `design-resources/fonts`, retaining exactly the
  characters of `_data/comics-text-en.yml` (with the plain twins of its
  typographic quotes, dashes and ellipses). Their licences ship beside them
  as `OFL-PatrickHand.txt`, `OFL-PatrickHandSC.txt`, `OFL-Anton.txt` and
  `OFL-Oswald.txt`.

The maintenance scripts need a network connection, except the comics one,
which needs a local checkout of the comics repository instead. None runs in
CI.
Re-run the Chinese fetch after adding glyphs: the build warns with the
actual missing characters rather than silently claiming font coverage.

Literata's optical-size axis is fixed at the Google CSS2 default rather
than retained, to reserve the English budget for both styles and all
three machinery weights. Its five Latin critical-path files total
109,596 bytes; the normal + mono-400 preloads total 49,312 bytes.
The `latin-ext` slices are additional downloads only when their ranges
are used. OFL licences accompany both families.

## Offline Chinese build

`vp build` runs `scripts/subset-zh-fonts.mjs` after HTML minification and
before Pagefind. A plain `astro build` does not run the pass.
`vp run fonts:subset` can repeat it against an existing `dist/`.

The pass parses the HTML, decodes entities, collects disclosure text and
text-bearing attributes, and ignores scripts/styles. It includes `tw/`
pages and any other page containing a `lang="zh…"` element. Regular
subsets cover all page Han; the 600 subsets cover headings, strong text
and structural labels. The regular face also covers other weights where
no heavier glyph was required.

A site-wide intersection forms a shared common-glyph face; each page
downloads only that face and its delta. Identical subsets share a
content-hashed URL. Inline `@font-face` declarations use `swap` and
disjoint Unicode ranges. Han-only aliases for the named system fallbacks
(Georgia, PingFang TC and Kaiti TC) keep Chinese text working before the
separate CSS token cutover lands. Aliasing variable Latin faces instead
can mask their Latin glyphs in Chrome; these fallback aliases reuse the
same files and leave Latin type unchanged.

Noto Sans TC is not shipped in this slice. A third Han face would consume
the budget for machinery whose labels already remain legible in Noto
Serif TC. The CSS fallback name `Noto Sans TC` therefore aliases Noto
Serif TC in this slice: it is not a separately shipped sans face.
Small Han labels use the serif subsets; Latin machinery retains
Plex Mono. This is a deliberate weight-budget choice, not a system-font
fallback.

`dist/fonts/zh/report.json` lists per-page font bytes, files, missing
glyphs and budget status. Totals conservatively include both weights
and common/delta files, including hidden disclosure content. Over
260,000 bytes warns but never fails publication. Source fonts are removed
from `dist/fonts/src/`; they are build inputs, not browser downloads.

The pipeline uses JavaScript and HarfBuzz WebAssembly (`subset-font`);
`fontkit` reads source cmaps and `parse5` reads HTML. It needs neither
Python nor a network connection after dependency installation.
