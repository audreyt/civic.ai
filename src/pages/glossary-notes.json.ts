import { smartQuotes } from "../lib/legacyMarkdown";
import { glossary } from "../lib/site";

// Margin notes (DESIGN.md §21): one short plain-text note per glossary entry,
// fetched by the client only on pages that carry gloss links. This file is a
// static endpoint, not a page, so it is in neither the sitemap nor the search
// index.

const ENTITIES: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&nbsp;": " ",
};

function plain(html: string): string {
    return html
        .replace(/<[^>]*>/g, "")
        .replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, (m) => ENTITIES[m] ?? m)
        .replace(/\s+/g, " ")
        .trim();
}

// First sentence: ends at 。 or at . ! ? followed by a capital, a quote, or
// the end, so "e.g. lower-case" and "Ms. Tronto" are not cut short.
function firstSentence(text: string): string {
    const match = text.match(/^[\s\S]*?(?:。|[.!?](?=\s+[A-Z“"‘'(]|\s*$))/);
    return match ? match[0].trim() : text;
}

function note(def: string): string {
    return smartQuotes(firstSentence(plain(def)));
}

type Entry = { term_en: string; term_tw: string; note: string };

export function GET() {
    const en: Record<string, Entry> = {};
    const tw: Record<string, Entry> = {};
    for (const entry of glossary as any[]) {
        const terms = {
            term_en: smartQuotes(entry.term_en),
            term_tw: smartQuotes(entry.term_tw),
        };
        en[entry.id] = { ...terms, note: note(entry.def_en) };
        tw[entry.id] = { ...terms, note: note(entry.def_tw) };
    }
    return new Response(JSON.stringify({ en, tw }), {
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "public, max-age=300",
        },
    });
}
