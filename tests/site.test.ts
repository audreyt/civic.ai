import { expect, test } from "vite-plus/test";
import {
    assetVersion,
    cssVersion,
    formatDateDisplay,
    formatDateIso,
    lang2,
    normalizeAltUrl,
    normalizeUrl,
    readingTime,
} from "../src/lib/site";

test("lang2 buckets any zh-prefixed tag as zh, everything else as en", () => {
    expect(lang2("zh-tw")).toBe("zh");
    expect(lang2("zh-Hant")).toBe("zh");
    expect(lang2("en-gb")).toBe("en");
    expect(lang2(undefined)).toBe("en");
});

test("normalizeUrl handles empty, root, hash, and absolute-scheme inputs", () => {
    expect(normalizeUrl("")).toBe("");
    expect(normalizeUrl("/")).toBe("/");
    expect(normalizeUrl("#anchor")).toBe("#anchor");
    expect(normalizeUrl("https://example.com/x")).toBe("https://example.com/x");
    expect(normalizeUrl("mailto:a@b.com")).toBe("mailto:a@b.com");
});

test("normalizeUrl adds a trailing slash to extension-less paths only", () => {
    expect(normalizeUrl("/manifesto")).toBe("/manifesto/");
    expect(normalizeUrl("/manifesto/")).toBe("/manifesto/");
    expect(normalizeUrl("/assets/app.js")).toBe("/assets/app.js");
});

test("normalizeUrl preserves query strings and hash fragments", () => {
    expect(normalizeUrl("/search?q=care")).toBe("/search/?q=care");
    expect(normalizeUrl("/measures#map")).toBe("/measures/#map");
    expect(normalizeUrl("/search?q=care#top")).toBe("/search/?q=care#top");
});

test("normalizeUrl treats a query-only path as the site root", () => {
    expect(normalizeUrl("?tab=map")).toBe("/?tab=map");
});

test("normalizeAltUrl passes through normalizeUrl or stays undefined", () => {
    expect(normalizeAltUrl("/tw/manifesto")).toBe("/tw/manifesto/");
    expect(normalizeAltUrl(undefined)).toBeUndefined();
    expect(normalizeAltUrl("")).toBeUndefined();
});

test("readingTime estimates English word-based minutes", () => {
    const words = Array.from({ length: 440 }, () => "word").join(" ");
    expect(readingTime(`<p>${words}</p>`, "en-gb")).toBe(2);
    expect(readingTime("<p>hi</p>", "en-gb")).toBe(1);
});

test("readingTime estimates Traditional Mandarin character-based minutes", () => {
    const chars = "關懷".repeat(360);
    expect(readingTime(`<p>${chars}</p>`, "zh-tw")).toBe(2);
    expect(readingTime("<p>你好</p>", "zh-tw")).toBe(1);
});

test("readingTime floors to one minute for zh-lang text with no CJK characters", () => {
    expect(readingTime("<p>hello</p>", "zh-tw")).toBe(1);
});

test("readingTime tolerates missing HTML", () => {
    expect(readingTime("", "en-gb")).toBe(1);
});

test("assetVersion hashes an existing file to a stable 8-char digest", () => {
    const version = assetVersion("package.json");
    expect(version).toMatch(/^[a-f0-9]{8}$/);
    expect(assetVersion("package.json")).toBe(version);
});

test("assetVersion returns an empty string when the file cannot be read", () => {
    expect(assetVersion("does/not/exist.never")).toBe("");
});

test("cssVersion hashes the root stylesheet", () => {
    expect(cssVersion()).toMatch(/^[a-f0-9]{8}$/);
});

test("formatDateDisplay renders the UTC calendar day in any build timezone", () => {
    // Both ends of 12 July UTC: a local-time reader shows 11 July west of
    // Greenwich for the first and 13 July east of it for the second.
    for (const date of [
        new Date(Date.UTC(2026, 6, 12)),
        new Date(Date.UTC(2026, 6, 12, 23, 59)),
    ]) {
        expect(formatDateDisplay(date, "en-gb")).toBe("July 12, 2026");
        expect(formatDateDisplay(date, "zh-tw")).toBe("2026 年 7 月 12 日");
    }
});

test("formatDateDisplay returns an empty string for a falsy date", () => {
    expect(formatDateDisplay(undefined, "en-gb")).toBe("");
    expect(formatDateDisplay("", "en-gb")).toBe("");
});

test("formatDateIso renders an ISO-8601 timestamp or an empty string", () => {
    expect(formatDateIso("2026-07-12")).toBe("2026-07-12T00:00:00.000Z");
    expect(formatDateIso(undefined)).toBe("");
});
