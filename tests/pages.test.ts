import { expect, test } from "vite-plus/test";
import { getPageByUrl, getSitemapPages, visibleHtml } from "../src/lib/pages";

test("loads canonical root pages", () => {
    expect(getPageByUrl("/").sourceName).toBe("index.md");
    expect(getPageByUrl("/tw/").sourceName).toBe("tw-index.md");
});

test("renders CJK-sensitive markdown through root loader", () => {
    expect(getPageByUrl("/1/").html).toContain(
        "<strong>Relationships first.</strong>"
    );
    expect(getPageByUrl("/tw/1/").html).toContain(
        "<strong>關係優先。</strong>"
    );
});

test("keeps book-aligned source material tableless", () => {
    const insideTheKami = getPageByUrl("/inside-the-kami/").html;
    expect(insideTheKami).not.toContain('class="compare-table"');
    expect(insideTheKami).not.toContain("<th>Research result</th>");
    expect(insideTheKami).toContain(
        "Separate truth-tracking from speech imitation"
    );
    expect(insideTheKami).toContain(
        "Decision traces can distinguish verified claims from reported claims"
    );

    const kamiSetup = getPageByUrl("/kami/").html;
    expect(kamiSetup).not.toContain("<th>RAM</th>");
    expect(kamiSetup).toContain("On a laptop with 16 GB of memory or more");

    const twKamiSetup = getPageByUrl("/tw/kami/").html;
    expect(twKamiSetup).not.toContain("<th>記憶體</th>");
    expect(twKamiSetup).toContain(
        '記憶體 <span lang="en-GB">16 GB</span> 以上的筆電'
    );

    const measures = getPageByUrl("/measures/").html;
    expect(measures).not.toContain("<th>Pack</th>");
    expect(measures).not.toContain("<th>Headline public measure</th>");
    expect(measures).toContain('id="uncommon-ground-index"');
    expect(measures).toContain("Uncommon-ground index");
});

test("expands generated glossary pages", () => {
    expect(getPageByUrl("/glossary/").html).toContain('id="civic-ai"');
    expect(getPageByUrl("/glossary/").html).toContain("Civic AI");
    expect(getPageByUrl("/glossary/").html).toContain(
        'id="glossary-diagnosis"'
    );
    expect(getPageByUrl("/tw/glossary/").html).toContain('id="civic-ai"');
    expect(getPageByUrl("/tw/glossary/").html).toContain("仁工智慧");
    expect(getPageByUrl("/tw/glossary/").html).toContain(
        'id="glossary-diagnosis"'
    );
});

test("excludes OpenClaw human guide from sitemap", () => {
    expect(getPageByUrl("/openclaw/").includeInSitemap).toBe(false);
    expect(getSitemapPages().some((page) => page.url === "/openclaw/")).toBe(
        false
    );
    expect(getSitemapPages().some((page) => page.url === "/1/")).toBe(true);
});

test("normalizes front-matter action and navigation links", () => {
    const indexPage = getPageByUrl("/");
    expect(indexPage.data.manifesto_link).toBe("/#the-6-pack");
    expect(indexPage.data.prev_action?.url).toBe("/manifesto/");
    expect(indexPage.data.next_action?.url).toBe("/1/");

    const comicsPage = getPageByUrl("/comics/");
    expect(comicsPage.data.nav_prev?.url).toBe("/");
    expect(comicsPage.data.nav_next?.url).toBe("/1/");

    const twIndexPage = getPageByUrl("/tw/");
    expect(twIndexPage.data.manifesto_link).toBe("/tw/#the-6-pack");
    expect(twIndexPage.data.prev_action?.url).toBe("/tw/manifesto/");
    expect(twIndexPage.data.next_action?.url).toBe("/tw/1/");

    expect(indexPage.data.alt_lang_url).toBe("/tw/");
    expect(getPageByUrl("/1/").data.alt_lang_url).toBe("/tw/1/");
});

test("visibleHtml curls quotes except on Japanese pages", () => {
    const en = getPageByUrl("/glossary/");
    expect(visibleHtml(en)).not.toMatch(/>[^<]*'[^<]*</);
    const ja = {
        ...en,
        data: { ...en.data, lang: "ja" as const },
        html: '<p>"x"</p>',
    };
    expect(visibleHtml(ja)).toBe('<p>"x"</p>');
});

test("serves content images as native pictures, not script-revealed noscript", () => {
    const essay = getPageByUrl("/ai-alignment-cannot-be-top-down/").html;
    expect(essay).toContain(
        '<picture><source srcset="/img/gpt-value-correlation-720w.avif 720w, /img/gpt-value-correlation.avif 1600w" sizes="(max-width: 700px) calc(100vw - 40px), 640px" type="image/avif"><img src="/img/gpt-value-correlation.jpg"'
    );
    expect(essay).not.toContain("<noscript><img");
});

test("serves the comics as vector plates: art, traced lettering, live text", () => {
    const pack = getPageByUrl("/1/").html;
    expect(pack).toContain(
        '<span class="comic comic--lettered overview-image" style="aspect-ratio: 1437 / 1999; --comic-ar: 1437 / 1999; --comic-lettered: url(/img/pack1-1.jpg);"><picture><source srcset="/img/pack1-1-wordless-720w.avif 720w, /img/pack1-1-wordless.avif 1437w, /img/pack1-1-wordless-2874w.avif 2874w"'
    );
    expect(pack).toContain(
        '<img class="comic-lettering" src="/img/pack1-1-lettering.svg" alt=""'
    );
    expect(pack).toContain(
        '<svg class="comic-text" viewBox="0 0 5749 8000" preserveAspectRatio="none" lang="en-GB" role="group" aria-label="Comic text"'
    );
    // the words read on across the per-word spans the fitter places
    const words = pack
        .slice(pack.indexOf('<svg class="comic-text"'))
        .replace(/<[^>]+>/g, "")
        .replaceAll("&#32;", " ");
    expect(words).toContain(
        "Government needs to listen to the needs of the governed. But right now,"
    );
    expect(pack).not.toContain("<noscript><img");
    // straight quotes stay straight inside the drawn lettering
    expect(visibleHtml(getPageByUrl("/1/"))).toContain(
        "still great, but you're&#32;</tspan>"
    );
    expect(getPageByUrl("/").html).toContain(
        '<source srcset="/img/overview-small-wordless-720w.avif 720w, /img/overview-small-wordless.avif 1280w, /img/overview-small-wordless-2560w.avif 2560w"'
    );
    const tw = getPageByUrl("/tw/1/").html;
    expect(tw).toContain('<img class="comic-art" src="/img/pack1-1-tw.jpg"');
    expect(tw).toContain('aria-label="漫畫文字"');
    expect(tw).not.toContain("comic-lettering");
});
