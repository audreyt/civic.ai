import { getSitemapPages, hasPublicFile } from "../lib/pages";
import { comics, lang2, openclawBootstrap, site } from "../lib/site";

export function GET() {
    const lines = [
        "# Civic AI",
        "",
        "Civic AI is alignment by public process: bounded local stewards, bridge-first governance, accountable action, public repair, and real sunset conditions.",
        "",
        "Start here for new claws:",
        `- OpenClaw bootstrap guide: ${site.url}${openclawBootstrap.urls.guide.en}`,
        `- OpenClaw bootstrap skill: ${site.url}${openclawBootstrap.urls.rawSkill}`,
        `- 華文 guide: ${site.url}${openclawBootstrap.urls.guide.tw}`,
        "",
        "Recommended reading order:",
        ...openclawBootstrap.readingOrder.map(
            (item) =>
                `- ${item.title.en}: ${site.url}${item.url.en} — ${item.why.en}`
        ),
        "",
    ];
    const pages = getSitemapPages();
    const listing = (zh: boolean) =>
        pages
            .filter((page) => (lang2(page.data.lang) === "zh") === zh)
            .map(
                (page) =>
                    `- ${page.data.title || page.url}: ${site.url}${page.url}`
            );
    lines.push("All pages (English):", ...listing(false), "");
    lines.push("全部頁面（華文）:", ...listing(true), "");
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
