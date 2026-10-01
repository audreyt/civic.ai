import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import {
    access,
    mkdir,
    mkdtemp,
    readFile,
    rename,
    rm,
    stat,
} from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

import {
    GENERATION_OPTIONS,
    LOCALES,
    PACKAGE_ROOT,
    REPLAY_MODEL_MANIFEST_PATH,
    REPO_ROOT,
    buildEvidence,
    buildGenerationSpec,
    sha256,
    stableJson,
    validateGeneratedNarrative,
    validateNarrativePair,
    writeArtifacts,
} from "./lib.mjs";

const REPLAY_HTML_PATH = resolve(PACKAGE_ROOT, "src/replay.html");
const WLLAMA_ROOT = resolve(REPO_ROOT, "node_modules/@wllama/wllama/esm");
const WLLAMA_INDEX_PATH = resolve(WLLAMA_ROOT, "index.js");
const WLLAMA_WASM_PATH = resolve(WLLAMA_ROOT, "wasm/wllama.wasm");
const RUNS_PER_LOCALE = 2;

export async function loadReplayModelManifest() {
    return JSON.parse(await readFile(REPLAY_MODEL_MANIFEST_PATH, "utf8"));
}

async function hashFile(path) {
    const hash = createHash("sha256");
    for await (const chunk of createReadStream(path)) hash.update(chunk);
    return hash.digest("hex");
}

async function verifyPinnedFile(path, expected, label) {
    const file = await stat(path);
    if (file.size !== expected.bytes) {
        throw new Error(
            `${label} has ${file.size} bytes; expected ${expected.bytes}`
        );
    }
    const digest = await hashFile(path);
    if (digest !== expected.sha256) {
        throw new Error(
            `${label} SHA-256 is ${digest}; expected ${expected.sha256}`
        );
    }
    return path;
}

export async function verifyReplayModel(path, expected) {
    return verifyPinnedFile(path, expected, "Replay model");
}
export async function verifyReplayRuntime(manifest) {
    await Promise.all([
        verifyPinnedFile(
            WLLAMA_INDEX_PATH,
            manifest.runtime.assets.javascript,
            "wllama JavaScript"
        ),
        verifyPinnedFile(
            WLLAMA_WASM_PATH,
            manifest.runtime.assets.webassembly,
            "wllama WebAssembly"
        ),
    ]);
}

async function downloadReplayModel(path, expected) {
    await mkdir(dirname(path), { recursive: true });
    const temporaryPath = `${path}.part-${process.pid}`;
    await rm(temporaryPath, { force: true });
    const response = await fetch(expected.downloadUrl, { redirect: "follow" });
    if (!response.ok || !response.body) {
        throw new Error(
            `${expected.downloadUrl}: ${response.status} ${response.statusText}`
        );
    }

    const hash = createHash("sha256");
    let bytes = 0;
    let previousProgress = -1;
    const meter = new Transform({
        transform(chunk, _encoding, callback) {
            bytes += chunk.length;
            hash.update(chunk);
            const progress = Math.floor((bytes / expected.bytes) * 20) * 5;
            if (progress !== previousProgress) {
                previousProgress = progress;
                console.log(`Downloading replay model: ${progress}%`);
            }
            callback(null, chunk);
        },
    });

    try {
        await pipeline(
            Readable.fromWeb(response.body),
            meter,
            createWriteStream(temporaryPath, { flags: "wx" })
        );
        const digest = hash.digest("hex");
        if (bytes !== expected.bytes || digest !== expected.sha256) {
            throw new Error(
                `Downloaded replay model is ${bytes} bytes with SHA-256 ${digest}; expected ${expected.bytes} bytes and ${expected.sha256}`
            );
        }
        await rename(temporaryPath, path);
    } catch (error) {
        await rm(temporaryPath, { force: true });
        throw error;
    }
    return path;
}

function replayCacheRoot() {
    return (
        process.env.SENSEMAKER_MODEL_CACHE ||
        resolve(
            process.env.XDG_CACHE_HOME || resolve(homedir(), ".cache"),
            "civic-ai/sensemaker"
        )
    );
}

export async function prepareReplayModel(expected) {
    const configuredPath = process.env.SENSEMAKER_MODEL_PATH;
    const cacheRoot = replayCacheRoot();
    const path = configuredPath
        ? resolve(configuredPath)
        : resolve(cacheRoot, expected.filename);
    try {
        return await verifyReplayModel(path, expected);
    } catch (error) {
        if (configuredPath || error?.code !== "ENOENT") throw error;
    }
    return downloadReplayModel(path, expected);
}

export async function buildReplayInput(evidence, manifest) {
    const specs = {};
    for (const locale of LOCALES) {
        specs[locale] = await buildGenerationSpec(locale, evidence);
    }
    return {
        model: manifest.model,
        locales: LOCALES,
        runsPerLocale: RUNS_PER_LOCALE,
        loadOptions: {
            n_ctx: GENERATION_OPTIONS.contextLength,
            n_gpu_layers: manifest.runtime.gpuLayers,
            n_threads: manifest.runtime.threads,
            seed: GENERATION_OPTIONS.seed,
        },
        specs,
    };
}

