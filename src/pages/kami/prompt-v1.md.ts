import { kamiPrompt } from "../../lib/kamiPrompt";

export function GET() {
    return new Response(kamiPrompt.en, {
        headers: { "Content-Type": "text/markdown; charset=utf-8" },
    });
}
