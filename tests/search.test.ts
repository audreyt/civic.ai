import { expect, test, vi } from "vite-plus/test";
import type { PageRecord } from "../src/lib/pages";
import {
    getSearchEntries,
    getSearchEntriesByLang,
    getSearchSuggestions,
    normalizeSearchLang,
    splitRenderedHtmlByHeadings,
} from "../src/lib/search";

test("builds English search entries from rendered civic pages", () => {
    const entries = getSearchEntries("en");
    const packOne = entries.find((entry) => entry.url === "/1/");

    expect(packOne).toBeDefined();
    expect(
        packOne?.subsections.some((section) =>
            section.content.includes("Relationships first")
        )
    ).toBe(true);
    expect(entries.some((entry) => entry.url === "/openclaw/")).toBe(false);
    expect(
        entries.some((entry) => entry.url === "/conference/sensemaking/")
    ).toBe(false);
});

test("builds Mandarin search entries only for /tw/ URLs", () => {
    const entries = getSearchEntries("zh");
    const packOne = entries.find((entry) => entry.url === "/tw/1/");

    expect(packOne).toBeDefined();
    expect(
        packOne?.subsections.some((section) =>
            section.content.includes("關係優先")
        )
    ).toBe(true);
    expect(entries.every((entry) => entry.url.startsWith("/tw/"))).toBe(true);
    expect(entries.some((entry) => entry.url === "/tw/openclaw/")).toBe(false);
    expect(
        entries.some((entry) => entry.url === "/tw/conference/sensemaking/")
    ).toBe(false);
});

test("getSearchEntriesByLang groups entries by language", () => {
    const byLang = getSearchEntriesByLang();

    expect(byLang.en).toEqual(getSearchEntries("en"));
    expect(byLang.zh).toEqual(getSearchEntries("zh"));
    expect(byLang.en.some((entry) => entry.url === "/1/")).toBe(true);
    expect(byLang.zh.some((entry) => entry.url === "/tw/1/")).toBe(true);
});

test("collects localized search suggestions from titles and glossary terms", () => {
    expect(getSearchSuggestions("en")).toContain("Civic AI");
    expect(getSearchSuggestions("zh")).toContain("仁工智慧");
});

test("keeps bilingual Doom brief content reachable at stable anchors", () => {
    for (const {
        lang,
        url,
        briefHeading,
        briefAnchor,
        briefContent,
        takeawaysHeading,
        takeawaysAnchor,
        takeawaysContent,
    } of [
        {
            lang: "en" as const,
            url: "/doom-debate/",
            briefHeading: "In brief",
            briefAnchor: "in-brief",
            briefContent: "This debate places the 6-Pack",
            takeawaysHeading: "Key takeaways",
            takeawaysAnchor: "key-takeaways",
            takeawaysContent:
                "Civic resilience depends on participatory institutions",
        },
        {
            lang: "zh" as const,
            url: "/tw/doom-debate/",
            briefHeading: "摘要",
            briefAnchor: "摘要",
            briefContent: "這場辯論把關懷六力放進超級智慧風險的討論中",
            takeawaysHeading: "重點",
            takeawaysAnchor: "重點",
            takeawaysContent: "公民韌性不只仰賴實驗室端的安全技術",
        },
    ]) {
        const entry = getSearchEntries(lang).find((item) => item.url === url);

        expect(entry?.subsections).toContainEqual(
            expect.objectContaining({
                heading: briefHeading,
                anchor: briefAnchor,
                content: expect.stringContaining(briefContent),
            })
        );
        expect(entry?.subsections).toContainEqual(
            expect.objectContaining({
                heading: takeawaysHeading,
                anchor: takeawaysAnchor,
                content: expect.stringContaining(takeawaysContent),
            })
        );
    }
});

test("normalizes structured Doom takeaways for search excerpts", () => {
    for (const [lang, url, term] of [
        ["en", "/doom-debate/", "P(Doom)"],
        ["zh", "/tw/doom-debate/", "P（末日）"],
    ] as const) {
        const entry = getSearchEntries(lang).find((item) => item.url === url);
        const takeaways = entry?.subsections.find(
            (section) =>
                section.anchor === (lang === "zh" ? "重點" : "key-takeaways")
        );

        expect(takeaways?.content).toContain(term);
        expect(takeaways?.content).not.toContain("`");
        expect(takeaways?.content).not.toContain("**");
    }
});

test("splits rendered HTML by headings and strips unsafe chrome", () => {
    const sections = splitRenderedHtmlByHeadings(
        '<h2 id="x">Head</h2><script>bad()</script><p>Visible &amp; safe</p>'
    );

    expect(sections).toHaveLength(1);
    expect(sections[0]?.heading).toBe("Head");
    expect(sections[0]?.anchor).toBe("x");
    expect(sections[0]?.content).toBe("Visible & safe");
    expect(sections[0]?.content).not.toContain("bad()");
});

