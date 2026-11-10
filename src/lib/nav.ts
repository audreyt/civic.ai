import { lang2 } from "./site";

// The masthead: seven destinations in reading order (DESIGN.md §9). Every page
// belongs to exactly one of them, so a reader who lands anywhere can see where
// they are. Pages that are not a destination themselves belong to the Library,
// which lists each of them once (tests/library.test.ts keeps that true).

export type NavSection =
    | "home"
    | "packs"
    | "measures"
    | "faq"
    | "kami"
    | "library"
    | "sources";

export interface NavItem {
    section: NavSection;
    href: string;
    full: string;
    short: string;
    /** "page": this link is the page being read; "true": the page sits inside this section. */
    current?: "page" | "true";
}

interface NavEntry {
    section: NavSection;
    path: string;
    en: [full: string, short: string];
    zh: [full: string, short: string];
}

const entries: readonly NavEntry[] = [
    { section: "home", path: "/", en: ["Home", "Home"], zh: ["首頁", "首頁"] },
    {
        section: "packs",
        path: "/#the-6-pack",
        en: ["The 6-Pack", "6-Pack"],
        zh: ["關懷六力", "六力"],
    },
    {
        section: "measures",
        path: "/measures/",
        en: ["Map & Measures", "Measures"],
        zh: ["地圖與衡量指標", "指標"],
    },
    {
        section: "faq",
        path: "/faq/",
        en: ["FAQ", "FAQ"],
        zh: ["常見問題", "問答"],
    },
    {
        section: "kami",
        path: "/kami/",
        en: ["Set up a Kami", "Set up a Kami"],
        zh: ["架設 Kami", "Kami"],
    },
    {
        section: "library",
        path: "/library/",
        en: ["Library", "Library"],
        zh: ["全站目錄", "目錄"],
    },
    {
        section: "sources",
        path: "/sources/",
        en: ["Sources", "Sources"],
        zh: ["文獻", "文獻"],
    },
];

const trimSlash = (path: string) => path.replace(/\/+$/, "") || "/";

/** The masthead section a page belongs to; the 404 page belongs to none. */
export function navSection(pathname: string): NavSection | undefined {
    const path = trimSlash(pathname.replace(/^\/tw(?=\/|$)/, ""));
    if (path === "/") return "home";
    if (/^\/[1-6]$/.test(path)) return "packs";
    if (path === "/measures") return "measures";
    if (path === "/faq") return "faq";
    if (path === "/kami" || path === "/openclaw") return "kami";
    if (path === "/sources") return "sources";
    if (/^\/404(\.html)?$/.test(path)) return undefined;
    return "library";
}

/** Masthead items for an edition, with the item for this page marked. */
export function navItems(
    lang: string | undefined,
    pathname: string
): NavItem[] {
    const zh = lang2(lang) === "zh";
    const section = navSection(pathname);
    const here = trimSlash(pathname);
    return entries.map((entry) => {
        const href = `${zh ? "/tw" : ""}${entry.path}`;
        const [full, short] = zh ? entry.zh : entry.en;
        const exact = !href.includes("#") && trimSlash(href) === here;
        const current = exact
            ? "page"
            : entry.section === section
              ? "true"
              : undefined;
        return { section: entry.section, href, full, short, current };
    });
}
