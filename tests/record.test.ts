import { expect, test, vi } from "vite-plus/test";
import { createRecordLoader, recordSources } from "../src/lib/record";
import type { PageRecord } from "../src/lib/pages";
import { execFileSync } from "node:child_process";

const a = "a".repeat(40);
const b = "b".repeat(40);
const c = "c".repeat(40);
function page(sourceName: string, url: string, rawBody = ""): PageRecord {
    return {
        sourceName,
        sourcePath: sourceName,
        url,
        slug: url,
        rawBody,
        html: "",
        data: {},
        includeInSitemap: true,
        isRawHtmlDocument: false,
    };
}
function git(files: Record<string, string>) {
    return vi.fn((args: string[]) =>
        args[0] === "rev-parse" ? "false\n" : files[String(args.at(-1))]
    );
}

test("follows each source across renames and caches the full revision list", () => {
    const read = git({
        "renamed.md": `${b}\t2026-09-02T08:00:00+08:00\tSecond\n${a}\t2026-03-01T00:00:00Z\tFirst\n`,
    });
    const loader = createRecordLoader(".", read);
    expect(loader.summary(["renamed.md"])).toEqual({
        firstDate: "2026-03-01T00:00:00.000Z",
        amendedDate: "2026-09-02T00:00:00.000Z",
        count: 2,
    });
    loader.summary(["renamed.md"]);
    expect(read).toHaveBeenCalledTimes(2);
    expect(read.mock.calls[1]?.[0]).toEqual([
        "log",
        "--follow",
        "--format=%H%x09%cI%x09%s",
        "--",
        "renamed.md",
    ]);
});

test.each(["true", undefined])(
    "omits records when history is shallow or unavailable: %s",
    (state) => {
        const read = vi.fn(() => state);
        const loader = createRecordLoader(".", read);
        expect(loader.summary(["1.md"])).toBeUndefined();
        expect(loader.amendments([page("1.md", "/1/")])).toEqual([]);
        expect(read).toHaveBeenCalledTimes(1);
    }
);

test.each([
    "",
    "bad",
    `${a}\tbad-date\tsubject`,
    `bad\t2026-01-01\tsubject`,
    `\t2026-01-01\tsubject`,
])("omits an empty or malformed source log: %s", (output) => {
    expect(
        createRecordLoader(".", git({ "a.md": output })).summary(["a.md"])
    ).toBeUndefined();
});

test("does not fabricate dates for untracked sources or an empty source set", () => {
    const loader = createRecordLoader(".", git({}));
    expect(loader.summary(["new.astro"])).toBeUndefined();
    expect(loader.summary([])).toBeUndefined();
});

test("unions generated source revisions without double-counting shared commits", () => {
    const loader = createRecordLoader(
        ".",
        git({
            "a.md": `${b}\t2026-09-01T00:00:00Z\tShared\n${a}\t2026-01-01T00:00:00Z\tFirst`,
            "data.json": `${b}\t2026-09-01T00:00:00Z\tShared\n${c}\t2026-09-01T00:00:00Z\tData\twith tab`,
        })
    );
    const first = {
        ...page("a.md", "/a/"),
        data: { title: "A", record_sources: ["data.json"] },
    };
    const second = page("data.json", "/tw/a/");
    expect(loader.summary(recordSources(first))?.count).toBe(3);
    const entries = loader.amendments([second, first]);
    expect(entries.map((entry) => entry.id)).toEqual([b, c, a]);
    expect(entries[0]?.pages).toEqual([
        { url: "/a/", title: "A" },
        { url: "/tw/a/", title: "/tw/a/" },
    ]);
    expect(entries[1]?.subject).toBe("Data\twith tab");
});

test("records all generated data inputs and deduplicates explicit sources", () => {
    const p = page("measures.md", "/measures/", "<!-- astro:concept-map -->");
    p.data.record_sources = ["src/lib/conceptMap.ts"];
    expect(recordSources(p)).toEqual(["measures.md", "src/lib/conceptMap.ts"]);
});

test("the default git boundary returns no records outside a repository", () => {
    expect(createRecordLoader("/dev/null").summary(["a.md"])).toBeUndefined();
});

test("the default git reader honours the checkout's actual history depth", () => {
    const shallow =
        execFileSync("git", ["rev-parse", "--is-shallow-repository"], {
            encoding: "utf8",
        }).trim() === "true";
    const loader = createRecordLoader();
    expect(loader.complete).toBe(!shallow);
    if (shallow) expect(loader.summary(["AGENTS.md"])).toBeUndefined();
    else expect(loader.summary(["AGENTS.md"])?.count).toBeGreaterThan(0);
});

test("pages the ledger by month without listing month pages as amended", () => {
    // Given one source amended twice in September and once in August, and a month page built from the same source.
    const loader = createRecordLoader(
        ".",
        git({
            "a.md": `${b}\t2026-09-02T00:00:00Z\tLater\n${c}\t2026-09-01T00:00:00Z\tSame month\n${a}\t2026-08-31T23:00:00Z\tEarlier`,
        })
    );
    const archive = {
        ...page("a.md", "/ledger/2026-09/"),
        data: { ledger_month: "2026-09" },
    };
    const pages = [page("a.md", "/a/"), archive];
    // Then months are listed once, newest first, and only the real page is attributed.
    expect(loader.months(pages)).toEqual(["2026-09", "2026-08"]);
    expect(loader.amendments(pages).flatMap((entry) => entry.pages)).toEqual(
        Array(3).fill({ url: "/a/", title: "/a/" })
    );
});
