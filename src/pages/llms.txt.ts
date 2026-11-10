import { getPageByUrl, getSitemapPages, hasPublicFile } from "../lib/pages";
import { navItems, type NavSection } from "../lib/nav";
import { comics, lang2, openclawBootstrap, site } from "../lib/site";

// What each masthead destination is for, in the words a person would be told.
const destinations: Record<NavSection, string> = {
    home: "what Civic AI is, the six principles on one page, four questions to agree before a group uses AI, and three moves to try today",
    packs: `the six principles, each a test you can put to an AI system; Packs 1 to 6 are at ${site.url}/1/ to ${site.url}/6/`,
    measures:
        "a map of how the six packs fit together, and one public measure for each",
    faq: `plain answers; for an AI that a school, clinic or council already runs, begin at ${site.url}/faq/#everyday-questions`,
    kami: "how a group sets up its own helper: an existing model, the site's instructions, and limits set in software",
    library:
        "everything else, listed once by kind: the manifesto, comics, glossary, essays, speeches, conversations and the conference record",
    sources:
        "where each part of the framework comes from, and what each case record can and cannot support",
};

// The Library page is the one place that lists every other page, so it is
// quoted here rather than classified a second time (DESIGN.md §16).
function libraryListing(url: string): string[] {
    return getPageByUrl(url)
        .rawBody.trim()
        .split("\n")
        .map((line) =>
            line
                .replace(/^<h2 id="[^"]+">(.*)<\/h2>$/, "### $1")
                .replace(/\]\(\//g, `](${site.url}/`)
        );
}

export function GET() {
    const lines = [
        "# Civic AI",
        "",
        "The 6-Pack of Care: six principles for AI that a community runs, plus instructions an AI agent can follow. The instructions guide the AI; the group holds it to them by checking its work, correcting it and keeping the off switch.",
        "",
        `By Audrey Tang and Caroline Green, at the Oxford Institute for Ethics in AI. Everything on the site is CC0 (public domain). To quote it, link a numbered paragraph (for example ${site.url}/1/#p1) on a pack page, Measures or the FAQ; the numbers survive edits.`,
        "",
        "If a person asked you what this is or where to start, these are the site's own menu, in reading order:",
        ...navItems("en-gb", "").map(
            (item) =>
                `- ${item.full}: ${site.url}${item.href} — ${destinations[item.section]}`
        ),
        `- 華文版: ${site.url}/tw/`,
        "",
        "If you were asked to act as a Kami:",
        `- Kami bootstrap guide: ${site.url}${openclawBootstrap.urls.guide.en}`,
        `- Kami bootstrap skill (plain Markdown): ${site.url}${openclawBootstrap.urls.rawSkill}`,
        `- 華文 guide: ${site.url}${openclawBootstrap.urls.guide.tw}`,
        "",
        "Recommended reading order for a Kami:",
        ...openclawBootstrap.readingOrder.map(
            (item) =>
                `- ${item.title.en}: ${site.url}${item.url.en} — ${item.why.en}`
        ),
        "",
        "## Library",
        "",
        ...libraryListing("/library/"),
        "",
        "## 全站目錄",
        "",
        ...libraryListing("/tw/library/"),
        "",
    ];
    const pages = getSitemapPages();
    // A conference page is titled by its theme; its subtitle names the event.
    const label = (page: (typeof pages)[number]) =>
        page.data.layout === "conference" && page.data.subtitle
            ? `${page.data.subtitle}: ${page.data.title}`
            : page.data.title || page.url;
    const listing = (edition: "en" | "zh" | "ja") =>
        pages
            .filter(
                (page) =>
                    (page.data.lang === "ja" ? "ja" : lang2(page.data.lang)) ===
                    edition
            )
            .map((page) => `- ${label(page)}: ${site.url}${page.url}`);
    lines.push("All pages (English):", ...listing("en"), "");
    lines.push("全部頁面（華文）:", ...listing("zh"), "");
    lines.push("日本語:", ...listing("ja"), "");
    // Each comic page is also an SVG whose lettering is text, not pixels.
    const comicPages = (key: "en" | "tw", suffix: string) =>
        [
            [key === "tw" ? "關懷六力概覽" : "Overview", "overview-small"],
            ...comics.packs.flatMap((pack) =>
                pack.pages.map((pg) => [
                    `${pack.title[key]} — ${pg.type[key]}`,
                    `pack${pack.num}-${pg.id}`,
                ])
            ),
        ]
            .filter(([, stem]) => hasPublicFile(`/img/${stem}${suffix}.svg`))
            .map(
                ([title, stem]) =>
                    `- ${title}: ${site.url}/img/${stem}${suffix}.svg`
            );
    lines.push(
        "Comics by Nicky Case, as SVG with their words as text:",
        ...comicPages("en", ""),
        ""
    );
    lines.push("漫畫（SVG，文字可讀取）:", ...comicPages("tw", "-tw"), "");
    return new Response(lines.join("\n"), {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
}
