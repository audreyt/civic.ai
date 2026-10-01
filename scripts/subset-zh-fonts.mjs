// Offline post-build pass. The DOM parser decodes entities and keeps hidden
// disclosure text, labels and attributes, but not script/style source.
import { createHash } from "node:crypto";
import {
    mkdirSync,
    readFileSync,
    readdirSync,
    rmSync,
    writeFileSync,
} from "node:fs";
import { join, relative, resolve } from "node:path";
import { create } from "fontkit";
import { parse } from "parse5";
import subsetFont from "subset-font";

const dist = resolve(process.argv[2] ?? "dist");
const sourceDir = resolve("fonts/src");
const output = join(dist, "fonts/zh");
const glyphPattern =
    /[\p{Script=Han}\u3000-\u303f\u3100-\u312f\u31a0-\u31bf\uff00-\uffef]/gu;
const pages = [];
function visit(path) {
    for (const entry of readdirSync(path, { withFileTypes: true })) {
        const file = join(path, entry.name);
        if (entry.isDirectory()) visit(file);
        else if (entry.name.endsWith(".html")) {
            const html = readFileSync(file, "utf8");
            const dom = parse(html);
            let zh = relative(dist, file).startsWith("tw/");
            const glyphs = new Set();
            const boldGlyphs = new Set();
            function collect(node, bold = false) {
                if (["script", "style"].includes(node.tagName)) return;
                const heavy =
                    bold ||
                    /^(?:h[1-6]|strong|b|th|dt|button|nav|header|footer)$/.test(
                        node.tagName ?? ""
                    );
                for (const attr of node.attrs ?? []) {
                    if (attr.name === "lang" && /^zh(?:-|$)/i.test(attr.value))
                        zh = true;
                    if (
                        [
                            "alt",
                            "title",
                            "aria-label",
                            "placeholder",
                            "value",
                        ].includes(attr.name)
                    ) {
                        for (const ch of attr.value.match(glyphPattern) ?? [])
                            glyphs.add(ch);
                    }
                }
                for (const ch of (node.value ?? "").match(glyphPattern) ?? []) {
                    glyphs.add(ch);
                    if (heavy) boldGlyphs.add(ch);
                }
                for (const child of node.childNodes ?? [])
                    collect(child, heavy);
                if (node.content) collect(node.content, heavy);
            }
            collect(dom);
            if (zh && glyphs.size)
                pages.push({ file, html, glyphs, boldGlyphs });
        }
    }
}
visit(dist);
pages.sort((a, b) => a.file.localeCompare(b.file));
mkdirSync(output, { recursive: true });
// Re-runs are idempotent and do not leave stale content-hashed subsets behind.
for (const file of readdirSync(output)) {
    if (file.endsWith(".woff2")) rmSync(join(output, file));
}
// A stable site-wide intersection is a small shared cacheable face; the rest
// is a page delta. Unlike frequency-based chunks it never downloads unused Han.
const common = [...(pages[0]?.glyphs ?? [])].filter((ch) =>
    pages.every((page) => page.glyphs.has(ch))
);
const boldCommon = [...(pages[0]?.boldGlyphs ?? [])].filter((ch) =>
    pages.every((page) => page.boldGlyphs.has(ch))
);
const sources = [400, 600].map((weight) => {
    const buffer = readFileSync(
        join(sourceDir, `noto-serif-tc-${weight}.woff2`)
    );
    return { weight, buffer, supported: new Set(create(buffer).characterSet) };
});
const cache = new Map();
const report = { budgetBytes: 260000, commonGlyphs: common.length, pages: [] };
function sorted(glyphs) {
    return [...glyphs]
        .sort((a, b) => a.codePointAt(0) - b.codePointAt(0))
        .join("");
}
function unicodeRange(text) {
    const ranges = [];
    for (const ch of text) {
        const cp = ch.codePointAt(0);
        const last = ranges.at(-1);
        if (last && last[1] + 1 === cp) last[1] = cp;
        else ranges.push([cp, cp]);
    }
    return ranges
        .map(
            ([a, b]) =>
                `U+${a.toString(16)}${a === b ? "" : `-${b.toString(16)}`}`
        )
        .join(",");
}
for (const page of pages) {
    const files = [];
    const rules = [];
    const missing = new Set();
    for (const source of sources) {
        for (const ch of page.glyphs) {
            if (!source.supported.has(ch.codePointAt(0))) missing.add(ch);
        }
        const shared = source.weight === 400 ? common : boldCommon;
        const needed = source.weight === 400 ? page.glyphs : page.boldGlyphs;
        for (const glyphs of [
            shared,
            [...needed].filter((ch) => !shared.includes(ch)),
        ]) {
            const text = sorted(
                glyphs.filter((ch) => source.supported.has(ch.codePointAt(0)))
            );
            if (!text) continue;
            const key = `${source.weight}:${text}`;
            let face = cache.get(key);
            if (!face) {
                const buffer = await subsetFont(source.buffer, text, {
                    targetFormat: "woff2",
                });
                const hash = createHash("sha256")
                    .update(buffer)
                    .digest("hex")
                    .slice(0, 16);
                const file = `noto-serif-tc-${source.weight}-${hash}.woff2`;
                writeFileSync(join(output, file), buffer);
                face = {
                    file,
                    bytes: buffer.length,
                    unicodeRange: unicodeRange(text),
                };
                cache.set(key, face);
            }
            files.push({
                file: face.file,
                bytes: face.bytes,
                weight: source.weight,
            });
            // Only the prose face is intercepted. Aliasing the sans and kai
            // families too would have pulled the machinery voice and Chinese
            // emphasis into the serif subset, erasing both distinctions, and
            // repeated every unicode-range once per aliased family. Those
            // stacks keep their system faces, which every current OS ships.
            for (const family of ["Noto Serif TC"]) {
                // One descriptor per weight band rather than per discrete
                // weight: the heavy band is declared last from the real 600
                // source, so Chrome still picks those outlines where they
                // exist, while the regular source covers every other glyph at
                // the same weights without falling back to a system face.
                // Enumerating 600/650/700/800/900 separately repeated the whole
                // unicode-range five times per family for no added behaviour.
                const weights =
                    source.weight === 400
                        ? ["100 500", "600 900"]
                        : ["600 900"];
                for (const weight of weights) {
                    rules.push(
                        `@font-face{font-family:"${family}";font-style:normal;font-weight:${weight};font-display:swap;src:url("/fonts/zh/${face.file}") format("woff2");unicode-range:${face.unicodeRange}}`
                    );
                }
            }
        }
    }
    const bytes = files.reduce((sum, file) => sum + file.bytes, 0);
    const path = "/" + relative(dist, page.file).replace(/index\.html$/, "");
    if (missing.size)
        console.warn(
            `WARNING: ${path} missing Noto Serif TC glyphs: ${sorted(missing)} — re-run vp run fonts:zh`
        );
    if (bytes > report.budgetBytes)
        console.warn(
            `WARNING: ${path} Chinese fonts ${bytes} bytes exceed ${report.budgetBytes}`
        );
    const html = page.html.replace(
        /<style data-zh-fonts>[\s\S]*?<\/style>/g,
        ""
    );
    if (!html.includes("</head>")) throw new Error(`Missing head: ${path}`);
    writeFileSync(
        page.file,
        html.replace(
            "</head>",
            `<style data-zh-fonts>${rules.join("")}</style></head>`
        )
    );
    report.pages.push({
        path,
        bytes,
        overBudget: bytes > report.budgetBytes,
        missingGlyphs: sorted(missing),
        files,
    });
}
// Source fonts are build inputs, not publicly downloadable web assets.
rmSync(join(dist, "fonts/src"), { recursive: true, force: true });
writeFileSync(
    join(output, "report.json"),
    JSON.stringify(report, null, 4) + "\n"
);
console.log(
    `Chinese font subsetting: ${pages.length} pages, ${cache.size} WOFF2 subsets, ${common.length} shared glyphs; report: fonts/zh/report.json`
);
