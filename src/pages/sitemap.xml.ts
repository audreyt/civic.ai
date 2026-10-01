import { statSync } from "node:fs";
import { type PageRecord, getSitemapPages } from "../lib/pages";
import { lang2, normalizeAltUrl, site } from "../lib/site";

function xmlEscape(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function lastmodFor(page: PageRecord): string {
    if (page.data.date) return new Date(page.data.date).toISOString();
    return statSync(page.sourcePath).mtime.toISOString();
}

export function GET() {
    const pages = getSitemapPages();
    const urls = pages
        .map((page) => {
            const pageUrl = `${site.url}${page.url}`;
            const alt = normalizeAltUrl(page.data.alt_lang_url);
            const links: string[] = [];
            if (alt) {
                if (lang2(page.data.lang) === "zh") {
                    links.push(
                        `<xhtml:link rel="alternate" hreflang="zh-Hant" href="${xmlEscape(pageUrl)}"/>`
                    );
                    links.push(
                        `<xhtml:link rel="alternate" hreflang="en" href="${xmlEscape(site.url + alt)}"/>`
                    );
                    links.push(
                        `<xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(site.url + alt)}"/>`
                    );
                } else {
                    links.push(
                        `<xhtml:link rel="alternate" hreflang="en" href="${xmlEscape(pageUrl)}"/>`
                    );
                    links.push(
                        `<xhtml:link rel="alternate" hreflang="zh-Hant" href="${xmlEscape(site.url + alt)}"/>`
                    );
                    links.push(
                        `<xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(pageUrl)}"/>`
                    );
                }
            }
            return `  <url>\n    <loc>${xmlEscape(pageUrl)}</loc>${links.length ? `\n    ${links.join("\n    ")}` : ""}\n    <lastmod>${lastmodFor(page)}</lastmod>\n  </url>`;
        })
        .join("\n");
    const xml = `<?xml version="1.0" encoding="utf-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
    return new Response(xml, {
        headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
}
