import { expect, test } from "vite-plus/test";
import { parseComicSvg, vectorComics } from "../src/lib/comicVector";

const page = (opts: { lang?: string; lettering?: boolean; art?: string }) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 800" width="100" height="200"${opts.lang ? ` lang="${opts.lang}"` : ""}><title>T</title><style>x</style><image href="${opts.art ?? "/img/p-wordless-200w.avif"}" width="400" height="800" preserveAspectRatio="none"/>${opts.lettering ? '<image class="comic-lettering" href="/img/p-lettering.svg" width="400" height="800" preserveAspectRatio="none"/>' : ""}<g class="comic-text"><text font-size="10"><tspan x="1" y="2">you're</tspan></text></g></svg>\n`;

test("reads a comic page SVG's art, lettering and text layer", () => {
    expect(parseComicSvg(page({ lang: "en-GB", lettering: true }))).toEqual({
        viewBox: "0 0 400 800",
        lang: "en-GB",
        art: "/img/p-wordless-200w.avif",
        lettering: "/img/p-lettering.svg",
        text: '<text font-size="10"><tspan x="1" y="2">you\'re</tspan></text>',
    });
    expect(parseComicSvg(page({}))?.lang).toBeUndefined();
    expect(parseComicSvg(page({}))?.lettering).toBeUndefined();
    expect(parseComicSvg("<svg></svg>")).toBeUndefined();
});

test("turns a comic's noscript image into a vector plate", () => {
    const files: Record<string, string> = {
        "/img/p.svg": page({ lang: "en-GB", lettering: true }),
        "/img/p-wordless-720w.avif": "",
        "/img/p-wordless-200w.avif": "",
        "/img/p-wordless.jpg": "",
        "/img/p.jpg": "",
    };
    const has = (path: string) => path in files;
    const read = (path: string) => files[path] as string;
    const html = vectorComics(
        '<noscript><img src="/img/p.jpg" alt="A page" class="overview-image" width="100" height="200" loading="lazy" decoding="async"></noscript>',
        has,
        read
    );
    expect(html).toBe(
        '<span class="comic comic--lettered overview-image" style="aspect-ratio: 100 / 200; --comic-ar: 100 / 200; --comic-lettered: url(/img/p.jpg);"><picture><source srcset="/img/p-wordless-720w.avif 720w, /img/p-wordless.avif 100w, /img/p-wordless-200w.avif 200w" sizes="(max-width: 700px) calc(100vw - 40px), 640px" type="image/avif"><img class="comic-art" src="/img/p-wordless.jpg" alt="A page" width="100" height="200" loading="lazy" decoding="async"></picture><img class="comic-lettering" src="/img/p-lettering.svg" alt="" width="100" height="200" loading="lazy" decoding="async"><svg class="comic-text" viewBox="0 0 400 800" preserveAspectRatio="none" lang="en-GB" role="group" aria-label="Comic text" data-font-subset="skip"><text font-size="10"><tspan x="1" y="2">you\'re</tspan></text></svg></span>'
    );
});

test("Mandarin plates keep the lettered raster and add only the text", () => {
    const files: Record<string, string> = {
        "/img/q-tw.svg": page({ lang: "zh-Hant-TW", art: "/img/q-tw.avif" }),
    };
    const html = vectorComics(
        '<noscript><img src="/img/q-tw.png" alt="頁" width="100" height="200" fetchpriority="high"></noscript>',
        (path) => path in files,
        (path) => files[path] as string
    );
    expect(html).toContain(
        '<span class="comic" style="aspect-ratio: 100 / 200; --comic-ar: 100 / 200;">'
    );
    expect(html).toContain(
        '<source srcset="/img/q-tw.avif 100w" sizes="(max-width: 700px) calc(100vw - 40px), 640px" type="image/avif"><img class="comic-art" src="/img/q-tw.jpg" alt="頁" width="100" height="200" fetchpriority="high" decoding="async">'
    );
    expect(html).toContain('aria-label="漫畫文字"');
    expect(html).toContain('class="comic-text comic-text--overlay"');
    expect(html).not.toContain("comic-lettering");
});

test("a plate without its lettered JPEG falls back to the image's own source", () => {
    const files: Record<string, string> = {
        "/img/r.svg": page({ lettering: true, art: "/img/r-wordless.avif" }),
    };
    const html = vectorComics(
        '<noscript><img src="/img/r.png" alt="" width="10" height="20"></noscript>',
        (path) => path in files,
        (path) => files[path] as string
    );
    expect(html).toContain("--comic-lettered: url(/img/r.png);");
    expect(html).toContain('<img class="comic-art" src="/img/r.jpg"');
    expect(html).not.toContain(' lang="');
    expect(html).toContain('decoding="async"><svg');
});

test("leaves other images alone and refuses malformed comic sources", () => {
    const plain =
        '<noscript><img src="/img/photo.jpg" alt="" width="1" height="1"></noscript>';
    expect(
        vectorComics(
            plain,
            () => false,
            () => ""
        )
    ).toBe(plain);
    expect(() =>
        vectorComics(
            plain,
            () => true,
            () => "<svg></svg>"
        )
    ).toThrow("not a comic page SVG");
    expect(() =>
        vectorComics(
            '<noscript><img src="/img/p.jpg" alt=""></noscript>',
            () => true,
            () => page({})
        )
    ).toThrow("need width and height");
});

test("full-size links open the vector page where there is one", () => {
    const html =
        '<a href="/img/p.jpg" data-comic-full>Open</a><a href="/img/z.png" data-comic-full>Open</a>';
    expect(
        vectorComics(
            html,
            (path) => path === "/img/p.svg",
            () => ""
        )
    ).toBe('<a href="/img/p.svg">Open</a><a href="/img/z.png">Open</a>');
});
