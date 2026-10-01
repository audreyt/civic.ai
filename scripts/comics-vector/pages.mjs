// The comic pages: upstream page ids (ncase/civic-ai-comics) and the site's
// image stems. Coordinates everywhere are upstream print-canvas pixels.

export const PAGES = [
    { id: "Overview", stem: "overview-small" },
    ...[1, 2, 3, 4, 5, 6].flatMap((pack) => [
        { id: `Ch${pack}_A`, stem: `pack${pack}-1` },
        { id: `Ch${pack}_B`, stem: `pack${pack}-2` },
    ]),
];

export const EDITIONS = {
    // English: the lettering becomes live text in its own (OFL) faces plus
    // traced outlines for Nicky Case's hand-drawn lettering, over the
    // wordless art.
    en: {
        upstream: "comics-en",
        suffix: "",
        lang: "en-GB",
        spec: "_data/comics-text-en.yml",
        mode: "vector",
    },
    // Mandarin: jf 蘭陽 has no web-embedding licence (DESIGN.md §6.2), so the
    // lettering stays pre-rendered; the text rides over it as an invisible,
    // selectable layer.
    tw: {
        upstream: "comics-zh-TW",
        suffix: "-tw",
        lang: "zh-Hant-TW",
        spec: "_data/comics-text-tw.yml",
        mode: "overlay",
    },
};

export function pageById(id) {
    const page = PAGES.find((p) => p.id === id);
    if (!page) throw new Error(`unknown comic page ${id}`);
    return page;
}
