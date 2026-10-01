// Exact glyph subsets of the comics' OFL faces, cut from the copies in
// ncase/civic-ai-comics/design-resources.
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import subsetFont from "subset-font";
import { ROLES } from "./type.mjs";

const LICENCES = {
    hand: "OFL-PatrickHand.txt",
    hand_sc: "OFL-PatrickHandSC.txt",
    oswald: "OFL-Oswald.txt",
    anton: "OFL-Anton.txt",
};

export async function writeFonts(upstream, charsByRole, outDir = "fonts") {
    const written = [];
    for (const [role, chars] of Object.entries(charsByRole)) {
        if (!chars.size) continue;
        const def = ROLES[role];
        const text = [...chars]
            .sort((a, b) => a.codePointAt(0) - b.codePointAt(0))
            .join("");
        const woff2 = await subsetFont(
            readFileSync(join(upstream, def.file)),
            text,
            { targetFormat: "woff2" }
        );
        const out = join(outDir, `${def.webfont}.woff2`);
        writeFileSync(out, woff2);
        const dir = dirname(def.file).replace(/\/static$/, "");
        copyFileSync(
            join(upstream, dir, "OFL.txt"),
            join(outDir, LICENCES[role])
        );
        written.push({
            role,
            file: out,
            bytes: woff2.length,
            glyphs: chars.size,
        });
    }
    return written;
}
