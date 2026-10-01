// Fit spec text to the ink of a reference master.
import { clampBox, median, hex } from "./image.mjs";
import {
    ITALIC_SKEW,
    QUOTES,
    assignSegments,
    inkOf,
    layout,
    lineRuns,
    linePath,
    styleMap,
    variants,
} from "./type.mjs";
import { bestShift, mismatch, renderMask } from "./raster.mjs";

const centre = (c) => [(c.x0 + c.x1) / 2, (c.y0 + c.y1) / 2];
const inBox = (c, b) => {
    const [cx, cy] = centre(c);
    return cx >= b[0] && cx <= b[2] && cy >= b[1] && cy <= b[3];
};

export function blockComponents(ctx, box) {
    return ctx.comps.filter(
        (c) => !ctx.used.has(c.id) && c.area >= 3 && inBox(c, box)
    );
}

// Cluster components into n lines (1-D k-means on the letters' centres,
// weighted by area); see below for small marks and shared components.
export function clusterLines(comps, n) {
    if (!comps.length) throw new Error("no ink in box");
    const items = comps.map((c) => ({ c, cy: (c.y0 + c.y1) / 2, w: c.area }));
    // Letters (not dots, quotes or commas) find the lines: k-means on their
    // centres, seeded evenly from the first line to the last.
    const hMed = median(
        items.filter((i) => i.c.y1 - i.c.y0 > 24).map((i) => i.c.y1 - i.c.y0)
    );
    let tall = items.filter((i) => i.c.y1 - i.c.y0 >= 0.5 * (hMed ?? 0));
    if (tall.length < n) tall = items;
    const ys = tall.map((i) => i.cy);
    const lo = Math.min(...ys),
        hi = Math.max(...ys);
    let centres = Array.from({ length: n }, (_, k) =>
        n === 1 ? (lo + hi) / 2 : lo + (k * (hi - lo)) / (n - 1)
    );
    for (let it = 0; it < 40; it++) {
        const sum = Array.from({ length: n }, () => 0),
            cnt = Array.from({ length: n }, () => 0);
        for (const i of tall) {
            let best = 0;
            for (let k = 1; k < n; k++)
                if (
                    Math.abs(i.cy - centres[k]) < Math.abs(i.cy - centres[best])
                )
                    best = k;
            i.k = best;
            sum[best] += i.cy * i.w;
            cnt[best] += i.w;
        }
        centres = centres.map((c, k) => (cnt[k] ? sum[k] / cnt[k] : c));
    }
    // Small marks (dots, commas, quotes) join the first line whose baseline
    // lies below the mark's top: commas and full stops start above their
    // own baseline, an apostrophe of the next line starts below it.
    const baselines = centres.map((c, k) => {
        const own = tall.filter((i) => i.k === k);
        return own.length ? median(own.map((i) => i.c.y1)) : c;
    });
    const byBaseline = baselines
        .map((b, k) => [b, k])
        .sort((p, q) => p[0] - q[0]);
    const tallSet = new Set(tall);
    for (const i of items) {
        if (tallSet.has(i)) continue;
        const owner = byBaseline.find(([b]) => b >= i.c.y0);
        i.k = (owner ?? byBaseline[byBaseline.length - 1])[1];
    }
    const lines = centres.map(() => ({
        x0: Infinity,
        y0: Infinity,
        x1: -Infinity,
        y1: -Infinity,
        comps: [],
    }));
    // A component reaching two line centres (a descender touching the
    // ascender below) is shared: each line takes its part between the
    // midpoints to the neighbouring lines.
    const order = centres.map((c, k) => [c, k]).sort((a, b) => a[0] - b[0]);
    const band = (k) => {
        const at = order.findIndex(([, kk]) => kk === k);
        const lo = at > 0 ? (order[at - 1][0] + order[at][0]) / 2 : -Infinity;
        const hi =
            at < order.length - 1
                ? (order[at][0] + order[at + 1][0]) / 2
                : Infinity;
        return [lo, hi];
    };
    const tallest = median(
        items.filter((i) => i.c.y1 - i.c.y0 > 24).map((i) => i.c.y1 - i.c.y0)
    );
    const add = (k, c) => {
        const L = lines[k];
        L.comps.push(c);
        L.x0 = Math.min(L.x0, c.x0);
        L.y0 = Math.min(L.y0, c.y0);
        L.x1 = Math.max(L.x1, c.x1 + 1);
        L.y1 = Math.max(L.y1, c.y1 + 1);
    };
    for (const i of items) {
        const reached = centres
            .map((y, k) => [y, k])
            .filter(([y]) => y >= i.c.y0 && y <= i.c.y1);
        if (reached.length >= 2 && i.c.y1 - i.c.y0 > 1.5 * (tallest ?? 0))
            for (const [, k] of reached) {
                const [lo, hi] = band(k);
                add(k, {
                    ...i.c,
                    y0: Math.max(i.c.y0, Math.ceil(lo)),
                    y1: Math.min(i.c.y1, Math.floor(hi)),
                    clip: [lo, hi],
                });
            }
        else add(i.k, i.c);
    }
    if (lines.some((L) => !L.comps.length))
        throw new Error(`could not find ${n} lines of ink`);
    return lines.sort((a, b) => a.y0 + a.y1 - (b.y0 + b.y1));
}