test("normalizeSearchLang treats a missing lang tag as English", () => {
    expect(normalizeSearchLang(undefined)).toBe("en");
    expect(normalizeSearchLang("zh-tw")).toBe("zh");
});

test("splitRenderedHtmlByHeadings returns no sections for blank content", () => {
    expect(splitRenderedHtmlByHeadings("<script>bad()</script>")).toEqual([]);
});

test("getSearchEntries falls back to the page URL for a title-less page and defaults untitled labels", async () => {
    const fakePages: PageRecord[] = [
        {
            sourcePath: "/tmp/untitled.md",
            sourceName: "untitled.md",
            url: "/untitled/",
            slug: "untitled",
            data: {},
            rawBody: "",
            html: "<p>Body text.</p>",
            includeInSitemap: true,
            isRawHtmlDocument: false,
        },
        {
            sourcePath: "/tmp/unlabeled.md",
            sourceName: "unlabeled.md",
            url: "/unlabeled/",
            slug: "unlabeled",
            data: {
                title: "Unlabeled",
                summary: "A summary with no custom label.",
                summary_anchor: "summary",
                key_takeaways: ["A takeaway with no custom label."],
                key_takeaways_anchor: "takeaways",
            },
            rawBody: "",
            html: "<p>Body text.</p>",
            includeInSitemap: true,
            isRawHtmlDocument: false,
        },
        {
            sourcePath: "/tmp/tw-unlabeled.md",
            sourceName: "tw-unlabeled.md",
            url: "/tw/unlabeled/",
            slug: "tw/unlabeled",
            data: {
                title: "無標籤",
                lang: "zh-tw",
                summary: "沒有自訂標籤的摘要。",
                summary_anchor: "summary",
                key_takeaways: ["沒有自訂標籤的重點。"],
                key_takeaways_anchor: "takeaways",
            },
            rawBody: "",
            html: "<p>內文。</p>",
            includeInSitemap: true,
            isRawHtmlDocument: false,
        },
    ];

    // Module-loading boundary test: mocks the page loader so we can exercise
    // frontmatter-fallback branches no real content page currently triggers.
    vi.resetModules();
    vi.doMock("../src/lib/pages", () => ({ loadPages: () => fakePages }));
    const mockedSearch = await import("../src/lib/search");

    const entries = mockedSearch.getSearchEntries();
    const untitled = entries.find((entry) => entry.url === "/untitled/");
    expect(untitled?.title).toBe("/untitled/");
    expect(untitled?.section).toBe("/untitled/");

    const unlabeled = entries.find((entry) => entry.url === "/unlabeled/");
    expect(unlabeled?.subsections).toContainEqual(
        expect.objectContaining({ heading: "In short", anchor: "summary" })
    );
    expect(unlabeled?.subsections).toContainEqual(
        expect.objectContaining({
            heading: "Key takeaways",
            anchor: "takeaways",
        })
    );

    const twUnlabeled = entries.find((entry) => entry.url === "/tw/unlabeled/");
    expect(twUnlabeled?.subsections).toContainEqual(
        expect.objectContaining({ heading: "簡單講", anchor: "summary" })
    );
    expect(twUnlabeled?.subsections).toContainEqual(
        expect.objectContaining({ heading: "重點", anchor: "takeaways" })
    );

    vi.doUnmock("../src/lib/pages");
    vi.resetModules();
});

test("getSearchSuggestions skips glossary entries missing a term or alias in the requested language", async () => {
    // Module-loading boundary test: mocks the glossary source so we can
    // exercise the missing-term/empty-alias branches no real glossary
    // entry currently triggers.
    vi.resetModules();
    vi.doMock("../src/lib/site", async (importOriginal) => {
        const actual = await importOriginal<typeof import("../src/lib/site")>();
        return {
            ...actual,
            glossary: [
                { id: "no-en", term_tw: "無英文" },
                { id: "no-tw", term_en: "No Mandarin" },
                {
                    id: "empty-alias",
                    term_en: "Empty Alias",
                    term_tw: "空別名",
                    aliases_tw: [""],
                    aliases_en: [""],
                },
            ],
        };
    });
    const mockedSearch = await import("../src/lib/search");

    const en = mockedSearch.getSearchSuggestions("en");
    expect(en).toContain("No Mandarin");
    expect(en).not.toContain("無英文");
    expect(en).not.toContain("");

    const zh = mockedSearch.getSearchSuggestions("zh");
    expect(zh).toContain("無英文");
    expect(zh).not.toContain("No Mandarin");
    expect(zh).not.toContain("");

    vi.doUnmock("../src/lib/site");
    vi.resetModules();
});
