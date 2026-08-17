#!/usr/bin/env node
// Build the translation-review clipboard set for `bun run en` / `bun run tw`.
//
// Inclusion: by en↔tw pairing, matching the repo's own invariant
// (README: "Every English page `foo.md` has a Traditional Mandarin twin
// `tw-foo.md` … keep them in parity"). `en` cats every `foo.md` whose `tw-foo.md`
// twin exists; `tw` cats the matching `tw-foo.md` files, same alphabetical
// order. This auto-includes every published page and needs no hand-maintained
// include list.
//
// Exclusion: scripts/review-set.md has an `## exclude` section listing page
// *base* names (e.g. `comics.md`) to hold back from the clipboard even though
// they are paired. A single name excludes both the English page and its twin,
// so the list stays one-per-page. Use this for paired pages that shouldn't be
// on a translator's clipboard — e.g. image galleries or Liquid templated
// glossaries whose raw source isn't prose to review.
//
// Repo metadata (README.md / CLAUDE.md / AGENTS.md) is held out by name from
// the en glob so it neither ships to the clipboard nor counts as a parity
// violation; none has a `tw-` twin by design.
//
// Parity check: warn on stderr about any page that exists in only one
// language — an English page with no `tw-` twin, or a `tw-` page with no
// English twin. The run still copies the *paired* set; orphans are held back
// until their twin lands.
//
// Companion doc: scripts/review-set.md.

import { readFileSync, globSync } from "fs";
import { spawnSync } from "child_process";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const META = new Set(["README.md", "CLAUDE.md", "AGENTS.md", "DESIGN.md"]);

function parseExclusions() {
    const path = join(here, "review-set.md");
    const out = new Set();
    let inExclude = false; // inside the `## exclude` heading's block
    let inFence = false; // inside a fenced ``` block
    for (const raw of readFileSync(path, "utf8").split("\n")) {
        const line = raw.trimEnd();
        // A new `## …` heading ends the previous heading's scope.
        if (/^##\s/.test(line)) inExclude = /^##\s+exclude\b/i.test(line);
        if (inExclude && line.trim().startsWith("```")) {
            inFence = !inFence;
            continue;
        }
        // Only fenced lines count as exclude entries — prose between fences
        // is free-form documentation and is ignored.
        if (inExclude && inFence) {
            const t = line.trim();
            if (!t || t.startsWith("#")) continue;
            out.add(t);
        }
    }
    return out;
}

// Normalise an exclude entry to a base filename: strip a leading slash and a
// `tw-` prefix, and take only the leading filename token (drop any trailing
// prose). Fenced entries are bare filenames, but be tolerant of stray text.
function base(name) {
    const m = name
        .replace(/^\/*/, "")
        .replace(/^tw-/, "")
        .match(/^[A-Za-z0-9_.-]+\.md\b/);
    return m ? m[0] : "";
}

const enAll = globSync("*.md", { cwd: root })
    .filter((f) => !f.startsWith("tw-") && !f.startsWith("ja-"))
    .filter((f) => !META.has(f))
    .sort();
const twAll = globSync("tw-*.md", { cwd: root }).sort();
const twSet = new Set(twAll);
const enSet = new Set(enAll);

const excludeRaw = parseExclusions();
const excludeBase = new Set([...excludeRaw].map(base));

const pairedEnAll = enAll.filter((f) => twSet.has("tw-" + f));
const pairedTwAll = twAll.filter((f) => enSet.has(f.slice(3)));
const pairedEn = pairedEnAll.filter((f) => !excludeBase.has(f));
const pairedTw = pairedTwAll.filter((f) => !excludeBase.has(f.slice(3)));

const orphanEn = enAll.filter((f) => !twSet.has("tw-" + f));
const orphanTw = twAll.filter((f) => !enSet.has(f.slice(3)));
// An exclude entry pointing at a non-paired page is itself drift.
const staleExclude = [...excludeBase].filter((f) => !enSet.has(f));

const lang = process.argv[2];
if (lang !== "en" && lang !== "tw") {
    console.error("usage: review-set.mjs <en|tw>");
    process.exit(2);
}

if (orphanEn.length || orphanTw.length) {
    for (const f of orphanEn)
        console.error(
            `review-set: PARITY VIOLATION — ${f} has no twin "tw-${f}"`
        );
    for (const f of orphanTw)
        console.error(
            `review-set: PARITY VIOLATION — ${f} has no twin "${f.slice(3)}"`
        );
}
for (const f of staleExclude)
    console.error(
        `review-set: exclude entry "${f}" is not a paired content page (remove from review-set.md)`
    );

const selected = lang === "en" ? pairedEn : pairedTw;
if (selected.length === 0) {
    console.error(
        `review-set (${lang}): no paired content files after excludes`
    );
    process.exit(1);
}

const blob = selected
    .map((f) => readFileSync(join(root, f), "utf8"))
    .join("\n\n");

const res = spawnSync("pbcopy", { input: blob });
if (res.status !== 0) {
    console.error(
        `review-set (${lang}): pbcopy failed (status ${res.status}) — is this macOS?`
    );
    process.exit(res.status ?? 1);
}
console.log(
    `review-set (${lang}): copied ${selected.length} paired files (${blob.length} bytes) to clipboard`
);
console.error(
    `  paired en=${pairedEn.length}  tw=${pairedTw.length}  orphan en=${orphanEn.length} tw=${orphanTw.length}  excluded=${excludeBase.size}`
);
