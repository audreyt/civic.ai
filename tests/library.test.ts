import { expect, test } from "vite-plus/test";
import { navSection } from "../src/lib/nav";
import { getPageByUrl, getSitemapPages, pageKinds } from "../src/lib/pages";

// The masthead reaches seven destinations; the Library is the one page that
// lists everything else, once (DESIGN.md §9). These tests keep that promise
// from eroding: a new page with no entry in the Library fails here.

const internalLinks = (url: string) =>
    new Set(
        [...getPageByUrl(url).html.matchAll(/href="(\/[^"#]*)(?:#[^"]*)?"/g)]
            .map((match) => String(match[1]))
            .filter((href) => !/\.[a-z0-9]+$/i.test(href))
    );

const english = internalLinks("/library/");
const mandarin = internalLinks("/tw/library/");

test("every page outside the masthead is listed in its edition's Library", () => {
    const missing = getSitemapPages()
        .filter((page) => !page.data.ledger_month)
        .filter((page) => navSection(page.url) === "library")
        .filter((page) => !/^\/(tw\/)?library\/$/.test(page.url))
        .filter(
            (page) =>
                !(page.url.startsWith("/tw/") ? mandarin : english).has(
                    page.url
                )
        )
        .map((page) => page.url);
    expect(missing).toEqual([]);
});

test("the agent door is listed although it stays out of the sitemap", () => {
    expect(english.has("/openclaw/")).toBe(true);
    expect(mandarin.has("/tw/openclaw/")).toBe(true);
});

test("both editions list the same pages", () => {
    // The Japanese comics have no Mandarin path; both editions link to them.
    const shared = (links: Set<string>) =>
        [...links]
            .filter((href) => href !== "/ja/comics/")
            .map((href) => href.replace(/^\/tw(?=\/)/, ""))
            .sort();
    expect(shared(mandarin)).toEqual(shared(english));
    expect(english.has("/ja/comics/")).toBe(true);
    expect(mandarin.has("/ja/comics/")).toBe(true);
});

test("a page's kind is one the Library groups by, agrees with its twin, and is listed", () => {
    const kinded = getSitemapPages().filter((page) => page.data.kind);
    expect(kinded.length).toBeGreaterThan(0);
    for (const page of kinded) {
        expect(pageKinds, page.url).toContain(page.data.kind);
        const twin = getPageByUrl(String(page.data.alt_lang_url));
        expect(twin.data.kind, page.url).toBe(page.data.kind);
        expect(
            (page.url.startsWith("/tw/") ? mandarin : english).has(page.url),
            page.url
        ).toBe(true);
    }
});
