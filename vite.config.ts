import { defineConfig } from "vite-plus";
import {
    createAstroBuildBridge,
    createAstroDevProxy,
} from "./src/lib/vitePlusAdapter";

export default defineConfig({
    lint: {
        jsPlugins: [
            { name: "vite-plus", specifier: "vite-plus/oxlint-plugin" },
        ],
        ignorePatterns: ["worker/**", "sensemaker/**", "coverage/**"],
        rules: {
            "vite-plus/prefer-vite-plus-imports": "error",
            "no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                },
            ],
        },
        options: { typeAware: true, typeCheck: true, denyWarnings: true },
    },
    staged: {
        "**/*": "vp fmt",
        "**/*.md": [
            "bun pangu-format.mjs",
            "bun scripts/check-tw-typography.mjs",
        ],
        "_data/glossary.json": "bun scripts/check-tw-typography.mjs",
    },
    fmt: {
        semi: true,
        singleQuote: false,
        tabWidth: 4,
        trailingComma: "es5",
        printWidth: 80,
        sortPackageJson: false,
        ignorePatterns: [
            "node_modules/**",
            "worker/**",
            "sensemaker/generated/**",
            ".astro/**",
            "dist/**",
            "public/**",
            "coverage/**",
        ],
    },
    server: {
        host: "127.0.0.1",
        port: 4321,
    },
    test: {
        include: ["tests/**/*.test.{ts,js}"],
        exclude: ["worker/**", "node_modules/**"],
        environment: "node",
        globalSetup: ["./tests/global-setup.ts"],
        coverage: {
            enabled: true,
            provider: "v8",
            reporter: ["text", "lcov"],
            reportsDirectory: "coverage",
            // Scoped to the meaningfully-testable business logic (the
            // typed content loader, markdown/search/concept-map/site
            // libraries, and the Vite+/Astro build bridge), not every
            // loaded module. Astro page wrappers (src/pages/**), the
            // one-off build/content maintenance scripts under scripts/,
            // and worker/ (separate Bun package, separately tested) are
            // out of scope by omission, not by exclusion carve-out — see
            // .github/vp-runtime-ci-design.md for the coverage rationale.
            include: ["src/lib/**/*.{ts,js}", "scripts/lib/**/*.{mjs,js}"],
            thresholds: {
                statements: 100,
                branches: 100,
                functions: 100,
                lines: 100,
            },
        },
    },
    plugins: [createAstroBuildBridge(), createAstroDevProxy()],
});
