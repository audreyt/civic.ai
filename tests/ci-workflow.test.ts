import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vite-plus/test";

const root = path.resolve(import.meta.dirname, "..");
const workflowPaths = [
    ".github/workflows/ci.yml",
    ".github/workflows/static.yml",
];
const workflows = Object.fromEntries(
    workflowPaths.map((relativePath) => [
        relativePath,
        readFileSync(path.join(root, relativePath), "utf8"),
    ])
) as Record<(typeof workflowPaths)[number], string>;

function allWorkflowText(): string {
    return Object.values(workflows).join("\n");
}

const packageJson = JSON.parse(
    readFileSync(path.join(root, "package.json"), "utf8")
) as {
    scripts: Record<string, string>;
    devEngines?: {
        runtime?: { name?: string; version?: string; onFail?: string };
        packageManager?: { name?: string; version?: string; onFail?: string };
    };
};
const workerPackageJson = JSON.parse(
    readFileSync(path.join(root, "worker/package.json"), "utf8")
) as { scripts: Record<string, string> };

describe("vp-first root lifecycle, Bun package-manager/worker boundary", () => {
    test("package.json pins both the Vite+-managed Node runtime and the Bun package manager", () => {
        expect(packageJson.devEngines?.runtime).toEqual({
            name: "node",
            version: "22.23.1",
            onFail: "download",
        });
        expect(packageJson.devEngines?.packageManager).toEqual({
            name: "bun",
            version: "1.3.14",
            onFail: "download",
        });
    });

    test("keeps the legitimate Cloudflare/Node compatibility pins aligned with the Vite+ runtime pin", () => {
        const nodeVersion = readFileSync(
            path.join(root, ".node-version"),
            "utf8"
        ).trim();
        const nvmrc = readFileSync(path.join(root, ".nvmrc"), "utf8").trim();
        const toolVersions = readFileSync(
            path.join(root, ".tool-versions"),
            "utf8"
        ).trim();

        expect(nodeVersion).toBe("22.23.1");
        expect(nvmrc).toBe("22.23.1");
        expect(toolVersions).toBe("nodejs 22.23.1");
        expect(packageJson.devEngines?.runtime?.version).toBe(nodeVersion);
    });

    test("folds the former standalone `check`/`test` scripts into native vp commands", () => {
        // `vp check` and `vp test` are direct Vite+ CLI commands; bare
        // package-script passthroughs for them add nothing over typing the
        // vp command directly, so they are removed rather than kept.
        expect(packageJson.scripts.check).toBeUndefined();
        expect(packageJson.scripts.test).toBeUndefined();
        const scriptText = Object.values(packageJson.scripts).join("\n");
        expect(scriptText).not.toMatch(/\btsc --noEmit\b/);
    });

    test("keeps the worker as a separate Bun package with its own test runner", () => {
        expect(packageJson.scripts["worker:typecheck"]).toBe(
            "cd worker && bun run typecheck"
        );
        expect(packageJson.scripts["worker:test"]).toBe(
            "cd worker && bun run test"
        );
        expect(workerPackageJson.scripts.test).toBe(
            "bun test ./test/*.node.ts"
        );
    });

    test("bootstraps both workflows via setup-vp, pinned to the same managed Node version", () => {
        for (const relativePath of workflowPaths) {
            const text = workflows[relativePath];
            expect(text).toContain("uses: voidzero-dev/setup-vp@v1");
            expect(text).toContain('node-version: "22.23.1"');
            expect(text).toContain("cache: true");
            expect(text).toContain("vp install --frozen-lockfile");
        }
    });

    test("uses maintained action generations, never a bare setup-node", () => {
        const text = allWorkflowText();
        expect(text).not.toContain("actions/setup-node@");
        expect(text).toContain("actions/checkout@v7");
        expect(text).toContain("actions/configure-pages@v6");
        expect(text).toContain("actions/upload-pages-artifact@v5");
        expect(text).toContain("actions/deploy-pages@v5");
    });

    test("uses setup-vp's managed package manager for root and worker installs", () => {
        const text = allWorkflowText();
        expect(text).not.toContain("oven-sh/setup-bun");
        expect(text).not.toMatch(/^\s*run:.*\bbun\b/m);

        for (const relativePath of workflowPaths) {
            expect(
                workflows[relativePath]!.match(
                    /run: vp install --frozen-lockfile/g
                )
            ).toHaveLength(2);
        }
    });

    test("routes every root lifecycle command through plain vp, never bunx/vpx/bun --bun", () => {
        const text = allWorkflowText();
        expect(text).not.toMatch(/\bbunx\b/);
        expect(text).not.toMatch(/\bvpx\b/);
        expect(text).not.toMatch(/\bbun\s+--bun\b/);

        const vpCommandLines = text
            .split("\n")
            .filter((line) => /^\s*run:.*\bvp\b/.test(line));
        expect(vpCommandLines.length).toBeGreaterThan(0);
        expect(
            vpCommandLines.every(
                (line) => !/\bbunx?\b/.test(line) && !/\bvpx\b/.test(line)
            )
        ).toBe(true);
    });

    test("runs every content/build validator through vp run in both workflows", () => {
        for (const relativePath of workflowPaths) {
            const text = workflows[relativePath];
            expect(text).toContain("vp check");
            expect(text).toContain("vp test");
            expect(text).toContain("vp build");
            expect(text).toContain("vp run worker:typecheck");
            expect(text).toContain("vp run worker:test");
            expect(text).toContain("vp run check-links");
            expect(text).toContain("vp run check:hybrid");
            expect(text).toContain("vp run check:astro-output");
            expect(text).toContain("vp run check:search");
            expect(text).toContain("vp run check:parity");
        }
    });

    test("keeps same-repository pull-request auto-formatting without privileging fork code", () => {
        const ci = workflows[".github/workflows/ci.yml"];
        expect(ci).not.toContain("pull_request_target");
        expect(ci).toContain(
            "github.event.pull_request.head.repo.full_name == github.repository"
        );
        expect(ci).toContain("vp run format");
        expect(allWorkflowText()).not.toContain("pull_request_target");
    });

    test("keeps hidden files in the Pages deployment artifact", () => {
        expect(workflows[".github/workflows/static.yml"]).toContain(
            "include-hidden-files: true"
        );
    });

    test("keeps Pages deployment retries with backoff", () => {
        const staticYml = workflows[".github/workflows/static.yml"];
        expect(staticYml).toContain("deployment-retry-1");
        expect(staticYml).toContain("deployment-retry-2");
        expect(staticYml).toContain("deployment-retry-3");
        expect(staticYml).toContain("sleep 30");
        expect(staticYml).toContain("sleep 60");
        expect(staticYml).toContain("sleep 120");
    });

    test("configures weekly GitHub Actions dependency updates", () => {
        const dependabot = readFileSync(
            path.join(root, ".github/dependabot.yml"),
            "utf8"
        );
        expect(dependabot).toContain('package-ecosystem: "github-actions"');
        expect(dependabot).toContain('interval: "weekly"');
    });

    test("keeps the root README free of Bun instructions", () => {
        const readme = readFileSync(path.join(root, "README.md"), "utf8");
        expect(readme).not.toMatch(/\bbun\b/i);
        expect(readme).toContain("vp check");
        expect(readme).toContain("vp test");
        expect(readme).toContain("vp build");
    });

    test("supersedes the prior Bun-native CI design doc with the Vite+-runtime one", () => {
        const superseded = readFileSync(
            path.join(root, ".github/bun-native-ci-design.md"),
            "utf8"
        );
        expect(superseded).toMatch(/superseded/i);
        expect(superseded).toContain("vp-runtime-ci-design.md");

        const current = readFileSync(
            path.join(root, ".github/vp-runtime-ci-design.md"),
            "utf8"
        );
        expect(current).toContain("voidzero-dev/setup-vp@v1");
        expect(current).toContain("22.23.1");
    });
});

