import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// Resolves to the repo root regardless of the process's current working
// directory (this file lives at `<root>/tests/global-setup.ts`).
const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const vpExecutable = fileURLToPath(
    new URL("../node_modules/.bin/vp", import.meta.url)
);

function run(command: string, args: string[]): void {
    execFileSync(command, args, { cwd: projectRoot, stdio: "inherit" });
}

/**
 * Vitest `globalSetup`: runs once before the whole `vp test` run. Folds in
 * everything the standalone `bun run check` / `bun run lint` scripts used
 * to gate separately:
 *
 *  - a full TypeScript compile check via `vp exec tsc --noEmit`, resolving
 *    `tsc` from the local `node_modules/.bin`. This project does not use
 *    Astro content collections (canonical content stays in root
 *    `*.md`/`tw-*.md`, see AGENTS.md), so `src/env.d.ts` only references
 *    `astro/client` — no generated `.astro/types.d.ts` is required for the
 *    compile to succeed, and no `astro sync` step runs here.
 *  - the Traditional Mandarin CJK-spacing gate (`pangu-format.mjs
 *    --check`), run under Bun, the project's intentional utility-script
 *    runtime.
 *  - the tw-typography double-em-dash collision gate
 *    (`scripts/check-tw-typography.mjs`), also run under Bun.
 *
 * A non-zero exit throws, which fails the test run before a single test
 * executes.
 */
export default function setup(): void {
    run(vpExecutable, ["exec", "tsc", "--noEmit"]);
    run("bun", ["pangu-format.mjs", "--check"]);
    run("bun", ["scripts/check-tw-typography.mjs"]);
}