export function replayModelMetadata(manifest, completions) {
    return {
        provider: "wllama",
        name: manifest.model.name,
        digest: manifest.model.sha256,
        format: manifest.model.format,
        family: manifest.model.family,
        parameterSize: manifest.model.parameterSize,
        quantization: manifest.model.quantization,
        repository: manifest.model.repository,
        revision: manifest.model.revision,
        filename: manifest.model.filename,
        license: manifest.model.license,
        runtime: manifest.runtime.package,
        runtimeVersion: manifest.runtime.version,
        runtimeIntegrity: manifest.runtime.integrity,
        launcher: manifest.runtime.launcher,
        backend: manifest.runtime.backend,
        gpuLayers: manifest.runtime.gpuLayers,
        threads: manifest.runtime.threads,
        runtimeAssets: manifest.runtime.assets,
        rawCompletionBytes: Object.fromEntries(
            LOCALES.map((locale) => [
                locale,
                Buffer.byteLength(completions[locale]),
            ])
        ),
        rawCompletionSha256: Object.fromEntries(
            LOCALES.map((locale) => [locale, sha256(completions[locale])])
        ),
    };
}

function browserCandidates() {
    if (process.env.SENSEMAKER_BROWSER) {
        return [process.env.SENSEMAKER_BROWSER];
    }
    if (process.platform === "darwin") {
        return [
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            "/Applications/Chromium.app/Contents/MacOS/Chromium",
            "google-chrome",
            "chromium",
        ];
    }
    if (process.platform === "win32") {
        return [
            resolve(
                process.env.PROGRAMFILES || "C:/Program Files",
                "Google/Chrome/Application/chrome.exe"
            ),
            resolve(
                process.env["PROGRAMFILES(X86)"] || "C:/Program Files (x86)",
                "Google/Chrome/Application/chrome.exe"
            ),
            "chrome.exe",
        ];
    }
    return [
        "google-chrome",
        "google-chrome-stable",
        "chromium",
        "chromium-browser",
    ];
}

async function resolveBrowser() {
    for (const candidate of browserCandidates()) {
        if (candidate.includes("/") || candidate.includes("\\")) {
            try {
                await access(candidate);
                return candidate;
            } catch {
                continue;
            }
        }
        const path = Bun.which(candidate);
        if (path) return path;
    }
    throw new Error(
        "No Chrome or Chromium executable found; set SENSEMAKER_BROWSER"
    );
}

function rangedFileResponse(request, path, contentType) {
    const file = Bun.file(path);
    const headers = {
        "accept-ranges": "bytes",
        "content-type": contentType,
    };
    const range = request.headers.get("range");
    if (!range) {
        headers["content-length"] = `${file.size}`;
        return request.method === "HEAD"
            ? new Response(null, { headers })
            : new Response(file, { headers });
    }

    const match = /^bytes=(\d+)-(\d*)$/.exec(range);
    if (!match) {
        return new Response(null, {
            status: 416,
            headers: { "content-range": `bytes */${file.size}` },
        });
    }
    const start = Number(match[1]);
    const end = match[2] ? Number(match[2]) : file.size - 1;
    if (start > end || end >= file.size) {
        return new Response(null, {
            status: 416,
            headers: { "content-range": `bytes */${file.size}` },
        });
    }
    headers["content-length"] = `${end - start + 1}`;
    headers["content-range"] = `bytes ${start}-${end}/${file.size}`;
    return request.method === "HEAD"
        ? new Response(null, { status: 206, headers })
        : new Response(file.slice(start, end + 1), { status: 206, headers });
}

