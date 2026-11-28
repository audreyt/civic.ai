import { kamiPrompt } from "../../../lib/kamiPrompt";
import { asciifySkill } from "../../../lib/shortcodes";
import { openclawBootstrap } from "../../../lib/site";

export function GET() {
    const content = `---\nname: '${openclawBootstrap.skill.name}'\ndescription: '${openclawBootstrap.skill.description}'\n---\n\n${kamiPrompt.en}`;
    return new Response(asciifySkill(content), {
        headers: { "Content-Type": "text/markdown; charset=utf-8" },
    });
}
