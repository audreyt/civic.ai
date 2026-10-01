import { defaultTreeAdapter } from "parse5";
import { expect, test } from "vite-plus/test";
import { annotateInlineLang, modeFor, textEdit } from "../src/lib/inlineLang";
import { glossary } from "../src/lib/site";

const en = (text: string) => `<span lang="en-GB">${text}</span>`;
const zh = (text: string) => `<span lang="zh-TW">${text}</span>`;

test("zh page labels Latin runs, keeping Pangu spaces outside the span", () => {
    expect(
        annotateInlineLang("<p>我們用 Kami 與 GPT-4 對話。</p>", "zh-tw")
    ).toBe(`<p>我們用 ${en("Kami")} 與 ${en("GPT-4")} 對話。</p>`);
});

test("zh page keeps multi-word runs with apostrophes and periods whole", () => {
    expect(
        annotateInlineLang(
            "<p>由 Joan Tronto、O’Neil 與 Dr. Smith 提出，見 civic.ai/tw/1 說明。</p>",
            "zh-Hant"
        )
    ).toBe(
        `<p>由 ${en("Joan Tronto")}、${en("O’Neil")} 與 ${en("Dr. Smith")} 提出，見 ${en("civic.ai/tw/1")} 說明。</p>`
    );
});

test("zh page skips digits and lone letters that carry no language", () => {
    const html = "<p>第 3 版，共 16 頁，選項 A 與 B。</p>";
    expect(annotateInlineLang(html, "zh-tw")).toBe(html);
});

test("zh page labels a unit that has two letters even beside digits", () => {
    expect(annotateInlineLang("<p>需要 16 GB 記憶體</p>", "zh-tw")).toBe(
        `<p>需要 ${en("16 GB")} 記憶體</p>`
    );
});

test("en page labels Han runs with their CJK punctuation", () => {
    expect(
        annotateInlineLang(
            "<p>Audrey (唐鳳) said 「多元」, twice.</p>",
            "en-gb"
        )
    ).toBe(`<p>Audrey (${zh("唐鳳")}) said ${zh("「多元」")}, twice.</p>`);
});

test("a missing lang follows the English convention", () => {
    expect(annotateInlineLang("<p>仁 means care</p>", undefined)).toBe(
        `<p>${zh("仁")} means care</p>`
    );
});

test("ja and unknown languages are returned untouched", () => {
    const html = "<p>Kami と 地神</p>";
    expect(annotateInlineLang(html, "ja")).toBe(html);
    expect(annotateInlineLang(html, "fr")).toBe(html);
    expect(modeFor("ja")).toBeUndefined();
});

test("text outside prose elements is left alone, inside nested inlines it is not", () => {
    expect(
        annotateInlineLang(
            '<div>地神 loose</div><ul><li><a href="/x/"><strong>地神</strong></a> text</li></ul>',
            "en-gb"
        )
    ).toBe(
        `<div>地神 loose</div><ul><li><a href="/x/"><strong>${zh("地神")}</strong></a> text</li></ul>`
    );
});

test("every prose element is annotated", () => {
    const tags = [
        "p",
        "li",
        "dt",
        "dd",
        "td",
        "th",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "blockquote",
        "figcaption",
        "caption",
    ];
    for (const tag of tags) {
        const wrap = (inner: string) =>
            tag === "td" || tag === "th"
                ? `<table><tbody><tr><${tag}>${inner}</${tag}></tr></tbody></table>`
                : tag === "caption"
                  ? `<table><${tag}>${inner}</${tag}></table>`
                  : tag === "li"
                    ? `<ul><${tag}>${inner}</${tag}></ul>`
                    : tag === "dt" || tag === "dd"
                      ? `<dl><${tag}>${inner}</${tag}></dl>`
                      : `<${tag}>${inner}</${tag}>`;
        expect(annotateInlineLang(wrap("Kami"), "zh-tw")).toBe(
            wrap(en("Kami"))
        );
    }
});

test("code, pre, kbd, samp, script, style, svg, math, textarea, noscript are skipped", () => {
    const html =
        "<p><code>Kami</code><kbd>Ctrl</kbd><samp>Out</samp></p>" +
        "<pre>Kami run</pre><script>var Kami = 1</script><style>.Kami{}</style>" +
        "<p><svg><text>Kami</text></svg><math><mi>Kami</mi></math></p>" +
        "<p><textarea>Kami</textarea><noscript>Kami</noscript></p>";
    expect(annotateInlineLang(html, "zh-tw")).toBe(html);
});