// Target mask for a crop: only the pixels of the given components (of a
// shared component, only its part in the line's band).
function targetMask(ctx, comps, box) {
    const clips = new Map(comps.map((c) => [c.id, c.clip]));
    const [x0, y0, x1, y1] = box;
    const w = x1 - x0,
        h = y1 - y0;
    const m = new Uint8Array(w * h);
    for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
            const id = ctx.labels[(y0 + y) * ctx.w + x0 + x];
            if (!clips.has(id)) continue;
            const clip = clips.get(id);
            if (clip && (y0 + y < clip[0] || y0 + y >= clip[1])) continue;
            m[y * w + x] = 1;
        }
    return m;
}

// Colour of the ink under a rendered mask: the median of its stroke cores
// (the stronger half of its pixels against the paper), so grey and white
// lettering read as truly as black.
function sampleColour(ctx, rendered, box) {
    const [x0, y0, x1] = box;
    const w = x1 - x0;
    const R = ctx.ref.data,
        W = ctx.wordless.data;
    const px = [];
    for (let i = 0; i < rendered.length; i += 1) {
        if (!rendered[i]) continue;
        const p = (y0 + ((i / w) | 0)) * ctx.w + x0 + (i % w);
        if (!ctx.mask[p]) continue;
        const j = p * 3;
        const d = Math.max(
            Math.abs(R[j] - W[j]),
            Math.abs(R[j + 1] - W[j + 1]),
            Math.abs(R[j + 2] - W[j + 2])
        );
        px.push([d, R[j], R[j + 1], R[j + 2]]);
    }
    if (px.length < 12) return null;
    px.sort((a, b) => b[0] - a[0]);
    const core = px.slice(0, Math.ceil(px.length / 2));
    return [1, 2, 3].map((c) => median(core.map((v) => v[c])));
}
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

// Quotes sit where the masters please (see QUOTES), so the height of a line
// is read from its other glyphs.
const bodyInk = (lay) => {
    const b = inkOf(lay, (g) => !QUOTES.has(g.char));
    return Number.isFinite(b.y0) ? b : lay.ink;
};

