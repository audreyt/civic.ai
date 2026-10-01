// Type: the comics' OFL faces, styled runs, layout and glyph outlines.
import * as fontkit from "fontkit";
import { join } from "node:path";

// Font roles. Files are the copies in ncase/civic-ai-comics/design-resources.
export const ROLES = {
    hand: {
        file: "design-resources/fonts/Patrick_Hand/PatrickHand-Regular.ttf",
        family: "Patrick Hand",
        webfont: "patrick-hand-comics",
        stack: "'Patrick Hand','Chalkboard SE','Comic Neue','Comic Sans MS',cursive",
    },
    hand_sc: {
        file: "design-resources/fonts/Patrick_Hand_SC/PatrickHandSC-Regular.ttf",
        family: "Patrick Hand SC",
        webfont: "patrick-hand-sc-comics",
        stack: "'Patrick Hand SC','Patrick Hand','Chalkboard SE','Comic Neue',cursive",
    },
    oswald: {
        file: "design-resources/fonts/Oswald/static/Oswald-Regular.ttf",
        family: "Oswald",
        webfont: "oswald-comics",
        stack: "Oswald,'Arial Narrow','Roboto Condensed',sans-serif-condensed,sans-serif",
    },
    anton: {
        file: "design-resources/fonts/Anton/Anton-Regular.ttf",
        family: "Anton",
        webfont: "anton-comics",
        stack: "Anton,Impact,'Arial Narrow Bold',sans-serif-condensed,sans-serif",
    },
};

// Nicky Case set the pages without ligatures (Patrick Hand's "ll" ligature
// would pull every following letter left), so the site turns them off too.
export const FEATURES = { liga: false, clig: false, calt: false, dlig: false };

// The masters slant italics by a skew that varies from page to page (about
// 14° to 20°); the fitter measures it per block. This is its starting guess,
// the browsers' synthetic oblique.
export const ITALIC_SKEW = Math.tan((14 * Math.PI) / 180);

// Quotes and apostrophes: placed on their own, as the masters (and the
// site's re-set lines) do not always put them where the font would.
export const QUOTES = new Set(["'", "’", "‘", '"', "“", "”"]);

const fonts = new Map();
export function loadFonts(upstream) {
    for (const [role, def] of Object.entries(ROLES))
        if (!fonts.has(role))
            fonts.set(role, fontkit.openSync(join(upstream, def.file)));
    return fonts;
}
export const fontFor = (role) => {
    const f = fonts.get(role);
    if (!f) throw new Error(`font role ${role} not loaded`);
    return f;
};

// Per-character styles from upstream-style emphasis spans
// ({ text, occurrence } or { start, end }; here italic and/or color).
export function styleMap(text, emphasis = []) {
    const italic = new Uint8Array(text.length);
    const color = Array.from({ length: text.length });
    for (const span of emphasis) {
        let start, end;
        if (span.start !== undefined || span.end !== undefined) {
            start = span.start ?? 0;
            end = span.end ?? start;
        } else {
            const occurrence = Math.max(1, span.occurrence ?? 1);
            let from = 0,
                found = -1;
            for (let n = 0; n < occurrence; n++) {
                found = text.indexOf(span.text, from);
                if (found < 0) break;
                from = found + span.text.length;
            }
            if (found < 0)
                throw new Error(
                    `emphasis "${span.text}" (occurrence ${occurrence}) not found in: ${text}`
                );
            start = found;
            end = found + span.text.length;
        }
        for (let i = start; i < end; i++) {
            if (span.italic) italic[i] = 1;
            if (span.color) color[i] = span.color.toUpperCase();
        }
    }
    return { italic, color };
}

// Split one line (with its offset into the block text) into style runs.
export function lineRuns(line, offset, styles) {
    const runs = [];
    for (let i = 0; i < line.length; i++) {
        const it = styles.italic[offset + i] === 1;
        const col = styles.color[offset + i];
        const last = runs[runs.length - 1];
        if (last && last.italic === it && last.color === col)
            last.text += line[i];
        else runs.push({ text: line[i], italic: it, color: col });
    }
    return runs;
}

// Glyph forms the masters may use for one character: the spec keeps the
// typographic character, the fitter picks the form the page actually shows.
const SWAPS = [
    [["…", "..."]],
    [
        ["’", "'"],
        ["‘", "'"],
    ],
    [
        ["“", '"'],
        ["”", '"'],
    ],
    [["—", "–"]],
];
export function variants(runs) {
    let out = [runs];
    for (const group of SWAPS) {
        const next = [];
        for (const v of out) {
            next.push(v);
            if (v.some((r) => group.some(([a]) => r.text.includes(a))))
                next.push(
                    v.map((r) => ({
                        ...r,
                        text: group.reduce(
                            (t, [a, b]) => t.split(a).join(b),
                            r.text
                        ),
                    }))
                );
        }
        out = next;
    }
    return out;
}

