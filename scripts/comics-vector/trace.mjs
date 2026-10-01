// Trace ink that live text does not reproduce (Nicky Case's hand lettering)
// into filled outlines with potrace.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { components, dilate, hex, median } from "./image.mjs";
import { renderMask } from "./raster.mjs";

// Ink the fitted text leaves uncovered (outside a small halo around it).
export async function residualMask(ctx, textPath, halo = 4) {
    const drawn = await renderMask(textPath, [0, 0, ctx.w, ctx.h]);
    const covered = dilate(drawn, ctx.w, ctx.h, halo);
    const out = new Uint8Array(ctx.w * ctx.h);
    for (let i = 0; i < out.length; i++)
        if (ctx.mask[i] && !covered[i]) out[i] = 1;
    return out;
}

// A traced mark's colour: the median of its stroke cores (the stronger
// half of its pixels against the art beneath).
function inkColour(ctx, labels, c) {
    const R = ctx.ref.data,
        W = ctx.wordless.data;
    const px = [];
    for (let y = c.y0; y <= c.y1; y++)
        for (let x = c.x0; x <= c.x1; x++) {
            const p = y * ctx.w + x;
            if (labels[p] !== c.id) continue;
            const j = p * 3;
            const d = Math.max(
                Math.abs(R[j] - W[j]),
                Math.abs(R[j + 1] - W[j + 1]),
                Math.abs(R[j + 2] - W[j + 2])
            );
            px.push([d, R[j], R[j + 1], R[j + 2]]);
        }
    px.sort((a, b) => b[0] - a[0]);
    const core = px.slice(0, Math.max(1, Math.ceil(px.length / 2)));
    return [1, 2, 3].map((k) => median(core.map((v) => v[k])));
}

function pbm(bits, W, box) {
    const [x0, y0, x1, y1] = box;
    const w = x1 - x0,
        h = y1 - y0;
    const rowBytes = Math.ceil(w / 8);
    const body = Buffer.alloc(rowBytes * h);
    for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++)
            if (bits[(y0 + y) * W + x0 + x])
                body[y * rowBytes + (x >> 3)] |= 0x80 >> (x & 7);
    return Buffer.concat([Buffer.from(`P4\n${w} ${h}\n`), body]);
}

export const POTRACE = {
    turdsize: 12,
    alphamax: 1.0,
    opttolerance: 0.5,
    unit: 1,
};

function potrace(bits, W, box, o = POTRACE) {
    const dir = mkdtempSync(join(tmpdir(), "comic-trace-"));
    try {
        const inp = join(dir, "in.pbm"),
            out = join(dir, "out.svg");
        writeFileSync(inp, pbm(bits, W, box));
        execFileSync("potrace", [
            "-b",
            "svg",
            "--flat",
            "-t",
            String(o.turdsize),
            "-a",
            String(o.alphamax),
            "-O",
            String(o.opttolerance),
            "-u",
            String(o.unit),
            "-o",
            out,
            inp,
        ]);
        const svg = readFileSync(out, "utf8");
        const t =
            /<g transform="translate\(([-\d.]+),([-\d.]+)\) scale\(([-\d.]+),([-\d.]+)\)"/.exec(
                svg
            );
        const d = [...svg.matchAll(/<path d="([^"]+)"/g)]
            .map((m) => m[1].replace(/\s+/g, " "))
            .join("");
        if (!d) return null;
        return {
            d,
            transform: `translate(${Number(t[1]) + box[0]} ${Number(t[2]) + box[1]}) scale(${t[3]} ${t[4]})`,
        };
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
}

// Trace residual ink in groups; `owner(c)` names the group of a component
// (a lettering block id, or null to drop it). Returns { [group]: paths[] }.
export function traceResidual(ctx, resid, owner, minArea = 24) {
    const { labels, comps } = components(resid, ctx.w, ctx.h);
    const groups = new Map();
    for (const c of comps) {
        if (c.area < minArea) continue;
        const g = owner(c);
        if (g === null) continue;
        const col = inkColour(ctx, labels, c);
        let entry = groups.get(g);
        if (!entry) groups.set(g, (entry = []));
        let swatch = entry.find(
            (s) =>
                Math.hypot(
                    s.col[0] - col[0],
                    s.col[1] - col[1],
                    s.col[2] - col[2]
                ) < 48
        );
        if (!swatch) entry.push((swatch = { col, comps: [] }));
        swatch.comps.push(c);
    }
    const R = ctx.ref.data,
        W = ctx.wordless.data;
    const out = {};
    for (const [g, swatches] of groups) {
        out[g] = [];
        for (const s of swatches) {
            const C = s.col;
            const bits = new Uint8Array(ctx.w * ctx.h);
            let box = [ctx.w, ctx.h, 0, 0];
            for (const c of s.comps) {
                for (let y = c.y0; y <= c.y1; y++)
                    for (let x = c.x0; x <= c.x1; x++) {
                        const p = y * ctx.w + x;
                        if (labels[p] !== c.id) continue;
                        const j = p * 3;
                        const dw = [
                            C[0] - W[j],
                            C[1] - W[j + 1],
                            C[2] - W[j + 2],
                        ];
                        const de = [
                            R[j] - W[j],
                            R[j + 1] - W[j + 1],
                            R[j + 2] - W[j + 2],
                        ];
                        const nn =
                            dw[0] * dw[0] + dw[1] * dw[1] + dw[2] * dw[2];
                        const alpha = nn
                            ? (dw[0] * de[0] + dw[1] * de[1] + dw[2] * de[2]) /
                              nn
                            : 1;
                        if (alpha >= 0.5) bits[p] = 1;
                    }
                box = [
                    Math.min(box[0], c.x0 - 2),
                    Math.min(box[1], c.y0 - 2),
                    Math.max(box[2], c.x1 + 3),
                    Math.max(box[3], c.y1 + 3),
                ];
            }
            box = [
                Math.max(0, box[0]),
                Math.max(0, box[1]),
                Math.min(ctx.w, box[2]),
                Math.min(ctx.h, box[3]),
            ];
            const traced = potrace(bits, ctx.w, box);
            if (traced)
                out[g].push({
                    fill: hex(C),
                    ...traced,
                    area: s.comps.reduce((n, c) => n + c.area, 0),
                });
        }
    }
    return out;
}
