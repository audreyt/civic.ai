#!/usr/bin/env bun

import {
    buildEvidence,
    regenerateArtifacts,
    stableJson,
    verifyArtifacts,
} from "./lib.mjs";

const command = process.argv[2];

if (command === "extract") {
    process.stdout.write(stableJson(await buildEvidence()));
} else if (command === "regenerate") {
    const manifest = await regenerateArtifacts();
    console.log(
        `Regenerated both report locales from snapshot ${manifest.snapshotId}.`
    );
} else if (command === "regenerate:wasm") {
    const { regenerateArtifactsWithWllama } = await import("./replay-wasm.mjs");
    const manifest = await regenerateArtifactsWithWllama({
        acceptNew: process.argv.includes("--accept-new"),
    });
    console.log(
        `Replayed both report locales with wllama from snapshot ${manifest.snapshotId}.`
    );
} else if (command === "verify") {
    const manifest = await verifyArtifacts();
    console.log(
        `Verified both report locales against snapshot ${manifest.snapshotId}.`
    );
} else {
    throw new Error(
        "Usage: bun src/cli.mjs <extract|regenerate|regenerate:wasm|verify>"
    );
}
