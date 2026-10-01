import { createHash } from "node:crypto";
import type Token from "markdown-it/lib/token.mjs";

export type AnchorUnit = {
    readonly id: string;
    readonly hash: string;
    readonly text: string;
};
export type AnchorPage = {
    readonly units: readonly AnchorUnit[];
    readonly retired: readonly string[];
};
export type AnchorLedger = Readonly<Record<string, AnchorPage>>;
export const RECORD_URL = /^\/(?:tw\/)?(?:manifesto|[1-6]|measures|faq)\/$/;

export function normaliseText(text: string): string {
    return text
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

export function textHash(text: string): string {
    return createHash("sha1").update(text).digest("hex").slice(0, 12);
}

export function similarity(left: string, right: string): number {
    if (left === right) return 1;
    if (left.length < 2 || right.length < 2) return 0;
    const counts = new Map<string, number>();
    for (let i = 0; i < left.length - 1; i++) {
        const pair = left.slice(i, i + 2);
        counts.set(pair, (counts.get(pair) ?? 0) + 1);
    }
    let overlap = 0;
    for (let i = 0; i < right.length - 1; i++) {
        const pair = right.slice(i, i + 2);
        const count = counts.get(pair) ?? 0;
        if (count) {
            overlap++;
            counts.set(pair, count - 1);
        }
    }
    return (2 * overlap) / (left.length + right.length - 2);
}

// Ties advance the old sequence: deterministic, order-preserving alignment.
function align(old: readonly AnchorUnit[], hashes: readonly string[]) {
    const scores = new Map<number, number>();
    const matches = new Set<number>();
    const width = hashes.length + 1;
    const score = (i: number, j: number) => scores.get(i * width + j) ?? 0;
    for (const [i, unit] of [...old.entries()].reverse()) {
        for (const [j, hash] of [...hashes.entries()].reverse()) {
            if (unit.hash === hash) matches.add(i * width + j);
            scores.set(
                i * width + j,
                unit.hash === hash
                    ? 1 + score(i + 1, j + 1)
                    : Math.max(score(i + 1, j), score(i, j + 1))
            );
        }
    }
    const pairs: { readonly old: number; readonly current: number }[] = [];
    let i = 0;
    let j = 0;
    while (i < old.length && j < hashes.length) {
        if (matches.has(i * width + j)) {
            pairs.push({ old: i++, current: j++ });
        } else if (score(i + 1, j) >= score(i, j + 1)) {
            i++;
        } else {
            j++;
        }
    }
    return pairs;
}

function suffix(number: number): string {
    let result = "";
    do {
        number--;
        result = String.fromCharCode(97 + (number % 26)) + result;
        number = Math.floor(number / 26);
    } while (number);
    return result;
}

export function assignAnchors(
    texts: readonly string[],
    previous: AnchorPage | undefined,
    reserved: ReadonlySet<string> = new Set()
): AnchorPage {
    const current = texts.map(normaliseText).map((text) => ({
        hash: textHash(text),
        text: text.slice(0, 120),
    }));
    const taken = new Set(reserved);
    if (!previous) {
        let ordinal = 0;
        return {
            units: current.map((unit) => {
                do {
                    ordinal++;
                } while (taken.has(`p${ordinal}`));
                return { id: `p${ordinal}`, ...unit };
            }),
            retired: [],
        };
    }
    for (const unit of previous.units) taken.add(unit.id);
    for (const id of previous.retired) taken.add(id);
    const assigned = new Map<number, string>();
    const aligned = align(
        previous.units,
        current.map((unit) => unit.hash)
    );
    let oldStart = 0;
    let start = 0;
    for (const end of [
        ...aligned,
        { old: previous.units.length, current: current.length },
    ]) {
        // Match edited units in order within each exact-anchor interval.
        for (const [offset, unit] of current
            .slice(start, end.current)
            .entries()) {
            const j = start + offset;
            for (const [oldOffset, candidate] of previous.units
                .slice(oldStart, end.old)
                .entries()) {
                if (
                    !reserved.has(candidate.id) &&
                    similarity(candidate.text, unit.text) >= 0.6
                ) {
                    assigned.set(j, candidate.id);
                    oldStart += oldOffset + 1;
                    break;
                }
            }
        }
        const exact = previous.units[end.old];
        if (exact && !reserved.has(exact.id))
            assigned.set(end.current, exact.id);
        oldStart = end.old + 1;
        start = end.current + 1;
    }
    let preceding = "p0";
    const units = current.map((unit, index) => {
        let id = assigned.get(index);
        if (!id) {
            // Suffixes share the preceding ordinal's family, including when
            // the preceding assigned unit itself already has a suffix.
            const base = preceding.replace(/[a-z]+$/, "");
            let letter = 0;
            do {
                id = base + suffix(++letter);
            } while (taken.has(id));
            taken.add(id);
        }
        preceding = id;
        return { id, ...unit };
    });
    const present = new Set(units.map((unit) => unit.id));
    return {
        units,
        retired: [
            ...previous.retired,
            ...previous.units
                .filter((unit) => !present.has(unit.id))
                .map((unit) => unit.id),
        ],
    };
}

export type RecordUnit = {
    readonly token: Token;
    readonly open: number;
    readonly close: number;
    readonly text: string;
};

// Both the renderer and ledger CLI consume this exact token selection.
export function recordUnits(tokens: readonly Token[]): RecordUnit[] {
    const units: RecordUnit[] = [];
    const items: {
        readonly token: Token;
        readonly open: number;
        readonly text: string;
    }[] = [];
    let quoteDepth = 0;
    for (const [index, token] of tokens.entries()) {
        if (token.type === "blockquote_open") quoteDepth++;
        if (token.type === "blockquote_close") quoteDepth--;
        const isItem = token.type === "list_item_open";
        if (token.type === "list_item_close") {
            const item = items.pop();
            if (item?.text) units.push({ ...item, close: index });
            continue;
        }
        const inline = tokens[index + (isItem ? 2 : 1)];
        const children = inline?.children ?? [];
        const cited =
            !quoteDepth &&
            children.some(
                (child) => child.type === "text" && child.content.trim()
            );
        const text = cited
            ? normaliseText(
                  children
                      .map((child) =>
                          child.type === "softbreak" ||
                          child.type === "hardbreak"
                              ? " "
                              : child.type === "html_inline"
                                ? ""
                                : child.content
                      )
                      .join("")
              )
            : "";
        if (isItem) {
            items.push({
                token,
                open: index,
                text: tokens[index + 1]?.type === "paragraph_open" ? text : "",
            });
        } else if (
            token.type === "paragraph_open" &&
            !token.hidden &&
            token.level === 0 &&
            !token.attrGet("id") &&
            text
        ) {
            units.push({ token, open: index, close: index + 2, text });
        }
    }
    return units.sort((a, b) => a.open - b.open);
}

export function reservedAnchors(body: string, tokens: readonly Token[]) {
    const used = new Set<string>();
    for (const match of body.matchAll(/\bid=["'](p\d+[a-z]*)["']/g))
        used.add(String(match[1]));
    for (const token of tokens) {
        const id = token.attrGet("id");
        if (id) used.add(id);
    }
    return used;
}

export function ledgerDifference(
    url: string,
    previous: AnchorPage | undefined,
    current: AnchorPage
): string[] {
    if (JSON.stringify(previous) === JSON.stringify(current)) return [];
    return [
        `${url}: stale anchor ledger`,
        `  recorded: ${JSON.stringify(previous)}`,
        `  current:  ${JSON.stringify(current)}`,
    ];
}
