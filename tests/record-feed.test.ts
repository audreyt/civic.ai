import { expect, test } from "vite-plus/test";
import { amendmentFeed } from "../src/lib/recordFeed";
import { getPageByUrl, getSitemapPages } from "../src/lib/pages";

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
