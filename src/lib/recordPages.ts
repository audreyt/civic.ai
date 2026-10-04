import type { PageRecord } from "./pages";

function ledgerPage(zh: boolean, month?: string): PageRecord {
    const path = (chinese: boolean) =>
        `${chinese ? "/tw" : ""}/ledger/${month ? `${month}/` : ""}`;
    const url = path(zh);
    return {
        sourcePath: "src/components/Ledger.astro",
        sourceName: "src/components/Ledger.astro",
        url,
        slug: url.slice(1, -1),
        data: {
            title: zh
                ? `修訂紀錄${month ? `：${month}` : ""}`
                : `Amendment ledger${month ? `: ${month}` : ""}`,
            description: month
                ? zh
                    ? `本站 ${month} 的 Git 修訂紀錄。`
                    : `This site's Git amendments in ${month}.`
                : zh
                  ? "本站的 Git 修訂紀錄與公開評測。"
                  : "This site's Git amendment record and public evaluations.",
            lang: zh ? ("zh-tw" as const) : ("en-gb" as const),
            alt_lang_url: path(!zh),
            page_class: "ledger-page",
            ...(month ? { ledger_month: month } : {}),
            // Commit messages are an audit trail, not authored prose
            // for the content-search corpus.
            search_exclude: true,
            record_sources: ["src/lib/record.ts", "src/lib/recordPages.ts"],
        },
        rawBody: "",
        html: "",
        // Month pages are reached from the ledger, which the sitemap lists.
        includeInSitemap: !month,
        isRawHtmlDocument: false,
    };
}

/** One page per amended month keeps every ledger page within its size budget. */
export function ledgerMonthPages(months: readonly string[]): PageRecord[] {
    return months.flatMap((month) => [
        ledgerPage(false, month),
        ledgerPage(true, month),
    ]);
}

/** Generated HTML pages share the same discovery, twin and record registry. */
export const generatedPages: PageRecord[] = [
    ...(["en", "tw"] as const).flatMap((lang) => {
        const zh = lang === "tw";
        const prefix = zh ? "/tw" : "";
        return [
            ledgerPage(zh),
            {
                sourcePath: `src/pages/${zh ? "tw/" : ""}conference/sensemaking/index.astro`,
                sourceName: `src/pages/${zh ? "tw/" : ""}conference/sensemaking/index.astro`,
                url: `${prefix}/conference/sensemaking/`,
                slug: `${zh ? "tw/" : ""}conference/sensemaking`,
                data: {
                    title: zh ? "Polis 審議鏡像" : "Polis Deliberation Mirror",
                    header_title: zh
                        ? "Polis 審議鏡像"
                        : "Polis Deliberation Mirror",
                    description: zh
                        ? "用 Polis 匯出檔重建、接近 Habermolt 風格的審議頁面。"
                        : "A Habermolt-inspired deliberation page rebuilt from Polis export files.",
                    lang: zh ? ("zh-Hant" as const) : ("en-gb" as const),
                    alt_lang_url: zh
                        ? "/conference/sensemaking/"
                        : "/tw/conference/sensemaking/",
                    search_exclude: true,
                    record_sources: [
                        "src/components/PolisCareReport.astro",
                        "_data/polis_care_deliberation.js",
                        "_data/polis_care_snapshot/manifest.json",
                    ],
                },
                rawBody: "",
                html: "",
                includeInSitemap: true,
                isRawHtmlDocument: false,
            },
        ];
    }),
    {
        sourcePath: "src/pages/404.astro",
        sourceName: "src/pages/404.astro",
        url: "/404.html",
        slug: "404",
        data: {
            title: "This path has been sunset.",
            lang: "en-gb",
            search_exclude: true,
            noindex: true,
        },
        rawBody: "",
        html: "",
        includeInSitemap: false,
        isRawHtmlDocument: false,
    },
];
