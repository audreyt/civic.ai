/** The root Markdown pairing rule shared by clipboard review and public evals. */
export function reviewPairs(names) {
    const meta = new Set(["README.md", "CLAUDE.md", "AGENTS.md", "DESIGN.md"]);
    const en = names
        .filter(
            (name) =>
                name.endsWith(".md") &&
                !name.startsWith("tw-") &&
                !name.startsWith("ja-") &&
                !meta.has(name)
        )
        .sort();
    const tw = names
        .filter((name) => name.startsWith("tw-") && name.endsWith(".md"))
        .sort();
    return {
        en,
        tw,
        pairedEn: en.filter((name) => tw.includes(`tw-${name}`)),
        pairedTw: tw.filter((name) => en.includes(name.slice(3))),
        orphanEn: en.filter((name) => !tw.includes(`tw-${name}`)),
        orphanTw: tw.filter((name) => !en.includes(name.slice(3))),
    };
}