// Lay out runs in font units. Each glyph keeps its pen x, run index and
// skew; ink is the outline bounding box (italic glyphs skewed about the
// baseline). `tracking` (font units) is added after every character, as CSS
// letter-spacing does.
// A block whose masters show ligatures (Ch6_B's Kami paragraph) sets
// `ligatures: true`; then a glyph's `char` may hold two letters.
export function layout(
    role,
    runs,
    tracking = 0,
    skew = ITALIC_SKEW,
    ligatures = false
) {
    const font = fontFor(role);
    let pen = 0;
    const glyphs = [];
    runs.forEach((run, ri) => {
        run.start = pen;
        const shaped = font.layout(
            run.text,
            ligatures ? { ...FEATURES, liga: true } : FEATURES
        );
        if (!ligatures && shaped.glyphs.length !== run.text.length)
            throw new Error(
                `expected one glyph per character in "${run.text}"`
            );
        shaped.glyphs.forEach((g, i) => {
            const p = shaped.positions[i];
            const char = ligatures
                ? String.fromCodePoint(...g.codePoints)
                : run.text[i];
            glyphs.push({
                g,
                i: glyphs.length,
                x: pen + p.xOffset,
                y: p.yOffset,
                run: ri,
                italic: run.italic,
                skew: run.italic ? skew : 0,
                char,
            });
            pen += p.xAdvance + tracking;
        });
        run.end = pen;
    });
    const lay = {
        glyphs,
        advance: pen,
        upm: font.unitsPerEm,
        tracking,
        skew,
        ligatures,
    };
    lay.ink = inkOf(lay, () => true);
    return lay;
}

// Words: each glyph's segment index (a word and the spaces after it). Quotes
// and apostrophes are segments of their own.
export function assignSegments(lay) {
    let seg = 0,
        breakAfter = false;
    for (const [i, gl] of lay.glyphs.entries()) {
        const space = gl.char === " ";
        const quote = QUOTES.has(gl.char);
        if (i > 0 && !space && (breakAfter || quote)) seg++;
        gl.seg = seg;
        breakAfter = space || quote;
    }
    return seg + 1;
}

// Ink box of the glyphs passing `keep` (font units).
export function inkOf(lay, keep) {
    const ink = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
    for (const gl of lay.glyphs) {
        if (!keep(gl)) continue;
        const b = gl.g.path.bbox;
        if (!Number.isFinite(b.minX)) continue;
        const k = gl.skew;
        const xs = [
            b.minX + k * (b.minY + gl.y),
            b.minX + k * (b.maxY + gl.y),
            b.maxX + k * (b.minY + gl.y),
            b.maxX + k * (b.maxY + gl.y),
        ];
        ink.x0 = Math.min(ink.x0, gl.x + Math.min(...xs));
        ink.x1 = Math.max(ink.x1, gl.x + Math.max(...xs));
        ink.y0 = Math.min(ink.y0, gl.y + b.minY);
        ink.y1 = Math.max(ink.y1, gl.y + b.maxY);
    }
    return ink;
}

const f1 = (v) => (Math.round(v * 10) / 10).toString();

// Outline path data in page pixels for a placed line.
// placed: { size, x, baseline, segs: [dx], segDy: [dy] per segment,
// glyphDx: [dx] per glyph }, optional glyph filter.
export function linePath(lay, placed, keep = () => true) {
    const k = placed.size / lay.upm;
    let d = "";
    for (const gl of lay.glyphs) {
        if (!keep(gl)) continue;
        const sk = gl.skew;
        const ox =
            placed.x +
            gl.x * k +
            (placed.segs?.[gl.seg] ?? 0) +
            (placed.glyphDx?.[gl.i] ?? 0);
        const oy = placed.baseline + (placed.segDy?.[gl.seg] ?? 0);
        const P = (x, y) => {
            const yy = y + gl.y;
            return `${f1(ox + (x + sk * yy) * k)} ${f1(oy - yy * k)}`;
        };
        for (const c of gl.g.path.commands) {
            const a = c.args;
            if (c.command === "moveTo") d += `M${P(a[0], a[1])}`;
            else if (c.command === "lineTo") d += `L${P(a[0], a[1])}`;
            else if (c.command === "quadraticCurveTo")
                d += `Q${P(a[0], a[1])} ${P(a[2], a[3])}`;
            else if (c.command === "bezierCurveTo")
                d += `C${P(a[0], a[1])} ${P(a[2], a[3])} ${P(a[4], a[5])}`;
            else if (c.command === "closePath") d += "Z";
        }
    }
    return d;
}

export function usedCharacters(texts) {
    const set = new Set();
    for (const t of texts) for (const ch of t) set.add(ch);
    return set;
}
