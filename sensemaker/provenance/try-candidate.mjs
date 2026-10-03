import {
    buildEvidence,
    buildGenerationSpec,
    validateGeneratedNarrative,
} from "../src/lib.mjs";

const model = process.env.SENSEMAKER_MODEL || "granite4.2:30b";
const locale = process.argv[2] || "en";
const baseUrl = process.env.SENSEMAKER_OLLAMA_URL || "http://127.0.0.1:11434";
const evidence = await buildEvidence();
const spec = await buildGenerationSpec(locale, evidence);
const started = Date.now();
const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    signal: AbortSignal.timeout(600_000),
    body: JSON.stringify({
        model,
        stream: false,
        think: false,
        keep_alive: "30m",
        format: spec.response_format.json_schema.schema,
        options: {
            temperature: 0,
            top_k: 1,
            top_p: 1,
            seed: 0,
            num_ctx: 8192,
            num_predict: 800,
        },
        messages: spec.messages,
    }),
});
const body = await response.json();
if (!response.ok) {
    console.error(
        JSON.stringify({ ok: false, status: response.status, error: body })
    );
    process.exit(1);
}
const content = body.message?.content ?? "";
let narrative;
try {
    narrative = JSON.parse(content);
} catch (error) {
    console.error(
        JSON.stringify({
            ok: false,
            error: "not json",
            sample: content.slice(0, 500),
        })
    );
    process.exit(1);
}
try {
    const valid = await validateGeneratedNarrative(narrative, evidence, locale);
    console.log(
        JSON.stringify({
            ok: true,
            model,
            locale,
            elapsedSeconds: Math.round((Date.now() - started) / 1000),
            promptTokens: body.prompt_eval_count,
            evalTokens: body.eval_count,
            narrative: valid,
        })
    );
} catch (error) {
    console.error(
        JSON.stringify({
            ok: false,
            model,
            locale,
            elapsedSeconds: Math.round((Date.now() - started) / 1000),
            error: String(error.message || error),
            narrative,
        })
    );
    process.exit(1);
}
