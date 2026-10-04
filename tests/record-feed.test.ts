import { expect, test } from "vite-plus/test";
import { amendmentFeed } from "../src/lib/recordFeed";
import { getPageByUrl, getSitemapPages } from "../src/lib/pages";
import { ledgerMonthPages } from "../src/lib/recordPages";

test("emits stable commit IDs, amended timestamps and escaped XML metadata", () => {
    const feed = amendmentFeed(
        [
            {
                id: "abc",
                date: "2026-09-01T00:00:00Z",
                subject: `Repair <a> & "b's"`,
                pages: [{ url: "/a/", title: "A & B" }],
            },
        ],
        { url: "https://civic.ai", builtAt: "2026-10-01T00:00:00Z" }
    );
    expect(feed).toContain("<id>urn:civic-ai:git:abc</id>");
    expect(
        feed.match(/<updated>2026-09-01T00:00:00Z<\/updated>/g)
    ).toHaveLength(2);
    expect(feed).toContain("Repair &lt;a&gt; &amp; &quot;b&apos;s&quot;");
    expect(feed).toContain(
        'rel="related" href="https://civic.ai/a/" title="A &amp; B"'
    );
});

test("uses the build timestamp only for an empty feed, without inventing an entry", () => {
    const feed = amendmentFeed([], {
        url: "https://civic.ai",
        builtAt: "2026-10-01T00:00:00Z",
    });
    expect(feed).not.toContain("<entry>");
    expect(feed).toContain("<updated>2026-10-01T00:00:00Z</updated>");
});

test("discovers both generated ledgers with reciprocal twins for sitemap and llms", () => {
    const pages = getSitemapPages();
    for (const url of ["/ledger/", "/tw/ledger/"]) {
        expect(pages.filter((page) => page.url === url)).toHaveLength(1);
        const page = getPageByUrl(url);
        expect(
            getPageByUrl(page.data.alt_lang_url ?? "").data.alt_lang_url
        ).toBe(url);
    }
    expect(
        pages.filter((page) => page.url === "/conference/sensemaking/")
    ).toHaveLength(1);
});

test("gives every ledger month a reciprocal twin outside search and the sitemap", () => {
    const pages = ledgerMonthPages(["2026-09"]);
    expect(
        pages.map((page) => [
            page.url,
            page.slug,
            page.data.alt_lang_url,
            page.data.title,
            page.data.ledger_month,
            page.data.search_exclude,
            page.includeInSitemap,
        ])
    ).toEqual([
        [
            "/ledger/2026-09/",
            "ledger/2026-09",
            "/tw/ledger/2026-09/",
            "Amendment ledger: 2026-09",
            "2026-09",
            true,
            false,
        ],
        [
            "/tw/ledger/2026-09/",
            "tw/ledger/2026-09",
            "/ledger/2026-09/",
            "修訂紀錄：2026-09",
            "2026-09",
            true,
            false,
        ],
    ]);
    expect(pages.map((page) => page.data.description)).toEqual([
        "This site's Git amendments in 2026-09.",
        "本站 2026-09 的 Git 修訂紀錄。",
    ]);
});
