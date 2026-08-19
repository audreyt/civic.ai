import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE_DIR = dirname(fileURLToPath(import.meta.url));
export const PACKAGE_ROOT = resolve(SOURCE_DIR, "..");
export const REPO_ROOT = resolve(PACKAGE_ROOT, "..");
export const GENERATED_DIR = resolve(PACKAGE_ROOT, "generated");

const BASELINE_PATH = resolve(PACKAGE_ROOT, "source/accepted-baseline.json");
const TRANSLATIONS_PATH = resolve(
    PACKAGE_ROOT,
    "source/translations.zh-tw.json"
);
const PROMPT_PATHS = {
    en: resolve(PACKAGE_ROOT, "prompts/en.txt"),
    "zh-TW": resolve(PACKAGE_ROOT, "prompts/zh-tw.txt"),
};
const SNAPSHOT_MANIFEST_PATH = resolve(
    REPO_ROOT,
    "_data/polis_care_snapshot/manifest.json"
);
export const REPLAY_MODEL_MANIFEST_PATH = resolve(
    PACKAGE_ROOT,
    "models/wllama.json"
);

export const LOCALES = ["en", "zh-TW"];
export const DEFAULT_MODEL = "gemma4:12b-it-qat-mtp";
export const GENERATION_OPTIONS = Object.freeze({
    contextLength: 8192,
    maxTokens: 800,
    temperature: 0,
    topK: 1,
    topP: 1,
    seed: 0,
    stream: false,
    think: false,
    cachePrompt: false,
});

const UPSTREAM = Object.freeze({
    repository: "https://github.com/Jigsaw-Code/sensemaking-tools",
    commit: "18b769a1afd6947cbaf2d1cfab2ca43a17b2949c",
    license: "Apache-2.0",
    relationship: "design-lineage",
});

function sortValue(value) {
    if (Array.isArray(value)) return value.map(sortValue);
    if (value && typeof value === "object") {
        return Object.fromEntries(
            Object.keys(value)
                .sort()
                .map((key) => [key, sortValue(value[key])])
        );
    }
    return value;
}

export function stableJson(value) {
    return `${JSON.stringify(sortValue(value), null, 4)}\n`;
}

export function sha256(value) {
    return createHash("sha256").update(value).digest("hex");
}

async function readJson(path) {
    return JSON.parse(await readFile(path, "utf8"));
}

function byId(left, right) {
    return Number(left.id) - Number(right.id);
}

function groupVoteRecord(group) {
    return {
        agrees: group.agrees,
        disagrees: group.disagrees,
        passes: group.passes,
        totalVotes: group.totalVotes,
        agreePct: group.agreePct,
    };
}

export async function buildEvidence() {
    const originalCwd = process.cwd();
    process.chdir(REPO_ROOT);
    let report;
    try {
        const loader = await import(
            new URL("../../_data/polis_care_deliberation.js", import.meta.url)
        );
        report = await loader.default();
    } finally {
        process.chdir(originalCwd);
    }

    const translations = await readJson(TRANSLATIONS_PATH);
    const statements = [...report.statements].sort(byId).map((statement) => {
        const translation = translations[statement.id];
        if (!translation) {
            throw new Error(
                `Missing Traditional Mandarin translation for statement ${statement.id}`
            );
        }
        const groups = Object.fromEntries(
            statement.groupSupport
                .filter((group) => group.internalId !== "none")
                .map((group) => [group.displayCode, groupVoteRecord(group)])
        );
        const agreePcts = Object.values(groups).map((group) => group.agreePct);
        return {
            id: statement.id,
            text: { en: statement.body, "zh-TW": translation },
            category:
                statement.supportRatio >= 0.7 ? "consensus" : "difference",
            totals: {
                agrees: statement.agrees,
                disagrees: statement.disagrees,
                passes: statement.passes,
                totalVotes: statement.totalVotes,
                agreePct: statement.supportPct,
                disagreePct: statement.disagreementPct,
            },
            groupSpreadPct: Math.max(...agreePcts) - Math.min(...agreePcts),
            groups,
        };
    });

    const groups = report.groups
        .filter((group) => !group.isUnclustered)
        .map((group) => ({
            code: group.displayCode,
            internalId: group.internalId,
            count: group.count,
            sharePct: group.sharePct,
            standoutStatementIds: group.standoutStatements.map(
                (statement) => statement.id
            ),
        }));
    const participants = report.participants.map((participant) => ({
        id: participant.id,
        group: participant.group.displayCode,
        plot: participant.plot,
    }));

    return sortValue({
        schemaVersion: 1,
        snapshotId: report.snapshotId,
        exportId: report.exportId,
        source: report.snapshot,
        question: report.question,
        sourceWindow: report.sourceWindow,
        counts: {
            participants: report.stats.participants,
            statements: report.stats.statements,
            voteEvents: report.stats.votes,
            groups: report.stats.clusters,
            clusteredParticipants: report.stats.clusteredParticipants,
            sourceSummaryVotersInConversation:
                report.summary.votersInConversation,
        },
        groups,
        statements,
        participants,
    });
}

