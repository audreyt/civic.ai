import { expect, test } from "vite-plus/test";
import { navItems, navSection } from "../src/lib/nav";

test("every page belongs to one masthead section, in either edition", () => {
    expect(navSection("/")).toBe("home");
    expect(navSection("/tw/")).toBe("home");
    expect(navSection("/tw")).toBe("home");
    expect(navSection("/1/")).toBe("packs");
    expect(navSection("/tw/6/")).toBe("packs");
    expect(navSection("/measures/")).toBe("measures");
    expect(navSection("/tw/faq/")).toBe("faq");
    expect(navSection("/kami/")).toBe("kami");
    expect(navSection("/tw/openclaw/")).toBe("kami");
    expect(navSection("/sources/")).toBe("sources");
    // Everything else is listed in the Library, so it sits under that item.
    expect(navSection("/library/")).toBe("library");
    expect(navSection("/tw/manifesto/")).toBe("library");
    expect(navSection("/doom-debate/")).toBe("library");
    expect(navSection("/ledger/2026-09/")).toBe("library");
    expect(navSection("/ja/comics/")).toBe("library");
    // "/twelve/" is not the Mandarin edition.
    expect(navSection("/twelve/")).toBe("library");
    expect(navSection("/404")).toBeUndefined();
    expect(navSection("/404.html")).toBeUndefined();
});

test("masthead items come in reading order with full and short labels", () => {
    const en = navItems("en-gb", "/");
    expect(en.map((item) => item.full)).toEqual([
        "Home",
        "The 6-Pack",
        "Measures",
        "FAQ",
        "Set up a Kami",
        "Library",
        "Sources",
    ]);
    expect(en.map((item) => item.href)).toEqual([
        "/",
        "/#the-6-pack",
        "/measures/",
        "/faq/",
        "/kami/",
        "/library/",
        "/sources/",
    ]);
    const zh = navItems("zh-tw", "/tw/");
    expect(zh.map((item) => item.short)).toEqual([
        "首頁",
        "六力",
        "指標",
        "問答",
        "Kami",
        "目錄",
        "文獻",
    ]);
    expect(zh.map((item) => item.href)).toEqual([
        "/tw/",
        "/tw/#the-6-pack",
        "/tw/measures/",
        "/tw/faq/",
        "/tw/kami/",
        "/tw/library/",
        "/tw/sources/",
    ]);
});

test("marks the page being read, or the section it sits in", () => {
    const current = (lang: string, path: string) =>
        navItems(lang, path)
            .filter((item) => item.current)
            .map((item) => [item.section, item.current]);
    // Home is the page itself; the pack index on it is not marked twice.
    expect(current("en-gb", "/")).toEqual([["home", "page"]]);
    expect(current("zh-tw", "/tw/")).toEqual([["home", "page"]]);
    expect(current("en-gb", "/measures/")).toEqual([["measures", "page"]]);
    expect(current("zh-tw", "/tw/library/")).toEqual([["library", "page"]]);
    // A pack sits inside The 6-Pack; the instructions inside Set up a Kami.
    expect(current("en-gb", "/4/")).toEqual([["packs", "true"]]);
    expect(current("zh-tw", "/tw/openclaw/")).toEqual([["kami", "true"]]);
    expect(current("en-gb", "/kami/")).toEqual([["kami", "page"]]);
    expect(current("en-gb", "/manifesto/")).toEqual([["library", "true"]]);
    expect(current("en-gb", "/404")).toEqual([]);
});
