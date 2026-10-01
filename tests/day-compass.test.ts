import { expect, test, vi } from "vite-plus/test";

vi.mock("../src/lib/site", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../src/lib/site")>()),
    paths: [
        {
            id: "fixture",
            label_en: "Fixture path",
            label_tw: "範例路徑",
            steps: [
                {
                    url: "/#start-today",
                    url_tw: "/tw/#start-today",
                    label_en: "Start",
                    label_tw: "開始",
                },
                {
                    url: "/1/",
                    url_tw: "/tw/1/",
                    label_en: "Notice",
                    label_tw: "留意",
                },
                {
                    url: "/6/#top",
                    url_tw: "/tw/6/#top",
                    label_en: "Close",
                    label_tw: "收尾",
                },
                {
                    url: "/kami/#before-you-start",
                    url_tw: "/tw/kami/#before-you-start",
                    label_en: "Kami",
                    label_tw: "地神",
                },
            ],
        },
    ],
}));

import { renderReadingPaths } from "../src/lib/shortcodes";

function stop(html: string, href: string): string {
    const match = new RegExp(
        `<li>(?:(?!</li>).)*href="${href}"(?:(?!</li>).)*</li>`
    ).exec(html);
    expect(match, `stop ${href}`).not.toBeNull();
    return match![0];
}

const filled = (item: string) =>
    [...item.matchAll(/class="path-compass__dot is-on" data-pack="(\d)"/g)].map(
        (m) => m[1]
    );

test("each stop carries one decorative six-dot compass", () => {
    const html = renderReadingPaths("en-gb");
    expect(
        html.match(/<svg class="path-compass"[^>]*aria-hidden="true"/g)
    ).toHaveLength(4);
    expect(html.match(/class="path-compass__dot/g)).toHaveLength(24);
});

test("a pack stop fills only its own dot and names the pack for assistive tech", () => {
    const html = renderReadingPaths("en-gb");
    const one = stop(html, "/1/");
    expect(filled(one)).toEqual(["1"]);
    expect(one).toContain('<span class="visually-hidden"> (Pack 1)</span>');
    const six = stop(html, "/6/#top");
    expect(filled(six)).toEqual(["6"]);
    expect(six).toContain("(Pack 6)");
});

test("stops that are not pack pages keep a neutral compass and no pack name", () => {
    const html = renderReadingPaths("en-gb");
    for (const href of ["/#start-today", "/kami/#before-you-start"]) {
        const item = stop(html, href);
        expect(filled(item)).toEqual([]);
        expect(item).not.toContain("visually-hidden");
    }
});

test("Traditional Chinese stops use the /tw/ pack urls and the zh ordinal", () => {
    const html = renderReadingPaths("zh-tw");
    const one = stop(html, "/tw/1/");
    expect(filled(one)).toEqual(["1"]);
    expect(one).toContain('<span class="visually-hidden">（第一力）</span>');
    const six = stop(html, "/tw/6/#top");
    expect(filled(six)).toEqual(["6"]);
    expect(six).toContain("（第六力）");
    expect(filled(stop(html, "/tw/#start-today"))).toEqual([]);
});