// The master's height of a line without its quote marks: components under
// the layout's quotes (placed by the line's width) are left out.
function bodyExtent(lay, L) {
    const quotes = lay.glyphs.filter((g) => QUOTES.has(g.char));
    if (!quotes.length) return [L.y0, L.y1];
    const k = (L.x1 - L.x0) / (lay.ink.x1 - lay.ink.x0);
    const x = L.x0 - lay.ink.x0 * k;
    const spans = quotes.map((g) => {
        const b = g.g.path.bbox;
        return [x + (g.x + b.minX) * k - 12, x + (g.x + b.maxX) * k + 12];
    });
    const lineH = L.y1 - L.y0;
    const rest = L.comps.filter((c) => {
        const [cx] = centre(c);
        const small = c.y1 - c.y0 < 0.45 * lineH;
        return !(small && spans.some(([a, b]) => cx >= a && cx <= b));
    });
    if (!rest.length) return [L.y0, L.y1];
    return [
        Math.min(...rest.map((c) => c.y0)),
        Math.max(...rest.map((c) => c.y1 + 1)),
    ];
}

function measure(role, runs, L, tracking = 0, skew = ITALIC_SKEW, lig = false) {
    const lay = layout(role, runs, tracking, skew, lig);
    const body = bodyInk(lay);
    const [y0, y1] = bodyExtent(lay, L);
    const sw = ((L.x1 - L.x0) / (lay.ink.x1 - lay.ink.x0)) * lay.upm;
    const sh = ((y1 - y0) / (body.y1 - body.y0)) * lay.upm;
    return { runs, lay, sw, sh, y0, y1 };
}

const lineBox = (ctx, L, pad) =>
    clampBox([L.x0 - pad, L.y0 - pad, L.x1 + pad, L.y1 + pad], ctx.w, ctx.h);

