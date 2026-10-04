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
expect("index.html", "Six principles for AI that a community runs");
expect("tw/index.html", "讓社群自己運作 AI 的六項原則");
expect("comics/index.html", 'id="pack-1-1"');
expect("glossary/index.html", 'id="civic-ai"');
expect("glossary/index.html", "Civic AI");
expect("tw/glossary/index.html", 'id="civic-ai"');
expect("tw/glossary/index.html", "仁工智慧");
const doomDebatesLink =
    '<a href="https://www.youtube.com/watch?v=bvcmiirT8ME">Doom Debates</a>';
for (const [path, paragraph] of [
    [
        "doom-debate/index.html",
        `<p>Originally recorded for ${doomDebatesLink} with Liron Shapira.</p>`,
    ],
    [
        "tw/doom-debate/index.html",
        '<p>原始錄音收錄於 <a href="https://www.youtube.com/watch?v=bvcmiirT8ME"><span lang="en-GB">Doom Debates</span></a>，對談者為 <span lang="en-GB">Liron Shapira</span>。</p>',
    ],
]) {
    const doomDebate = built(path);
    expect(path, paragraph);
    checks.push(`${path}: no escaped description HTML`);
    if (doomDebate.includes("&lt;a href=") || doomDebate.includes("&amp;lt;a"))
        throw new Error(`${path} contains escaped description HTML`);
}

const twSearchIndex = JSON.parse(built("tw/search-index.json"));
const twDoomSearchEntry = twSearchIndex.find(
    (entry) => entry.url === "/tw/doom-debate/"
);
checks.push("tw/search-index.json: Doom takeaways remain indexed");
if (
    !twDoomSearchEntry?.subsections.some(
        (section) =>
            section.anchor === "重點" &&
            section.content.includes("公民韌性不只仰賴實驗室端的安全技術")
    )
) {
    throw new Error("tw/search-index.json missing indexed Doom takeaways");
}

function expectDoomSummaryCard(
    path,
    summaryLabel,
    summaryAnchor,
    summary,
    takeawaysLabel,
    takeawaysAnchor,
    takeaways
) {
    const html = built(path);
    const card = html.match(
        /<aside class="in-short"[^>]*>[\s\S]*?<\/aside>/
    )?.[0];
    checks.push(`${path}: structured summary card`);
    if (!card) throw new Error(`${path} missing structured summary card`);

    for (const needle of [
        `id="${summaryAnchor}"`,
        summaryLabel,
        summary,
        `id="${takeawaysAnchor}"`,
        takeawaysLabel,
        ...takeaways,
    ]) {
        checks.push(`${path}: summary card includes ${needle}`);
        if (!card.includes(needle))
            throw new Error(`${path} summary card missing ${needle}`);
    }

    const cardHeadingTags = card.match(/<h[23]\b[^>]*>/g) || [];
    const summaryHeading = cardHeadingTags.find((tag) =>
        tag.includes(`id="${summaryAnchor}"`)
    );
    const takeawaysHeading = cardHeadingTags.find((tag) =>
        tag.includes(`id="${takeawaysAnchor}"`)
    );
    checks.push(`${path}: summary card preserves native headings`);
    if (
        !summaryHeading?.startsWith("<h2") ||
        !summaryHeading.includes("data-toc-exclude") ||
        !takeawaysHeading?.startsWith("<h3") ||
        !takeawaysHeading.includes("data-toc-exclude")
    ) {
        throw new Error(`${path} summary card missing native headings`);
    }

    const main = html.match(/<main\b[^>]*>[\s\S]*?<\/main>/)?.[0];
    checks.push(`${path}: summary body appears once in main`);
    if (!main || main.split(summary).length - 1 !== 1)
        throw new Error(`${path} duplicates summary body copy in main`);
}

expectDoomSummaryCard(
    "doom-debate/index.html",
    "In brief",
    "in-brief",
    "This debate places the 6-Pack inside the superintelligence-risk conversation.",
    "Key takeaways",
    "key-takeaways",
    [
        "Tang argues that",
        "Governance should upgrade",
        "The alternative to one permanent centre",
        "Civic resilience depends on participatory institutions",
    ]
);
expectDoomSummaryCard(
    "tw/doom-debate/index.html",
    "摘要",
    "摘要",
    "這場辯論把關懷六力放進超級智慧風險的討論中。",
    "重點",
    "重點",
    [
        "唐鳳主張",
        "治理必須隨著能力升級",
        "一個永久中心的替代方案",
        "公民韌性不只仰賴實驗室端的安全技術",
    ]
);
const skill = built(".well-known/openclaw/SKILL.md");
// oxlint-disable-next-line no-control-regex -- intentional full-ASCII range check (control chars are valid ASCII)
if (!/^[\x00-\x7F]*$/.test(skill))
    throw new Error("OpenClaw skill is not ASCII-only");
if (!built("CNAME").includes("civic.ai"))
    throw new Error("CNAME missing civic.ai");
if (!existsSync(join(BUILD_DIR, ".nojekyll")))
    throw new Error(".nojekyll missing");
console.log(`astro output checks passed (${checks.length + 3} assertions)`);