export function outputSchema(locale) {
    const groupSchema = {
        type: "object",
        additionalProperties: false,
        required: ["code", "title", "summary", "statementIds"],
        properties: {
            code: { type: "string", enum: ["A", "B", "C"] },
            title: { type: "string" },
            summary: { type: "string" },
            statementIds: {
                type: "array",
                minItems: 4,
                maxItems: 4,
                items: { type: "string" },
            },
        },
    };
    return {
        type: "object",
        additionalProperties: false,
        required: [
            "snapshotId",
            "locale",
            "consensusSummary",
            "differencesSummary",
            "groups",
        ],
        properties: {
            snapshotId: { type: "string" },
            locale: { type: "string", enum: [locale] },
            consensusSummary: { type: "string" },
            differencesSummary: { type: "string" },
            groups: {
                type: "array",
                minItems: 3,
                maxItems: 3,
                items: groupSchema,
            },
        },
    };
}

function modelEvidence(evidence) {
    const { participants: _participants, ...rest } = evidence;
    return rest;
}
export async function buildGenerationSpec(locale, evidence) {
    if (!LOCALES.includes(locale)) {
        throw new Error(`Unsupported locale: ${locale}`);
    }
    const baseline = (await readJson(BASELINE_PATH))[locale];
    const prompt = await readFile(PROMPT_PATHS[locale], "utf8");
    const payload = {
        task: "Produce the publication narrative from the canonical evidence while preserving supported accepted copy.",
        snapshotId: evidence.snapshotId,
        locale,
        evidence: modelEvidence(evidence),
        acceptedBaseline: baseline,
    };
    return sortValue({
        messages: [
            { role: "system", content: prompt },
            { role: "user", content: JSON.stringify(payload) },
        ],
        max_tokens: GENERATION_OPTIONS.maxTokens,
        temperature: GENERATION_OPTIONS.temperature,
        temp: GENERATION_OPTIONS.temperature,
        top_k: GENERATION_OPTIONS.topK,
        top_p: GENERATION_OPTIONS.topP,
        seed: GENERATION_OPTIONS.seed,
        cache_prompt: GENERATION_OPTIONS.cachePrompt,
        response_format: {
            type: "json_schema",
            json_schema: {
                name: "civic_deliberation_narrative",
                strict: true,
                schema: outputSchema(locale),
            },
        },
    });
}

