import { buildEvidence } from "../src/lib.mjs";

const model = process.env.SENSEMAKER_DECISION_MODEL || "clef";
const baseUrl = process.env.SENSEMAKER_OLLAMA_URL || "http://127.0.0.1:11434";
const limit = Number(process.env.SENSEMAKER_CLEF_LIMIT || 8);
const evidence = await buildEvidence();
const statements = evidence.statements.slice(0, limit);
const results = [];

for (const statement of statements) {
    const response = await fetch(`${baseUrl}/v1/systemone`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: AbortSignal.timeout(180_000),
        body: JSON.stringify({
            model,
            keep_alive: "10m",
            state: statement.text.en,
            questions: {
                topic: {
                    type: "choice",
                    instructions: "Which topic does this comment belong under?",
                    criteria: {
                        care: "Care homes, dementia, or family caregiving",
                        government: "Government or public administration",
                        everyday:
                            "Everyday public life outside care and government",
                        other: "Does not fit the other topics",
                    },
                },
                accepts_imperfect_ai: {
                    type: "noul",
                    instructions:
                        "Does the comment accept imperfect AI if it helps people in care?",
                    criteria: {
                        true: "The comment accepts or prefers an imperfect AI aid",
                        false: "The comment rejects AI aid, or does not address it",
                    },
                },
            },
        }),
    });
    const body = await response.json();
    if (!response.ok) {
        results.push({ id: statement.id, error: body });
        continue;
    }
    results.push({
        id: statement.id,
        text: statement.text.en,
        topic: body.answers.topic.choice,
        topic_p: body.answers.topic.probabilities,
        accepts: body.answers.accepts_imperfect_ai.noul,
        tokens: body.usage?.input_tokens,
    });
}

const failed = results.some((row) => row.error);
console.log(JSON.stringify({ ok: !failed, model, n: results.length, results }));
if (failed) process.exit(1);
