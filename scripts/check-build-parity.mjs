#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

const baselineFile = resolve(
    process.env.BASELINE_IN || "tests/fixtures/eleventy-build-baseline.json"
);
const buildDir = resolve(process.env.BUILD_DIR || "dist");

if (!existsSync(baselineFile))
    throw new Error(`Baseline file does not exist: ${baselineFile}`);
if (!existsSync(buildDir))
    throw new Error(`Build directory does not exist: ${buildDir}`);

function walk(dir, files = []) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) walk(full, files);
        else if (entry.isFile()) files.push(full);
    }
    return files;
}

function posixRelative(file) {
    return relative(buildDir, file).split(sep).join("/");
}

function shouldIgnoreBuildFile(path) {
    return (
        path.startsWith("_astro/") ||
        path.startsWith("pagefind/") ||
        // Per-page Han subsets are content-hashed: their names change whenever
        // the page's glyph set does, so they cannot be a fixed requirement.
        path.startsWith("fonts/zh/") ||
        path.endsWith(".DS_Store") ||
        path.includes("/.DS_Store")
    );
}

function decodeHtml(value) {
    return String(value)
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
}

function attr(html, regex) {
    const match = html.match(regex);
    // A value may be double- or single-quoted; take whichever group matched.
    return match ? decodeHtml(match[1] ?? match[2] ?? "") : "";
}

function snapshotHtml(file) {
    const html = readFileSync(file, "utf8");
    const alternates = Array.from(
        html.matchAll(
            /<link\b(?=[^>]*\brel=["']alternate["'])(?=[^>]*\bhreflang=["']([^"']+)["'])(?=[^>]*\bhref=["']([^"']+)["'])[^>]*>/gi
        ),
        (match) => ({
            hreflang: decodeHtml(match[1]),
            href: decodeHtml(match[2]),
        })
    ).sort((a, b) => (a.hreflang + a.href).localeCompare(b.hreflang + b.href));
    return {
        path: posixRelative(file),
        lang: attr(html, /<html\b[^>]*\blang=["']([^"']*)["']/i),
        title: attr(html, /<title>([\s\S]*?)<\/title>/i).trim(),
        description: attr(
            html,
            /<meta\b(?=[^>]*\bname=["']description["'])(?=[^>]*\bcontent=(?:"([^"]*)"|'([^']*)'))[^>]*>/i
        ),
        canonical: attr(
            html,
            /<link\b(?=[^>]*\brel=["']canonical["'])(?=[^>]*\bhref=["']([^"']*)["'])[^>]*>/i
        ),
        alternates,
        ids: Array.from(
            new Set(
                Array.from(html.matchAll(/\bid=["']([^"']+)["']/g), (match) =>
                    decodeHtml(match[1])
                )
            )
        ).sort(),
    };
}

const baseline = JSON.parse(readFileSync(baselineFile, "utf8"));
const files = walk(buildDir);
const htmlByPath = new Map(
    files
        .filter((file) => file.endsWith(".html"))
        .filter((file) => !shouldIgnoreBuildFile(posixRelative(file)))
        .map((file) => [posixRelative(file), snapshotHtml(file)])
);
const required = new Set(
    files
        .map(posixRelative)
        .filter((path) => !path.endsWith(".html"))
        .filter((path) => !shouldIgnoreBuildFile(path))
);

const errors = [];
for (const requiredFile of baseline.requiredFiles) {
    if (!required.has(requiredFile))
        errors.push(`Missing required file: ${requiredFile}`);
}

for (const expected of baseline.html) {
    const actual = htmlByPath.get(expected.path);
    if (!actual) {
        errors.push(`Missing HTML path: ${expected.path}`);
        continue;
    }
    for (const key of ["lang", "title", "description", "canonical"]) {
        if (actual[key] !== expected[key]) {
            errors.push(
                `${expected.path}: ${key} mismatch\n  expected: ${expected[key]}\n  actual:   ${actual[key]}`
            );
        }
    }
    for (const key of ["alternates", "ids"]) {
        const a = JSON.stringify(actual[key]);
        const e = JSON.stringify(expected[key]);
        if (a !== e) errors.push(`${expected.path}: ${key} mismatch`);
    }
}

if (errors.length) {
    console.error(`Build parity failed (${errors.length}):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
}

console.log(
    `Build parity OK (${baseline.html.length} HTML snapshots, ${baseline.requiredFiles.length} required files)`
);
