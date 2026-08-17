# Review-set definition

`bun run en` and `bun run tw` copy the English and Traditional-Mandarin page
sets to the clipboard (`pbcopy`) for translation review. The set needs no
hand-maintained **include** list — and it does have a small, deliberate
**exclude** list below for pages that are paired (so they exist in both
languages) but whose source isn't prose a translator should review.

## How the set is defined

By en↔tw pairing, matching the repo's own invariant (see `README.md` →
"Authoring content" and `AGENTS.md`):

> Every English page `foo.md` has a Traditional Mandarin twin `tw-foo.md`
> served at `/tw/foo/`. Keep them in parity.

- `bun run en` cats every `foo.md` whose `tw-foo.md` twin also exists, minus
  the excludes below.
- `bun run tw` cats the matching `tw-foo.md` files, in the same (alphabetical)
  order, minus the same excludes.
- Repo metadata — `README.md`, `CLAUDE.md`, `AGENTS.md`, `DESIGN.md` — is held
  out by name in `scripts/review-set.mjs`: none has a `tw-` twin by design, so
  they're excluded from parity checking too.
- Adding a page means adding both `foo.md` and `tw-foo.md`; both runs pick it
  up with no edit here.

## exclude

One base name per line (the English filename, e.g. `comics.md`, **not** the
`tw-` twin). A single entry excludes both the English page and its Mandarin
twin, so the list stays one-per-page. `#` starts a comment. Update this list
when a paired page clearly shouldn't appear on a translator's clipboard
(image galleries, Liquid-templated glossaries, structured-data indexes). When
in doubt, leave it in and let the translator skip it.

```exclude
# Image gallery — its source is picture layout, not prose to review:
comics.md
# Liquid-templated definition list — raw source is a {% for %} loop, not text:
glossary.md
```

Pages currently shipped to the clipboard without an exclude entry that are
worth a judgment call:

- `conference.md` — conference programme (hosts, speakers, schedule). Remove
  this comment and add `conference.md` above if you'd rather not review it.
- `polis-report.md` — Polis sensemaking report (charts, quotes). Borderline
  prose; add `polis-report.md` above if it shouldn't be on the pass.

## Parity check

Any page present in one language but not the other is an **orphan** and a
parity violation. `bun run en`/`bun run tw` print a `PARITY VIOLATION`
warning to stderr naming each orphan and its missing twin. The orphaned page
is held out of the clipboard until its twin lands. Fix the violation by
adding the missing twin — not by editing any list here.

A second warning, `exclude entry "X" is not a paired content page`, fires if
you list a file here that doesn't exist (e.g. after a rename); remove the
stale line.

## Why not a hand-maintained include list

The previous `en`/`tw` scripts kept a hand-typed include list, which
drifted to cover only 17 of the repo's 37 pages: ~20 published pages silently
missed the clipboard. Defining inclusion by pairing removes that maintenance
surface; the only hand-typing left is this exclude list, which changes rarely.
