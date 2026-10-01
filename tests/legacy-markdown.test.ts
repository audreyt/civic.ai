import { expect, test } from "vite-plus/test";
import {
    avifSibling,
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

test("nativePictures lists shipped narrower renditions with sizes", () => {
    const html =
        '<noscript><img src="/img/d.jpg" alt="D" width="2992" height="1680"></noscript>';
    const shipped = new Set([
        "/img/d.avif",
        "/img/d-720w.avif",
        "/img/d-1280w.avif",
    ]);
    expect(nativePictures(html, (path) => shipped.has(path))).toBe(
        '<picture><source srcset="/img/d-720w.avif 720w, /img/d-1280w.avif 1280w, /img/d.avif 2992w" sizes="(max-width: 700px) calc(100vw - 40px), 640px" type="image/avif"><img src="/img/d.jpg" alt="D" width="2992" height="1680"></picture>'
    );
});

test("nativePictures skips renditions an undeclared width cannot rank", () => {
    const html = '<noscript><img src="/img/e.jpg" alt="E"></noscript>';
    expect(nativePictures(html, () => true)).toBe(
        '<picture><source srcset="/img/e.avif" type="image/avif"><img src="/img/e.jpg" alt="E"></picture>'
    );
});

test("avifSibling offers the AVIF beside a JPEG or PNG only when it ships", () => {
    const has = (publicPath: string) => publicPath === "/img/a.avif";
    expect(avifSibling("/img/a.jpg", has)).toBe("/img/a.avif");
    expect(avifSibling("/img/b.png", has)).toBeUndefined();
    expect(avifSibling("/img/a.svg", has)).toBeUndefined();
});

test.each([
    "/manifesto/",
    "/1/",
    "/2/",
    "/3/",
    "/4/",
    "/5/",
    "/6/",
    "/measures/",
    "/faq/",
    "/tw/manifesto/",
    "/tw/1/",
    "/tw/2/",
    "/tw/3/",
    "/tw/4/",
    "/tw/5/",
    "/tw/6/",
    "/tw/measures/",
    "/tw/faq/",
])("numbers canonical prose by core page URL: %s", (url) => {
    const body = "First paragraph.\n\nSecond **paragraph**.";
    const html = renderMarkdown(body, url);
    expect(html.match(/id="p\d+"/g)).toEqual(['id="p1"', 'id="p2"']);
    expect(html).toContain('href="#p2"');
    expect(renderMarkdown(body, url)).toBe(html);
});

test("does not number non-core prose or generated HTML, media, quotes, controls and footnotes, but numbers bullets", () => {
    const body = `Prose.[^note]\n\n<div class="card"><p>Generated</p><button>Control</button></div>\n\n![Image](a.png)\n\n- List item\n\n> Quotation\n\n[^note]: A footnote.\n`;
    expect(renderMarkdown(body, "/kami/")).not.toContain('id="p1"');
    expect(
        renderMarkdown(body, "/1/").match(/data-record-paragraph=/g)
    ).toHaveLength(2);
});

test("numbers each bullet, nested ones included, but not quoted or empty bullets", () => {
    const html = renderMarkdown(
        "- Risk\n  - The fix\n-\n\n> - Quoted\n",
        "/1/"
    );
    expect(html.match(/<li id="p\d+"/g)).toEqual([
        '<li id="p1"',
        '<li id="p2"',
    ]);
    expect(html).toContain('href="#p2"');
});

test("reserves existing raw and generated heading IDs when allocating paragraph anchors", () => {
    const html = renderMarkdown(
        '<h2 id="p1">Existing</h2>\n\n## p2\n\nProse.',
        "/faq/"
    );
    expect(html.match(/id="p1"/g)).toHaveLength(1);
    expect(html.match(/id="p2"/g)).toHaveLength(1);
    expect(html).toContain('href="#p3"');
});