async function fetchJson(url, init) {
    const response = await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(300_000),
    });
    if (!response.ok) {
        throw new Error(`${url}: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

export async function getModelMetadata({
    baseUrl = process.env.SENSEMAKER_OLLAMA_URL || "http://127.0.0.1:11434",
    model = process.env.SENSEMAKER_MODEL || DEFAULT_MODEL,
} = {}) {
    const [version, tags] = await Promise.all([
        fetchJson(`${baseUrl}/api/version`),
        fetchJson(`${baseUrl}/api/tags`),
    ]);
    const installed = tags.models?.find(
        (candidate) => candidate.name === model || candidate.model === model
    );
    if (!installed) {
        throw new Error(`Ollama model is not installed: ${model}`);
    }
    return sortValue({
        provider: "ollama",
        name: model,
        digest: installed.digest,
        format: installed.details?.format ?? null,
        family: installed.details?.family ?? null,
        parameterSize: installed.details?.parameter_size ?? null,
        quantization: installed.details?.quantization_level ?? null,
        ollamaVersion: version.version,
    });
}

async function callModel({ baseUrl, model, spec }) {
    const response = await fetchJson(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
            model,
            stream: GENERATION_OPTIONS.stream,
            think: GENERATION_OPTIONS.think,
            format: spec.response_format.json_schema.schema,
            options: {
                temperature: GENERATION_OPTIONS.temperature,
                top_k: GENERATION_OPTIONS.topK,
                top_p: GENERATION_OPTIONS.topP,
                seed: GENERATION_OPTIONS.seed,
                num_ctx: GENERATION_OPTIONS.contextLength,
                num_predict: GENERATION_OPTIONS.maxTokens,
            },
            messages: spec.messages,
        }),
    });
    const content = response.message?.content;
    if (typeof content !== "string") {
        throw new Error("Ollama response did not contain message.content");
    }
    try {
        return JSON.parse(content);
    } catch (error) {
        throw new Error("Ollama response was not valid JSON", { cause: error });
    }
}

function assertProse(value, label, minimum, maximum) {
    if (typeof value !== "string") {
        throw new Error(`${label} must be a string`);
    }
    const length = [...value].length;
    if (length < minimum || length > maximum) {
        throw new Error(`${label} must be ${minimum}-${maximum} characters`);
    }
    if (/[0-9０-９]/u.test(value)) {
        throw new Error(`${label} must not contain digits`);
    }
    if (/[<>{}]/u.test(value) || value.includes("```")) {
        throw new Error(`${label} must not contain markup`);
    }
    if (value.includes("Pol.is")) {
        throw new Error(`${label} must use Polis, not Pol.is`);
    }
}

export function validateNarrative(narrative, evidence, baseline, locale) {
    if (narrative.snapshotId !== evidence.snapshotId) {
        throw new Error(
            `${locale}: narrative snapshotId does not match evidence`
        );
    }
    if (narrative.locale !== locale) {
        throw new Error(`${locale}: narrative locale does not match`);
    }
    assertProse(
        narrative.consensusSummary,
        `${locale} consensusSummary`,
        locale === "zh-TW" ? 15 : 40,
        500
    );
    assertProse(
        narrative.differencesSummary,
        `${locale} differencesSummary`,
        locale === "zh-TW" ? 15 : 40,
        500
    );
    if (!Array.isArray(narrative.groups) || narrative.groups.length !== 3) {
        throw new Error(
            `${locale}: narrative must contain exactly three groups`
        );
    }

    const statementIds = new Set(
        evidence.statements.map((statement) => statement.id)
    );
    for (let index = 0; index < baseline.groups.length; index += 1) {
        const expected = baseline.groups[index];
        const actual = narrative.groups[index];
        if (actual?.code !== expected.code) {
            throw new Error(`${locale}: group order or code changed`);
        }
        assertProse(
            actual.title,
            `${locale} group ${actual.code} title`,
            2,
            80
        );
        assertProse(
            actual.summary,
            `${locale} group ${actual.code} summary`,
            locale === "zh-TW" ? 25 : 40,
            600
        );
        if (
            !Array.isArray(actual.statementIds) ||
            actual.statementIds.length !== expected.statementIds.length ||
            actual.statementIds.some(
                (id, citationIndex) =>
                    id !== expected.statementIds[citationIndex] ||
                    !statementIds.has(id)
            )
        ) {
            throw new Error(
                `${locale}: group ${actual.code} evidence citations changed`
            );
        }
    }
    return sortValue(narrative);
}
export async function validateGeneratedNarrative(narrative, evidence, locale) {
    const baseline = (await readJson(BASELINE_PATH))[locale];
    return validateNarrative(narrative, evidence, baseline, locale);
}

export function validateNarrativePair(english, mandarin) {
    for (let index = 0; index < english.groups.length; index += 1) {
        if (
            JSON.stringify(english.groups[index].statementIds) !==
            JSON.stringify(mandarin.groups[index].statementIds)
        ) {
            throw new Error(
                `Bilingual evidence citations differ for group ${english.groups[index].code}`
            );
        }
    }
}

