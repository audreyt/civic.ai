// Write a comic page as SVG: art underneath, traced lettering, live text.
import { ROLES } from "./type.mjs";

const f1 = (v) => (Math.round(v * 10) / 10).toString();
const f3 = (v) => (Math.round(v * 1000) / 1000).toString();
const esc = (s) =>
    s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
// Spaces the HTML minifier must not collapse travel as character references.
const text = (s) => esc(s).replace(/ (?= )|^ | $/g, "&#32;");

function textBlock(block, fill) {
    const role = ROLES[block.role];
    const texts = [];
    let upright = "";
    // the stylesheet turns ligatures off; a block set with them says so
    const open = block.lines[0]?.lay.ligatures
        ? `<text style="font-variant-ligatures:common-ligatures"`
        : "<text";
    const flush = () => {
        if (upright) texts.push(`${open}>${upright}</text>`);
        upright = "";
    };
    block.lines.forEach((L, li) => {
        const k = block.size / L.lay.upm;
        const dx = (g) => L.placed.segs?.[g.seg] ?? 0;
        const dy = (g) => L.placed.segDy?.[g.seg] ?? 0;
        // a new span wherever the style changes or a word (or quote) sits
        // apart from the font's own spacing; spaces ride with the word before
        const spans = [];
        for (const g of L.lay.glyphs) {
            const run = L.runs[g.run];
            const cur = spans[spans.length - 1];
            const gx =
                L.placed.x + g.x * k + dx(g) + (L.placed.glyphDx?.[g.i] ?? 0);
            if (
                cur &&
                (g.char === " " ||
                    (cur.run === run &&
                        Math.abs(cur.dx - dx(g)) < 0.75 &&
                        Math.abs(cur.dy - dy(g)) < 0.75))
            ) {
                cur.text += g.char;
                cur.xs.push(gx);
            } else
                spans.push({
                    run,
                    dx: dx(g),
                    dy: dy(g),
                    x: gx,
                    xs: [gx],
                    text: g.char,
                });
        }
        const last = li === block.lines.length - 1;
        const tail = spans[spans.length - 1];
        if (!last && !/[-/]$/.test(tail.text)) tail.text += " ";
        for (const sp of spans) {
            const y = L.placed.baseline + sp.dy;
            // letters placed one by one carry an x per character
            const own = L.placed.glyphDx && sp.xs.length > 1;
            const xs = own ? sp.xs.map(f1).join(" ") : f1(sp.x);
            const attrs = [`x="${xs}"`, `y="${f1(y)}"`];
            const colour = sp.run.color ?? L.colour;
            if (colour !== fill) attrs.push(`fill="${colour}"`);
            const tspan = `<tspan ${attrs.join(" ")}>${text(sp.text)}</tspan>`;
            if (!sp.run.italic) upright += tspan;
            else {
                // the masters' slant, skewed about this line's baseline
                flush();
                const t = block.skew;
                texts.push(
                    `${open} transform="matrix(1 0 ${f3(-t)} 1 ${f1(t * L.placed.baseline)} 0)">${tspan}</text>`
                );
            }
        }
    });
    flush();
    const spacing =
        Math.abs(block.tracking ?? 0) >= 0.05
            ? ` letter-spacing="${f1(block.tracking)}"`
            : "";
    return `<g font-family="${role.stack}" font-size="${f1(block.size)}"${spacing}${fill ? ` fill="${fill}"` : ""}>${texts.join("")}</g>`;
}

function overlayBlock(block, family) {
    // drawn marks with no words (underlines, a scribble) carry no text
    block = { ...block, lines: block.lines.filter((L) => L.text.trim()) };
    if (!block.lines.length) return "";
    const lines = block.lines
        .map((L, li) => {
            const tail = li < block.lines.length - 1 && !block.cjk ? " " : "";
            return `<tspan x="${f1(L.x)}" y="${f1(L.baseline)}" font-size="${f1(L.size)}" textLength="${f1(L.width)}" lengthAdjust="spacingAndGlyphs">${text(L.text + tail)}</tspan>`;
        })
        .join("");
    return `<text font-family="${family}" fill-opacity="0">${lines}</text>`;
}

function majority(values) {
    const counts = new Map();
    for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1])[0]?.[0];
}

// The standalone page (art, lettering and text in one file, for opening at
// full size and for machines) and, when there is hand lettering, its traced
// outlines alone as a lazily loaded image layer for the site's plates.
export function pageSvg({
    w,
    h,
    display,
    lang,
    title,
    desc,
    art,
    lettering,
    blocks,
    traced,
    fonts,
    overlayFamily,
}) {
    const parts = [];
    for (const block of blocks) {
        if (block.kind === "text") {
            const fill = majority(
                block.lines.flatMap((L) =>
                    L.runs.map((r) => r.color ?? L.colour)
                )
            );
            parts.push(textBlock(block, fill));
        } else parts.push(overlayBlock(block, overlayFamily));
    }
    const faces = fonts
        .map(
            (f) =>
                `@font-face{font-family:"${f.family}";src:url(/fonts/${f.file}.woff2) format("woff2");font-display:block}`
        )
        .join("");
    const page =
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${display.w}" height="${display.h}" lang="${lang}">` +
        `<title>${esc(title)}</title><desc>${esc(desc)}</desc>` +
        `<style>${faces}text{white-space:pre;font-variant-ligatures:none}</style>` +
        `<image href="${art}" width="${w}" height="${h}" preserveAspectRatio="none"/>` +
        (traced.length
            ? `<image class="comic-lettering" href="${lettering}" width="${w}" height="${h}" preserveAspectRatio="none"/>`
            : "") +
        `<g class="comic-text">${parts.join("")}</g>` +
        `</svg>\n`;
    const paths = traced
        .map(
            (t) =>
                `<path fill="${t.fill}" transform="${t.transform}" d="${t.d}"/>`
        )
        .join("");
    const letteringSvg = traced.length
        ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${display.w}" height="${display.h}" preserveAspectRatio="none">${paths}</svg>\n`
        : null;
    return { page, lettering: letteringSvg };
}