test("a subtree with its own lang attribute is skipped, siblings are not", () => {
    expect(
        annotateInlineLang(
            '<p lang="fr">Bonjour tout</p><p>Kami <em lang="de">Guten Tag</em> Kami</p>',
            "zh-tw"
        )
    ).toBe(
        `<p lang="fr">Bonjour tout</p><p>${en("Kami")} <em lang="de">Guten Tag</em> ${en("Kami")}</p>`
    );
});

test("attribute values, comments, ids and entities are preserved byte for byte", () => {
    const html =
        '<h2 id="kami-地神" title="Kami">Kami &amp; AI &lt;x&gt;</h2><!-- Kami --><p><a class="record-paragraph__link" href="#p3" data-pagefind-ignore>¶ 3<span class="visually-hidden">（第 3 段的永久連結）</span></a></p>';
    expect(annotateInlineLang(html, "zh-tw")).toBe(
        `<h2 id="kami-地神" title="Kami">${en("Kami")} &amp; ${en("AI")} &lt;x&gt;</h2><!-- Kami --><p><a class="record-paragraph__link" href="#p3" data-pagefind-ignore>¶ 3<span class="visually-hidden">（第 3 段的永久連結）</span></a></p>`
    );
});

test("escapes the characters it re-emits inside a labelled run", () => {
    expect(annotateInlineLang("<p>R&amp;D 與 AT&amp;T</p>", "zh-tw")).toBe(
        `<p>${en("R&amp;D")} 與 ${en("AT&amp;T")}</p>`
    );
});

test("annotating twice changes nothing the second time", () => {
    const once = annotateInlineLang("<p>用 Kami 與 AI 協作</p>", "zh-tw");
    expect(annotateInlineLang(once, "zh-tw")).toBe(once);
});

test("stripping the added spans restores the original markup", () => {
    const html = '<p id="p1">Audrey (唐鳳) 與 <em>Kami</em> 說「好」。</p>';
    for (const lang of ["en-gb", "zh-tw"]) {
        const out = annotateInlineLang(html, lang);
        expect(out.replace(/<span lang="(?:en-GB|zh-TW)">|<\/span>/g, "")).toBe(
            html
        );
    }
});

test("a mixed-script glossary label stays whole while the same word elsewhere is labelled", () => {
    expect(
        annotateInlineLang(
            "<dt>地神（Kami）</dt><p>地神（Kami）與 Kami</p>",
            "zh-tw"
        )
    ).toBe(`<dt>地神（Kami）</dt><p>地神（Kami）與 ${en("Kami")}</p>`);
});

test("a text node without source location yields no edit", () => {
    const node = {
        nodeName: "#text",
        parentNode: null,
        value: "Kami",
    } as unknown as Parameters<typeof textEdit>[0];
    expect(defaultTreeAdapter.isTextNode(node)).toBe(true);
    expect(textEdit(node, "latin")).toBeUndefined();
});

test("a located text node with nothing to label yields no edit", () => {
    const node = {
        nodeName: "#text",
        parentNode: null,
        value: "3 pages",
        sourceCodeLocation: { startOffset: 0, endOffset: 7 },
    } as unknown as Parameters<typeof textEdit>[0];
    expect(textEdit(node, "han")).toBeUndefined();
});

test("a glossary term the first-use glosser matches is never split by a label", () => {
    const candidates = (raw: string): string[] => {
        const base = raw.replace(/[（(][^）)]+[）)]/g, "").trim();
        const inner = [...raw.matchAll(/[（(]([^）)\s]{1,6})[）)]/g)].map(
            (m) => m[1] as string
        );
        return [...base.split(" / "), ...inner].filter((c) => c.length >= 2);
    };
    const hasHan = (s: string) => /\p{Script=Han}/u.test(s);
    const hasLatin = (s: string) => /[A-Za-z]/.test(s);
    let checked = 0;
    for (const entry of glossary as Array<{
        term_en: string;
        term_tw: string;
        aliases_tw?: string[];
        aliases_en?: string[];
    }>) {
        for (const raw of [entry.term_tw, ...(entry.aliases_tw ?? [])]) {
            expect(
                annotateInlineLang(`<p>前 ${raw} 後</p>`, "zh-tw")
            ).toContain(raw);
            for (const term of candidates(raw)) {
                checked++;
                const out = annotateInlineLang(`<p>前 ${term} 後</p>`, "zh-tw");
                expect(hasHan(term) && hasLatin(term)).toBe(false);
                expect(out.includes(term)).toBe(true);
            }
        }
        for (const raw of [entry.term_en, ...(entry.aliases_en ?? [])]) {
            for (const term of candidates(raw)) {
                checked++;
                expect(hasHan(term)).toBe(false);
                expect(annotateInlineLang(`<p>${term}</p>`, "en-gb")).toBe(
                    `<p>${term}</p>`
                );
            }
        }
    }
    expect(checked).toBeGreaterThan(100);
});
