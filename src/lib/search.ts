import { glossary } from "./site";
import { loadPages, type PageRecord } from "./pages";
import { renderMarkdown } from "./legacyMarkdown";

export type SearchLang = "en" | "zh";

export type SearchSubsection = {
    heading: string | null;
    anchor: string | null;
    content: string;
};

export type SearchPageEntry = {
    title: string;
    section: string;
    url: string;
    subsections: SearchSubsection[];
};

const BLOCK_RE = /<(head|script|style|svg|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi;
const HEADING_RE =
    /<h([2-4])\b[^>]*\bid=["']([^"']+)["'][^>]*>([\s\S]*?)<\/h\1>/gi;
const LINK_RE = /<a\b[^>]*>([\s\S]*?)<\/a>/gi;
const TAG_RE = /<[^>]+>/g;

type GlossaryEntry = {
    term_en?: string;
    term_tw?: string;
    aliases_en?: string[];
    aliases_tw?: string[];
};

function glossaryAliases(
    entry: GlossaryEntry,
    key: "aliases_tw" | "aliases_en"
): string[] {
    const raw = entry[key];
    return Array.isArray(raw) ? raw : [];
}

export function normalizeSearchLang(lang: string | undefined): SearchLang {
    return String(lang ?? "")
        .toLowerCase()
        .startsWith("zh")
        ? "zh"
        : "en";
}

function stripHtmlBlocks(html: string): string {
    return html.replace(BLOCK_RE, "");
}

function decodeHtmlEntities(text: string): string {
    return text
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'");
}

function htmlToPlainText(fragment: string): string {
    let text = fragment.replace(LINK_RE, (_match, inner: string) =>
        htmlToPlainText(inner)
    );
    text = text.replace(TAG_RE, " ");
    text = decodeHtmlEntities(text);
    return text.replace(/\s+/g, " ").trim();
}

function headingTitle(html: string): string {
    return htmlToPlainText(html);
}

export function splitRenderedHtmlByHeadings(html: string): SearchSubsection[] {
    const cleaned = stripHtmlBlocks(html);
    const sections: SearchSubsection[] = [];
    const matches: Array<{
        index: number;
        end: number;
        anchor: string;
        headingHtml: string;
    }> = [];

    for (const match of cleaned.matchAll(HEADING_RE)) {
        const full = match[0];
        const index = match.index!;
        matches.push({
            index,
            end: index + full.length,
            anchor: match[2]!,
            headingHtml: match[3]!,
        });
    }

    if (matches.length === 0) {
        const content = htmlToPlainText(cleaned);
        if (content) {
            sections.push({ heading: null, anchor: null, content });
        }
        return sections;
    }

    const intro = cleaned.slice(0, matches[0]!.index);
    const introText = htmlToPlainText(intro);
    if (introText) {
        sections.push({
            heading: null,
            anchor: null,
            content: introText,
        });
    }

    for (let i = 0; i < matches.length; i++) {
        const current = matches[i]!;
        const next = matches[i + 1];
        const bodyHtml = cleaned.slice(
            current.end,
            next ? next.index : cleaned.length
        );
        const content = htmlToPlainText(bodyHtml);
        if (!content) continue;
        sections.push({
            heading: headingTitle(current.headingHtml),
            anchor: current.anchor,
            content,
        });
    }

    return sections;
}

function pageSectionLabel(page: PageRecord): string {
    const title = page.data.title || page.url;
    const subtitle = page.data.subtitle;
    return subtitle ? `${title} — ${subtitle}` : title;
}

function structuredSummarySubsections(page: PageRecord): SearchSubsection[] {
    const zh = normalizeSearchLang(page.data.lang) === "zh";
    const sections: SearchSubsection[] = [];
    const summary = page.data.summary?.trim();
    const summaryAnchor = page.data.summary_anchor?.trim();

    if (summary && summaryAnchor) {
        sections.push({
            heading:
                page.data.summary_label?.trim() || (zh ? "簡單講" : "In short"),
            anchor: summaryAnchor,
            content: htmlToPlainText(renderMarkdown(summary)),
        });
    }

    const takeaways = Array.isArray(page.data.key_takeaways)
        ? page.data.key_takeaways
              .filter(
                  (item): item is string =>
                      typeof item === "string" && item.trim() !== ""
              )
              .map((item) => htmlToPlainText(renderMarkdown(item)))
              .filter(Boolean)
        : [];
    const takeawaysAnchor = page.data.key_takeaways_anchor?.trim();
    if (takeaways.length && takeawaysAnchor) {
        sections.push({
            heading:
                page.data.key_takeaways_label?.trim() ||
                (zh ? "重點" : "Key takeaways"),
            anchor: takeawaysAnchor,
            content: takeaways.join(" "),
        });
    }

    return sections;
}

function pagePassesSearchFilters(page: PageRecord): boolean {
    return (
        page.includeInSitemap === true &&
        page.data.search_exclude !== true &&
        page.isRawHtmlDocument === false &&
        !page.sourceName.endsWith(".html")
    );
}

export function getSearchEntries(lang?: SearchLang): SearchPageEntry[] {
    return loadPages()
        .filter((page) => {
            if (!pagePassesSearchFilters(page)) return false;
            if (lang === undefined) return true;
            return normalizeSearchLang(page.data.lang) === lang;
        })
        .map((page) => ({
            title: page.data.title || page.url,
            section: pageSectionLabel(page),
            url: page.url,
            subsections: [
                ...structuredSummarySubsections(page),
                ...splitRenderedHtmlByHeadings(page.html),
            ],
        }));
}

export function getSearchEntriesByLang(): Record<
    SearchLang,
    SearchPageEntry[]
> {
    return {
        en: getSearchEntries("en"),
        zh: getSearchEntries("zh"),
    };
}

export function getSearchSuggestions(lang: SearchLang): string[] {
    const terms = new Set<string>();

    for (const entry of getSearchEntries(lang)) {
        terms.add(entry.title);
    }

    for (const entry of glossary as GlossaryEntry[]) {
        if (lang === "en") {
            if (entry.term_en) terms.add(entry.term_en);
            for (const alias of glossaryAliases(entry, "aliases_en")) {
                if (alias) terms.add(alias);
            }
        } else {
            if (entry.term_tw) terms.add(entry.term_tw);
            for (const alias of glossaryAliases(entry, "aliases_tw")) {
                if (alias) terms.add(alias);
            }
        }
    }

    return [...terms].sort((a, b) => a.localeCompare(b));
}
