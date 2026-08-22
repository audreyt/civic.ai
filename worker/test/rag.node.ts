import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { URL } from "node:url";
import test from "node:test";
import { streamSiteAnswer } from "../src/rag";
import { retrieveSiteChunks } from "../src/vectorize";

void test("streamSiteAnswer without bindings returns stub stream", async () => {
    const res = await streamSiteAnswer({}, "hello", "en");
    assert.equal(res.status, 200);
    const text = await res.text();
    assert.match(text, /hello/);
    assert.match(text, /Civic AI site index/);
});

void test("rag keeps the gateway and Workers AI chat paths wired", () => {
    const source = readFileSync(
        new URL("../src/rag.ts", import.meta.url),
        "utf8"
    );
    const wrangler = readFileSync(
        new URL("../wrangler.toml", import.meta.url),
        "utf8"
    );
    assert.match(source, /resolveAudreyAiGateway/);
    assert.match(source, /streamViaGatewayChatCompletions/);
    assert.match(source, /resolveWorkersAiChatModel/);
    assert.match(source, /streamViaWorkersAiChat/);
    assert.doesNotMatch(source, /streamViaDirectBasetenChatCompletions/);
    assert.doesNotMatch(source, /BASETEN_API_KEY/);
    assert.match(
        wrangler,
        /AUDREY_MODEL = "@cf\/deepseek-ai\/deepseek-v4-flash-0731"/
    );
});

void test("configured Nemotron streams even when Vectorize has no chunks", async () => {
    const originalFetch = globalThis.fetch;
    const calls: Array<{ url: string; body: string; headers: Headers }> = [];
    globalThis.fetch = (async (
        url: string,
        init?: { body?: string; headers?: unknown }
    ) => {
        calls.push({
            url,
            body: init?.body ?? "",
            headers: new Headers(init?.headers as HeadersInit),
        });
        return new Response(
            'data: {"choices":[{"delta":{"content":"nemotron ok"}}]}\n\n',
            {
                status: 200,
                headers: { "Content-Type": "text/event-stream" },
            }
        );
    }) as typeof fetch;
    try {
        const res = await streamSiteAnswer(
            {
                AUDREY_MODEL: "nemotron-ultra",
                CF_AIG_TOKEN: "test-cf-aig-token",
            },
            "hello",
            "en"
        );
        const text = await res.text();
        assert.equal(text, "nemotron ok");
        assert.equal(calls.length, 1);
        assert.match(calls[0].url, /gateway\.ai\.cloudflare\.com/);
        assert.match(calls[0].url, /baseten/);
        assert.match(calls[0].body, /NVIDIA-Nemotron-3-Ultra/);
        assert.equal(
            calls[0].headers.get("cf-aig-authorization"),
            "Bearer test-cf-aig-token"
        );
        assert.equal(calls[0].headers.get("Authorization"), null);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

void test("a @cf model generates on the Workers AI binding without a gateway hop", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => {
        throw new Error("Workers AI path must not contact the AI Gateway");
    }) as typeof fetch;
    const runs: Array<{ model: string; input: Record<string, unknown> }> = [];
    const sse =
        'data: {"choices":[{"delta":{"content":"workers ai cited answer"}}]}\n\n';
    const ai = {
        run: async (model: string, input: Record<string, unknown>) => {
            runs.push({ model, input });
            return new ReadableStream<Uint8Array>({
                start(controller) {
                    controller.enqueue(new TextEncoder().encode(sse));
                    controller.close();
                },
            });
        },
    };
    try {
        const res = await streamSiteAnswer(
            {
                AUDREY_MODEL: "@cf/deepseek-ai/deepseek-v4-flash-0731",
                AI: ai,
            },
            "hello",
            "en"
        );
        assert.equal(res.status, 200);
        assert.equal(res.headers.get("X-Accel-Buffering"), "no");
        assert.equal(res.headers.get("Cache-Control"), "no-store");
        const text = await res.text();
        assert.equal(text, "workers ai cited answer");
        assert.doesNotMatch(text, /No AI gateway configured/);
        assert.equal(runs.length, 1);
        assert.equal(
            runs[0].model,
            "@cf/deepseek-ai/deepseek-v4-flash-0731"
        );
        assert.equal(runs[0].input.stream, true);
        assert.equal(runs[0].input.max_completion_tokens, 8192);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

void test("with the AI binding present but AUDREY_MODEL unset the worker still returns the graceful stub", async () => {
    let runCalls = 0;
    const ai = {
        run: async () => {
            runCalls += 1;
            return undefined;
        },
    };
    const res = await streamSiteAnswer({ AI: ai }, "hello", "en");
    assert.equal(res.status, 200);
    const text = await res.text();
    assert.match(text, /hello/);
    assert.match(text, /Civic AI site index/);
    assert.equal(runCalls, 0);
});

void test("nemotron-ultra keeps selecting the AI Gateway over the Workers AI binding", async () => {
    const originalFetch = globalThis.fetch;
    const calls: Array<{ url: string }> = [];
    globalThis.fetch = (async (url: string) => {
        calls.push({ url });
        return new Response(
            'data: {"choices":[{"delta":{"content":"nemotron ok"}}]}\n\n',
            {
                status: 200,
                headers: { "Content-Type": "text/event-stream" },
            }
        );
    }) as typeof fetch;
    let runCalls = 0;
    const ai = {
        run: async () => {
            runCalls += 1;
            return undefined;
        },
    };
    try {
        const res = await streamSiteAnswer(
            {
                AUDREY_MODEL: "nemotron-ultra",
                CF_AIG_TOKEN: "test-cf-aig-token",
                AI: ai,
            },
            "hello",
            "en"
        );
        const text = await res.text();
        assert.equal(text, "nemotron ok");
        assert.equal(calls.length, 1);
        assert.match(calls[0].url, /gateway\.ai\.cloudflare\.com/);
        assert.equal(runCalls, 0);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

void test("without any gateway token the worker degrades to the excerpt/stub path", async () => {
    const originalFetch = globalThis.fetch;
    let fetchCalls = 0;
    globalThis.fetch = (async () => {
        fetchCalls += 1;
        throw new Error("gateway must not be contacted without CF_AIG_TOKEN");
    }) as typeof fetch;
    try {
        const res = await streamSiteAnswer(
            { AUDREY_MODEL: "nemotron-ultra" },
            "hello",
            "en"
        );
        assert.equal(res.status, 200);
        const text = await res.text();
        assert.match(text, /hello/);
        assert.match(text, /Civic AI site index/);
        assert.equal(fetchCalls, 0);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

void test("retrieveSiteChunks keeps sibling chunks with distinct metadata ids", async () => {
    const ai = {
        run: async () => ({ data: [[0.1, 0.2, 0.3]] }),
    };
    const vectorize = {
        query: async () => ({
            matches: [
                {
                    score: 0.9,
                    metadata: {
                        id: "hash-1",
                        lang: "en",
                        url: "https://civic.ai/1/#x",
                        heading: "Shared",
                        pageTitle: "Page",
                        content: "first chunk needle",
                    },
                },
                {
                    score: 0.88,
                    metadata: {
                        id: "hash-2",
                        lang: "en",
                        url: "https://civic.ai/1/#x",
                        heading: "Shared",
                        pageTitle: "Page",
                        content: "second chunk needle",
                    },
                },
            ],
        }),
    };

    const chunks = await retrieveSiteChunks(ai, vectorize, "needle", "en", {
        minScore: 0,
    });

    assert.deepEqual(
        chunks.map((chunk) => chunk.id),
        ["hash-1", "hash-2"]
    );
});
