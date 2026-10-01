#!/usr/bin/env bun
// Rebuild the comic pages as SVG from Nicky Case's print masters.
//
//   https://github.com/ncase/civic-ai-comics
//
// English: the wordless art (raster) under live, selectable text set in the
// comics' own OFL faces (Patrick Hand, Patrick Hand SC, Anton) at the exact
// size, baseline and spacing of the 8000 px masters, plus Nicky's hand
// lettering traced to outlines. Mandarin: the jf 蘭陽 lettering may not ship
// as a font or outlines (DESIGN.md §6.2), so the lettered page stays a raster
// and its text rides on top as an invisible, selectable layer.
//
// The words come from _data/comics-text-{en,tw}.yml (the upstream compact
// text-spec schema of translation-assets/zh-TW.yml); the site's own images
// stay canonical where they carry later copy edits than the masters.
//
// Usage:
//   vp run comics:vector -- --src ../civic-ai-comics            # all pages
//   vp run comics:vector -- --src ../civic-ai-comics Ch1_A en    # one page
//   ... --verify             render each SVG in Chromium, diff with the master
//   ... --report DIR         write diff images for review
//   ... --no-art             skip the high-resolution art renditions
//   ... --no-fonts           keep the current font subsets
//   ... --spec FILE en       draft against another spec file
//   ... --overlays           with --report, one fit image per line
//
// A maintenance script, never run by the build. It needs potrace on PATH
// (brew install potrace / apt install potrace) and, for --verify, Chromium.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import sharp from "sharp";
import { EDITIONS, PAGES } from "./comics-vector/pages.mjs";
import {
    buildReference,
    components,
    diffMask,
    dilate,
    erode,
    loadRGB,
} from "./comics-vector/image.mjs";
import {
    fitCjkOverlay,
    fitTransparent,
    fitTypeset,
} from "./comics-vector/fit.mjs";
import {
    linePath,
    loadFonts,
    ROLES,
    usedCharacters,
} from "./comics-vector/type.mjs";
import { residualMask, traceResidual } from "./comics-vector/trace.mjs";
import { renderMask } from "./comics-vector/raster.mjs";
import { pageSvg } from "./comics-vector/svg.mjs";
import { writeFonts } from "./comics-vector/fonts.mjs";
import { compare, launch, renderPage } from "./comics-vector/verify.mjs";

const argv = process.argv.slice(2);
const opt = (name) => {
    const i = argv.indexOf(name);
    return i >= 0 ? argv[i + 1] : undefined;
};
const SRC = resolve(opt("--src") ?? "../civic-ai-comics");
const VERIFY = argv.includes("--verify");
const REPORT = opt("--report");
const ART = !argv.includes("--no-art");
const SPEC = opt("--spec"); // a different spec file for the chosen edition (drafting)
const onlyPages = new Set(argv.filter((a) => PAGES.some((p) => p.id === a)));
const onlyEditions = new Set(argv.filter((a) => a in EDITIONS));
if (!existsSync(join(SRC, "comics-wordless")))
    throw new Error(`no ncase/civic-ai-comics checkout at ${SRC} (use --src)`);

const comics = JSON.parse(readFileSync("_data/comics.json", "utf8"));
loadFonts(SRC);

function caption(page, key) {
    if (page.id === "Overview")
        return {
            title:
                key === "tw" ? "關懷六力概覽" : "The 6-Pack of Care: overview",
            desc: comics.overview[key].alt,
        };
    const [, n, letter] = /^Ch(\d)_([AB])$/.exec(page.id);
    const pack = comics.packs.find((p) => p.num === Number(n));
    const pg = pack.pages.find((p) => p.id === (letter === "A" ? "1" : "2"));
    return { title: `${pack.title[key]} — ${pg.type[key]}`, desc: pg.alt[key] };
}

const sizeOf = async (path) => {
    const m = await sharp(path, { limitInputPixels: false }).metadata();
    return { w: m.width, h: m.height };
};

