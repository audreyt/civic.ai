import { kamiPrompt } from "../../../lib/kamiPrompt";

export function GET() {
    return new Response(kamiPrompt.tw, {
        headers: { "Content-Type": "text/markdown; charset=utf-8" },
    });
}