export async function fitTypeset(ctx, block) {
    const role = block.role ?? "hand";
    const lig = block.ligatures === true;
    const comps = blockComponents(ctx, block.box);
    const textLines = block.text.split("\n");
    const ink = clusterLines(comps, textLines.length);
    comps.forEach((c) => ctx.used.add(c.id));
    const styles = styleMap(block.text, block.emphasis);
    let offset = 0;
    const baseRuns = textLines.map((t) => {
        const runs = lineRuns(t, offset, styles);
        offset += t.length + 1;
        return runs;
    });
    // size and glyph forms: alternate between choosing the forms closest to
    // the block size and re-estimating the size from the chosen forms
    let tracking = 0; // font units
    const plainLines = () => {
        const p = chosen
            .map((m, i) => ({ m, L: ink[i] }))
            .filter(({ m }) => m.runs.every((r) => !r.italic));
        return p.length ? p : chosen.map((m, i) => ({ m, L: ink[i] }));
    };
    let chosen = baseRuns.map((runs, i) =>
        measure(role, runs, ink[i], 0, ITALIC_SKEW, lig)
    );
    let size = block.font ?? median(plainLines().map(({ m }) => m.sw));
    for (let pass = 0; pass < 4; pass++) {
        chosen = baseRuns.map((runs, i) => {
            let best = null;
            for (const v of variants(runs)) {
                const m = measure(role, v, ink[i], tracking, ITALIC_SKEW, lig);
                m.score = Math.abs(m.sw - size) + Math.abs(m.sh - size);
                if (!best || m.score < best.score - 1e-9) best = m;
            }
            return best;
        });
        if (block.font !== undefined) continue;
        // Italic lines' width depends on a slant not yet measured: when
        // every line has italics, read the size from the height.
        if (chosen.every((m) => m.runs.some((r) => r.italic))) {
            size = median(chosen.map((m) => m.sh));
            continue;
        }
        // Letter-spaced lines read wider than their height implies: take
        // the size from the height and the excess width as tracking.
        const sw = median(plainLines().map(({ m }) => m.sw)),
            sh = median(plainLines().map(({ m }) => m.sh));
        if (
            block.tracking === false ||
            (!tracking && Math.abs(sw / sh - 1) < 0.03)
        )
            size = sw;
        else {
            size = sh;
            tracking = median(
                plainLines().map(({ m, L }) => {
                    const k = size / m.lay.upm;
                    const n = Math.max(1, m.lay.glyphs.length - 1);
                    return (
                        ((L.x1 - L.x0) / k - (m.lay.ink.x1 - m.lay.ink.x0)) /
                            n +
                        tracking
                    );
                })
            );
        }
    }
    // 0. where a line could use either form of a quote, dash or ellipsis,
    // let the ink decide (the size alone can be fooled by the forms)
    for (const [i, runs] of baseRuns.entries()) {
        const forms = variants(runs);
        if (forms.length < 2) continue;
        const L = ink[i];
        const box = lineBox(ctx, L, 36);
        const target = targetMask(ctx, L.comps, box);
        let best = null;
        for (const v of forms) {
            const m = measure(role, v, L, tracking, ITALIC_SKEW, lig);
            const k = size / m.lay.upm;
            const body = bodyInk(m.lay);
            const placed = {
                size,
                x: L.x0 - m.lay.ink.x0 * k,
                baseline: (m.y0 + body.y1 * k + (m.y1 + body.y0 * k)) / 2,
            };
            const r = await renderMask(linePath(m.lay, placed), box);
            m.fit = bestShift(
                r,
                target,
                box[2] - box[0],
                box[3] - box[1],
                16,
                16
            ).iou;
            if (!best || m.fit > best.fit + 1e-9) best = m;
        }
        chosen[i] = best;
    }
    // 1. place each line, find its colours
    const work = [];
    for (const [i, m] of chosen.entries()) {
        const L = ink[i];
        const k = size / m.lay.upm;
        const placed = {
            size,
            x: L.x0 - m.lay.ink.x0 * k,
            baseline:
                (m.y0 +
                    bodyInk(m.lay).y1 * k +
                    (m.y1 + bodyInk(m.lay).y0 * k)) /
                2,
            segs: [],
            segDy: [],
        };
        const box = lineBox(ctx, L, 36);
        const target = targetMask(ctx, L.comps, box);
        const w = box[2] - box[0],
            h = box[3] - box[1];
        const s = bestShift(
            await renderMask(linePath(m.lay, placed), box),
            target,
            w,
            h,
            24,
            24
        );
        placed.x += s.dx;
        placed.baseline += s.dy;
        let runs = m.runs;
        const lay = m.lay;
        const nseg = assignSegments(lay);
        // colour per word (spec colours win)
        const cols = [];
        for (let sg = 0; sg < nseg; sg++) {
            const r = await renderMask(
                linePath(lay, placed, (g) => g.seg === sg && g.char !== " "),
                box
            );
            cols.push(sampleColour(ctx, r, box));
        }
        const known = cols.filter(Boolean);
        const base = known.length
            ? [0, 1, 2].map((c) => median(known.map((v) => v[c])))
            : [0, 0, 0];
        // per character (a ligature glyph holds two)
        const perChar = lay.glyphs.flatMap((g) => [...g.char].map(() => g));
        const colours = perChar.map((g) => runs[g.run].color);
        let changed = false;
        perChar.forEach((g, ci) => {
            const col = cols[g.seg];
            if (g.char !== " " && col && dist(col, base) > 64 && !colours[ci]) {
                colours[ci] = hex(col);
                changed = true;
            }
        });
        if (changed) {
            const italic = Uint8Array.from(
                perChar.map((g) => (g.italic ? 1 : 0))
            );
            runs = lineRuns(runs.map((r) => r.text).join(""), 0, {
                italic,
                color: colours,
            });
        }
        work.push({ L, k, placed, runs, box, target, w, h, colour: hex(base) });
    }
    // 2. the block's italic slant, measured on its italic words
    let skew = ITALIC_SKEW;
    if (work.some((x) => x.runs.some((r) => r.italic))) {
        let best = -1;
        for (const cand of SKEWS) {
            let total = 0;
            for (const x of work) {
                if (!x.runs.some((r) => r.italic)) continue;
                const lay = layout(role, x.runs, tracking, cand, lig);
                const nseg = assignSegments(lay);
                for (let sg = 0; sg < nseg; sg++) {
                    if (!lay.glyphs.some((g) => g.seg === sg && g.italic))
                        continue;
                    total += (await alignSegment(ctx, x, lay, sg, 48, 3)).iou;
                }
            }
            if (total > best + 1e-9) {
                best = total;
                skew = cand;
            }
        }
    }
    // 3. per line: the quote forms, then its words and glyphs (settleLine)
    const lines = [];
    const qry = Math.max(48, Math.round(0.3 * size));
    for (const x of work) {
        const base = { ...x.placed };
        // each quote mark takes the form, typographic or plain, that its
        // own ink shows (too small to tell on the scale of a whole line)
        if (!lig) {
            let lay = layout(role, x.runs, tracking, skew, lig);
            assignSegments(lay);
            for (let gi = 0; gi < lay.glyphs.length; gi++) {
                const twin = twinOf(
                    lay.glyphs[gi].char,
                    lay.glyphs[gi - 1]?.char
                );
                if (!twin) continue;
                const here = await alignSegment(
                    ctx,
                    x,
                    lay,
                    lay.glyphs[gi].seg,
                    48,
                    qry
                );
                const runs = swapChar(x.runs, gi, twin);
                const alt = layout(role, runs, tracking, skew, lig);
                assignSegments(alt);
                const there = await alignSegment(
                    ctx,
                    x,
                    alt,
                    alt.glyphs[gi].seg,
                    48,
                    qry
                );
                if (there.iou > here.iou + 0.02) {
                    x.runs = runs;
                    lay = alt;
                }
            }
        }
        let fit = await settleLine(
            ctx,
            x,
            base,
            layout(role, x.runs, tracking, skew, lig),
            size,
            lig
        );
        // A line set looser or tighter than the rest of its block (Ch4_B's
        // "evaluations,"): fit it again with its own letter-spacing, read
        // from its ink, and keep that if it fits better. Its glyphs then
        // carry their own x, so the block's letter-spacing does not apply.
        if (!lig && fit.mm.missed + fit.mm.extra > 0.05) {
            const { lay } = fit;
            const n = Math.max(1, lay.glyphs.length - 1);
            const own =
                tracking +
                ((x.L.x1 - x.L.x0) / x.k - (lay.ink.x1 - lay.ink.x0)) / n;
            const alt = await settleLine(
                ctx,
                x,
                base,
                layout(role, x.runs, own, skew, lig),
                size,
                lig
            );
            if (alt.mm.missed + alt.mm.extra < fit.mm.missed + fit.mm.extra) {
                alt.placed.glyphDx ??= alt.lay.glyphs.map(() => 0);
                fit = alt;
            }
        }
        const { lay, placed, iou, mm } = fit;
        x.placed = placed;
        lines.push({
            runs: x.runs,
            lay,
            placed,
            colour: x.colour,
            iou,
            ...mm,
            box: x.box,
        });
    }
    return {
        kind: "text",
        id: block.id,
        role,
        size,
        skew,
        tracking: (tracking * size) / (chosen[0]?.lay.upm ?? 1000),
        lines,
    };
}

