import { expect, test } from "vite-plus/test";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
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
            '<html lang="en"><body><div data-record-evals="trace" data-record-lang="en"></div><a href="/missing/">Broken</a></body></html>';
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
    } finally {
        rmSync(scratch, { recursive: true });
    }
});

// Hex digests barely shrink under gzip, so either page tops 60 KB.
const words = Array.from({ length: 3000 }, (_, i) =>
    createHash("sha256").update(String(i)).digest("hex")
).join(" ");
test.each([
    [`<p>${words}</p>`, true],
    [`<p title="${words}">x</p>`, false],
])(
    "lets a long page pass on its own text, never on its markup",
    (body, pass) => {
        const scratch = mkdtempSync(join(process.cwd(), ".record-eval-"));
        try {
            mkdirSync(join(scratch, "dist"));
            writeFileSync(
                join(scratch, "dist/index.html"),
                `<html lang="en"><body>${body}</body></html>`
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
            expect(report.checks.size.detail[0].html).toBeGreaterThan(60000);
            expect(report.checks.size.pass).toBe(pass);
        } finally {
            rmSync(scratch, { recursive: true });
        }
    }
);
