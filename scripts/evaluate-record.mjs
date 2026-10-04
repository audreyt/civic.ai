#!/usr/bin/env bun
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { gzipSync } from "node:zlib";
import { reviewPairs } from "./lib/review-pairs.mjs";
import { evaluateContrast } from "./lib/record-contrast.mjs";
import {
    evaluateTerms,
    evaluateTwins,
    injectEvals,
} from "./lib/record-evals.mjs";

const root = process.cwd();
const dist = resolve(process.env.BUILD_DIR || "dist");
function walk(dir) {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        if (entry.name === "pagefind") return [];
        const path = join(dir, entry.name);
        return entry.isDirectory()
            ? walk(path)
            : path.endsWith(".html")
              ? [path]
              : [];
    });
}
const pages = walk(dist).map((path) => ({
    path,
    url: path.slice(dist.length).replace(/index\.html$/, ""),
    html: readFileSync(path, "utf8"),
}));
const checks = {};
function evaluate(name, run) {
    try {
        checks[name] = run();
    } catch (error) {
        checks[name] = {
            pass: false,
            scope: `${name}: evaluation could not finish; see receipts.`,
            scopeZh: "評測未能完成，請查看完整紀錄。",
            detail: [String(error)],
        };
    }
}
evaluate("links", () => {
    const result = spawnSync("bun", ["check-links.mjs"], {
        cwd: root,
        env: { ...process.env, BUILD_DIR: dist },
        encoding: "utf8",
    });
    return {
        pass: result.status === 0,
        scope: "Existing internal-link and fragment checker; external destinations are not fetched.",
        scopeZh: "使用既有站內連結與段落錨點檢查；不擷取外部網址。",
        detail: [result.stdout, result.stderr, result.error?.message].filter(
            Boolean
        ),
    };
});
evaluate("parity", () => evaluateTwins(pages, reviewPairs(readdirSync(root))));
evaluate("terms", () =>
    evaluateTerms(
        JSON.parse(readFileSync("_data/glossary.json", "utf8")),
        readFileSync(join(dist, "tw/glossary/index.html"), "utf8")
    )
);
evaluate("contrast", () =>
    evaluateContrast(readFileSync("styles.css", "utf8"))
);

const compressed = (text) => (text.length ? gzipSync(text).length : 0);
function sizeCheck(rendered) {
    const detail = rendered.map((page) => {
        const cssPaths = [
            ...page.html.matchAll(
                /<link\b(?=[^>]*rel="stylesheet")(?=[^>]*href="([^"]+)")[^>]*>/g
            ),
        ].map((m) => m[1]);
        const scriptTags = [
            ...page.html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi),
        ].filter((m) => !/type="application\/ld\+json"/.test(m[1]));
        const resources = (urls) =>
            [...new Set(urls)].reduce((bytes, url) => {
                if (/^(?:https?:)?\/\//.test(url)) return bytes;
                return (
                    bytes +
                    compressed(
                        readFileSync(
                            join(
                                dist,
                                new URL(url, `https://civic.ai${page.url}`)
                                    .pathname
                            )
                        )
                    )
                );
            }, 0);
        const html = compressed(page.html);
        // A long page can exceed the HTML budget on its own words alone: it
        // passes while its markup beyond that text stays within budget. Inline
        // CSS and JS are left out here; they count under their own budgets.
        const prose = page.html.replace(
            /<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,
            ""
        );
        const markup =
            compressed(prose) - compressed(prose.replace(/<[^>]+>/g, ""));
        const css =
            resources(cssPaths) +
            compressed(
                [...page.html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)]
                    .map((m) => m[1])
                    .join("")
            );
        const js =
            resources(
                scriptTags.flatMap((m) => /src="([^"]+)"/.exec(m[1])?.[1] ?? [])
            ) + compressed(scriptTags.map((m) => m[2]).join(""));
        return {
            url: page.url,
            html,
            markup,
            css,
            js,
            pass:
                (html <= 60000 || markup <= 25000) &&
                css <= 30000 &&
                js <= 30000,
        };
    });
    return {
        pass: detail.every((row) => row.pass),
        detail,
        budgets: { html: 60000, htmlMarkup: 25000, css: 30000, js: 30000 },
        scope: "Per-page gzip HTML, linked/inline CSS and JS; decimal KB. A page over the HTML budget passes while its markup beyond its own text stays within 25 KB. Chinese text uses the reader's system fonts; fonts, images and network requests are outside this static check.",
        scopeZh:
            "逐頁計算 gzip 壓縮後的 HTML、CSS 與 JS，KB 採十進位。HTML 超出預算的長頁，只要文字以外的標記不超過 25 KB 即算通過。華文使用讀者裝置的系統字型；字型、圖片及網路請求不在此靜態檢查範圍。",
    };
}
const report = { builtAt: new Date().toISOString(), checks };
// Settle the size status against the actual injected HTML, not the placeholders.
// No byte totals appear in HTML, so only pass/fail can change its size.
evaluate("size", () => sizeCheck(pages));
let rendered = pages;
for (let i = 0; i < 3; i++) {
    rendered = pages.map((page) => ({
        ...page,
        html: injectEvals(page.html, report),
    }));
    const before = checks.size.pass;
    evaluate("size", () => sizeCheck(rendered));
    if (checks.size.pass === before) break;
}
for (const page of rendered) writeFileSync(page.path, page.html);
writeFileSync(join(dist, "evals.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(
    `Record evals: ${Object.entries(checks)
        .map(
            ([name, check]) => `${name} ${check.pass ? "PASS" : "NEEDS REPAIR"}`
        )
        .join(" · ")} (non-blocking)`
);
