import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import siteData from "../../_data/site.json";
import pathsData from "../../_data/paths.json";
import glossaryData from "../../_data/glossary.json";
import packsData from "../../_data/packs.json";
import comicsData from "../../_data/comics.json";
import comicsJaOverlaysData from "../../_data/comics-ja-overlays.json";
import openclawBootstrapData from "../../_data/openclaw_bootstrap.js";

export type Lang = "en-gb" | "zh-tw" | "zh-Hant" | "ja";
export type Lang2 = "en" | "zh";

export interface ComicsOverlayFrame {
    id?: string;
    text: string;
    aria?: string;
    bgImageURL?: string;
    bgImageParameter?: string;
    top: string;
    left: string;
    width: string;
    height: string;
    fontSize: number;
    align: string;
    color: string;
    bg: string;
    italic: boolean;
    angle: string;
    fontFamily: string;
    pad: number;
    shapeOn?: boolean;
    sL?: number[];
    sR?: number[];
    sD?: number[];
}

export const site = siteData;
export const paths = pathsData;
export const glossary = glossaryData;
export const packs = packsData;
export const comics = comicsData;
export const comicsJaOverlays = comicsJaOverlaysData as Record<
    string,
    ComicsOverlayFrame[]
>;
export const openclawBootstrap = openclawBootstrapData;

export function lang2(lang: string | undefined): Lang2 {
    return String(lang || "").split("-")[0] === "zh" ? "zh" : "en";
}

export function normalizeUrl(path: string): string {
    if (!path) return "";
    if (path === "/") return "/";
    if (path.startsWith("#")) return path;
    if (/^[a-z][a-z0-9+.-]*:/i.test(path)) return path;

    // Split on hash first. `indexOf`/`slice` (rather than `split(sep, 2)`
    // plus a `|| ""` guard) always yield defined strings, so there is no
    // dead not-found fallback to carry: the guards above already rule out
    // an empty `path` or one starting with `#`.
    const hashIndex = path.indexOf("#");
    const pathAndQuery = hashIndex === -1 ? path : path.slice(0, hashIndex);
    const hash = hashIndex === -1 ? undefined : path.slice(hashIndex + 1);
    // Split on query
    const queryIndex = pathAndQuery.indexOf("?");
    const pathPart =
        queryIndex === -1 ? pathAndQuery : pathAndQuery.slice(0, queryIndex);
    const query =
        queryIndex === -1 ? undefined : pathAndQuery.slice(queryIndex + 1);

    let normalizedPath = pathPart;
    if (!normalizedPath.endsWith("/")) {
        const last = normalizedPath.split("/").pop() || "";
        if (!last.includes(".")) {
            normalizedPath = `${normalizedPath}/`;
        }
    }

    const queryStr = query !== undefined ? `?${query}` : "";
    const hashStr = hash !== undefined ? `#${hash}` : "";
    return `${normalizedPath}${queryStr}${hashStr}`;
}

export function normalizeAltUrl(path: string | undefined): string | undefined {
    return path ? normalizeUrl(path) : undefined;
}

export function readingTime(html: string, lang: string | undefined): number {
    const text = String(html || "").replace(/<[^>]+>/g, " ");
    if (lang2(lang) === "zh") {
        const chars = (text.match(/[㐀-鿿]/g) || []).length;
        return Math.max(1, Math.ceil(chars / 360));
    }
    const words = (text.trim().match(/\S+/g) || []).length;
    return Math.max(1, Math.ceil(words / 220));
}

export function assetVersion(path: string): string {
    try {
        return createHash("sha1")
            .update(readFileSync(path))
            .digest("hex")
            .slice(0, 8);
    } catch {
        return "";
    }
}

export function cssVersion(): string {
    return assetVersion("styles.css");
}

// Front-matter dates are calendar days: YAML loads `2026-07-12` as UTC midnight.
// Read them back in UTC, or a build west of Greenwich shows the day before.
export function formatDateDisplay(
    date: unknown,
    lang: string | undefined
): string {
    if (!date) return "";
    const d = new Date(date as string | number | Date);
    if (lang2(lang) === "zh")
        return `${d.getUTCFullYear()} 年 ${d.getUTCMonth() + 1} 月 ${d.getUTCDate()} 日`;
    // British English: 12 July 2026.
    return d.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
    });
}

export function formatDateIso(date: unknown): string {
    if (!date) return "";
    return new Date(date as string | number | Date).toISOString();
}