describe("vp test contract (vite.config.ts)", () => {
    const viteConfigText = readFileSync(
        path.join(root, "vite.config.ts"),
        "utf8"
    );

    test("no test file imports the bun:test compatibility alias", () => {
        expect(viteConfigText).not.toContain("bun:test");

        const testDir = path.join(root, "tests");
        const otherTestFiles = readdirSync(testDir).filter(
            (name) =>
                /\.test\.(ts|js)$/.test(name) && name !== "ci-workflow.test.ts"
        );
        expect(otherTestFiles.length).toBeGreaterThan(0);
        for (const name of otherTestFiles) {
            const text = readFileSync(path.join(testDir, name), "utf8");
            expect(text).not.toContain("bun:test");
        }
    });

    test("wires the global setup that folds tsc/pangu/typography gates into vp test", () => {
        expect(viteConfigText).toContain(
            'globalSetup: ["./tests/global-setup.ts"]'
        );

        const globalSetup = readFileSync(
            path.join(root, "tests/global-setup.ts"),
            "utf8"
        );
        expect(globalSetup).toContain('"tsc", "--noEmit"');
        expect(globalSetup).toContain("pangu-format.mjs");
        expect(globalSetup).toContain("check-tw-typography.mjs");
        // Content lives in root *.md/tw-*.md, not Astro content
        // collections, so no `astro sync` step regenerates ambient types
        // here.
        expect(globalSetup).not.toMatch(/["']astro["'],\s*["']sync["']/);
    });

    test("enforces 100% statement/branch/function/line coverage over a meaningful, explicit scope", () => {
        expect(viteConfigText).toMatch(/provider:\s*["']v8["']/);
        expect(viteConfigText).toMatch(/statements:\s*100/);
        expect(viteConfigText).toMatch(/branches:\s*100/);
        expect(viteConfigText).toMatch(/functions:\s*100/);
        expect(viteConfigText).toMatch(/lines:\s*100/);
        expect(viteConfigText).toContain('"src/lib/**/*.{ts,js}"');
        expect(viteConfigText).toContain('"scripts/lib/**/*.{mjs,js}"');
        // A scoped include, not a broad exclude carve-out that could hide
        // untested files.
        expect(viteConfigText).not.toMatch(/coverage:\s*\{[^}]*exclude:/s);
    });

    test("package.json pins @vitest/coverage-v8 to the exact Vitest version Vite+ bundles", () => {
        const devDependencies = (JSON.parse(
            readFileSync(path.join(root, "package.json"), "utf8")
        ).devDependencies ?? {}) as Record<string, string>;
        const vitestPackageJson = JSON.parse(
            readFileSync(
                path.join(root, "node_modules/vitest/package.json"),
                "utf8"
            )
        ) as { version: string };

        expect(devDependencies["@vitest/coverage-v8"]).toBe(
            vitestPackageJson.version
        );
    });
});
