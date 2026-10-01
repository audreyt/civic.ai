import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import {
    PACKAGE_ROOT,
    GENERATION_OPTIONS,
    buildEvidence,
    buildGenerationSpec,
    renderReportHtml,
    validateNarrative,
    validateNarrativePair,
    verifyArtifacts,
} from "../src/lib.mjs";
import {
    buildReplayInput,
    loadReplayModelManifest,
    replayModelMetadata,
    verifyReplayRuntime,
} from "../src/replay-wasm.mjs";

const baseline = JSON.parse(
    await readFile(
        resolve(PACKAGE_ROOT, "source/accepted-baseline.json"),
        "utf8"
    )
);
const evidence = await buildEvidence();
const replayModelManifest = await loadReplayModelManifest();
const model = {
    name: "fixture-model",
    digest: "a".repeat(64),
    ollamaVersion: "fixture-runtime",
};

function acceptedNarrative(locale) {
    return {
        snapshotId: evidence.snapshotId,
        locale,
        ...structuredClone(baseline[locale]),
    };
}

describe("portable browser replay", () => {
    test("pins the public model and local wllama runtime by content identity", async () => {
        expect(replayModelManifest.model).toMatchObject({
            repository: "Qwen/Qwen2.5-1.5B-Instruct-GGUF",
            revision: "dd26da440ef0330c47919d1ecae0966d24022222",
            filename: "qwen2.5-1.5b-instruct-q4_k_m.gguf",
            bytes: 1117320736,
            sha256: "6a1a2eb6d15622bf3c96857206351ba97e1af16c30d7a74ee38970e434e9407e",
            license: "Apache-2.0",
        });
        expect(replayModelManifest.runtime).toMatchObject({
            package: "@wllama/wllama",
            version: "3.5.1",
            launcher: {
                package: "puppeteer-core",
                version: "25.3.0",
            },
            backend: "cpu-wasm-simd",
            gpuLayers: 0,
            threads: 1,
            assets: {
                javascript: {
                    bytes: 357890,
                    sha256: "2ed031e8d61cebd1d4c7d4956a6350f5afc7fa7c678c3a324d66f6df958f67db",
                },
                webassembly: {
                    bytes: 7656521,
                    sha256: "4197ce6d3dc9240c42ee52b4197dc99638875a06b0083901f8a57767338a0cfa",
                },
            },
        });
        await expect(
            verifyReplayRuntime(replayModelManifest)
        ).resolves.toBeUndefined();
    });

    test("builds one shared schema-constrained generation specification", async () => {
        const spec = await buildGenerationSpec("en", evidence);
        expect(spec).toMatchObject({
            max_tokens: 800,
            temperature: 0,
            temp: 0,
            top_k: 1,
            top_p: 1,
            seed: 0,
            cache_prompt: false,
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "civic_deliberation_narrative",
                    strict: true,
                },
            },
        });
        expect(spec.messages.map(({ role }) => role)).toEqual([
            "system",
            "user",
        ]);
        const payload = JSON.parse(spec.messages[1].content);
        expect(payload.snapshotId).toBe(evidence.snapshotId);
        expect(payload.locale).toBe("en");
        expect(payload.evidence.participants).toBeUndefined();
        expect(payload.acceptedBaseline).toEqual(baseline.en);
    });

    test("fixes the CPU execution shape and records raw completion hashes", async () => {
        const input = await buildReplayInput(evidence, replayModelManifest);
        expect(input).toMatchObject({
            locales: ["en", "zh-TW"],
            runsPerLocale: 2,
            loadOptions: {
                n_ctx: GENERATION_OPTIONS.contextLength,
                n_gpu_layers: 0,
                n_threads: 1,
                seed: 0,
            },
        });
        const completions = { en: '{"locale":"en"}', "zh-TW": "華文" };
        const metadata = replayModelMetadata(replayModelManifest, completions);
        expect(metadata).toMatchObject({
            provider: "wllama",
            digest: replayModelManifest.model.sha256,
            runtime: "@wllama/wllama",
            runtimeVersion: "3.5.1",
            launcher: {
                package: "puppeteer-core",
                version: "25.3.0",
            },
            rawCompletionBytes: { en: 15, "zh-TW": 6 },
        });
        expect(metadata.rawCompletionSha256.en).toHaveLength(64);
        expect(metadata.rawCompletionSha256["zh-TW"]).toHaveLength(64);
    });
});

describe("canonical evidence", () => {
    test("uses the checked-in snapshot for both report locales", () => {
        expect(evidence.snapshotId).toBe(
            "39b1eed77ad2caed03c11d38b7f5730b5008f9df14e4c7617dc3b2854b740db0"
        );
        expect(evidence.counts).toEqual({
            clusteredParticipants: 45,
            groups: 3,
            participants: 62,
            sourceSummaryVotersInConversation: 46,
            statements: 20,
            voteEvents: 671,
        });
        expect(
            evidence.statements.filter(
                (statement) => statement.category === "consensus"
            )
        ).toHaveLength(14);
        expect(
            evidence.statements.filter(
                (statement) => statement.category === "difference"
            )
        ).toHaveLength(6);
        expect(evidence.groups.map(({ code, count }) => [code, count])).toEqual(
            [
                ["A", 17],
                ["B", 21],
                ["C", 7],
            ]
        );
    });
});

describe("narrative contract", () => {
    test("accepts grounded bilingual narratives with matching citations", () => {
        const english = validateNarrative(
            acceptedNarrative("en"),
            evidence,
            baseline.en,
            "en"
        );
        const mandarin = validateNarrative(
            acceptedNarrative("zh-TW"),
            evidence,
            baseline["zh-TW"],
            "zh-TW"
        );
        expect(() => validateNarrativePair(english, mandarin)).not.toThrow();
    });

    test("rejects model-authored numbers and changed evidence citations", () => {
        const withNumber = acceptedNarrative("en");
        withNumber.groups[0].summary = `${withNumber.groups[0].summary} 99%`;
        expect(() =>
            validateNarrative(withNumber, evidence, baseline.en, "en")
        ).toThrow("must not contain digits");

        const withChangedCitation = acceptedNarrative("en");
        withChangedCitation.groups[0].statementIds[0] = "0";
        expect(() =>
            validateNarrative(withChangedCitation, evidence, baseline.en, "en")
        ).toThrow("evidence citations changed");
    });
});

describe("generated report", () => {
    test("renders current counts and the shared snapshot without stale copy", () => {
        const html = renderReportHtml(
            evidence,
            acceptedNarrative("en"),
            "en",
            model
        );
        expect(html).toContain(`data-polis-snapshot="${evidence.snapshotId}"`);
        expect(html).toContain("views of 62 participants");
        expect(html).toContain(">671<");
        expect(html).toContain("Group C: Principled Sceptics (7 members)");
        expect(html).not.toContain("views of 61 participants");
        expect(html).not.toContain(">551<");
        expect(html).not.toContain("8 members");
    });

    test("verifies every committed input and output hash", async () => {
        await expect(verifyArtifacts()).resolves.toMatchObject({
            snapshotId: evidence.snapshotId,
            replayRunsPerLocale: 2,
        });
    });
});
