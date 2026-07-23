import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import {
    PACKAGE_ROOT,
    buildEvidence,
    renderReportHtml,
    validateNarrative,
    validateNarrativePair,
    verifyArtifacts,
} from "../src/lib.mjs";

const baseline = JSON.parse(
    await readFile(
        resolve(PACKAGE_ROOT, "source/accepted-baseline.json"),
        "utf8"
    )
);
const evidence = await buildEvidence();
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