// Words drift in the masters (around italics, and wherever the site re-set
// a line): align each word on its own ink, quotes in both axes, then settle
// the baseline, then (if still off) each glyph. Starts from `base`.
async function settleLine(ctx, x, base, lay, size, lig) {
    const { box, target, w, h } = x;
    const placed = { ...base };
    x.placed = placed;
    const qry = Math.max(48, Math.round(0.3 * size));
    const nseg = assignSegments(lay);
    placed.segs = Array.from({ length: nseg }, () => 0);
    placed.segDy = Array.from({ length: nseg }, () => 0);
    for (let sg = 0; sg < nseg; sg++) {
        const quote = lay.glyphs.every(
            (g) => g.seg !== sg || QUOTES.has(g.char) || g.char === " "
        );
        // drift carries on from the word before; quotes roam further
        const start = sg > 0 ? placed.segs[sg - 1] : 0;
        const a = await alignSegment(
            ctx,
            x,
            lay,
            sg,
            quote ? Math.max(48, Math.round(0.4 * size)) : 48,
            quote ? qry : 3,
            start
        );
        // (a quote's thin ticks overlap little even when found)
        if (a.iou > (quote ? 0.15 : 0.4)) {
            placed.segs[sg] = a.dx;
            if (quote) placed.segDy[sg] = a.dy;
        } else placed.segs[sg] = start;
    }
    const again = bestShift(
        await renderMask(linePath(lay, placed), box),
        target,
        w,
        h,
        2,
        10
    );
    placed.x += again.dx;
    placed.baseline += again.dy;
    const final = await renderMask(linePath(lay, placed), box);
    let iou = bestShift(final, target, w, h, 0, 0).iou;
    let mm = mismatch(final, target, w, h, 3);
    // Still off: some letters sit apart from the font's spacing. Place each
    // glyph on its own ink (kept only if the line fits better).
    if (!lig && (mm.missed > 0.004 || mm.extra > 0.004)) {
        const glyphDx = Array.from({ length: lay.glyphs.length }, () => 0);
        for (const g of lay.glyphs) {
            if (g.char === " ") continue;
            const a = await alignGlyph(ctx, x, lay, placed, g, 20);
            if (a.iou > 0.3) glyphDx[g.i] = a.dx;
        }
        const trial = { ...placed, glyphDx };
        const r2 = await renderMask(linePath(lay, trial), box);
        const mm2 = mismatch(r2, target, w, h, 3);
        if (mm2.missed + mm2.extra < mm.missed + mm.extra) {
            placed.glyphDx = glyphDx;
            mm = mm2;
            iou = bestShift(r2, target, w, h, 0, 0).iou;
        }
    }
    return { lay, placed, iou, mm };
}

