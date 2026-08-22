import { Hono } from "hono";
import { createAskCors } from "@au/cf-ai-gateway";
import { resolveQueryLang } from "./lang";
import { streamSiteAnswer } from "./rag";
import type { VectorizeBinding } from "./vectorize";

export type Env = {
    AUDREY_MODEL?: string;
    // The Baseten credential is a stored provider key on the Cloudflare AI
    // Gateway side, so only the gateway run token is needed here.
    CF_AIG_TOKEN?: string;
    CF_AIG_ACCOUNT_ID?: string;
    CF_AI_GATEWAY_ACCOUNT_ID?: string;
    CF_AI_GATEWAY_ID?: string;
    BASETEN_MODEL?: string;
    SITE_EMBEDDING_MODEL?: string;
    AI?: {
        run: (
            model: string,
            input: Record<string, unknown>
        ) => Promise<unknown>;
    };
    SITE_VECTORIZE?: VectorizeBinding;
};

const MAX_QUESTION_CHARS = 100;

const askCors = createAskCors({
    allowedOrigins: [
        "https://civic.ai",
        "https://www.civic.ai",
        "https://civic-ai-ask.audreyt.workers.dev",
        "http://localhost:4321",
        "http://127.0.0.1:4321",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
});

function decodeRouteParam(value: string): string {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

function isQuestionTooLong(question: string): boolean {
    return Array.from(question.trim()).length > MAX_QUESTION_CHARS;
}

const app = new Hono<{ Bindings: Env }>();

app.options("/au/:question", (c) => askCors.preflight(c.req.raw));
app.options("/capacity", (c) => askCors.preflight(c.req.raw));

app.get("/capacity", (c) => {
    const res = c.json({ status: "available" as const }, 200, {
        "Cache-Control": "public, max-age=5, s-maxage=5",
    });
    return askCors.apply(c.req.raw, res);
});

app.get("/au/:question", async (c) => {
    const lang = resolveQueryLang(c.req.query("lang"));
    const question = decodeRouteParam(c.req.param("question")).trim();
    if (!question) {
        return askCors.apply(c.req.raw, c.text("Missing question.", 400));
    }
    if (isQuestionTooLong(question)) {
        return askCors.apply(
            c.req.raw,
            c.text("Question too long (max 100 characters).", 400)
        );
    }

    const res = await streamSiteAnswer(c.env, question, lang);
    return askCors.apply(c.req.raw, res);
});

app.get("/", (c) => c.text("civic-ai-ask worker"));

export default app;