// High-resolution AVIF renditions beside the site's 1x images.
async function writeArt(rgb, stem, display) {
    const w = display.w * 2,
        h = display.h * 2;
    const out = `img/${stem}-${w}w.avif`;
    await sharp(rgb.data, {
        raw: { width: rgb.w, height: rgb.h, channels: 3 },
        limitInputPixels: false,
    })
        .resize(w, h, { fit: "fill", kernel: "lanczos3" })
        .avif({ quality: 55, effort: 6 })
        .toFile(out);
    return out;
}

function inkMaskFor(mode, ref, wordless) {
    if (mode === "vector") return diffMask(ref, wordless, 48);
    // Mandarin masters were rasterised at another DPI than the wordless
    // art: keep only solid ink (an opening drops the misregistered art edges).
    const m = diffMask(ref, wordless, 96);
    return dilate(erode(m, ref.w, ref.h, 2), ref.w, ref.h, 2);
}

// Review image: fitted outline (red), master ink (blue), both (black).
async function overlay(ctx, L, out) {
    const box = L.box;
    const w = box[2] - box[0],
        h = box[3] - box[1];
    const r = await renderMask(linePath(L.lay, L.placed), box);
    const img = Buffer.alloc(w * h * 3, 255);
    for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
            const i = y * w + x,
                t = ctx.mask[(box[1] + y) * ctx.w + box[0] + x];
            const c =
                r[i] && t
                    ? [0, 0, 0]
                    : r[i]
                      ? [230, 0, 0]
                      : t
                        ? [0, 110, 255]
                        : null;
            if (c) img.set(c, i * 3);
        }
    await sharp(img, { raw: { width: w, height: h, channels: 3 } })
        .png()
        .toFile(out);
}