// Best x shift of one glyph onto the ink under it, from its placed spot.
async function alignGlyph(ctx, x, lay, placed, g, rx) {
    const b = inkOf(lay, (gl) => gl === g);
    if (!Number.isFinite(b.x0)) return { dx: 0, iou: 0 };
    const off = placed.segs[g.seg] ?? 0;
    const gx0 = placed.x + b.x0 * x.k + off,
        gx1 = placed.x + b.x1 * x.k + off;
    const own = x.L.comps.filter((c) => {
        const [cx] = centre(c);
        return cx >= gx0 - 6 && cx <= gx1 + 6;
    });
    if (!own.length) return { dx: 0, iou: 0 };
    const gbox = clampBox(
        [gx0 - rx - 6, x.box[1], gx1 + rx + 6, x.box[3]],
        ctx.w,
        ctx.h
    );
    const rr = await renderMask(
        linePath(lay, placed, (gl) => gl === g),
        gbox
    );
    const tt = targetMask(ctx, own, gbox);
    return bestShift(rr, tt, gbox[2] - gbox[0], gbox[3] - gbox[1], rx, 0);
}

// The other form of a quote mark: curly for plain and plain for curly.
function twinOf(ch, prev) {
    const opening = !prev || prev === " " || prev === "(";
    if (ch === "'") return opening ? "‘" : "’";
    if (ch === '"') return opening ? "“" : "”";
    return { "‘": "'", "’": "'", "“": '"', "”": '"' }[ch];
}

// Runs with the character at (flat) index i replaced.
function swapChar(runs, i, ch) {
    let at = 0;
    return runs.map((r) => {
        const start = at;
        at += r.text.length;
        if (i < start || i >= at) return r;
        const k = i - start;
        return { ...r, text: r.text.slice(0, k) + ch + r.text.slice(k + 1) };
    });
}

// Candidate italic slants: tan of 11° to 22°.
const SKEWS = [0.2, 0.25, 0.3, 0.35, 0.4];

