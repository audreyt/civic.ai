import { execFileSync } from "node:child_process";
import {
    mkdtempSync,
    mkdirSync,
    readFileSync,
    rmSync,
    writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { afterEach, expect, test } from "vite-plus/test";
import { create } from "fontkit";

const temporary: string[] = [];
afterEach(() => {
    for (const dir of temporary.splice(0))
        rmSync(dir, { recursive: true, force: true });
});

test("offline subsets cover decoded Han and deduplicate identical page sets", () => {
    // Given two identical zh pages, an inline zh page and an English page.
    const dir = mkdtempSync(join(process.cwd(), ".font-test-"));
    temporary.push(dir);
    mkdirSync(join(dir, "tw/a"), { recursive: true });
    mkdirSync(join(dir, "tw/b"), { recursive: true });
    const html =
        '<html lang="zh-Hant"><head></head><body><h1>仁</h1><p>智慧&#x3002;<strong>工</strong></p><script>龍</script><svg data-font-subset="skip"><text>鳳</text></svg></body></html>';
    writeFileSync(join(dir, "tw/a/index.html"), html);
    writeFileSync(join(dir, "tw/b/index.html"), html);
    writeFileSync(
        join(dir, "inline.html"),
        '<html><head></head><body><p lang="zh">仁工</p></body></html>'
    );
    writeFileSync(
        join(dir, "en.html"),
        '<html lang="en"><head></head><body>Hello</body></html>'
    );

    // When the real HarfBuzz post-build pass runs without any fetch.
    execFileSync("bun", ["scripts/subset-zh-fonts.mjs", dir], {
        cwd: process.cwd(),
    });
    const report = JSON.parse(
        readFileSync(join(dir, "fonts/zh/report.json"), "utf8")
    );
    const a = report.pages.find(
        (page: { path: string }) => page.path === "/tw/a/"
    );
    const b = report.pages.find(
        (page: { path: string }) => page.path === "/tw/b/"
    );

    // Then actual WOFF2 cmaps cover text/entities, but not script source
    // or skipped layers.
    expect(report.pages).toHaveLength(3);
    expect(a.files).toEqual(b.files);
    const regular = new Set<number>();
    const heavy = new Set<number>();
    for (const file of a.files) {
        const font = create(readFileSync(join(dir, "fonts/zh", file.file)));
        if (!("characterSet" in font))
            throw new Error("Expected a single font");
        for (const cp of font.characterSet)
            (file.weight === 400 ? regular : heavy).add(cp);
    }
    expect(regular.has(0x3002)).toBe(true);
    expect(regular.has(0x667a)).toBe(true);
    expect(regular.has(0x9f8d)).toBe(false);
    // a comic's invisible text layer (data-font-subset="skip") needs no glyphs
    expect(regular.has(0x9cf3)).toBe(false);
    expect(heavy.has(0x4ec1)).toBe(true);
    expect(heavy.has(0x5de5)).toBe(true);
    expect(a.bytes).toBe(
        a.files.reduce(
            (sum: number, file: { bytes: number }) => sum + file.bytes,
            0
        )
    );
    expect(readFileSync(join(dir, "en.html"), "utf8")).not.toContain(
        "data-zh-fonts"
    );
    const first = readFileSync(join(dir, "tw/a/index.html"), "utf8");
    execFileSync("bun", ["scripts/subset-zh-fonts.mjs", dir], {
        cwd: process.cwd(),
    });
    expect(readFileSync(join(dir, "tw/a/index.html"), "utf8")).toBe(first);
});

test("missing source glyphs produce a visible warning and report", () => {
    // Given a Han character absent from the site's source superset.
    const dir = mkdtempSync(join(process.cwd(), ".font-test-"));
    temporary.push(dir);
    writeFileSync(
        join(dir, "index.html"),
        '<html lang="zh"><head></head><body>仁𠀀</body></html>'
    );
    // When the real pass runs, it must not silently pretend coverage.
    execFileSync("bun", ["scripts/subset-zh-fonts.mjs", dir], {
        cwd: process.cwd(),
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
    });
    // Then the machine-readable report names the missing character.
    const report = JSON.parse(
        readFileSync(join(dir, "fonts/zh/report.json"), "utf8")
    );
    expect(report.pages[0].missingGlyphs).toBe("𠀀");
});
