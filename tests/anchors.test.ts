import { expect, test } from "vite-plus/test";
import {
    assignAnchors,
    ledgerDifference,
    normaliseText,
    recordUnits,
    reservedAnchors,
    similarity,
    textHash,
} from "../src/lib/anchors";
import {
    createMarkdownRenderer,
    renderMarkdown,
} from "../src/lib/legacyMarkdown";
import anchorData from "../_data/anchors.json";

const texts = [
    "The first public record.",
    "The second public record.",
    "The final decision.",
];
const initial = assignAnchors(texts, undefined);
const ids = (page: ReturnType<typeof assignAnchors>) =>
    page.units.map((unit) => unit.id);

test("keeps identities when a document is unchanged", () => {
    // Given the original recorded edition.
    const previous = initial;
    // When the same edition is assigned.
    const current = assignAnchors(texts, previous);
    // Then the full ledger is unchanged.
    expect(current).toEqual(previous);
});

test("keeps later identities when new prose is inserted", () => {
    // Given a recorded document.
    const previous = initial;
    // When unrelated text is inserted in the middle.
    const current = assignAnchors(
        [texts[0] ?? "", "Zebras walk home.", ...texts.slice(1)],
        previous
    );
    // Then later citations remain intact.
    expect(ids(current)).toEqual(["p1", "p1a", "p2", "p3"]);
});

test("keeps an identity when similar prose is reworded", () => {
    // Given an original edition.
    const previous = initial;
    // When one sentence is edited.
    const current = assignAnchors(
        [
            "The first public record.",
            "The second public record!",
            "The final decision.",
        ],
        previous
    );
    // Then it keeps its citation.
    expect(ids(current)).toEqual(["p1", "p2", "p3"]);
});

test("retires deleted identities and never reuses them", () => {
    // Given deletion recorded in a subsequent edition.
    const deleted = assignAnchors([texts[0] ?? "", texts[2] ?? ""], initial);
    // When the deleted sentence is reintroduced.
    const current = assignAnchors(texts, deleted);
    // Then its old citation stays retired.
    expect(deleted.retired).toEqual(["p2"]);
    expect(ids(current)).toEqual(["p1", "p1a", "p3"]);
    expect(current.retired).toEqual(["p2"]);
});

test("aligns a reordered document by order-preserving LCS", () => {
    // Given three distinct recorded units.
    const previous = assignAnchors(["Alpha", "Bravo", "Charlie"], undefined);
    // When the first two exchange positions.
    const current = assignAnchors(["Bravo", "Alpha", "Charlie"], previous);
    // Then the deterministic LCS is retained, with moved text a new citation.
    expect(ids(current)).toEqual(["p2", "p2a", "p3"]);
    expect(current.retired).toEqual(["p1"]);
});

test("matches CJK edits using character bigrams", () => {
    // Given a Mandarin record.
    const previous = assignAnchors(["人民共同參與公共決策。"], undefined);
    // When one word is changed.
    const current = assignAnchors(["人民共同參與公共討論。"], previous);
    // Then it retains the identity.
    expect(ids(current)).toEqual(["p1"]);
});

test("falls back to ordinals when the ledger entry is absent", () => {
    // Given reserved body IDs, but no edition.
    const reserved = new Set(["p1", "p3"]);
    // When new prose is assigned.
    const current = assignAnchors(["One", "Two"], undefined, reserved);
    // Then original ordinal skipping applies.
    expect(ids(current)).toEqual(["p2", "p4"]);
});

test("skips suffixes already in the ledger, retirement or body", () => {
    // Given every source of reserved identity.
    const previous = {
        units: [
            ...initial.units,
            { id: "p1a", hash: textHash("Old suffix"), text: "Old suffix" },
        ],
        retired: ["p1b"],
    };
    // When a new unit follows p1.
    const current = assignAnchors(
        [texts[0] ?? "", "Zebras walk home.", ...texts.slice(1)],
        previous,
        new Set(["p1c"])
    );
    // Then the first free suffix is chosen.
    expect(ids(current)).toEqual(["p1", "p1d", "p2", "p3"]);
    expect(current.retired).toEqual(["p1b", "p1a"]);
});