async function buildPage(page, key, specPage, browser) {
    const ed = EDITIONS[key];
    const master = join(SRC, ed.upstream, `${page.id}.png`);
    const sitePath = `img/${page.stem}${ed.suffix}.jpg`;
    const size = await sizeOf(master);
    const display = await sizeOf(sitePath);
    const wordless = await loadRGB(
        join(SRC, "comics-wordless", `${page.id}.png`),
        size
    );
    const textBoxes = specPage.boxes
        .filter((b) => b.type !== "lettering")
        .map((b) => b.box);
    // Mandarin renders differ from the site's copies by sub-pixel shifts
    // along whole lines; only a real re-set (dozens of characters) counts.
    const { ref, edited, editedPx } = await buildReference(
        master,
        sitePath,
        size,
        textBoxes,
        ed.mode === "overlay" ? 200 : 24,
        ed.mode === "vector" ? wordless : null
    );
    const mask = inkMaskFor(ed.mode, ref, wordless);
    const { labels, comps } = components(mask, size.w, size.h);
    const ctx = {
        w: size.w,
        h: size.h,
        ref,
        wordless,
        mask,
        labels,
        comps,
        used: new Set(),
    };
    const blocks = [];
    const chars = {};
    const typesetPaths = [];
    const problems = [];
    // Mandarin ink belongs to the box its centre lies deepest inside (the
    // spec's boxes may overlap a little); ink inside no box is reported.
    if (ed.mode === "overlay") {
        ctx.owner = new Map();
        for (const c of comps) {
            const cx = (c.x0 + c.x1) / 2,
                cy = (c.y0 + c.y1) / 2;
            let depth = -1;
            for (const { id, box: b } of specPage.boxes) {
                const d = Math.min(cx - b[0], b[2] - cx, cy - b[1], b[3] - cy);
                if (d >= 0 && d > depth) {
                    depth = d;
                    ctx.owner.set(c.id, id);
                }
            }
            // slivers are misregistered art, not lettering
            if (depth < 0 && c.y1 - c.y0 >= 40 && c.area >= 400)
                problems.push(
                    `ink outside every box @${c.x0},${c.y0}-${c.x1},${c.y1}`
                );
        }
    }
    for (const box of specPage.boxes) {
        const block = { ...box, box: box.box };
        if (ed.mode === "overlay") {
            const fitted = fitCjkOverlay(ctx, block);
            if (fitted.empty) problems.push(`${box.id}: no ink`);
            blocks.push(fitted);
        } else if (box.type === "lettering") {
            blocks.push({
                ...fitTransparent(ctx, block, box.text.split("\n")),
                lettering: true,
            });
            for (const ch of box.text) (chars.hand ??= new Set()).add(ch);
        } else {
            const fitted = await fitTypeset(ctx, block);
            blocks.push(fitted);
            for (const L of fitted.lines) {
                typesetPaths.push(linePath(L.lay, L.placed));
                for (const r of L.runs)
                    for (const ch of r.text)
                        (chars[fitted.role] ??= new Set()).add(ch);
                if (REPORT && argv.includes("--overlays"))
                    await overlay(
                        ctx,
                        L,
                        join(
                            REPORT,
                            `${page.stem}${ed.suffix}-${box.id}-${fitted.lines.indexOf(L)}.png`
                        )
                    );
                if (L.missed > 0.004 || L.extra > 0.004)
                    problems.push(
                        `${box.id} line "${L.runs
                            .map((r) => r.text)
                            .join("")
                            .slice(
                                0,
                                40
                            )}": iou ${L.iou.toFixed(3)} missed ${(L.missed * 100).toFixed(2)}% extra ${(L.extra * 100).toFixed(2)}%`
                    );
            }
        }
    }
    let traced = [];
    if (ed.mode === "vector") {
        const resid = await residualMask(ctx, typesetPaths.join(""));
        const inside = (c, b) => {
            const cx = (c.x0 + c.x1) / 2,
                cy = (c.y0 + c.y1) / 2;
            return cx >= b[0] && cx <= b[2] && cy >= b[1] && cy <= b[3];
        };
        const strays = [];
        const groups = traceResidual(ctx, resid, (c) => {
            const lettering = specPage.boxes.find(
                (b) => b.type === "lettering" && inside(c, b.box)
            );
            if (lettering) return lettering.id;
            const typeset = specPage.boxes.find((b) => inside(c, b.box));
            // inside a line the site re-set, leftovers are JPEG and stroke
            // weight differences of the upscaled reference, not lost ink
            const cy = Math.round((c.y0 + c.y1) / 2),
                cx = Math.round((c.x0 + c.x1) / 2);
            if (typeset && edited?.[cy * ctx.w + cx]) return null;
            if (typeset) {
                if (c.area >= 400)
                    strays.push(`${typeset.id}@${c.x0},${c.y0} ${c.area}px`);
                return c.area >= 400 ? `stray:${typeset.id}` : null;
            }
            strays.push(
                `unclaimed@${c.x0},${c.y0},${c.x1},${c.y1} ${c.area}px`
            );
            return "unclaimed";
        });
        for (const s of strays) problems.push(`residual ink ${s}`);
        traced = Object.values(groups).flat();
    }
    const cap = caption(page, key);
    const artStem =
        ed.mode === "vector"
            ? `${page.stem}-wordless`
            : `${page.stem}${ed.suffix}`;
    let artHref = `/img/${artStem}.avif`;
    if (ART) {
        // Mandarin art is the lettered page itself: only double it where the
        // site image still matches the master, so no line comes out softer.
        if (ed.mode === "vector")
            artHref = "/" + (await writeArt(wordless, artStem, display));
        else if (!editedPx)
            artHref = "/" + (await writeArt(ref, artStem, display));
    } else {
        const hi = `img/${artStem}-${display.w * 2}w.avif`;
        if (existsSync(hi)) artHref = "/" + hi;
    }
    const fonts = [
        ...new Set(
            blocks
                .filter((b) => b.kind === "text")
                .map((b) => b.role)
                .concat(blocks.some((b) => b.lettering) ? ["hand"] : [])
        ),
    ].map((r) => ({ family: ROLES[r].family, file: ROLES[r].webfont }));
    const out = `img/${page.stem}${ed.suffix}.svg`;
    const letteringOut = `img/${page.stem}${ed.suffix}-lettering.svg`;
    const { page: svg, lettering } = pageSvg({
        w: size.w,
        h: size.h,
        display,
        lang: ed.lang,
        title: cap.title,
        desc: cap.desc,
        art: artHref,
        lettering: "/" + letteringOut,
        blocks,
        traced,
        fonts,
        overlayFamily: ed.mode === "overlay" ? "sans-serif" : ROLES.hand.stack,
    });
    writeFileSync(out, svg);
    if (lettering) writeFileSync(letteringOut, lettering);
    const report = {
        page: page.id,
        edition: key,
        out,
        bytes: svg.length,
        letteringBytes: lettering?.length ?? 0,
        traced: traced.length,
        editedPx,
        problems,
    };
    if (browser) {
        const scale = 0.5;
        const shot = await renderPage(browser, svg, ".", size.w, size.h, scale);
        const diffOut = REPORT
            ? join(REPORT, `${page.stem}${ed.suffix}-diff.png`)
            : undefined;
        if (REPORT)
            await sharp(shot).toFile(
                join(REPORT, `${page.stem}${ed.suffix}.png`)
            );
        report.verify = await compare(
            shot,
            ref,
            Math.round(size.w * scale),
            Math.round(size.h * scale),
            diffOut
        );
    }
    return { report, chars };
}

