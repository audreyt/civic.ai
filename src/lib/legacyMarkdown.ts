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

export function renderMarkdown(body: string, url = ""): string {
    const md = createMarkdownRenderer();
    if (/^\/(?:tw\/)?(?:manifesto|[1-6]|measures|faq)\/$/.test(url)) {
        const numbers = new Map<number, number>();
        // Number top-level Markdown prose, not raw HTML cards, hidden list
        // paragraphs, footnotes, blockquotes or image-only blocks. Ordinals are
        // deterministic for an edition; git supplies the edition's provenance.
        md.core.ruler.push("record_paragraphs", (state) => {
            const used = new Set(
                [...body.matchAll(/\bid=["'](p\d+)["']/g)].map((m) => m[1])
            );
            for (const token of state.tokens) {
                const id = token.attrGet("id");
                if (id) used.add(id);
            }
            let number = 0;
            const next = () => {
                do {
                    number++;
                } while (used.has(`p${number}`));
                return number;
            };
            // Bullets are citable units too, nested ones included, and share
            // the paragraphs' sequence. Bullets inside a quotation are the
            // quoted author's, and an empty bullet has nothing to cite.
            let quoteDepth = 0;
            const items: number[] = [];
            for (const [index, token] of state.tokens.entries()) {
                if (token.type === "blockquote_open") quoteDepth++;
                if (token.type === "blockquote_close") quoteDepth--;
                if (token.type === "list_item_open") {
                    const inline =
                        state.tokens[index + 1]?.type === "paragraph_open"
                            ? state.tokens[index + 2]
                            : undefined;
                    const cited =
                        !quoteDepth &&
                        inline?.children?.some(
                            (child) =>
                                child.type === "text" && child.content.trim()
                        );
                    const n = cited ? next() : 0;
                    if (n) {
                        token.attrSet("id", `p${n}`);
                        token.attrSet("class", "record-paragraph");
                        token.attrSet("data-record-paragraph", String(n));
                    }
                    items.push(n);
                    continue;
                }
                if (token.type === "list_item_close") {
                    const n = items.pop();
                    if (n) numbers.set(index, n);
                    continue;
                }
                if (
                    token.type !== "paragraph_open" ||
                    token.hidden ||
                    token.level !== 0 ||
                    token.attrGet("id")
                )
                    continue;
                const inline = state.tokens[index + 1];
                if (
                    !inline?.children?.some(
                        (child) => child.type === "text" && child.content.trim()
                    )
                )
                    continue;
                next();
                token.attrSet("id", `p${number}`);
                token.attrSet("class", "record-paragraph");
                token.attrSet("data-record-paragraph", String(number));
                numbers.set(index + 2, number);
            }
        });
        const closeWithLink: NonNullable<
            typeof md.renderer.rules.paragraph_close
        > = (tokens, index, options, _env, renderer) => {
            const number = numbers.get(index);
            return (
                (number
                    ? `<a class="record-paragraph__link" href="#p${number}" aria-label="${url.startsWith("/tw/") ? `第 ${number} 段的永久連結` : `Permalink to paragraph ${number}`}">¶ ${number}</a>`
                    : "") + renderer.renderToken(tokens, index, options)
            );
        };
        md.renderer.rules.paragraph_close = closeWithLink;
        md.renderer.rules.list_item_close = closeWithLink;
    }
    return md.render(body);
}

// The AVIF sibling of a JPEG/PNG public path, when one ships beside it.
export function avifSibling(
    src: string,
    hasFile: (publicPath: string) => boolean
): string | undefined {
    const stem = /^(.+)\.(?:jpe?g|png)$/i.exec(src)?.[1];
    return stem && hasFile(`${stem}.avif`) ? `${stem}.avif` : undefined;
}

const NOSCRIPT_IMG =
    /<noscript>\s*(<img\b[^>]*?\ssrc="([^"]+)\.(?:jpe?g|png)"[^>]*>)\s*<\/noscript>/gi;

// Content images are authored as `<noscript><img src="x.jpg"></noscript>`, a
// leftover from a client-side AVIF swap. Resolve them at build time instead:
// a native <picture> offers the AVIF sibling when one ships, the JPEG/PNG
// stays the fallback, and the image no longer waits for JavaScript (it is
// visible to the preload scanner and to readers who browse without scripts).
// Narrower AVIF renditions shipped beside a full-size image as `x-720w.avif`
// (and `x-1280w.avif` for very wide sources). Content images sit in the text
// column: 40px of page padding on phones, a 640px column on wider screens.
const PICTURE_WIDTHS = [720, 1280];
const PICTURE_SIZES = "(max-width: 700px) calc(100vw - 40px), 640px";

export function nativePictures(
    html: string,
    hasFile: (publicPath: string) => boolean
): string {
    return html.replace(NOSCRIPT_IMG, (_match, img: string, stem: string) => {
        const avif = `${stem}.avif`;
        if (!hasFile(avif)) return img;
        const width = Number(/\swidth="(\d+)"/.exec(img)?.[1] ?? 0);
        const smaller = PICTURE_WIDTHS.filter(
            (w) => w < width && hasFile(`${stem}-${w}w.avif`)
        );
        if (!smaller.length)
            return `<picture><source srcset="${avif}" type="image/avif">${img}</picture>`;
        const srcset = [
            ...smaller.map((w) => `${stem}-${w}w.avif ${w}w`),
            `${avif} ${width}w`,
        ].join(", ");
        return `<picture><source srcset="${srcset}" sizes="${PICTURE_SIZES}" type="image/avif">${img}</picture>`;
    });
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
