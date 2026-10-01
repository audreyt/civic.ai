import { expect, test } from "vite-plus/test";
import { getPageByUrl } from "../src/lib/pages";

function jollyHostessListItem(html: string): string {
    const marker = /Jolly-hostess prompts|熱情接待者提示詞/;
    const idx = html.search(marker);
    if (idx < 0)
        throw new Error("Jolly-hostess buildable-tools line not found");
    // Bullets on core pages carry ¶ attributes, so match the tag, not "<li>".
    const start = html.lastIndexOf("<li", idx);
    const end = html.indexOf("</li>", idx);
    if (start < 0 || end < 0) {
        throw new Error("Jolly-hostess list item bounds not found");
    }
    return html.slice(start, end + "</li>".length);
}

test("Pack 1 EN: Jolly-hostess bullet surfaces missing/under-represented voices and where crossings may be possible — no uncommon ground", () => {
    const block = jollyHostessListItem(getPageByUrl("/1/").html);

    expect(block).not.toMatch(/uncommon ground/i);
    expect(block).toMatch(/under-represented|under-representation|missing/i);
    expect(block).toMatch(/where crossings may be possible/i);
});

test("Pack 1 zh-TW: 熱情接待者提示詞要求缺席/代表性不足與何處可能跨越分歧 — 不含罕見共識", () => {
    const block = jollyHostessListItem(getPageByUrl("/tw/1/").html);

    expect(block).not.toMatch(/罕見共識/);
    expect(block).toMatch(/代表性不足|較安靜|缺席|低估/);
    expect(block).toMatch(/何處可能跨越分歧/);
});
