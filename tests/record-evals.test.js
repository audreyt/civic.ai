import { expect, test } from "vite-plus/test";
import { reviewPairs } from "../scripts/lib/review-pairs.mjs";
import {
    contrastRatio,
    evaluateContrast,
} from "../scripts/lib/record-contrast.mjs";
import {
    escapeRecord,
    evaluateTerms,
    evaluateTwins,
    injectEvals,
} from "../scripts/lib/record-evals.mjs";

test("shares Markdown pairing with clipboard review without inventing metadata twins", () => {
    expect(
        reviewPairs([
            "README.md",
            "AGENTS.md",
            "DESIGN.md",
            "CLAUDE.md",
            "a.md",
            "tw-a.md",
            "b.md",
            "tw-c.md",
            "ja-comics.md",
            "image.png",
        ])
    ).toEqual({
        en: ["a.md", "b.md"],
        tw: ["tw-a.md", "tw-c.md"],
        pairedEn: ["a.md"],
        pairedTw: ["tw-a.md"],
        orphanEn: ["b.md"],
        orphanTw: ["tw-c.md"],
    });
});

test("computes WCAG sRGB ratios in either order, including short hex colours", () => {
    expect(contrastRatio("#000", "#fff")).toBe(21);
    expect(contrastRatio("#ffffff", "#000000")).toBe(21);
    expect(contrastRatio("#777777", "#ffffff")).toBeCloseTo(4.478, 3);
});

const light =
    "--field:#fff;--surface:#fff;--ink:#111;--soil:var(--ink);--moss:#222;--cinnabar:#333;";
test("parses root tokens and overrides for both themes rather than hardcoding ratios", () => {
    const result = evaluateContrast(
        `/* comment */ :root {${light}} html[data-theme="dark"] {--field:#111;--surface:#111;--ink:#eee;--moss:#ddd;--cinnabar:#ccc;} .card {--ink:#fff;}`
    );
    expect(result.pass).toBe(true);
    expect(result.detail).toHaveLength(16);
    expect(
        result.detail.find(
            (row) => row.theme === "dark" && row.text === "--soil"
        ).foreground
    ).toBe("#eee");
});

test("reports missing, cyclic and unresolvable colour tokens as failures", () => {
    const result = evaluateContrast(
        ":root {--ink:var(--soil);--soil:var(--ink);--surface:rgb(0,0,0);}"
    );
    expect(result.pass).toBe(false);
    expect(result.detail.every((row) => row.ratio === null)).toBe(true);
    expect(
        evaluateContrast(
            `html[data-theme="light"] {${light}} :root[data-theme="dark"] {--ink:#fff;}`
        ).pass
    ).toBe(false);
});

const canon = [
    { id: "civic-ai", term_tw: "仁工智慧" },
    { id: "6-pack-of-care", term_tw: "關懷六力" },
    { id: "kami", term_tw: "地神（Kami）" },
    { id: "override-ledger", term_tw: "否決帳本" },
    { id: "shared-eval-registry", term_tw: "共享評測登錄庫" },
];
const glossaryHtml = canon
    .map(
        (entry) =>
            `<dt id="${entry.id}">${entry.term_tw}</dt><dd>Definition</dd>`
    )
    .join("");
test("checks locked glossary terms in both source data and the matching rendered entry", () => {
    expect(evaluateTerms(canon, glossaryHtml).pass).toBe(true);
    expect(
        evaluateTerms(canon, glossaryHtml.replace("仁工智慧", "wrong")).pass
    ).toBe(false);
    expect(evaluateTerms(canon.slice(1), glossaryHtml).pass).toBe(false);
});

test("reads the locked label from a glossary entry paired with its English term", () => {
    const paired = canon
        .map(
            (entry) =>
                `<dt id="${entry.id}"><span class="glossary-term">${entry.term_tw}</span><span class="glossary-term-pair" lang="en-GB">Term</span></dt><dd>Definition</dd>`
        )
        .join("");
    expect(evaluateTerms(canon, paired).pass).toBe(true);
    expect(evaluateTerms(canon, paired.replace("否決帳本", "wrong")).pass).toBe(
        false
    );
    expect(
        evaluateTerms(canon, paired.replace('id="kami"', 'id="other"')).pass
    ).toBe(false);
});

const alt = (lang, url) =>
    `<link rel="alternate" hreflang="${lang}" href="https://civic.ai${url}">`;
const twins = [
    { url: "/a/", html: alt("en", "/a/") + alt("zh-Hant", "/tw/a/") },
    { url: "/tw/a/", html: alt("en", "/a/") + alt("zh-Hant", "/tw/a/") },
];
test("checks generated-page twins as well as root Markdown pairing", () => {
    expect(evaluateTwins(twins, reviewPairs([])).pass).toBe(true);
    expect(
        evaluateTwins(
            [
                ...twins,
                { url: "/404.html", html: "" },
                {
                    url: "/ja/comics/",
                    html: alt("en", "/a/") + alt("zh-Hant", "/tw/a/"),
                },
            ],
            reviewPairs([])
        ).pass
    ).toBe(true);
    expect(evaluateTwins([twins[0]], reviewPairs(["orphan.md"])).pass).toBe(
        false
    );
});

test("does not mistake a canonical link for a reciprocal hreflang declaration", () => {
    const result = evaluateTwins(
        [
            twins[0],
            {
                url: "/tw/a/",
                html: '<link rel="canonical" href="https://civic.ai/a/">',
            },
        ],
        reviewPairs([])
    );
    expect(result.pass).toBe(false);
    expect(result.detail).toHaveLength(2);
});

test("escapes metadata rather than allowing report text to create HTML", () => {
    expect(escapeRecord('<img x="a&b">')).toBe(
        "&lt;img x=&quot;a&amp;b&quot;&gt;"
    );
});

test.each(["en", "zh"])(
    "injects honest outcomes and receipts in %s without client scripts",
    (lang) => {
        const report = {
            builtAt: "2026-10-01T00:00:00Z",
            checks: {
                links: { pass: true, scope: "<scope>", scopeZh: "<scope>" },
                terms: { pass: false, scope: "<repair>", scopeZh: "<repair>" },
            },
        };
        const html = ["trace", "board"]
            .map(
                (kind) =>
                    `<div data-record-evals="${kind}" data-record-lang="${lang}">pending</div>`
            )
            .join("");
        const result = injectEvals(html, report);
        expect(result.match(/record-eval--fail/g)).toHaveLength(2);
        expect(result.match(/href="\/evals.json"/g)).toHaveLength(2);
        expect(result).toContain("&lt;scope&gt;");
        expect(injectEvals(result, report)).toBe(result);
    }
);
