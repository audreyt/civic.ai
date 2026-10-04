# Self-hosted fonts

The browser and production build make no font requests to third parties.

## Refreshing sources

- `vp run fonts:latin` fetches Google Fonts' desktop-Chrome CSS2 WOFF2 `latin`
  and `latin-ext` slices for Literata normal/italic (variable weight 400–700)
  and IBM Plex Mono 400/500/600. `latin-manifest.json` records the CSS query,
  resolved URLs, byte sizes and Unicode ranges. Keep these ranges in the
  contiguous charter block of `styles.css` in sync if Google changes them.
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

Literata's optical-size axis is fixed at the Google CSS2 default rather
than retained, to reserve the English budget for both styles and all
three machinery weights. Its five Latin critical-path files total
109,596 bytes; the normal + mono-400 preloads total 49,312 bytes.
The `latin-ext` slices are additional downloads only when their ranges
are used. OFL licences accompany both families.

## Chinese text

No Han webfont ships. Chinese prose uses the reader's own faces, named in
`styles.css` (`--prose`, and `--serif` on zh pages): Noto Serif CJK TC or
Source Han Serif TC where installed, Songti TC on macOS, then PingFang TC
(iPhone and iPad, which ship no Traditional Chinese Song face) and
Microsoft JhengHei (Windows), before the generic `serif` that Android
resolves to Noto Serif CJK TC. `Literata Fallback` precedes them so Latin
stays serif while Literata loads. Civic Kai, for emphasis, is local-only;
the machinery voice names `Noto Sans TC` but does not ship it.
DESIGN.md §6.2 records why the self-hosted Noto Serif TC subsets were
retired.
