import { expect, test, vi } from "vite-plus/test";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ConfigEnv, Plugin } from "vite";
import type * as NodeChildProcess from "node:child_process";
import viteConfig from "../vite.config";

const execFileSyncMock = vi.hoisted(() => vi.fn());
const astroDevMock = vi.hoisted(() =>
    vi.fn(async () => ({ address: { port: 4321 }, stop: async () => {} }))
);
const astroBuildMock = vi.hoisted(() => vi.fn(async () => {}));

vi.mock("node:child_process", async (importOriginal) => {
    const actual = await importOriginal<typeof NodeChildProcess>();
    return { ...actual, execFileSync: execFileSyncMock };
});

vi.mock("astro", () => ({
    dev: astroDevMock,
    build: astroBuildMock,
}));

import {
    createAstroBuildBridge,
    createAstroDevProxy,
    isAstroDevCommand,
    runPagefind,
    syncPublic,
} from "../src/lib/vitePlusAdapter";

async function resolvePluginConfig(
    plugin: Plugin,
    environment: ConfigEnv
): Promise<unknown> {
    if (typeof plugin.config !== "function") {
        throw new Error("Expected a Vite config hook");
    }
    return Reflect.apply(plugin.config, undefined, [{}, environment]);
}

test("only real development activates the Astro dev bridge", () => {
    expect(isAstroDevCommand({ command: "serve", mode: "development" })).toBe(
        true
    );
    expect(isAstroDevCommand({ command: "serve", mode: "test" })).toBe(false);
    expect(
        isAstroDevCommand({
            command: "serve",
            mode: "production",
            isPreview: true,
        })
    ).toBe(false);
    expect(isAstroDevCommand({ command: "build", mode: "production" })).toBe(
        false
    );
});

test("direct vp dev uses the site port for local Worker probing", () => {
    expect(viteConfig.server).toMatchObject({
        host: "127.0.0.1",
        port: 4321,
    });
});

test("Astro dev proxy preserves HTTP and WebSocket forwarding", async () => {
    const plugin = createAstroDevProxy({
        startAstro: async () => ({
            address: { port: 8787 },
            stop: async () => {},
        }),
        syncPublic: async () => {},
    });
    const config = (await resolvePluginConfig(plugin, {
        command: "serve",
        mode: "development",
        isPreview: false,
    } as ConfigEnv)) as {
        server: {
            hmr: boolean;
            proxy: Record<string, { target: string; ws: boolean }>;
        };
    };

    expect(config.server.hmr).toBe(false);
    expect(config.server.proxy["/"]).toMatchObject({
        target: "http://127.0.0.1:8787",
        ws: true,
    });
});

test("Astro dev proxy is inactive outside a real dev command", async () => {
    const plugin = createAstroDevProxy({
        startAstro: async () => {
            throw new Error("startAstro should not run for a build command");
        },
    });

    expect(
        await resolvePluginConfig(plugin, {
            command: "build",
            mode: "production",
            isPreview: false,
        } as ConfigEnv)
    ).toBeUndefined();
});

test("Astro build bridge handles every Vite environment after Astro builds", async () => {
    const calls: string[] = [];
    const plugin = createAstroBuildBridge({
        buildAstro: async () => {
            calls.push("astro");
        },
        runPostBuild: async () => {
            calls.push("post-build");
        },
        syncPublic: async () => {
            calls.push("sync");
        },
    });
    const config = (await resolvePluginConfig(plugin, {
        command: "build",
        mode: "production",
        isPreview: false,
    } as ConfigEnv)) as {
        builder: {
            buildApp(builder: {
                environments: Record<string, { isBuilt: boolean }>;
            }): Promise<void>;
        };
    };
    const environments = {
        client: { isBuilt: false },
        prerender: { isBuilt: false },
    };

    await config.builder.buildApp({ environments });

    expect(calls).toEqual(["sync", "astro", "post-build"]);
    expect(
        Object.values(environments).every((environment) => environment.isBuilt)
    ).toBe(true);
});

test("Astro build bridge is inactive for non-build Vite commands", async () => {
    const plugin = createAstroBuildBridge({
        buildAstro: async () => {},
        runPostBuild: async () => {},
    });

    expect(
        await resolvePluginConfig(plugin, {
            command: "serve",
            mode: "development",
            isPreview: false,
        } as ConfigEnv)
    ).toBeUndefined();
});

test("runPagefind indexes the given directory via the injected executor", () => {
    const calls: string[] = [];
    runPagefind("/tmp/example-dist", (cwd) => {
        calls.push(cwd);
    });

    expect(calls).toEqual(["/tmp/example-dist"]);
});

test("runPagefind defaults to the project root when no directory is given", () => {
    const calls: string[] = [];
    runPagefind(undefined, (cwd) => {
        calls.push(cwd);
    });

    expect(calls).toEqual([fileURLToPath(new URL("..", import.meta.url))]);
});

