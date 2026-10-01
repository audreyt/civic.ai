// Inline language annotation (DESIGN.md §21): runs of the "other" script inside
// prose are labelled with their language at build time, so the browser picks
// the right glyphs, shaping and spacing for them. Replacements are spliced into
// the original markup at parse5 source offsets, so everything outside a
// labelled run stays byte-identical (ids, ¶ links, attributes, entities).
import {
    defaultTreeAdapter,
    parseFragment,
    type DefaultTreeAdapterMap,
} from "parse5";
import { glossary } from "./site";

type TextNode = DefaultTreeAdapterMap["textNode"];
type ParentNode = DefaultTreeAdapterMap["parentNode"];

interface Edit {
    readonly start: number;
    readonly end: number;
    readonly html: string;
}

export type Mode = "latin" | "han";

const LATIN = "A-Za-z\\u00c0-\\u00d6\\u00d8-\\u00f6\\u00f8-\\u024f";
// A word of Latin letters and digits; URL/e-mail connectors only between them.
const TOKEN = `[${LATIN}0-9]+(?:[_/:@#%?=&+~][${LATIN}0-9]+)*`;

const SPECS: Record<
    Mode,
    { readonly runs: RegExp; readonly worthy: RegExp; readonly lang: string }
> = {
    latin: {
        runs: new RegExp(`${TOKEN}(?:(?: |-|['’]|\\. ?)${TOKEN})*`, "g"),
        // At least two letters: digits and lone initials carry no language.
        worthy: new RegExp(`[${LATIN}].*[${LATIN}]`),
        lang: "en-GB",
    },
    han: {
        runs: /[\p{Script=Han}\u3000-\u303f\u30fb\ufe30-\ufe4f\uff00-\uffef]+/gu,
        worthy: /\p{Script=Han}/u,
        lang: "zh-TW",
    },
};

const MODES = new Map<string, Mode>([
    ["zh", "latin"],
    ["en", "han"],
    ["", "han"],
]);

const PROSE = new Set([
    "p",
    "li",
    "dt",
    "dd",
    "td",
    "th",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "blockquote",
    "figcaption",
    "caption",
]);

// Raw-text and non-prose subtrees: a span there would print literally or
// mislabel code.
const SKIPPED = new Set([
    "code",
    "pre",
    "kbd",
    "samp",
    "script",
    "style",
    "svg",
    "math",
    "textarea",
    "noscript",
]);

// ja (and any other language) is left alone; a missing lang follows the
// site's convention of treating the page as English.
export function modeFor(lang: string | undefined): Mode | undefined {
    return MODES.get((lang ?? "").toLowerCase().replace(/-.*/, ""));
}

const escapeText = (text: string): string =>
    text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Locked glossary labels that mix scripts (地神（Kami）) are matched and
// checked as whole strings, so no label is allowed to cut through one.
const MIXED_TERMS = (
    glossary as ReadonlyArray<{
        readonly term_tw: string;
        readonly aliases_tw?: readonly string[];
    }>
)
    .flatMap(({ term_tw, aliases_tw }) => [term_tw, ...(aliases_tw ?? [])])
    .filter((term) => /\p{Script=Han}/u.test(term) && /[A-Za-z]/.test(term));

function splitsTerm(value: string, start: number, end: number): boolean {
    return MIXED_TERMS.some((term) => {
        for (
            let at = value.indexOf(term);
            at >= 0;
            at = value.indexOf(term, at + 1)
        ) {
            if (at < end && start < at + term.length) return true;
        }
        return false;
    });
}

function annotateText(value: string, mode: Mode): string | undefined {
    const { runs, worthy, lang } = SPECS[mode];
    let html = "";
    let last = 0;
    let wrapped = false;
    for (const run of value.matchAll(runs)) {
        if (
            !worthy.test(run[0]) ||
            splitsTerm(value, run.index, run.index + run[0].length)
        )
            continue;
        html += `${escapeText(value.slice(last, run.index))}<span lang="${lang}">${escapeText(run[0])}</span>`;
        last = run.index + run[0].length;
        wrapped = true;
    }
    return wrapped ? html + escapeText(value.slice(last)) : undefined;
}

export function textEdit(node: TextNode, mode: Mode): Edit | undefined {
    const location = node.sourceCodeLocation;
    const html = location && annotateText(node.value, mode);
    return location && html
        ? { start: location.startOffset, end: location.endOffset, html }
        : undefined;
}

export function annotateInlineLang(
    html: string,
    lang: string | undefined
): string {
    const mode = modeFor(lang);
    if (!mode) return html;
    const edits: Edit[] = [];
    const walk = (parent: ParentNode, inProse: boolean): void => {
        for (const node of parent.childNodes) {
            if (defaultTreeAdapter.isTextNode(node)) {
                const edit = inProse ? textEdit(node, mode) : undefined;
                if (edit) edits.push(edit);
            } else if (
                defaultTreeAdapter.isElementNode(node) &&
                !SKIPPED.has(node.tagName) &&
                !node.attrs.some((attr) => attr.name === "lang")
            ) {
                walk(node, inProse || PROSE.has(node.tagName));
            }
        }
    };
    walk(parseFragment(html, { sourceCodeLocationInfo: true }), false);

    let out = "";
    let last = 0;
    for (const edit of edits) {
        out += html.slice(last, edit.start) + edit.html;
        last = edit.end;
    }
    return out + html.slice(last);
}
