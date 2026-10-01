import { expect, test } from "vite-plus/test";
import { spawnSync } from "node:child_process";
import {
    mkdtempSync,
    mkdirSync,
    readFileSync,
    rmSync,
    writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { gzipSync } from "node:zlib";

test("postbuild publishes failed evals and exact final HTML bytes without rejecting publication", () => {
    const scratch = mkdtempSync(join(process.cwd(), ".record-eval-"));
    try {
        mkdirSync(join(scratch, "dist"));
        const html =
            '<html lang="en"><body><div data-record-evals="trace" data-record-lang="en">Not yet evaluated</div><a href="/missing/">Broken</a></body></html>';
        writeFileSync(join(scratch, "dist/404.html"), html);
        const result = spawnSync(
            "bun",
            [resolve("scripts/evaluate-record.mjs")],
            { cwd: scratch, encoding: "utf8" }
        );
        expect(result.status).toBe(0);
        const report = JSON.parse(
            readFileSync(join(scratch, "dist/evals.json"), "utf8")
        );
        expect(report.checks.links.pass).toBe(false);
        expect(report.checks.terms.pass).toBe(false);
        expect(report.checks.contrast.pass).toBe(false);
        expect(report.checks.size.detail[0].html).toBeGreaterThan(0);
        const published = readFileSync(join(scratch, "dist/404.html"), "utf8");
        expect(report.checks.size.detail[0].html).toBe(
            gzipSync(published).length
        );
        expect(published).toContain("record-eval--fail");
        expect(published).toContain('href="/evals.json"');
        expect(published).not.toContain("Not yet evaluated");
    } finally {
        rmSync(scratch, { recursive: true });
    }
});

// The receipt shape is the one scripts/subset-zh-fonts.mjs actually writes:
// a site path and the page's total subset bytes.
test.each([
    [{ pages: [{ path: "/tw/", bytes: 260000 }] }, true],
    [{ pages: [{ path: "/tw/", bytes: 260001 }] }, false],
    [{ pages: [] }, false],
])(
    "uses optional zh font receipts without treating missing measurements as zero",
    (fontReport, pass) => {
        const scratch = mkdtempSync(join(process.cwd(), ".record-eval-"));
        try {
            mkdirSync(join(scratch, "dist/tw"), { recursive: true });
            mkdirSync(join(scratch, "dist/fonts/zh"), { recursive: true });
            writeFileSync(
                join(scratch, "dist/tw/index.html"),
                "<html><body>Text</body></html>"
            );
            writeFileSync(
                join(scratch, "dist/fonts/zh/report.json"),
                JSON.stringify(fontReport)
            );
            const result = spawnSync(
                "bun",
                [resolve("scripts/evaluate-record.mjs")],
                { cwd: scratch, encoding: "utf8" }
            );
            expect(result.status).toBe(0);
            const report = JSON.parse(
                readFileSync(join(scratch, "dist/evals.json"), "utf8")
            );
            expect(report.checks.size.pass).toBe(pass);
        } finally {
            rmSync(scratch, { recursive: true });
        }
    }
);
