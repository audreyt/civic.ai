import { expect, test } from "vite-plus/test";
import { getPageByUrl, getSitemapPages } from "../src/lib/pages";

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
    expect(kamiSetup).toContain("For machines with 16 GB RAM or more:");
    expect(kamiSetup).toContain("ornith:9b");

    const twKamiSetup = getPageByUrl("/tw/kami/").html;
    expect(twKamiSetup).not.toContain("<th>記憶體</th>");
    expect(twKamiSetup).toContain("記憶體達 16 GB 或以上：");
    expect(twKamiSetup).toContain("ornith:9b");

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
    expect(indexPage.data.manifesto_link).toBe("/manifesto/");
    expect(indexPage.data.prev_action?.url).toBe("/manifesto/");
    expect(indexPage.data.next_action?.url).toBe("/1/");

    const comicsPage = getPageByUrl("/comics/");
    expect(comicsPage.data.nav_prev?.url).toBe("/");
    expect(comicsPage.data.nav_next?.url).toBe("/1/");

    const twIndexPage = getPageByUrl("/tw/");
    expect(twIndexPage.data.manifesto_link).toBe("/tw/manifesto/");
    expect(twIndexPage.data.prev_action?.url).toBe("/tw/manifesto/");
    expect(twIndexPage.data.next_action?.url).toBe("/tw/1/");

    expect(indexPage.data.alt_lang_url).toBe("/tw/");
    expect(getPageByUrl("/1/").data.alt_lang_url).toBe("/tw/1/");
});