const specs = {};
for (const key of Object.keys(EDITIONS)) {
    if (onlyEditions.size && !onlyEditions.has(key)) continue;
    const specPath = SPEC && onlyEditions.has(key) ? SPEC : EDITIONS[key].spec;
    if (!existsSync(specPath)) {
        console.warn(`skip ${key}: no ${specPath}`);
        continue;
    }
    specs[key] = Bun.YAML.parse(readFileSync(specPath, "utf8"));
    if (specs[key]?.schema !== 1)
        throw new Error(`${specPath}: unsupported schema`);
}
if (REPORT) mkdirSync(REPORT, { recursive: true });

// Fonts are cut from every English page's text (with each typographic
// character's plain twin, which the masters sometimes show instead).
if (specs.en && !argv.includes("--no-fonts")) {
    const all = {};
    for (const page of Object.values(specs.en.pages))
        for (const b of page.boxes) {
            const role = b.type === "lettering" ? "hand" : (b.role ?? "hand");
            const twins = {
                "…": ".",
                "‘": "'",
                "’": "'",
                "“": '"',
                "”": '"',
                "—": "–",
            };
            const text = b.text.replace(/\n/g, "");
            for (const ch of usedCharacters([
                text + [...text].map((c) => twins[c] ?? "").join(""),
            ]))
                (all[role] ??= new Set()).add(ch);
        }
    for (const f of await writeFonts(SRC, all))
        console.log(`${f.file}: ${f.glyphs} characters, ${f.bytes} bytes`);
}
const browser = VERIFY ? await launch() : null;
try {
    for (const [key, spec] of Object.entries(specs))
        for (const page of PAGES) {
            if (onlyPages.size && !onlyPages.has(page.id)) continue;
            const specPage = spec.pages?.[page.id];
            if (!specPage) {
                console.warn(`skip ${key} ${page.id}: not in spec`);
                continue;
            }
            const t0 = Date.now();
            const { report } = await buildPage(page, key, specPage, browser);
            const v = report.verify
                ? `  render diff mean ${report.verify.mean.toFixed(2)}, strong ${(report.verify.strong * 100).toFixed(3)}%`
                : "";
            console.log(
                `${key} ${page.id} -> ${report.out}  ${(report.bytes / 1024).toFixed(1)} kB + lettering ${(report.letteringBytes / 1024).toFixed(1)} kB (${report.traced} traced)${v}  (${((Date.now() - t0) / 1000).toFixed(1)} s)`
            );
            for (const p of report.problems) console.log(`    ! ${p}`);
        }
} finally {
    await browser?.close();
}
