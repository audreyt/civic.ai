import { readFileSync } from "node:fs";
import { join } from "node:path";

export function formalSourceResponse(relativePath: string): Response {
    const content = readFileSync(
        join(process.cwd(), "formal", relativePath),
        "utf8"
    );
    return new Response(content, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
}
