// Self-host the fonts of the Japanese comic overlays as exact glyph subsets.
// Google Fonts cuts each subset from the overlay text (its `text=` parameter),
// so /ja/comics/ makes no third-party font requests. Re-run after
// `vp run import-comics` changes _data/comics-ja-overlays.json.
import { readFileSync, writeFileSync } from "node:fs";

// The weights the overlays actually render: frames set no weight, and Zen Maru
// Gothic has no 400, so the browser used its 500.
const FAMILIES = {
    "Mochiy Pop One": { file: "mochiy-pop-one-ja", weight: 400 },
    "Noto Sans JP": { file: "noto-sans-jp-ja", weight: 400 },
    "Zen Maru Gothic": { file: "zen-maru-gothic-ja", weight: 500 },
};
// A current desktop Chrome user agent makes Google serve WOFF2.
const UA =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

const overlays = JSON.parse(
    readFileSync("_data/comics-ja-overlays.json", "utf8")
);
const chars = {};
(function walk(node) {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== "object") return;
    const family = /'([^']+)'/.exec(node.fontFamily ?? "")?.[1];
    if (family && typeof node.text === "string")
        for (const ch of node.text) (chars[family] ??= new Set()).add(ch);
    Object.values(node).forEach(walk);
})(overlays);

const unknown = Object.keys(chars).filter((family) => !FAMILIES[family]);
if (unknown.length)
    throw new Error(
        `overlay fonts missing from FAMILIES: ${unknown.join(", ")}`
    );

for (const [family, { file, weight }] of Object.entries(FAMILIES)) {
    const glyphs = [...(chars[family] ?? [])].sort((a, b) => (a < b ? -1 : 1));
    const text = glyphs.join("");
    if (!text) throw new Error(`no overlay text uses ${family}`);
    const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (
        await fetch(url, { headers: { "User-Agent": UA } })
    ).text();
    const src = /url\((https:[^)]+)\)\s*format\('woff2'\)/.exec(css)?.[1];
    if (!src) throw new Error(`no WOFF2 for ${family}: ${css.slice(0, 200)}`);
    const out = `fonts/${file}-${weight}.woff2`;
    writeFileSync(out, Buffer.from(await (await fetch(src)).arrayBuffer()));
    console.log(`${out}: ${family} ${weight}, ${glyphs.length} characters`);
}
