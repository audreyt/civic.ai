// Maintenance only: fetch an OFL upstream font, then retain the site's glyphs.
// CI consumes the committed WOFF2 sources and never invokes this script.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { create } from "fontkit";
import subsetFont from "subset-font";

const revision = "9710da1eacb3be272583c3224dcb70f9da6eadbb";
const upstream = `https://raw.githubusercontent.com/google/fonts/${revision}/ofl/notoseriftc/`;
const source = `${upstream}NotoSerifTC%5Bwght%5D.ttf`;
const glyphs = new Set();
function scan(path) {
    for (const entry of readdirSync(path, { withFileTypes: true })) {
        const file = join(path, entry.name);
        if (entry.isDirectory()) scan(file);
        else if (/\.(?:md|json|astro|[cm]?[jt]s)$/.test(file)) {
            for (const ch of readFileSync(file, "utf8").match(
                /[\p{Script=Han}\u3000-\u303f\u3100-\u312f\u31a0-\u31bf\uff00-\uffef]/gu
            ) ?? [])
                glyphs.add(ch);
        }
    }
}
for (const file of readdirSync(".")) {
    if (/^tw-.*\.md$/.test(file)) {
        for (const ch of readFileSync(file, "utf8").match(
            /[\p{Script=Han}\u3000-\u303f\u3100-\u312f\u31a0-\u31bf\uff00-\uffef]/gu
        ) ?? [])
            glyphs.add(ch);
    }
}
scan("_data");
scan("src");
scan("sensemaker/generated");
scan("sensemaker/source");
const response = await fetch(source);
if (!response.ok) throw new Error(`${source}: ${response.status}`);
const buffer = Buffer.from(await response.arrayBuffer());
const supported = new Set(create(buffer).characterSet);
const text = [...glyphs]
    .sort((a, b) => a.codePointAt(0) - b.codePointAt(0))
    .join("");
const missing = [...glyphs].filter((ch) => !supported.has(ch.codePointAt(0)));
if (missing.length)
    console.warn(`WARNING: upstream Noto Serif TC lacks: ${missing.join("")}`);
mkdirSync("fonts/src", { recursive: true });
const files = [];
for (const weight of [400, 600]) {
    const font = await subsetFont(buffer, text, {
        targetFormat: "woff2",
        variationAxes: { wght: weight },
    });
    const file = `noto-serif-tc-${weight}.woff2`;
    writeFileSync(`fonts/src/${file}`, font);
    files.push({ file, weight, bytes: font.length });
    console.log(`${file}: ${font.length} bytes, ${text.length} source glyphs`);
}
const licence = await fetch(`${upstream}OFL.txt`);
if (!licence.ok) throw new Error(`OFL: ${licence.status}`);
// The licence must travel with the subsets the build ships, not with the
// sources, which stay out of the deploy.
writeFileSync("fonts/OFL-NotoSerifTC.txt", await licence.text());
writeFileSync(
    "fonts/src/manifest.json",
    JSON.stringify({ source, revision, files }, null, 4) + "\n"
);
