import { expect, test } from "vite-plus/test";
import {
    cjkSlugify,
    nativePictures,
    renderMarkdown,
    smartQuotes,
} from "../src/lib/legacyMarkdown";

test("renders emphasis closed after CJK punctuation", () => {
    const html = renderMarkdown("經驗法則：_先搭橋，再決策。_ 若屬緊急損害。");
    expect(html).toContain("<em>先搭橋，再決策。</em>");
});

test("renders bold labels followed by CJK full stop", () => {
    const html = renderMarkdown("- **關係優先。** 關係是關懷的基本單位。");
    expect(html).toContain("<strong>關係優先。</strong>");
});

test("uses existing CJK heading slug policy", () => {
    const html = renderMarkdown("## 關懷六力？\n");
    expect(html).toContain('id="關懷六力"');
});

test("cjkSlugify falls back to a placeholder when nothing slug-worthy remains", () => {
    expect(cjkSlugify("!!!")).toBe("section");
});

test("scanDelims patch handles delimiters at the very start and end of a line", () => {
    // The opening `*` is at src position 0 (no `lastChar`) and the closing
    // `*` reaches `posMax` while scanning its run (no `nextChar`) — both
    // exercise the CJK-adjacency patch's out-of-bounds fallbacks.
    const html = renderMarkdown("*hi*");
    expect(html).toContain("<em>hi</em>");
});

test("typographer converts apostrophes and quotes but no other replacements", () => {
    const html = renderMarkdown(
        'People\'s "quoted" words (c) a -- b... `it\'s "raw"`'
    );
    expect(html).toContain("People\u2019s \u201Cquoted\u201D words");
    expect(html).toContain("(c) a -- b...");
    expect(html).toContain("<code>it's &quot;raw&quot;</code>");
});

test("smartQuotes converts text nodes only and leaves markup alone", () => {
    expect(smartQuotes("\"Hello,\" she said. It's 'fine'.")).toBe(
        "\u201CHello,\u201D she said. It\u2019s \u2018fine\u2019."
    );
    expect(smartQuotes('<a href="x">"y"</a>')).toBe(
        '<a href="x">\u201Cy\u201D</a>'
    );
});

test("smartQuotes skips code, comments and entity-encoded quotes", () => {
    expect(
        smartQuotes('<code>"a"</code> "b" <!-- "c" --> &quot;d&quot; it&#39;s')
    ).toBe(
        '<code>"a"</code> \u201Cb\u201D <!-- "c" --> \u201Cd\u201D it\u2019s'
    );
    expect(smartQuotes("<em>'x'</em>")).toBe("<em>\u2018x\u2019</em>");
});

test("nativePictures offers a shipped AVIF sibling through <picture>", () => {
    const html =
        '<p><noscript><img src="/img/a.jpg" alt="A" width="10" height="20" loading="lazy" decoding="async"></noscript></p>';
    expect(nativePictures(html, (path) => path === "/img/a.avif")).toBe(
        '<p><picture><source srcset="/img/a.avif" type="image/avif"><img src="/img/a.jpg" alt="A" width="10" height="20" loading="lazy" decoding="async"></picture></p>'
    );
});

test("nativePictures unwraps to a bare <img> when no AVIF ships", () => {
    const html =
        '<a href="/x/"><noscript>\n<img src="/img/b.png" alt="B" />\n</noscript></a>';
    expect(nativePictures(html, () => false)).toBe(
        '<a href="/x/"><img src="/img/b.png" alt="B" /></a>'
    );
});

test("nativePictures leaves non-image noscript blocks alone", () => {
    const html =
        '<noscript><p>Turn on JavaScript for search.</p></noscript><noscript><img src="/img/c.svg" alt=""></noscript>';
    expect(nativePictures(html, () => true)).toBe(html);
});