export async function generateNarrative(locale, evidence, options = {}) {
    const baseUrl =
        options.baseUrl ||
        process.env.SENSEMAKER_OLLAMA_URL ||
        "http://127.0.0.1:11434";
    const model =
        options.model || process.env.SENSEMAKER_MODEL || DEFAULT_MODEL;
    const spec = await buildGenerationSpec(locale, evidence);
    const candidate = await callModel({ baseUrl, model, spec });
    return validateGeneratedNarrative(candidate, evidence, locale);
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function statementText(statement, locale) {
    return statement.text[locale];
}

function barHtml(votes) {
    const passPct = Math.max(0, 100 - votes.agreePct - votes.disagreePct);
    return `<div class="polis-bar"><div class="polis-bar-agree" style="width:${votes.agreePct}%"></div>${votes.disagreePct > 0 ? `<div class="polis-bar-disagree" style="width:${votes.disagreePct}%"></div>` : ""}</div><div class="polis-bar-labels"><span class="polis-label-agree">${votes.agreePct}% ${votes._locale === "zh-TW" ? "同意" : "agree"}</span>${votes.disagreePct > 0 ? ` <span class="polis-label-disagree">${votes.disagreePct}% ${votes._locale === "zh-TW" ? "不同意" : "disagree"}</span>` : ""}${passPct > 0 ? ` <span>${passPct}% ${votes._locale === "zh-TW" ? "略過" : "pass"}</span>` : ""}</div>`;
}

function statementCard(statement, locale, showGroups, badge) {
    const zh = locale === "zh-TW";
    const totals = { ...statement.totals, _locale: locale };
    const groupBars = showGroups
        ? `<div class="polis-group-bars">${Object.entries(statement.groups)
              .map(
                  ([code, votes]) =>
                      `<div class="polis-group-bar"><span class="polis-group-name polis-g${code.toLowerCase()}">${code}</span><div class="polis-bar"><div class="polis-bar-agree" style="width:${votes.agreePct}%"></div>${votes.disagrees > 0 ? `<div class="polis-bar-disagree" style="width:${Math.round((votes.disagrees / votes.totalVotes) * 100)}%"></div>` : ""}</div><span class="polis-group-pct">${votes.agreePct}%</span></div>`
              )
              .join("")}</div>`
        : "";
    return `<div class="polis-statement" id="statement-${statement.id}" data-statement-id="${statement.id}">${badge ? `<span class="polis-consensus-badge">${zh ? "廣泛共識" : "Broad agreement"}</span>` : ""}<p class="polis-statement-text">${escapeHtml(statementText(statement, locale))} <a href="#statement-${statement.id}" aria-label="${zh ? "陳述" : "Statement"} ${statement.id}">[#${statement.id}]</a></p>${barHtml(totals)}${groupBars}</div>`;
}

function beeswarmHtml(statements, locale) {
    const zh = locale === "zh-TW";
    const circles = statements
        .map((statement, index) => {
            const balance =
                1 -
                Math.abs(
                    statement.totals.agreePct - statement.totals.disagreePct
                ) /
                    100;
            const x = (
                50 +
                Math.max(balance, statement.groupSpreadPct / 100) * 500
            ).toFixed(1);
            const y = (45 + (index % 4) * 18).toFixed(1);
            const fill =
                statement.totals.agreePct >= 70
                    ? "#2a7f8a"
                    : statement.totals.disagreePct > statement.totals.agreePct
                      ? "#c4614a"
                      : "#4c5b66";
            return `<a href="#statement-${statement.id}"><circle cx="${x}" cy="${y}" r="7" fill="${fill}" opacity="0.82"><title>#${statement.id}: ${escapeHtml(statementText(statement, locale))} (${statement.totals.agreePct}% ${zh ? "同意" : "agree"})</title></circle></a>`;
        })
        .join("");
    return `<svg class="polis-beeswarm" viewBox="0 0 600 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${zh ? "陳述分歧程度圖" : "Statement divisiveness chart"}"><title>${zh ? "對話中的共識與分歧" : "Consensus and difference in the conversation"}</title><line x1="50" y1="122" x2="550" y2="122" stroke="var(--border)" stroke-width="1.5"/><text x="50" y="140" fill="var(--muted)" font-family="var(--sans)" font-size="10" font-weight="600">${zh ? "共識" : "Consensus"}</text><text x="550" y="140" fill="var(--muted)" font-family="var(--sans)" font-size="10" font-weight="600" text-anchor="end">${zh ? "分歧" : "Difference"}</text>${circles}</svg><p class="figure-caption">${zh ? "每個點代表一項陳述；位置由整體意見平衡與群組差距確定性計算。" : "Each dot is a statement; position is deterministically calculated from the overall balance and cross-group spread."}</p>`;
}

function participantPlotHtml(evidence, locale) {
    const zh = locale === "zh-TW";
    const colors = { A: "#2a7f8a", B: "#c4614a", C: "#b8860b", U: "#6c7a89" };
    const circles = evidence.participants
        .map(
            (participant) =>
                `<circle cx="${participant.plot.x}" cy="${participant.plot.y}" r="4.5" fill="${colors[participant.group]}" opacity="${participant.group === "U" ? "0.45" : "0.78"}"><title>${zh ? "參與者" : "Participant"} ${escapeHtml(participant.id)} · ${participant.group}</title></circle>`
        )
        .join("");
    return `<svg class="polis-dot-plot" viewBox="0 0 640 460" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${zh ? "參與者意見圖" : "Participant opinion map"}"><title>${zh ? "依投票相似度排列的參與者" : "Participants positioned by voting similarity"}</title><rect width="640" height="460" rx="8" fill="var(--warm)" stroke="var(--border)" stroke-width="1"/>${circles}</svg><p class="figure-caption">${zh ? "每個點代表一位參與者。A、B、C 為明確分群；灰色 U 代表未分群。距離表示投票模式相似度，而非人口特徵。" : "Each dot is a participant. A, B, and C are explicit group assignments; grey U is unclustered. Distance reflects voting similarity, not demographics."}</p>`;
}

function citationList(groupNarrative, evidence, locale) {
    const zh = locale === "zh-TW";
    const statements = new Map(
        evidence.statements.map((statement) => [statement.id, statement])
    );
    return `<ul>${groupNarrative.statementIds
        .map((id) => {
            const statement = statements.get(id);
            const selected = statement.groups[groupNarrative.code];
            const comparison = Object.entries(statement.groups)
                .filter(([code]) => code !== groupNarrative.code)
                .map(([code, votes]) => `${code} ${votes.agreePct}%`)
                .join(zh ? "、" : ", ");
            return `<li><strong>${selected.agreePct}% ${zh ? "同意" : "agree"}</strong> — ${escapeHtml(statementText(statement, locale))} <a href="#statement-${id}">[#${id}]</a> <span class="figure-caption">(${comparison})</span></li>`;
        })
        .join("")}</ul>`;
}

export function renderReportHtml(evidence, narrative, locale, model) {
    const zh = locale === "zh-TW";
    const consensus = evidence.statements.filter(
        (statement) => statement.category === "consensus"
    );
    const differences = evidence.statements.filter(
        (statement) => statement.category === "difference"
    );
    const groupByCode = new Map(
        evidence.groups.map((group) => [group.code, group])
    );
    const statCards = [
        [evidence.counts.participants, zh ? "參與者" : "Participants"],
        [evidence.counts.statements, zh ? "陳述" : "Statements"],
        [evidence.counts.voteEvents, zh ? "投票事件" : "Vote events"],
        [evidence.counts.groups, zh ? "意見群組" : "Opinion groups"],
    ]
        .map(
            ([value, label]) =>
                `<div class="polis-stat"><div class="polis-stat-num">${value}</div><div class="polis-stat-label">${label}</div></div>`
        )
        .join("");
    const groupSections = narrative.groups
        .map((groupNarrative) => {
            const group = groupByCode.get(groupNarrative.code);
            return `<div class="polis-group polis-group-${group.code.toLowerCase()}"><h4 id="group-${group.code.toLowerCase()}">${zh ? "群組" : "Group"} ${group.code}: ${escapeHtml(groupNarrative.title)} (${group.count} ${zh ? "位成員" : group.count === 1 ? "member" : "members"})</h4><p>${escapeHtml(groupNarrative.summary)}</p>${citationList(groupNarrative, evidence, locale)}</div>`;
        })
        .join("\n");
    const runtimeLabel =
        model.provider === "wllama"
            ? `wllama ${model.runtimeVersion}`
            : `Ollama ${model.ollamaVersion}`;
    const modelLabel = `${model.name} · ${model.digest.slice(0, 12)} · ${runtimeLabel}`;

    return `<div class="polis-generated-report" data-polis-snapshot="${evidence.snapshotId}">
