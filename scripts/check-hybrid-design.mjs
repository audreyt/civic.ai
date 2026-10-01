import { readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const checks = [];
const BUILD_DIR = resolve(process.env.BUILD_DIR || "dist");

function builtPath(path) {
    return join(BUILD_DIR, path);
}

function readBuilt(path) {
    const full = builtPath(path);
    if (!existsSync(full))
        throw new Error(`${full} does not exist; run bun run build first`);
    return readFileSync(full, "utf8");
}

function expectIncludes(name, html, needle) {
    checks.push(`${name}: includes ${needle}`);
    if (!html.includes(needle)) throw new Error(`${name} is missing ${needle}`);
}

function expectExcludes(name, html, needle) {
    checks.push(`${name}: excludes ${needle}`);
    if (html.includes(needle))
        throw new Error(`${name} unexpectedly contains ${needle}`);
}

function expectMissingBuilt(name, path) {
    checks.push(`${name}: missing ${path}`);
    if (existsSync(builtPath(path)))
        throw new Error(`${name} unexpectedly exists at ${path}`);
}

const home = readBuilt("index.html");
const zhHome = readBuilt("tw/index.html");
const manifesto = readBuilt("manifesto/index.html");
const pack = readBuilt("1/index.html");
const conference = readBuilt("conference/index.html");
const measures = readBuilt("measures/index.html");
const zhMeasures = readBuilt("tw/measures/index.html");
const config = readFileSync("astro.config.mjs", "utf8");
const styles = readFileSync("styles.css", "utf8");

for (const [name, html] of [
    ["home", home],
    ["zh home", zhHome],
]) {
    expectIncludes(name, html, "site-header--home");
    expectIncludes(name, html, "img/oxford-logo.svg");
    expectIncludes(name, html, "img/afp-logo.svg");
    expectExcludes(name, html, "partner-colophon");
    expectIncludes(name, html, "data-theme-toggle");
    expectIncludes(name, html, "favicon.svg");
    expectIncludes(name, html, "favicon.ico");
    expectExcludes(name, html, "overview-frame lqip");
}

for (const [name, html] of [
    ["manifesto", manifesto],
    ["pack", pack],
    ["conference", conference],
]) {
    expectIncludes(name, html, "site-header--interior");
    expectIncludes(name, html, "civic.ai");
    expectIncludes(name, html, "partner-colophon");
    expectIncludes(name, html, "img/oxford-logo-light.svg");
    expectIncludes(name, html, "img/afp-logo-light.svg");
    expectExcludes(name, html, "ring-of-six");
    expectIncludes(name, html, "favicon.svg");
    expectIncludes(name, html, "favicon.ico");
    expectIncludes(name, html, "nav-label-short");
}

expectIncludes("home nav map link", home, 'href="/measures/#map"');
expectIncludes("zh home nav map link", zhHome, 'href="/tw/measures/#map"');
expectIncludes("measures title", measures, "Map &amp; Measures");
expectIncludes("measures map anchor", measures, 'id="map"');
expectIncludes("measures concept map", measures, 'class="cmap"');
expectIncludes("measures map frames packs", measures, 'href="/1/"');
expectIncludes(
    "measures map links metrics",
    measures,
    'href="/measures/#representation-gap"'
);
expectIncludes("zh measures map anchor", zhMeasures, 'id="map"');
expectIncludes("zh measures concept map", zhMeasures, 'class="cmap"');
expectIncludes(
    "zh measures map links metrics",
    zhMeasures,
    'href="/tw/measures/#representation-gap"'
);
expectIncludes("measures map care cycle", measures, 'class="cmap-cycle"');
expectIncludes("zh measures map care cycle", zhMeasures, 'class="cmap-cycle"');
expectMissingBuilt("standalone map route", "map/index.html");
expectMissingBuilt("standalone zh map route", "tw/map/index.html");

expectIncludes("theme preflight", home, "dataset.theme");
expectIncludes("theme script", home, "data-theme-toggle");
expectIncludes("theme css", styles, ':root[data-theme="dark"]');
expectIncludes("theme css", styles, 'html[data-theme="dark"] .polis-dot-plot');
expectExcludes("theme css", styles, "@media (prefers-color-scheme: dark)");
expectExcludes("theme css", styles, "ring-of-six");
expectIncludes("mobile css", styles, ".site-wordmark__secondary");
expectIncludes("mobile css", styles, ".nav-label-short");
expectIncludes("print css", styles, "header > .site-header__title-block");
expectIncludes("print css", styles, "display: block !important");
expectIncludes("astro config", config, 'outDir: "dist"');
readBuilt("favicon.svg");
readBuilt("favicon.ico");

console.log(`hybrid design checks passed (${checks.length} assertions)`);
