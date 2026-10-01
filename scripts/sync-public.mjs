#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const PASSTHROUGH = [
    "img",
    "fonts",
    "audio",
    "assets",
    "styles.css",
    "CNAME",
    ".nojekyll",
    "favicon.ico",
    "favicon.svg",
];

const root = resolve(new URL("..", import.meta.url).pathname);
const outDir = join(root, "public");

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

// fonts/src holds the full upstream Han faces the build subsets from. They are
// inputs, not deliverables: shipping them would add ~1 MB to every deploy.
const fontSrcDir = join(root, "fonts", "src");

for (const source of PASSTHROUGH) {
    const from = join(root, source);
    if (!existsSync(from))
        throw new Error(`Missing passthrough asset: ${source}`);
    cpSync(from, join(outDir, basename(source)), {
        recursive: true,
        filter: (src) =>
            src !== fontSrcDir && !src.startsWith(fontSrcDir + "/"),
    });
}

const fuseFrom = join(root, "node_modules/fuse.js/dist/fuse.min.js");
if (!existsSync(fuseFrom))
    throw new Error(
        "Missing Fuse vendor: node_modules/fuse.js/dist/fuse.min.js"
    );
const vendorDir = join(outDir, "assets", "vendor");
mkdirSync(vendorDir, { recursive: true });
cpSync(fuseFrom, join(vendorDir, "fuse.min.js"));

console.log(`Synced ${PASSTHROUGH.length} passthrough assets to public/`);
