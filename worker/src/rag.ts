import {
    DEFAULT_NEMOTRON_MAX_COMPLETION_TOKENS,
    openAiChatCompletionsEventStreamToText,
    resolveAudreyAiGateway,
    resolveWorkersAiChatModel,
    streamViaGatewayChatCompletions,
    streamViaWorkersAiChat,
    type AudreyGatewayEnv,
} from "@au/cf-ai-gateway";
import { citationFootnotes } from "./citationFootnotes";
import { stubSiteAnswer, textStream } from "./stubAnswer";
import {
    retrieveSiteChunks,
    SITE_EMBEDDING_MODEL,
    type SiteChunk,
    type VectorizeBinding,
} from "./vectorize";

type AiBinding = {
    run: (model: string, input: Record<string, unknown>) => Promise<unknown>;
};

const LANG_INSTRUCTION: Record<string, string> = {
    en: "Answer in English. Cite excerpts with markdown footnote references [^1], [^2] (caret form only; do not paste URLs).",
    zh: "請用繁體中文作答。以 [^1]、[^2] 標註引註（僅用此格式，勿貼網址）。",
};

function chunkFootnoteLabel(c: SiteChunk): string {
    return c.metadata.heading || c.metadata.pageTitle || "Section";
}

function footnoteDefsFromChunks(chunks: SiteChunk[]): string {
    return chunks
        .map(
            (c, i) =>
                `[^${i + 1}]: [${chunkFootnoteLabel(c)}](${c.metadata.url})`
        )
        .join("\n");
}

function buildMessages(
    question: string,
    chunks: SiteChunk[],
    lang: string
): Array<{ role: string; content: string }> {
    const cite = chunks
        .map((c, i) => {
            const label =
                c.metadata.heading || c.metadata.pageTitle || "Section";
            return `[${i + 1}] ${label}\nURL: ${c.metadata.url}\n${c.metadata.content}`;
        })
        .join("\n\n");
    const instruction = LANG_INSTRUCTION[lang] ?? LANG_INSTRUCTION.en;
    const systemContent =
        chunks.length > 0
            ? "You are a helpful assistant for the Civic AI 6-Pack of Care site. Answer only from the excerpts. Be concise. If excerpts are insufficient, say so briefly."
            : "You are a helpful assistant for the Civic AI 6-Pack of Care site. No matching site excerpts were retrieved for this question. Answer briefly if you can, and state that no site excerpts were available for citation.";
    return [
        {
            role: "system",
            content: systemContent,
        },
        {
            role: "user",
            content: `${instruction}\n\nQuestion: ${question}\n\nExcerpts:\n${cite}`,
        },
    ];
}

function retrievalStubMarkdown(
    question: string,
    lang: string,
    chunks: SiteChunk[]
): string {
    const lines = [
        `*(No AI gateway configured; showing retrieved excerpts — lang=${lang})*`,
        "",
        `**${question.trim()}**`,
        "",
    ];
    chunks.forEach((c, i) => {
        const label = chunkFootnoteLabel(c);
        lines.push(`[^${i + 1}] **${label}**`);
        lines.push("");
        lines.push(
            c.metadata.content.slice(0, 400) +
                (c.metadata.content.length > 400 ? "…" : "")
        );
        lines.push("");
    });
    if (chunks.length > 0) {
        lines.push("");
        lines.push(footnoteDefsFromChunks(chunks));
    }
    return lines.join("\n");
}

export async function streamSiteAnswer(
    env:
        | (AudreyGatewayEnv & {
              AI?: AiBinding;
              SITE_VECTORIZE?: VectorizeBinding;
              SITE_EMBEDDING_MODEL?: string;
          })
        | undefined,
    question: string,
    lang: string
): Promise<Response> {
    const bindings = env ?? {};
    const ai = bindings.AI;
    const vectorize = bindings.SITE_VECTORIZE;
    const embeddingModel =
        bindings.SITE_EMBEDDING_MODEL?.trim() || SITE_EMBEDDING_MODEL;
    let chunks: SiteChunk[] = [];
    if (ai && vectorize) {
        chunks = await retrieveSiteChunks(ai, vectorize, question, lang, {
            embeddingModel,
        });
    }
    const respondWithStub = () => {
        const body =
            chunks.length > 0
                ? retrievalStubMarkdown(question, lang, chunks)
                : stubSiteAnswer(question, lang);
        return new Response(textStream(body), {
            status: 200,
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-store",
            },
        });
    };

    const messages = buildMessages(question, chunks, lang);
    const footnotes = chunks.map((c) => {
        const label = c.metadata.heading || c.metadata.pageTitle || "Section";
        return `[${label}](${c.metadata.url})`;
    });
    const respondWithGeneratedText = async (
        openByteStream: () => Promise<ReadableStream<Uint8Array>>
    ): Promise<Response> => {
        try {
            const byteStream = await openByteStream();
            const textStreamOut = byteStream
                .pipeThrough(openAiChatCompletionsEventStreamToText())
                .pipeThrough(citationFootnotes(footnotes))
                .pipeThrough(new TextEncoderStream());
            return new Response(textStreamOut, {
                status: 200,
                headers: {
                    "Content-Type": "text/plain; charset=utf-8",
                    "Cache-Control": "no-store",
                    "X-Accel-Buffering": "no",
                },
            });
        } catch (e) {
            console.error("answer stream failed", e);
            return respondWithStub();
        }
    };

    const gateway = resolveAudreyAiGateway(bindings);
    if (gateway && gateway.kind === "chat") {
        return respondWithGeneratedText(() =>
            streamViaGatewayChatCompletions(
                gateway.config,
                messages,
                DEFAULT_NEMOTRON_MAX_COMPLETION_TOKENS
            )
        );
    }

    const workersAiChatModel = resolveWorkersAiChatModel(
        bindings.AUDREY_MODEL
    );
    if (workersAiChatModel && ai) {
        return respondWithGeneratedText(() =>
            streamViaWorkersAiChat(
                ai,
                workersAiChatModel,
                messages,
                DEFAULT_NEMOTRON_MAX_COMPLETION_TOKENS
            )
        );
    }

    return respondWithStub();
}
