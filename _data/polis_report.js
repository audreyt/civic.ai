import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const REPO_ROOT = process.cwd();
const MANIFEST_PATH = resolve(REPO_ROOT, "sensemaker/generated/manifest.json");
const EXPECTED_PATHS = {
    acceptedBaseline: "sensemaker/source/accepted-baseline.json",
    evidence: "sensemaker/generated/evidence.json",
    narrativeEn: "sensemaker/generated/narrative.en.json",
    narrativeZhTw: "sensemaker/generated/narrative.zh-tw.json",
    promptEn: "sensemaker/prompts/en.txt",
    promptZhTw: "sensemaker/prompts/zh-tw.txt",
    generatorLib: "sensemaker/src/lib.mjs",
    generatorCli: "sensemaker/src/cli.mjs",
    packageJson: "sensemaker/package.json",
    reportEn: "sensemaker/generated/report.en.html",
    reportZhTw: "sensemaker/generated/report.zh-tw.html",
    snapshotManifest: "_data/polis_care_snapshot/manifest.json",
    translations: "sensemaker/source/translations.zh-tw.json",
};

function sha256(value) {
    return createHash("sha256").update(value).digest("hex");
}

function loadArtifacts() {
    const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
    if (
        manifest.schemaVersion !== 1 ||
        !/^[0-9a-f]{64}$/.test(manifest.snapshotId ?? "")
    ) {
        throw new Error("Sensemaker manifest is incompatible");
    }

    const contents = {};
    for (const [key, expectedPath] of Object.entries(EXPECTED_PATHS)) {
        const descriptor = manifest.files?.[key];
        if (
            descriptor?.path !== expectedPath ||
            !Number.isSafeInteger(descriptor.bytes) ||
            !/^[0-9a-f]{64}$/.test(descriptor.sha256 ?? "")
        ) {
            throw new Error(`Sensemaker manifest has an invalid ${key} entry`);
        }
        const bytes = readFileSync(resolve(REPO_ROOT, expectedPath));
        if (
            bytes.length !== descriptor.bytes ||
            sha256(bytes) !== descriptor.sha256
        ) {
            throw new Error(
                `${expectedPath} does not match the sensemaker manifest`
            );
        }
        contents[key] = bytes.toString("utf8");
    }

    const snapshotManifest = JSON.parse(contents.snapshotManifest);
    if (snapshotManifest.snapshotId !== manifest.snapshotId) {
        throw new Error(
            "Sensemaking and narrative artifacts use different Polis snapshots"
        );
    }
    for (const key of ["reportEn", "reportZhTw"]) {
        if (
            !contents[key].includes(
                `data-polis-snapshot="${manifest.snapshotId}"`
            )
        ) {
            throw new Error(`${key} does not declare the shared snapshot`);
        }
    }
    return { contents, manifest };
}

const artifacts = loadArtifacts();

export const polisReportManifest = artifacts.manifest;

export function renderPolisReport(lang) {
    return String(lang ?? "")
        .toLowerCase()
        .startsWith("zh")
        ? artifacts.contents.reportZhTw
        : artifacts.contents.reportEn;
}