async function runBrowserReplay({ input, modelPath }) {
    await Promise.all([
        access(REPLAY_HTML_PATH),
        access(WLLAMA_INDEX_PATH),
        access(WLLAMA_WASM_PATH),
    ]);
    const browserPath = await resolveBrowser();
    const { default: puppeteer } = await import("puppeteer-core");
    const profilePath = await mkdtemp(resolve(tmpdir(), "sensemaker-wllama-"));
    const timeoutMs = Number(
        process.env.SENSEMAKER_REPLAY_TIMEOUT_MS || 7_200_000
    );
    let browser;
    let resultSettled = false;
    let settleResult;
    const resultPromise = new Promise((resolveResult) => {
        settleResult = resolveResult;
    });
    const settleOnce = (value) => {
        if (resultSettled) return false;
        resultSettled = true;
        settleResult(value);
        return true;
    };
    const inputJson = stableJson(input);
    let pageRequested = false;

    const server = Bun.serve({
        hostname: "127.0.0.1",
        port: 0,
        async fetch(request) {
            const url = new URL(request.url);
            if (url.pathname === "/" || url.pathname === "/replay.html") {
                if (!pageRequested) {
                    pageRequested = true;
                    console.log("[browser] Replay page opened");
                }
                return rangedFileResponse(
                    request,
                    REPLAY_HTML_PATH,
                    "text/html; charset=utf-8"
                );
            }
            if (url.pathname === "/input.json") {
                return new Response(inputJson, {
                    headers: { "content-type": "application/json" },
                });
            }
            if (url.pathname === "/model.gguf") {
                return rangedFileResponse(
                    request,
                    modelPath,
                    "application/octet-stream"
                );
            }
            if (url.pathname === "/wllama/index.js") {
                return rangedFileResponse(
                    request,
                    WLLAMA_INDEX_PATH,
                    "text/javascript; charset=utf-8"
                );
            }
            if (url.pathname === "/wllama/wasm/wllama.wasm") {
                return rangedFileResponse(
                    request,
                    WLLAMA_WASM_PATH,
                    "application/wasm"
                );
            }
            if (url.pathname === "/progress" && request.method === "POST") {
                console.log(`[browser] ${await request.text()}`);
                return new Response(null, { status: 204 });
            }
            if (url.pathname === "/result" && request.method === "POST") {
                const result = await request.json();
                if (result.error) {
                    settleOnce({ error: result.error });
                } else if (
                    LOCALES.every(
                        (locale) =>
                            typeof result.completions?.[locale] === "string"
                    )
                ) {
                    settleOnce({ completions: result.completions });
                } else {
                    return new Response("Replay is incomplete", {
                        status: 409,
                    });
                }
                return new Response(null, { status: 204 });
            }
            if (url.pathname === "/favicon.ico") {
                return new Response(null, { status: 204 });
            }
            return new Response("Not found", { status: 404 });
        },
    });

    let timeout;
    try {
        browser = await puppeteer.launch({
            executablePath: browserPath,
            headless: true,
            protocolTimeout: timeoutMs,
            userDataDir: profilePath,
            args:
                process.env.SENSEMAKER_BROWSER_NO_SANDBOX === "1"
                    ? ["--no-sandbox"]
                    : [],
        });
        browser.on("disconnected", () => {
            settleOnce({
                error: "Browser disconnected before replay completed",
            });
        });
        const page = await browser.newPage();
        page.on("pageerror", (error) => {
            console.error(`[browser error] ${error.stack || error}`);
            settleOnce({ error: `${error.stack || error}` });
        });
        page.on("console", (message) => {
            if (message.type() === "error") {
                console.error(`[browser console] ${message.text()}`);
            }
        });
        await page.goto(`http://127.0.0.1:${server.port}/`, {
            waitUntil: "load",
            timeout: 30_000,
        });
        const timeoutPromise = new Promise((resolveTimeout) => {
            timeout = setTimeout(
                () =>
                    resolveTimeout({
                        error: `Browser replay timed out after ${timeoutMs} ms`,
                    }),
                timeoutMs
            );
        });
        const outcome = await Promise.race([resultPromise, timeoutPromise]);
        if (outcome.error) throw new Error(outcome.error);
        return outcome.completions;
    } finally {
        clearTimeout(timeout);
        server.stop(true);
        if (browser) {
            const closeResult = await Promise.race([
                browser
                    .close()
                    .then(() => "closed")
                    .catch(() => "closed"),
                new Promise((resolveClose) =>
                    setTimeout(() => resolveClose("timeout"), 10_000)
                ),
            ]);
            if (closeResult === "timeout") {
                browser.process()?.kill("SIGKILL");
            }
        }
        await rm(profilePath, { recursive: true, force: true });
    }
}

async function assertExistingReplay(narratives, model) {
    const narrativePaths = {
        en: resolve(PACKAGE_ROOT, "generated/narrative.en.json"),
        "zh-TW": resolve(PACKAGE_ROOT, "generated/narrative.zh-tw.json"),
    };
    for (const locale of LOCALES) {
        const accepted = await readFile(narrativePaths[locale], "utf8");
        if (accepted !== stableJson(narratives[locale])) {
            throw new Error(
                `${locale}: wllama output differs from the accepted narrative; pass --accept-new only when intentionally replacing reviewed prose`
            );
        }
    }

    const acceptedManifest = JSON.parse(
        await readFile(resolve(PACKAGE_ROOT, "generated/manifest.json"), "utf8")
    );
    if (
        acceptedManifest.model.provider === "wllama" &&
        stableJson(acceptedManifest.model) !== stableJson(model)
    ) {
        throw new Error(
            "wllama model, runtime, or raw completion bytes differ from the accepted replay; pass --accept-new only for an intentional provenance change"
        );
    }
}

export async function regenerateArtifactsWithWllama({
    acceptNew = false,
} = {}) {
    const manifest = await loadReplayModelManifest();
    await verifyReplayRuntime(manifest);
    const modelPath = await prepareReplayModel(manifest.model);
    const evidence = await buildEvidence();
    const input = await buildReplayInput(evidence, manifest);
    const completions = await runBrowserReplay({ input, modelPath });
    const narratives = {};
    for (const locale of LOCALES) {
        const parsed = JSON.parse(completions[locale]);
        narratives[locale] = await validateGeneratedNarrative(
            parsed,
            evidence,
            locale
        );
    }
    validateNarrativePair(narratives.en, narratives["zh-TW"]);
    const model = replayModelMetadata(manifest, completions);
    if (!acceptNew) await assertExistingReplay(narratives, model);
    return writeArtifacts({
        evidence,
        narratives,
        model,
    });
}
