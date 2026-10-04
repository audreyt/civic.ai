import { defineConfig } from "astro/config";
import { availableParallelism } from "node:os";

const staticRouteConcurrency = availableParallelism();

export default defineConfig({
    site: "https://civic.ai",
    output: "static",
    trailingSlash: "always",
    build: { format: "directory", concurrency: staticRouteConcurrency },
    outDir: "dist",
    // Client scripts ship as cached files instead of being repeated inline in
    // every page's HTML (DESIGN.md §15); other assets keep Vite's default.
    vite: {
        build: {
            assetsInlineLimit: (file) =>
                file.endsWith(".js") ? false : undefined,
        },
    },
});
