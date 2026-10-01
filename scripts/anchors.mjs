import { readFileSync, writeFileSync } from "node:fs";
import matter from "gray-matter";
import {
    assignAnchors,
    ledgerDifference,
    RECORD_URL,
    recordUnits,
    reservedAnchors,
} from "../src/lib/anchors.ts";
import { createMarkdownRenderer } from "../src/lib/legacyMarkdown.ts";
import { loadPages } from "../src/lib/pages.ts";
import { expandShortcodes } from "../src/lib/shortcodes.ts";

const mode = process.argv.filter((arg) => arg !== "--").at(-1);
if (mode !== "--write" && mode !== "--check") {
    console.error("Usage: bun run anchors -- --write | --check");
    process.exit(1);
}
const path = "_data/anchors.json";
const ledger = JSON.parse(readFileSync(path, "utf8"));
const next = {};
const differences = [];
for (const page of loadPages().filter((page) => RECORD_URL.test(page.url))) {
    const parsed = matter(readFileSync(page.sourcePath, "utf8"));
    const body = expandShortcodes(
        { sourcePath: page.sourcePath, data: page.data },
        parsed.content
    );
    const tokens = createMarkdownRenderer().parse(body, {});
    const current = assignAnchors(
        recordUnits(tokens).map((unit) => unit.text),
        ledger[page.url],
        reservedAnchors(body, tokens)
    );
    next[page.url] = current;
    differences.push(...ledgerDifference(page.url, ledger[page.url], current));
}
if (mode === "--write") {
    writeFileSync(path, JSON.stringify(next, null, 4) + "\n");
    console.log(`Recorded ${Object.keys(next).length} core pages.`);
} else {
    console.log(
        differences.length
            ? differences.join("\n")
            : "Anchor ledger is current."
    );
    process.exitCode = differences.length ? 1 : 0;
}
