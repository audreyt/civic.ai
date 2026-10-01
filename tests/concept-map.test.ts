import { describe, expect, test } from "vite-plus/test";
import {
    byNum,
    conceptMap,
    cycleHand,
    escapeHtml,
    relation,
    renderConceptMap,
} from "../src/lib/conceptMap";

describe("render helpers", () => {
    test("escapeHtml treats null/undefined as an empty string", () => {
        expect(escapeHtml(undefined)).toBe("");
        expect(escapeHtml(null)).toBe("");
        expect(escapeHtml('<a href="x">&y</a>')).toBe(
            "&lt;a href=&quot;x&quot;&gt;&amp;y&lt;/a&gt;"
        );
    });

    test("byNum resolves Pack 6 and throws for an unknown pack", () => {
        expect(byNum(6)).toBe(conceptMap.membrane);
        expect(() => byNum(9999)).toThrow("concept map: unknown pack 9999");
    });

    test("cycleHand throws for a pack with no cycle handoff", () => {
        expect(() => cycleHand(9999)).toThrow(
            "concept map: missing cycle handoff 9999"
        );
    });

    test("relation puts the linked pack name in the template's slot", () => {
        const html = relation("A {pack} B", byNum(3), false, "en");
        expect(html.startsWith("A <a ")).toBe(true);
        expect(html.endsWith("</a> B")).toBe(true);
        expect(html).toContain('href="/3/" target="_blank" rel="noopener"');
        expect(html).toContain(`style="--hue:${byNum(3).hue}"`);
        expect(html).toContain(`>${byNum(3).title.en}</a>`);
        expect(relation("{pack}", byNum(3), true, "tw")).toContain(
            'href="/tw/3/"'
        );
    });
});

describe("renderConceptMap", () => {
    const en = renderConceptMap("en-gb");
    const tw = renderConceptMap("zh-Hant");

    test("emits a single markdown-safe line", () => {
        expect(en).not.toContain("\n");
        expect(tw).not.toContain("\n");
    });

    test("every handoff cargo appears in both languages", () => {
        for (const handoff of conceptMap.handoffs) {
            expect(en).toContain(escapeHtml(handoff.cargo.en));
            expect(tw).toContain(escapeHtml(handoff.cargo.tw));
        }
    });

    test("every pack links to its chapter beside the map and to its measure on the page", () => {
        for (const pack of [...conceptMap.packs, conceptMap.membrane]) {
            expect(en).toContain(
                `href="/${pack.slug}/" target="_blank" rel="noopener"`
            );
            expect(tw).toContain(
                `href="/tw/${pack.slug}/" target="_blank" rel="noopener"`
            );
            expect(en).toContain(`href="/measures/#${pack.measure.anchor}"`);
            expect(tw).toContain(`href="/tw/measures/#${pack.measure.anchor}"`);
            expect(en).not.toContain(
                `href="/measures/#${pack.measure.anchor}" target="_blank"`
            );
        }
        expect(en).toContain(`href="${conceptMap.legendUrl.en}"`);
        expect(tw).toContain(`href="${conceptMap.legendUrl.tw}"`);
    });

    test("uses the comic-derived pack palette", () => {
        expect(conceptMap.packs.map((pack) => pack.hue)).toEqual([
            "#eb573a",
            "#f09344",
            "#f9dd55",
            "#7cc967",
            "#6197f8",
        ]);
        expect(conceptMap.membrane.hue).toBe("#a753f6");
    });

    test("languages never leak across", () => {
        expect(en).not.toContain("/tw/");
        expect(tw).not.toContain("Pack 1");
    });

    test("view-transition opt-in ships inline, exactly once", () => {
        const marker = "<style>@view-transition{navigation:auto}</style>";
        expect(en.split(marker).length).toBe(2);
        expect(tw.split(marker).length).toBe(2);
    });

    test("the cycle is four cards, each followed by its handoff, the last returning to Pack 1", () => {
        for (const html of [en, tw]) {
            expect(
                html.match(/class="cmap-card cmap-step cmap-step--\d"/g)
            ).toHaveLength(4);
            expect(html.match(/class="cmap-hand cmap-hand--\d"/g)).toHaveLength(
                4
            );
            expect(html.match(/href="#st-p1"/g)).toHaveLength(1);
            expect(html).toMatch(
                /cmap-hand--4">.*?<a class="cmap-back" href="#st-p1">/
            );
            for (const num of [1, 2, 3, 4, 5, 6])
                expect(
                    html.match(new RegExp(`id="st-p${num}"`, "g"))
                ).toHaveLength(1);
        }
    });

    test("screen readers hear who hands what to whom", () => {
        const one = byNum(1).title;
        const two = byNum(2).title;
        expect(en).toContain(
            `<span class="visually-hidden">${one.en} ${conceptMap.handsLabel.en} ${two.en}: </span>`
        );
        expect(tw).toContain(
            `<span class="visually-hidden">${one.tw}${conceptMap.handsLabel.tw}${two.tw}：</span>`
        );
    });

    test("each relation is written out once, on the card that owns it", () => {
        const { alsoTemplate, fromTemplate, toTemplate, bothTemplate } =
            conceptMap;
        for (const [html, key, zh] of [
            [en, "en", false],
            [tw, "tw", true],
        ] as const) {
            // two chords on the cycle cards, three into Pack 5, four on Pack 6
            expect(html.match(/<span class="cmap-rel">/g)).toHaveLength(9);
            expect(html).toContain(
                relation(alsoTemplate[key], byNum(3), zh, key)
            );
            expect(html).toContain(
                relation(alsoTemplate[key], byNum(4), zh, key)
            );
            for (const num of [1, 2, 4, 5, 3])
                expect(html).toContain(
                    relation(fromTemplate[key], byNum(num), zh, key)
                );
            expect(html).toContain(
                relation(toTemplate[key], byNum(1), zh, key)
            );
            expect(html).toContain(
                relation(bothTemplate[key], byNum(2), zh, key)
            );
            expect(html).toContain(
                `<p class="cmap-guard">${escapeHtml(conceptMap.guard[key])}</p>`
            );
        }
    });
});
