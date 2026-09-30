import { getSitemapPages } from "../lib/pages";
import { lang2, openclawBootstrap, site } from "../lib/site";

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
    return new Response(lines.join("\n"), {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
}
