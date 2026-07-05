import { readFileSync } from "node:fs";
import { expect, test } from "bun:test";
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

test("expands generated glossary pages", () => {
    expect(getPageByUrl("/glossary/").html).toContain('id="civic-ai"');
    expect(getPageByUrl("/glossary/").html).toContain("Civic AI");
    expect(getPageByUrl("/tw/glossary/").html).toContain('id="civic-ai"');
    expect(getPageByUrl("/tw/glossary/").html).toContain("仁工智慧");
});

test("measures named instruments list buildable audit artefacts", () => {
    const en = getPageByUrl("/measures/").html;
    const tw = getPageByUrl("/tw/measures/").html;

    expect(en).toContain("<strong>Bridging map</strong>");
    expect(en).toContain("<strong>Participation Officer</strong>");
    expect(en).toContain("<strong>Governance charter</strong>");
    expect(en).toContain("<strong>Handover rehearsal/exit drill</strong>");
    expect(tw).toContain("<strong>搭橋地圖</strong>");
    expect(tw).toContain("<strong>參與官</strong>");
    expect(tw).toContain("<strong>治理章程</strong>");
    expect(tw).toContain("<strong>交接演練／退場演習</strong>");
});

test("excludes OpenClaw human guide from sitemap", () => {
    expect(getPageByUrl("/openclaw/").includeInSitemap).toBe(false);
    expect(getSitemapPages().some((page) => page.url === "/openclaw/")).toBe(
        false
    );
    expect(getSitemapPages().some((page) => page.url === "/1/")).toBe(true);
});

test("renders Lean formalization pages and source links", () => {
    expect(getPageByUrl("/formal-care/").sourceName).toBe("formal-care.md");
    expect(getPageByUrl("/tw/formal-care/").sourceName).toBe(
        "tw-formal-care.md"
    );

    const en = getPageByUrl("/formal-care/").html;
    const tw = getPageByUrl("/tw/formal-care/").html;

    expect(en).toContain("bridging_not_nat_separable");
    expect(en).toContain("/formal/CivicAi/Care/Solidarity.lean");
    expect(tw).toContain("團結力的不可分解性");
    expect(tw).toContain("/formal/CivicAi/Care/Solidarity.lean");
});

test("Lean formalization has no proof placeholders", () => {
    const solidarityLean = readFileSync(
        "formal/CivicAi/Care/Solidarity.lean",
        "utf8"
    );

    expect(solidarityLean).toContain("theorem bridging_not_nat_separable");
    expect(solidarityLean).not.toMatch(/\b(sorry|admit)\b/);
});
