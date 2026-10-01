import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vite-plus/test";
import { glossary } from "../src/lib/site";

const root = path.resolve(import.meta.dirname, "..");
const sources = readdirSync(root).filter(
    (name) => name.endsWith(".md") || name.endsWith(".html")
);
const edition = (zh: boolean) =>
    sources
        .filter((name) => name.startsWith("tw-") === zh)
        .map((name) => readFileSync(path.join(root, name), "utf8"))
        .join("\n");

// The forms first-use glossing derives from a term (ClientScripts.astro).
const forms = (raw: string): string[] =>
    raw
        .replace(/[（(][^）)]+[）)]/g, "")
        .split(" / ")
        .map((form) => form.trim())
        .filter((form) => form.length >= 2);

test("every everyday phrase first-use glossing passes over holds its term and still occurs in its edition", () => {
    const en = edition(false);
    const tw = edition(true);
    let checked = 0;
    for (const entry of glossary as Array<{
        term_en: string;
        term_tw: string;
        aliases_en?: string[];
        aliases_tw?: string[];
        gloss_skip_en?: string[];
        gloss_skip_tw?: string[];
    }>) {
        const editions = [
            {
                text: en,
                terms: [entry.term_en, ...(entry.aliases_en ?? [])],
                skip: entry.gloss_skip_en ?? [],
            },
            {
                text: tw,
                terms: [entry.term_tw, ...(entry.aliases_tw ?? [])],
                skip: entry.gloss_skip_tw ?? [],
            },
        ];
        for (const { text, terms, skip } of editions) {
            for (const phrase of skip) {
                checked++;
                expect(
                    terms.flatMap(forms).some((f) => phrase.includes(f))
                ).toBe(true);
                expect(text).toContain(phrase);
            }
        }
    }
    expect(checked).toBeGreaterThan(0);
});
