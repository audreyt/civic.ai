import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { build as astroBuild, dev as astroDev } from "astro";
import type { ConfigEnv, Plugin, ViteBuilder } from "vite";

const PROJECT_ROOT = fileURLToPath(new URL("../..", import.meta.url));

type CommandEnvironment = Pick<ConfigEnv, "command" | "mode"> & {
    isPreview?: boolean;
};

type AstroDevServer = {
    address: { port: number };
    stop(): Promise<void>;
};

export type AstroBuildBridgeDependencies = {
    buildAstro?: () => Promise<void>;
    runPostBuild?: () => void | Promise<void>;
    syncPublic?: () => void | Promise<void>;
};

export function isAstroDevCommand({
    command,
    mode,
    isPreview = false,
}: CommandEnvironment): boolean {
    return command === "serve" && mode !== "test" && !isPreview;
}

export type AstroDevProxyDependencies = {
    startAstro?: () => Promise<AstroDevServer>;
    syncPublic?: () => void | Promise<void>;
};

export function createAstroDevProxy(
    dependencies: AstroDevProxyDependencies = {}
): Plugin {
    let astroServer: AstroDevServer | undefined;
    const startAstro =
        dependencies.startAstro ??
        (() => astroDev({ server: { host: "127.0.0.1", port: 0 } }));

    const sync = dependencies.syncPublic ?? syncPublic;
    return {
        name: "civic-ai:astro-dev-proxy",
        apply: "serve",
        async config(_config, environment) {
            if (!isAstroDevCommand(environment)) return;

            await sync();
            astroServer = await startAstro();
            const target = `http://127.0.0.1:${astroServer.address.port}`;

            return {
                server: {
                    hmr: false,
                    proxy: {
                        "/": {
                            changeOrigin: true,
                            target,
                            ws: true,
                        },
                    },
                },
            };
        },
        configureServer(viteServer) {
            viteServer.httpServer?.once("close", () => {
                void astroServer?.stop();
            });
        },
    };
}

function runBun(args: string[]): void {
    execFileSync("bun", args, { cwd: PROJECT_ROOT, stdio: "inherit" });
}

export function syncPublic(): void {
    runBun(["scripts/sync-public.mjs"]);
}

type PagefindExecutor = (cwd: string) => void;

/**
 * Runs Pagefind directly from the local `node_modules/.bin`, not via
 * ambient `bunx`. `bunx` resolves package binaries from Bun's global
 * cache/registry rather than the project's pinned `pagefind` dependency,
 * so it can silently run a different version than `package.json`
 * declares. Resolving the local bin keeps `vp build` deterministic.
 */
function execPagefind(cwd: string): void {
    execFileSync(
        join(cwd, "node_modules", ".bin", "pagefind"),
        ["--site", "dist"],
        { cwd, stdio: "inherit" }
    );
}

/**
 * Indexes `dist/` with Pagefind. `cwd` and `exec` are both injectable so
 * tests can cover this without shelling out to a real Pagefind binary.
 */
export function runPagefind(
    cwd: string = PROJECT_ROOT,
    exec: PagefindExecutor = execPagefind
): void {
    exec(cwd);
}

function runPostBuild(): void {
    runBun(["scripts/minify-html.mjs"]);
    runBun(["scripts/subset-zh-fonts.mjs"]);
    runPagefind();
    runBun(["scripts/evaluate-record.mjs"]);
}

export function createAstroBuildBridge(
    dependencies: AstroBuildBridgeDependencies = {}
): Plugin {
    const buildAstro = dependencies.buildAstro ?? (async () => astroBuild({}));
    const postBuild = dependencies.runPostBuild ?? runPostBuild;
    const sync = dependencies.syncPublic ?? syncPublic;

    return {
        name: "civic-ai:astro-build",
        apply: "build",
        config(_config, environment) {
            if (environment.command !== "build") return;

            return {
                builder: {
                    async buildApp(builder: ViteBuilder): Promise<void> {
                        await sync();
                        await buildAstro();
                        await postBuild();

                        for (const buildEnvironment of Object.values(
                            builder.environments
                        )) {
                            buildEnvironment.isBuilt = true;
                        }
                    },
                },
            };
        },
    };
}
