// Refresh self-hosted Latin slices; never called by the build.
import { writeFileSync } from "node:fs";

const UA =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
const url =
    "https://fonts.googleapis.com/css2?family=Literata:ital,wght@0,400..700;1,400..700&family=IBM+Plex+Mono:wght@400;500;600&display=swap";
const response = await fetch(url, { headers: { "User-Agent": UA } });
if (!response.ok) throw new Error(`Google Fonts: ${response.status}`);
const css = await response.text();
const faces = [];
for (const match of css.matchAll(
    /\/\* (latin(?:-ext)?) \*\/\s*(@font-face\s*\{[^}]+\})/g
)) {
    const [, slice, rule] = match;
    const family = /font-family: '([^']+)'/.exec(rule)[1];
    const style = /font-style: (\w+)/.exec(rule)[1];
    const weight = /font-weight: ([^;]+)/.exec(rule)[1];
    const src = /url\(([^)]+)\)/.exec(rule)[1];
    const file =
        family === "Literata"
            ? `literata-${style}-${slice}.woff2`
            : `ibm-plex-mono-${weight}-${slice}.woff2`;
    const font = await fetch(src);
    if (!font.ok) throw new Error(`${src}: ${font.status}`);
    const buffer = Buffer.from(await font.arrayBuffer());
    writeFileSync(`fonts/${file}`, buffer);
    faces.push({
        family,
        style,
        weight,
        slice,
        file,
        bytes: buffer.length,
        unicodeRange: /unicode-range: ([^;]+)/.exec(rule)[1],
        source: src,
    });
    console.log(`${file}: ${buffer.length} bytes`);
}
if (faces.length !== 10)
    throw new Error(`Expected 10 slices, got ${faces.length}`);
writeFileSync(
    "fonts/latin-manifest.json",
    JSON.stringify({ cssSource: url, faces }, null, 4) + "\n"
);
for (const [family, folder] of [
    ["Literata", "literata"],
    ["IBMPlexMono", "ibmplexmono"],
]) {
    const licence = await fetch(
        `https://raw.githubusercontent.com/google/fonts/9710da1eacb3be272583c3224dcb70f9da6eadbb/ofl/${folder}/OFL.txt`
    );
    if (!licence.ok) throw new Error(`OFL ${family}: ${licence.status}`);
    writeFileSync(`fonts/OFL-${family}.txt`, await licence.text());
}