// Best shift of one segment's outline onto its own ink (the components
// under it), within rx/ry px.
async function alignSegment(ctx, x, lay, sg, rx, ry, start = 0) {
    const si = inkOf(lay, (g) => g.seg === sg && g.char !== " ");
    if (!Number.isFinite(si.x0)) return { dx: start, dy: 0, iou: 0 };
    const rx0 = x.placed.x + si.x0 * x.k + start,
        rx1 = x.placed.x + si.x1 * x.k + start;
    // a quote's own ink is a small mark anywhere within the search window
    const quote = lay.glyphs.every(
        (g) => g.seg !== sg || QUOTES.has(g.char) || g.char === " "
    );
    const lineH = x.L.y1 - x.L.y0;
    const own = x.L.comps.filter((c) => {
        const [cx] = centre(c);
        if (quote)
            return (
                c.y1 - c.y0 < 0.5 * lineH && cx >= rx0 - rx && cx <= rx1 + rx
            );
        return cx >= rx0 - 12 && cx <= rx1 + 12;
    });
    if (!own.length) return { dx: start, dy: 0, iou: 0 };
    const rbox = clampBox(
        [
            rx0 - rx - 8,
            x.box[1] - (ry > 3 ? ry : 0),
            rx1 + rx + 8,
            x.box[3] + (ry > 3 ? ry : 0),
        ],
        ctx.w,
        ctx.h
    );
    const segs = [];
    segs[sg] = start;
    const rr = await renderMask(
        linePath(lay, { ...x.placed, segs, segDy: [] }, (g) => g.seg === sg),
        rbox
    );
    const tt = targetMask(ctx, own, rbox);
    const best = bestShift(
        rr,
        tt,
        rbox[2] - rbox[0],
        rbox[3] - rbox[1],
        rx,
        ry
    );
    return { ...best, dx: best.dx + start };
}

// Invisible text over the hand lettering it does not draw (the outlines
// are traced): one line per ink band, stretched to it.
export function fitTransparent(ctx, block, lines) {
    const comps = blockComponents(ctx, block.box);
    comps.forEach((c) => ctx.used.add(c.id));
    if (!comps.length) return { kind: "overlay", id: block.id, lines: [] };
    const ink = clusterLines(comps, Math.min(lines.length, comps.length));
    return {
        kind: "overlay",
        id: block.id,
        comps,
        lines: lines.slice(0, ink.length).map((text, i) => {
            const L = ink[i];
            const size = (L.y1 - L.y0) / 0.95;
            return {
                text,
                x: L.x0,
                baseline: L.y1 - 0.22 * size,
                size,
                width: L.x1 - L.x0,
            };
        }),
    };
}

// Lines by vertical overlap, for text whose wrapping the spec does not pin.
export function autoLines(comps) {
    const sorted = [...comps].sort((a, b) => a.y0 + a.y1 - (b.y0 + b.y1));
    const lines = [];
    for (const c of sorted) {
        const L = lines.find((l) => {
            const ov = Math.min(l.y1, c.y1) - Math.max(l.y0, c.y0);
            return ov > 0.4 * Math.min(l.y1 - l.y0, c.y1 - c.y0);
        });
        if (L) {
            L.comps.push(c);
            L.x0 = Math.min(L.x0, c.x0);
            L.y0 = Math.min(L.y0, c.y0);
            L.x1 = Math.max(L.x1, c.x1 + 1);
            L.y1 = Math.max(L.y1, c.y1 + 1);
        } else
            lines.push({
                x0: c.x0,
                y0: c.y0,
                x1: c.x1 + 1,
                y1: c.y1 + 1,
                comps: [c],
            });
    }
    return lines.sort((a, b) => a.y0 - b.y0 || a.x0 - b.x0);
}

const cjkWidth = (ch) =>
    /[⺀-鿿豈-﫿＀-￯　-〿—…「」『』（）]/.test(ch) ? 1 : 0.55;

