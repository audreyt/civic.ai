import { expect, test } from "vite-plus/test";
import { glossary } from "../src/lib/site";
import { renderGlossaryList } from "../src/lib/shortcodes";

test("renders every English glossary term beside its locked Traditional Mandarin term", () => {
    const glossaryHtml = renderGlossaryList("en-GB");

    for (const entry of glossary) {
        expect(glossaryHtml).toContain(
            `<dt id="${entry.id}"><span class="glossary-term">${entry.term_en}</span><span class="glossary-term-pair" lang="zh-TW">${entry.term_tw}</span></dt><dd>${entry.def_en}</dd>`
        );
        expect(glossaryHtml).not.toContain(
            `<dt id="${entry.id}"><span class="glossary-term">${entry.term_en}</span><span class="glossary-term-pair" lang="zh-TW">${entry.term_tw}</span></dt><dd>${entry.def_tw}</dd>`
        );
    }
});

test("renders every Traditional Mandarin glossary term beside its locked English term", () => {
    const glossaryHtml = renderGlossaryList("zh-TW");

    for (const entry of glossary) {
        expect(glossaryHtml).toContain(
            `<dt id="${entry.id}"><span class="glossary-term">${entry.term_tw}</span><span class="glossary-term-pair" lang="en-GB">${entry.term_en}</span></dt><dd>${entry.def_tw}</dd>`
        );
        expect(glossaryHtml).not.toContain(
            `<dt id="${entry.id}"><span class="glossary-term">${entry.term_tw}</span><span class="glossary-term-pair" lang="en-GB">${entry.term_en}</span></dt><dd>${entry.def_en}</dd>`
        );
    }
});