<p>${zh ? `本報告彙集了在牛津大學羅德樓舉辦的 <a href="/tw/conference/">2026 仁工智慧研討會</a>中 ${evidence.counts.participants} 位參與者的意見。所有統計、圖表與敘事皆綁定同一份 Polis 快照。` : `This report captures the views of ${evidence.counts.participants} participants at the <a href="/conference/">Civic AI Conference 2026</a> at Rhodes House, Oxford. Every statistic, chart, and narrative is bound to the same Polis snapshot.`}</p>
<div class="polis-overview">${statCards}</div>
${beeswarmHtml(evidence.statements, locale)}
<h3 id="what-we-agree-on">${zh ? "共同立場" : "What We Agree On"}</h3>
<p>${escapeHtml(narrative.consensusSummary)}</p>
${consensus.map((statement, index) => statementCard(statement, locale, false, index < 5)).join("\n")}
<h3 id="where-opinions-differ">${zh ? "意見分歧之處" : "Where Opinions Differ"}</h3>
<p>${escapeHtml(narrative.differencesSummary)}</p>
${differences.map((statement) => statementCard(statement, locale, true, false)).join("\n")}
<h3 id="three-perspectives">${zh ? "三種觀點" : "Three Perspectives"}</h3>
<p>${zh ? "群組依照投票模式形成，不使用人口統計資料。下列敘事由本地模型根據同一份證據產生；數字與引用則由確定性 renderer 加入。" : "Groups are formed from voting patterns, not demographic data. The narratives below are generated locally from the same evidence; every number and citation is added by the deterministic renderer."}</p>
${participantPlotHtml(evidence, locale)}
${groupSections}
<h3 id="replay-and-provenance">${zh ? "重播與來源" : "Replay and provenance"}</h3>
<p>${zh ? `三個群組敘事以 ${evidence.counts.clusteredParticipants} 筆明確分群資料為準。來源摘要記載 ${evidence.counts.sourceSummaryVotersInConversation} 位對話參與者，但 participant export 只有 ${evidence.counts.clusteredParticipants} 筆群組指派，因此不把兩者混為同一數字。` : `The three group narratives use the ${evidence.counts.clusteredParticipants} explicit participant-group assignments. The source summary records ${evidence.counts.sourceSummaryVotersInConversation} voters in conversation, while the participant export contains ${evidence.counts.clusteredParticipants} assignments, so the report does not silently treat those counts as identical.`}</p>
<p>${zh ? `快照 <code>${evidence.snapshotId}</code>；模型執行 <code>${escapeHtml(modelLabel)}</code>。每種語言皆以 batch size one 連續生成兩次，只有 canonical JSON 完全相同才會寫入。` : `Snapshot <code>${evidence.snapshotId}</code>; model run <code>${escapeHtml(modelLabel)}</code>. Each locale is generated twice sequentially at batch size one and written only when the canonical JSON is identical.`}</p>
<p><a href="${zh ? "/tw/conference/sensemaking/" : "/conference/sensemaking/"}">${zh ? "以同一份快照開啟完整集體感知視圖" : "Open the full sensemaking view built from this same snapshot"}</a> · <a href="${evidence.source.repository}/tree/${evidence.source.commit}">${zh ? "固定來源資料" : "Pinned source data"}</a></p>
</div>
`;
}

async function descriptor(path) {
    const bytes = await readFile(path);
    return {
        path: relative(REPO_ROOT, path).replaceAll("\\", "/"),
        bytes: bytes.length,
        sha256: sha256(bytes),
    };
}

function generatedPaths() {
    return {
        evidence: resolve(GENERATED_DIR, "evidence.json"),
        narrativeEn: resolve(GENERATED_DIR, "narrative.en.json"),
        narrativeZhTw: resolve(GENERATED_DIR, "narrative.zh-tw.json"),
        reportEn: resolve(GENERATED_DIR, "report.en.html"),
        reportZhTw: resolve(GENERATED_DIR, "report.zh-tw.html"),
        manifest: resolve(GENERATED_DIR, "manifest.json"),
    };
}

async function buildManifest(evidence, model) {
    const paths = generatedPaths();
    const filePaths = {
        snapshotManifest: SNAPSHOT_MANIFEST_PATH,
        translations: TRANSLATIONS_PATH,
        acceptedBaseline: BASELINE_PATH,
        promptEn: PROMPT_PATHS.en,
        promptZhTw: PROMPT_PATHS["zh-TW"],
        generatorLib: resolve(PACKAGE_ROOT, "src/lib.mjs"),
        generatorCli: resolve(PACKAGE_ROOT, "src/cli.mjs"),
        replayWasm: resolve(PACKAGE_ROOT, "src/replay-wasm.mjs"),
        replayHtml: resolve(PACKAGE_ROOT, "src/replay.html"),
        replayModelManifest: REPLAY_MODEL_MANIFEST_PATH,
        packageJson: resolve(PACKAGE_ROOT, "package.json"),
        evidence: paths.evidence,
        narrativeEn: paths.narrativeEn,
        narrativeZhTw: paths.narrativeZhTw,
        reportEn: paths.reportEn,
        reportZhTw: paths.reportZhTw,
    };
    const files = {};
    for (const [key, path] of Object.entries(filePaths)) {
        files[key] = await descriptor(path);
    }
    return sortValue({
        schemaVersion: 1,
        generatorVersion: 2,
        snapshotId: evidence.snapshotId,
        replayRunsPerLocale: 2,
        model,
        decoding: GENERATION_OPTIONS,
        upstream: UPSTREAM,
        files,
    });
}

export async function writeArtifacts({ evidence, narratives, model }) {
    validateNarrativePair(narratives.en, narratives["zh-TW"]);
    await mkdir(GENERATED_DIR, { recursive: true });
    const paths = generatedPaths();
    await writeFile(paths.evidence, stableJson(evidence));
    await writeFile(paths.narrativeEn, stableJson(narratives.en));
    await writeFile(paths.narrativeZhTw, stableJson(narratives["zh-TW"]));
    await writeFile(
        paths.reportEn,
        renderReportHtml(evidence, narratives.en, "en", model)
    );
    await writeFile(
        paths.reportZhTw,
        renderReportHtml(evidence, narratives["zh-TW"], "zh-TW", model)
    );
    const manifest = await buildManifest(evidence, model);
    await writeFile(paths.manifest, stableJson(manifest));
    return manifest;
}

export async function regenerateArtifacts(options = {}) {
    const evidence = await buildEvidence();
    const model = await getModelMetadata(options);
    const narratives = {};
    for (const locale of LOCALES) {
        const first = await generateNarrative(locale, evidence, options);
        const second = await generateNarrative(locale, evidence, options);
        if (stableJson(first) !== stableJson(second)) {
            throw new Error(`${locale}: deterministic replay mismatch`);
        }
        narratives[locale] = first;
    }
    return writeArtifacts({ evidence, narratives, model });
}

export async function verifyArtifacts() {
    const paths = generatedPaths();
    const manifest = await readJson(paths.manifest);
    const evidence = await buildEvidence();
    const committedEvidence = await readJson(paths.evidence);
    if (stableJson(evidence) !== stableJson(committedEvidence)) {
        throw new Error("Generated evidence is stale relative to the snapshot");
    }
    if (manifest.snapshotId !== evidence.snapshotId) {
        throw new Error("Generated manifest uses a different snapshot");
    }
    if (
        manifest.replayRunsPerLocale !== 2 ||
        stableJson(manifest.decoding) !== stableJson(GENERATION_OPTIONS)
    ) {
        throw new Error("Generated manifest has incompatible replay settings");
    }

    const baseline = await readJson(BASELINE_PATH);
    const narratives = {
        en: validateNarrative(
            await readJson(paths.narrativeEn),
            evidence,
            baseline.en,
            "en"
        ),
        "zh-TW": validateNarrative(
            await readJson(paths.narrativeZhTw),
            evidence,
            baseline["zh-TW"],
            "zh-TW"
        ),
    };
    validateNarrativePair(narratives.en, narratives["zh-TW"]);

    const expectedHtml = {
        reportEn: renderReportHtml(
            evidence,
            narratives.en,
            "en",
            manifest.model
        ),
        reportZhTw: renderReportHtml(
            evidence,
            narratives["zh-TW"],
            "zh-TW",
            manifest.model
        ),
    };
    for (const [key, html] of Object.entries(expectedHtml)) {
        const path = key === "reportEn" ? paths.reportEn : paths.reportZhTw;
        if ((await readFile(path, "utf8")) !== html) {
            throw new Error(`${key} is stale relative to its narrative`);
        }
    }

    const rebuilt = await buildManifest(evidence, manifest.model);
    if (stableJson(rebuilt) !== stableJson(manifest)) {
        throw new Error("Generated manifest hashes do not match the artifacts");
    }
    return manifest;
}
