import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";
import footnote from "markdown-it-footnote";

const CJK =
    /[\u2E80-\u9FFF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF\u3000-\u303F\u3040-\u309F\u30A0-\u30FF]/;
let cjkPatchInstalled = false;

export function cjkSlugify(value: unknown): string {
    const out = String(value)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\p{L}\p{N}_-]/gu, "");
    return out || "section";
}

function installCjkDelimiterPatch(md: MarkdownIt) {
    if (cjkPatchInstalled) return;
    const State = md.inline.State;
    // oxlint-disable-next-line unbound-method -- always invoked via .call(this, ...) below
    const original = State.prototype.scanDelims;
    State.prototype.scanDelims = function (
        start: number,
        canSplitWord: boolean
    ) {
        const result = original.call(this, start, canSplitWord);
        const marker = this.src.charCodeAt(start);
        let pos = start;
        while (pos < this.posMax && this.src.charCodeAt(pos) === marker) pos++;
        // `start`/`pos` are already bounds-checked above, so `slice`
        // (unlike indexing under `noUncheckedIndexedAccess`) needs no
        // nullish fallback: it always returns a defined string, "" when
        // out of range, which is exactly as CJK-inert as " ".
        const lastChar = start > 0 ? this.src.slice(start - 1, start) : " ";
        const nextChar = pos < this.posMax ? this.src.slice(pos, pos + 1) : " ";
        if (!result.can_close && CJK.test(lastChar)) result.can_close = true;
        if (!result.can_open && CJK.test(nextChar)) result.can_open = true;
        return result;
    };
    cjkPatchInstalled = true;
}

export function createMarkdownRenderer(): MarkdownIt {
    const md = new MarkdownIt({
        html: true,
        linkify: false,
        typographer: true,
    });
    md.disable("replacements");
    md.use(footnote);
    md.use(anchor, { slugify: cjkSlugify, permalink: false });
    installCjkDelimiterPatch(md);
    return md;
}

export function renderMarkdown(body: string): string {
    return createMarkdownRenderer().render(body);
}

const SMART_QUOTE_SKIP = new Set([
    "code",
    "pre",
    "script",
    "style",
    "textarea",
]);
const OPENER_CONTEXT = /[\s([{\u2013\u2014\u201C\u2018-]/;

function convertQuotes(text: string, previous: string): string {
    let prev = previous;
    let out = "";
    for (const ch of text) {
        if (ch === '"') out += OPENER_CONTEXT.test(prev) ? "\u201C" : "\u201D";
        else if (ch === "'")
            out += OPENER_CONTEXT.test(prev) ? "\u2018" : "\u2019";
        else out += ch;
        prev = ch;
    }
    return out;
}

export function smartQuotes(value: string): string {
    let previous = " ";
    let skip = 0;
    return value
        .split(/(<[^>]+>)/)
        .map((part) => {
            if (part.startsWith("<")) {
                const match = /^<(\/?)([a-zA-Z0-9]+)/.exec(part);
                if (match) {
                    const closing = match[1] === "/";
                    if (SMART_QUOTE_SKIP.has(String(match[2]).toLowerCase()))
                        skip = closing ? Math.max(0, skip - 1) : skip + 1;
                    if (!closing) previous = " ";
                }
                return part;
            }
            if (skip > 0 || part === "") return part;
            const text = part
                .replace(/&quot;|&#34;|&#x22;/g, '"')
                .replace(/&#39;|&#x27;|&apos;/g, "'");
            const converted = convertQuotes(text, previous);
            previous = text.slice(-1);
            return converted;
        })
        .join("");
}