// Invisible Mandarin text over pre-rendered lettering: lines come from the
// ink; the text is shared out in proportion to each line's width.
export function fitCjkOverlay(ctx, block) {
    const comps = blockComponents(ctx, block.box).filter(
        (c) => c.area >= 12 && (ctx.owner?.get(c.id) ?? block.id) === block.id
    );
    comps.forEach((c) => ctx.used.add(c.id));
    if (!comps.length)
        return {
            kind: "overlay",
            id: block.id,
            cjk: true,
            lines: [],
            empty: true,
        };
    let ink = autoLines(comps).filter((L) => L.y1 - L.y0 > 20);
    const explicit = block.text.split("\n").filter((t) => t.trim());
    // While the ink has more lines than the spec, put split characters back
    // together: first lines that overlap in height (a character standing
    // taller or lower than its neighbours), then a piece too short to be a
    // line (the 立 of a 章 set vertically) with its nearest line below or
    // above in the same column.
    const merge = (a, b) => {
        a.comps.push(...b.comps);
        a.x0 = Math.min(a.x0, b.x0);
        a.y0 = Math.min(a.y0, b.y0);
        a.x1 = Math.max(a.x1, b.x1);
        a.y1 = Math.max(a.y1, b.y1);
        ink = ink.filter((L) => L !== b);
    };
    const height = (L) => L.y1 - L.y0;
    while (ink.length > explicit.length) {
        let pair = null,
            score = 0;
        for (const [i, a] of ink.entries())
            for (const b of ink.slice(i + 1)) {
                const ov =
                    (Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0)) /
                    Math.min(height(a), height(b));
                if (ov > score) [pair, score] = [[a, b], ov];
            }
        if (!pair) {
            const short = 0.6 * median(ink.map(height));
            for (const a of ink.filter((L) => height(L) < short))
                for (const b of ink) {
                    if (b === a || Math.min(a.x1, b.x1) <= Math.max(a.x0, b.x0))
                        continue;
                    const gap = Math.max(a.y0, b.y0) - Math.min(a.y1, b.y1);
                    if (!pair || gap < score) [pair, score] = [[b, a], gap];
                }
        }
        if (!pair) break;
        merge(...pair);
    }
    let texts;
    if (explicit.length === ink.length) texts = explicit;
    else {
        // Re-wrap: the em comes from the ink itself (total ink width over
        // total character width, CJK characters being one em wide); each
        // spec line then fills ink lines in turn, so hard breaks hold.
        const width = (t) => [...t].reduce((n, ch) => n + cjkWidth(ch), 0);
        const em =
            ink.reduce((n, L) => n + L.x1 - L.x0, 0) /
            Math.max(1, width(explicit.join("")));
        texts = Array.from({ length: ink.length }, () => "");
        let li = 0;
        for (const [ei, line] of explicit.entries()) {
            const chars = [...line];
            let at = 0;
            while (at < chars.length && li < ink.length) {
                // when the ink lines left are only enough for one per spec
                // line, this one takes the rest of its spec line
                const takeAll = ink.length - li <= explicit.length - ei;
                const room = (ink[li].x1 - ink[li].x0) / em;
                let acc = 0;
                while (at < chars.length) {
                    const w = cjkWidth(chars[at]);
                    if (!takeAll && acc > 0 && acc + w / 2 > room) break;
                    acc += w;
                    texts[li] += chars[at++];
                }
                // a line never starts with closing punctuation
                while (
                    at < chars.length &&
                    /[，。、；：！？）」』…]/.test(chars[at])
                )
                    texts[li] += chars[at++];
                li++;
            }
            // more spec lines than ink lines: the rest joins the last line
            if (at < chars.length && li > 0)
                texts[li - 1] += chars.slice(at).join("");
        }
        const kept = texts.map((t, i) => [t, ink[i]]).filter(([t]) => t);
        texts = kept.map(([t]) => t);
        ink = kept.map(([, L]) => L);
    }
    return {
        kind: "overlay",
        id: block.id,
        cjk: true,
        comps,
        lines: texts.map((text, i) => {
            const L = ink[i];
            const size = median(ink.map((l) => l.y1 - l.y0)) / 0.92;
            return {
                text,
                x: L.x0,
                baseline: (L.y0 + L.y1) / 2 + 0.38 * size,
                size,
                width: L.x1 - L.x0,
            };
        }),
    };
}