test("allocates before the first anchor and past the alphabet", () => {
    // Given the p0 alphabet already used.
    const reserved = new Set(
        Array.from({ length: 26 }, (_, i) => `p0${String.fromCharCode(97 + i)}`)
    );
    // When two units precede every assigned unit.
    const current = assignAnchors(
        ["Zebras", "Quartz"],
        { units: [], retired: [] },
        reserved
    );
    // Then suffix allocation continues without collisions.
    expect(ids(current)).toEqual(["p0aa", "p0ab"]);
});

test("does not reassign existing IDs reserved by the page body", () => {
    // Given an original p1 now reserved by authored HTML.
    const previous = assignAnchors(["Alpha", "Bravo"], undefined);
    // When unchanged text and an edited unit are assigned.
    const current = assignAnchors(
        ["Alpha", "Bravo!"],
        previous,
        new Set(["p1", "p2"])
    );
    // Then old collisions retire and both receive free identities.
    expect(ids(current)).toEqual(["p0a", "p0b"]);
    expect(current.retired).toEqual(["p1", "p2"]);
});

test("normalises whitespace and strips markup before hashing", () => {
    // Given inline markup and whitespace.
    const text = "  <em>Public</em>\n  record  ";
    // When normalised.
    const normalised = normaliseText(text);
    // Then hashing is of the text, with a 120-character ledger excerpt.
    expect(normalised).toBe("Public record");
    expect(textHash(normalised)).toMatch(/^[a-f0-9]{12}$/);
    expect(
        assignAnchors(["x".repeat(150)], undefined).units[0]?.text
    ).toHaveLength(120);
});

test("counts repeated bigrams and handles short or unrelated text", () => {
    // Given text boundary classes.
    const pairs = [
        ["a", "a"],
        ["a", "b"],
        ["aaaa", "aa"],
        ["ab", "cd"],
    ];
    // When similarity is measured.
    const measured = pairs.map(([a = "", b = ""]) => similarity(a, b));
    // Then Dice overlap uses multiset counts.
    expect(measured).toEqual([1, 0, 0.5, 0]);
});

test("selects prose and nested bullets but excludes quotations and media", () => {
    // Given parsed Markdown with all citable-unit classes.
    const md = createMarkdownRenderer();
    const tokens = md.parse(
        "First **bold** and `code` <em>word</em>.\nnext  \nline\n\n- Parent\n  - Child\n-\n\n> - Quoted\n\n![image](x)\n\n<div>Raw</div>",
        {}
    );
    // When units are extracted.
    const units = recordUnits(tokens);
    // Then nested units follow document order and inline text is plain.
    expect(units.map((unit) => unit.text)).toEqual([
        "First bold and code word. next line",
        "Parent",
        "Child",
    ]);
});

test("excludes pre-identified paragraphs and list items without initial prose", () => {
    // Given a paragraph identified by another rule and a heading-only bullet.
    const md = createMarkdownRenderer();
    const tokens = md.parse("Existing.\n\n- ## Heading", {});
    tokens[0]?.attrSet("id", "authored");
    // When selecting units.
    const units = recordUnits(tokens);
    // Then neither receives a new citation.
    expect(units).toEqual([]);
});

test("reserves both authored suffixed IDs and generated heading IDs", () => {
    // Given authored and generated anchors.
    const tokens = createMarkdownRenderer().parse("## p2", {});
    // When IDs are collected.
    const reserved = reservedAnchors('<span id="p1a"></span>', tokens);
    // Then both identity sources are present.
    expect([...reserved]).toEqual(["p1a", "p2"]);
});

test("reports missing and stale ledger entries but accepts current records", () => {
    // Given a current edition.
    const current = initial;
    // When compared with current, missing and stale editions.
    const differences = [current, undefined, { units: [], retired: [] }].map(
        (previous) => ledgerDifference("/1/", previous, current)
    );
    // Then the check identifies only stale records.
    expect(differences[0]).toEqual([]);
    expect(
        differences
            .slice(1)
            .every((diff) => diff[0] === "/1/: stale anchor ledger")
    ).toBe(true);
});

test("renders ledger identities and accessible suffixed labels", () => {
    // Given one actual ledger unit and unrelated inserted prose.
    const first = anchorData["/1/"].units[0];
    const body = `${first?.text}\n\nZebras walk home.`;
    // When rendered through the public library.
    const html = renderMarkdown(body, "/1/");
    // Then data, fragment and accessible name share the label.
    expect(html).toContain('data-record-paragraph="1a"');
    expect(html).toContain('href="#p1a"');
    expect(html).toContain("¶ 1a<span");
    expect(html).toContain("(permalink to paragraph 1a)");
});
