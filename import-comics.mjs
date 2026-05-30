#!/usr/bin/env node
// Re-import the comic pages ("packX-Y") from Nicky Case's source repo.
//
//   https://github.com/ncase/civic-ai-comics/tree/main/comics-en
//
// The upstream files are full-resolution PNGs named Ch<chapter>_<A|B>.png.
// We map each one to our local naming scheme and emit an optimised pair of
// web assets in ./img/ — a JPEG fallback and an AVIF (referenced from the
// chapter Markdown):
//
//   Ch1_A.png -> img/pack1-1.{jpg,avif}   (chapter 1, page A)
//   Ch1_B.png -> img/pack1-2.{jpg,avif}   (chapter 1, page B)
//   ...
//   Ch6_B.png -> img/pack6-2.{jpg,avif}
//
// Usage:
//   node import-comics.mjs          # download + convert all pages
//   node import-comics.mjs --check  # list what would be done, fetch nothing
//
// This is a maintenance script, not part of the site build, so `sharp` is
// deliberately kept out of the project's dependencies (it is a heavy native
// package that would otherwise be installed on every deploy). We load it on
// demand below, installing it transiently with `npm install --no-save` if it
// is not already present. Run with `node`, not `bun` — bun currently
// mis-resolves one of sharp's transitive imports (semver/functions/coerce).

import { writeFile } from "fs/promises";
import { resolve } from "path";
import { execFileSync } from "child_process";

async function loadSharp() {
    try {
        return (await import("sharp")).default;
    } catch {
        console.log("sharp not found — installing it transiently (--no-save)…");
        execFileSync("npm", ["install", "--no-save", "sharp@^0.34.5"], {
            stdio: "inherit",
        });
        return (await import("sharp")).default;
    }
}

const BASE_URL =
    "https://raw.githubusercontent.com/ncase/civic-ai-comics/main/comics-en";
const OUT_DIR = resolve("img");
const CHAPTERS = [1, 2, 3, 4, 5, 6];
const PAGES = { A: 1, B: 2 }; // upstream page letter -> our page number

// All upstream pages share a 5749x8000 canvas; we scale every page to the
// same target height, preserving aspect ratio, to keep the set consistent
// (this yields 1437x1999, matching the dimensions in the chapter Markdown).
const TARGET_HEIGHT = 1999;
const JPEG = { quality: 90, mozjpeg: true, chromaSubsampling: "4:4:4" };
const AVIF = { quality: 60 };

const check = process.argv.includes("--check");
// Only needed for the actual conversion, so --check stays dependency-free.
const sharp = check ? null : await loadSharp();

async function fetchPng(name) {
    const url = `${BASE_URL}/${name}`;
    const res = await fetch(url);
    if (!res.ok)
        throw new Error(`fetch ${url} -> ${res.status} ${res.statusText}`);
    return Buffer.from(await res.arrayBuffer());
}

async function importPage(chapter, letter) {
    const srcName = `Ch${chapter}_${letter}.png`;
    const base = `pack${chapter}-${PAGES[letter]}`;
    if (check) {
        console.log(`${srcName} -> ${base}.{jpg,avif}`);
        return;
    }

    const png = await fetchPng(srcName);
    const pipeline = sharp(png).resize({ height: TARGET_HEIGHT });

    const [jpg, avif] = await Promise.all([
        pipeline.clone().jpeg(JPEG).toBuffer(),
        pipeline.clone().avif(AVIF).toBuffer(),
    ]);

    const jpgPath = resolve(OUT_DIR, `${base}.jpg`);
    const avifPath = resolve(OUT_DIR, `${base}.avif`);
    await Promise.all([writeFile(jpgPath, jpg), writeFile(avifPath, avif)]);

    const { width, height } = await sharp(jpg).metadata();
    const kb = (n) => `${Math.round(n / 1024)}kB`;
    console.log(
        `${srcName} -> ${base}  ${width}x${height}  ` +
            `jpg ${kb(jpg.length)}, avif ${kb(avif.length)}`
    );
}

const jobs = [];
for (const chapter of CHAPTERS)
    for (const letter of Object.keys(PAGES))
        jobs.push(importPage(chapter, letter));
await Promise.all(jobs);

console.log(`\nDone — ${check ? "checked" : "wrote"} ${jobs.length} pages.`);
