#!/usr/bin/env bun

import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const EXPORT_ID = "r2jstrdchy3udbrf8arjx";
const REPOSITORY = "https://github.com/audreyt/polis-tally";
const TIME_ZONE = "Europe/London";
const SNAPSHOT_DIR = fileURLToPath(
    new URL("../_data/polis_care_snapshot/", import.meta.url)
);
const SOURCE_FILES = {
    summary: `${EXPORT_ID}-summary.csv`,
    comments: `${EXPORT_ID}-comments.csv`,
    votes: `${EXPORT_ID}-votes.csv`,
    participantVotes: `${EXPORT_ID}-participant-votes.csv`,
    commentGroups: `${EXPORT_ID}-comment-groups.csv`,
};

function sha256(value) {
    return createHash("sha256").update(value).digest("hex");
}

function readCommitArgument(argv) {
    const index = argv.indexOf("--commit");
    const commit = index >= 0 ? argv[index + 1] : undefined;
    if (!commit || !/^[0-9a-f]{40}$/.test(commit)) {
        throw new Error(
            "Usage: bun scripts/refresh-polis-care-snapshot.mjs --commit <40-character lowercase git commit>"
        );
    }
    return commit;
}

async function fetchSource(commit, name) {
    const url = `${REPOSITORY.replace("github.com", "raw.githubusercontent.com")}/${commit}/${name}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`${name}: ${response.status} ${response.statusText}`);
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length === 0) {
        throw new Error(`${name}: upstream file is empty`);
    }
    return { bytes, name, sha256: sha256(bytes) };
}

async function main() {
    const commit = readCommitArgument(process.argv.slice(2));
    const entries = await Promise.all(
        Object.entries(SOURCE_FILES).map(async ([key, name]) => [
            key,
            await fetchSource(commit, name),
        ])
    );
    const files = Object.fromEntries(
        entries.map(([key, file]) => [
            key,
            {
                name: file.name,
                bytes: file.bytes.length,
                sha256: file.sha256,
            },
        ])
    );
    const snapshotId = sha256(
        JSON.stringify({
            schemaVersion: 1,
            exportId: EXPORT_ID,
            repository: REPOSITORY,
            commit,
            timeZone: TIME_ZONE,
            files,
        })
    );
    const manifest = {
        schemaVersion: 1,
        snapshotId,
        exportId: EXPORT_ID,
        repository: REPOSITORY,
        commit,
        timeZone: TIME_ZONE,
        files,
    };

    await mkdir(SNAPSHOT_DIR, { recursive: true });
    await Promise.all(
        entries.map(([, file]) =>
            writeFile(new URL(file.name, `file://${SNAPSHOT_DIR}/`), file.bytes)
        )
    );
    await writeFile(
        new URL("manifest.json", `file://${SNAPSHOT_DIR}/`),
        `${JSON.stringify(manifest, null, 4)}\n`
    );

    console.log(`Polis snapshot ${snapshotId} refreshed at ${commit}.`);
}

await main();
