import { spawnSync } from "node:child_process";
import type { PageRecord } from "./pages";

export interface Revision {
    readonly id: string;
    readonly date: string;
    readonly subject: string;
}

export interface Amendment extends Revision {
    readonly pages: readonly { url: string; title: string }[];
}

export interface SourceRecord {
    readonly firstDate: string;
    readonly amendedDate: string;
    /** Recorded commits, including the first edition; never an estimated count. */
    readonly count: number;
}

type GitReader = (args: string[]) => string | undefined;

/** One cache per build. No dates or counts are inferred from filesystem mtimes. */
export function createRecordLoader(
    cwd: string = process.cwd(),
    readGit: GitReader = (args) => {
        const result = spawnSync("git", args, {
            cwd,
            encoding: "utf8",
            maxBuffer: 32 * 1024 * 1024,
        });
        if (args[0] === "rev-parse")
            console.warn(
                "DIAG record",
                cwd,
                JSON.stringify([
                    result.status,
                    result.stdout,
                    result.stderr,
                    result.error?.message,
                    process.env.HOME,
                ])
            );
        return result.status === 0 ? result.stdout : undefined;
    }
) {
    const complete =
        readGit(["rev-parse", "--is-shallow-repository"])?.trim() === "false";
    const cache = new Map<string, readonly Revision[] | undefined>();

    function revisions(source: string): readonly Revision[] | undefined {
        if (!complete) return undefined;
        if (cache.has(source)) return cache.get(source);
        const output = readGit([
            "log",
            "--follow",
            "--format=%H%x09%cI%x09%s",
            "--",
            source,
        ]);
        const rows: Revision[] = [];
        for (const line of (output ?? "").split("\n").filter(Boolean)) {
            const [id, date, ...subject] = line.split("\t");
            if (
                !id ||
                !date ||
                !/^[a-f0-9]{40,64}$/.test(id) ||
                !Number.isFinite(Date.parse(date))
            ) {
                cache.set(source, undefined);
                return undefined;
            }
            rows.push({
                id,
                date: new Date(date).toISOString(),
                subject: subject.join("\t"),
            });
        }
        const result = rows.length ? rows : undefined;
        cache.set(source, result);
        return result;
    }

    function summary(sources: readonly string[]): SourceRecord | undefined {
        const commits = new Map<string, Revision>();
        for (const source of sources) {
            const rows = revisions(source);
            if (!rows) return undefined;
            for (const row of rows) commits.set(row.id, row);
        }
        const dates = [...commits.values()].map((row) => row.date).sort();
        const firstDate = dates[0];
        const amendedDate = dates.at(-1);
        return firstDate && amendedDate
            ? { firstDate, amendedDate, count: commits.size }
            : undefined;
    }

    function amendments(pages: readonly PageRecord[]): Amendment[] {
        const entries = new Map<
            string,
            {
                revision: Revision;
                pages: Map<string, { url: string; title: string }>;
            }
        >();
        for (const page of pages) {
            // A ledger month page shows amendments; it is not amended itself.
            if (page.data.ledger_month) continue;
            for (const source of recordSources(page)) {
                for (const revision of revisions(source) ?? []) {
                    let entry = entries.get(revision.id);
                    if (!entry) {
                        entry = { revision, pages: new Map() };
                        entries.set(revision.id, entry);
                    }
                    entry.pages.set(page.url, {
                        url: page.url,
                        title: page.data.title ?? page.url,
                    });
                }
            }
        }
        return [...entries.values()]
            .map(({ revision, pages: touched }) => ({
                ...revision,
                pages: [...touched.values()].sort((a, b) =>
                    a.url.localeCompare(b.url)
                ),
            }))
            .sort(
                (a, b) =>
                    b.date.localeCompare(a.date) || a.id.localeCompare(b.id)
            );
    }

    function months(pages: readonly PageRecord[]): string[] {
        return [
            ...new Set(
                amendments(pages).map((entry) => entry.date.slice(0, 7))
            ),
        ];
    }

    return { complete, revisions, summary, amendments, months };
}

/** Generated prose is attributed to its data and renderer as well as its page. */
export function recordSources(page: PageRecord): string[] {
    const sources = [page.sourceName, ...(page.data.record_sources ?? [])];
    const generated = [
        ["reading-paths", "_data/paths.json", "src/lib/shortcodes.ts"],
        ["comics-gallery", "_data/comics.json", "src/lib/shortcodes.ts"],
        ["glossary-list", "_data/glossary.json", "src/lib/shortcodes.ts"],
        ["concept-map", "src/lib/conceptMap.ts"],
        [
            "polis-report",
            "_data/polis_report.js",
            "_data/polis_care_snapshot/manifest.json",
        ],
        ["openclaw-", "_data/openclaw_bootstrap.js", "src/lib/shortcodes.ts"],
    ];
    for (const [marker, ...files] of generated) {
        if (marker && page.rawBody.includes(`<!-- astro:${marker}`))
            sources.push(...files);
    }
    return [...new Set(sources)];
}

export const record = createRecordLoader();