test("runPagefind's default executor runs the local pagefind bin directly, never ambient bunx", () => {
    execFileSyncMock.mockClear();
    runPagefind("/tmp/example-dist");

    expect(execFileSyncMock).toHaveBeenCalledWith(
        join("/tmp/example-dist", "node_modules", ".bin", "pagefind"),
        ["--site", "dist"],
        { cwd: "/tmp/example-dist", stdio: "inherit" }
    );
});

test("syncPublic runs the sync script directly under Bun", () => {
    execFileSyncMock.mockClear();
    syncPublic();

    expect(execFileSyncMock).toHaveBeenCalledWith(
        "bun",
        ["scripts/sync-public.mjs"],
        expect.objectContaining({ stdio: "inherit" })
    );
});

test("Astro build bridge's default post-build step minifies then indexes via local bin, never bunx", async () => {
    execFileSyncMock.mockClear();
    const plugin = createAstroBuildBridge({
        buildAstro: async () => {},
        syncPublic: async () => {},
    });
    const config = (await resolvePluginConfig(plugin, {
        command: "build",
        mode: "production",
        isPreview: false,
    } as ConfigEnv)) as {
        builder: {
            buildApp(builder: {
                environments: Record<string, { isBuilt: boolean }>;
            }): Promise<void>;
        };
    };

    await config.builder.buildApp({ environments: {} });

    expect(execFileSyncMock.mock.calls.map((call) => call[0])).toEqual([
        "bun",
        "bun",
        join(process.cwd(), "node_modules", ".bin", "pagefind"),
        "bun",
    ]);
    expect(execFileSyncMock.mock.calls[0]?.[1]).toEqual([
        "scripts/minify-html.mjs",
    ]);
    expect(execFileSyncMock.mock.calls[1]?.[1]).toEqual([
        "scripts/subset-zh-fonts.mjs",
    ]);
    expect(execFileSyncMock.mock.calls[2]?.[1]).toEqual(["--site", "dist"]);
    expect(execFileSyncMock.mock.calls[3]?.[1]).toEqual([
        "scripts/evaluate-record.mjs",
    ]);
    expect(
        execFileSyncMock.mock.calls
            .flat(2)
            .some((value) => String(value).includes("bunx"))
    ).toBe(false);
});

test("Astro dev proxy stops the proxied Astro server when Vite+'s server closes", async () => {
    let stopped = false;
    const plugin = createAstroDevProxy({
        startAstro: async () => ({
            address: { port: 9999 },
            stop: async () => {
                stopped = true;
            },
        }),
        syncPublic: async () => {},
    });
    await resolvePluginConfig(plugin, {
        command: "serve",
        mode: "development",
        isPreview: false,
    } as ConfigEnv);

    const listeners: Record<string, () => void> = {};
    if (typeof plugin.configureServer !== "function") {
        throw new Error("Expected a configureServer hook");
    }
    Reflect.apply(plugin.configureServer, undefined, [
        {
            httpServer: {
                once(event: string, cb: () => void) {
                    listeners[event] = cb;
                },
            },
        },
    ]);
    listeners.close?.();
    await Promise.resolve();

    expect(stopped).toBe(true);
});

test("Astro dev proxy tolerates a missing Vite+ HTTP server", () => {
    const plugin = createAstroDevProxy();
    if (typeof plugin.configureServer !== "function") {
        throw new Error("Expected a configureServer hook");
    }
    const configureServer = plugin.configureServer;

    expect(() =>
        Reflect.apply(configureServer, undefined, [{ httpServer: undefined }])
    ).not.toThrow();
});

test("Astro dev proxy's default startAstro calls Astro's real dev API", async () => {
    astroDevMock.mockClear();
    const plugin = createAstroDevProxy({ syncPublic: async () => {} });
    const config = (await resolvePluginConfig(plugin, {
        command: "serve",
        mode: "development",
        isPreview: false,
    } as ConfigEnv)) as {
        server: { proxy: Record<string, { target: string }> };
    };

    expect(astroDevMock).toHaveBeenCalledWith({
        server: { host: "127.0.0.1", port: 0 },
    });
    expect(config.server.proxy["/"]?.target).toBe("http://127.0.0.1:4321");
});

test("Astro build bridge's default buildAstro calls Astro's real build API", async () => {
    astroBuildMock.mockClear();
    const plugin = createAstroBuildBridge({
        syncPublic: async () => {},
        runPostBuild: async () => {},
    });
    const config = (await resolvePluginConfig(plugin, {
        command: "build",
        mode: "production",
        isPreview: false,
    } as ConfigEnv)) as {
        builder: {
            buildApp(builder: {
                environments: Record<string, { isBuilt: boolean }>;
            }): Promise<void>;
        };
    };

    await config.builder.buildApp({ environments: {} });

    expect(astroBuildMock).toHaveBeenCalledWith({});
});
