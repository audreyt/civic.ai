import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const BUILD_DIR = resolve(process.env.BUILD_DIR || "dist");
const checks = [];

function built(path) {
    const full = join(BUILD_DIR, path);
    if (!existsSync(full)) throw new Error(`${full} does not exist`);
    return readFileSync(full, "utf8");
}

function expect(path, needle) {
    checks.push(`${path}: ${needle}`);
    const html = built(path);
    if (!html.includes(needle)) throw new Error(`${path} missing ${needle}`);
}

expect("tw/1/index.html", "<em>先搭橋，再決策。</em>");
expect("tw/1/index.html", "<strong>關係優先。</strong>");
const home = built("index.html");
if (
    !home.includes("Policy &amp; governance") &&
    !home.includes("Policy & governance")
)
    throw new Error("index.html missing Policy & governance");
expect("tw/index.html", "政策與治理");
expect("comics/index.html", 'id="pack-1-1"');
expect("glossary/index.html", 'id="civic-ai"');
expect("glossary/index.html", "Civic AI");
expect("tw/glossary/index.html", 'id="civic-ai"');
expect("tw/glossary/index.html", "仁工智慧");
expect("formal-care/index.html", "bridging_not_nat_separable");
expect("tw/formal-care/index.html", "團結力的不可分解性");
const solidarityLean = built("formal/CivicAi/Care/Solidarity.lean");
if (!solidarityLean.includes("theorem bridging_not_nat_separable"))
    throw new Error("Solidarity Lean source missing theorem");
if (/\b(sorry|admit)\b/.test(solidarityLean))
    throw new Error("Solidarity Lean source contains proof placeholder");
const skill = built(".well-known/openclaw/SKILL.md");
if (!/^[\x00-\x7F]*$/.test(skill))
    throw new Error("OpenClaw skill is not ASCII-only");
if (!built("CNAME").includes("civic.ai"))
    throw new Error("CNAME missing civic.ai");
if (!existsSync(join(BUILD_DIR, ".nojekyll")))
    throw new Error(".nojekyll missing");
console.log(`astro output checks passed (${checks.length + 3} assertions)`);
