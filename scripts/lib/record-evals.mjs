export function escapeRecord(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

export function evaluateTerms(glossary, html) {
    const canon = {
        "civic-ai": "仁工智慧",
        "6-pack-of-care": "關懷六力",
        kami: "地神（Kami）",
        "override-ledger": "否決帳本",
        "shared-eval-registry": "共享評測登錄庫",
    };
    const detail = Object.entries(canon).map(([id, term]) => ({
        id,
        term,
        pass:
            glossary.some(
                (entry) => entry.id === id && entry.term_tw === term
            ) &&
            new RegExp(
                `<dt\\b[^>]*id=["']${id}["'][^>]*>([\\s\\S]*?)</dt>`
            ).exec(html)?.[1] === escapeRecord(term),
    }));
    return {
        pass: detail.every((row) => row.pass),
        detail,
        scope: "Five locked zh-TW glossary labels and their rendered glossary entries only; not a semantic translation audit.",
        scopeZh: "核對五個鎖定的華文術語及其詞彙表呈現；不代表已查核全文翻譯。",
    };
}

export function evaluateTwins(pages, pairs) {
    const detail = [...pairs.orphanEn, ...pairs.orphanTw].map(
        (source) => `${source}: missing Markdown twin`
    );
    const byUrl = new Map(pages.map((page) => [page.url, page]));
    let checked = 0;
    for (const page of pages) {
        if (page.url.startsWith("/ja/")) continue;
        const alternates = [
            ...page.html.matchAll(
                /<link\b(?=[^>]*\brel=["']alternate["'])(?=[^>]*\bhreflang=["'](en|zh-Hant)["'])(?=[^>]*\bhref=["']([^"']+)["'])[^>]*>/gi
            ),
        ];
        for (const [, , href] of alternates) {
            const url = new URL(href, "https://civic.ai").pathname;
            if (url === page.url) continue;
            checked++;
            const twin = byUrl.get(url);
            const reciprocal =
                twin &&
                [
                    ...twin.html.matchAll(
                        /<link\b(?=[^>]*\brel=["']alternate["'])(?=[^>]*\bhreflang=["'](?:en|zh-Hant)["'])(?=[^>]*\bhref=["']([^"']+)["'])[^>]*>/gi
                    ),
                ].some(
                    (m) =>
                        new URL(m[1], "https://civic.ai").pathname === page.url
                );
            if (!reciprocal)
                detail.push(`${page.url}: missing reciprocal twin ${url}`);
        }
        if (page.url !== "/404.html" && alternates.length < 2)
            detail.push(`${page.url}: missing EN/zh hreflang declarations`);
    }
    return {
        pass: !detail.length,
        detail,
        checked,
        scope: "Root Markdown pairing and reciprocal built EN/zh hreflang URLs; not equal paragraph counts or translation fidelity.",
        scopeZh:
            "核對 Markdown 配對及雙向語言連結；不假設段落數相同，也不代表翻譯忠實度。",
    };
}

const names = {
    en: {
        links: "links",
        parity: "parity",
        terms: "terms",
        contrast: "contrast",
        size: "size",
    },
    zh: {
        links: "連結",
        parity: "雙語",
        terms: "術語",
        contrast: "對比",
        size: "大小",
    },
};

/** One replaceable slot, no client JS and no reliance on comments surviving minification. */
export function injectEvals(html, report) {
    return html.replace(
        /<div\b([^>]*\bdata-record-evals="(trace|board|chip)"[^>]*)>[\s\S]*?<\/div>/g,
        (_match, attributes, kind) => {
            const zh = /\bdata-record-lang="zh"/.test(attributes);
            const labels = names[zh ? "zh" : "en"];
            const cells = Object.entries(report.checks)
                .map(([key, check]) => {
                    const status = check.pass
                        ? zh
                            ? "通過"
                            : "pass"
                        : zh
                          ? "待修復"
                          : "needs repair";
                    const title = `${labels[key]} ${check.pass ? "✓" : "⚠"} ${status}`;
                    return kind === "board"
                        ? `<li class="record-eval record-eval--${check.pass ? "pass" : "fail"}"><strong>${title}</strong><p>${escapeRecord(zh ? check.scopeZh : check.scope)}</p></li>`
                        : `<span class="record-eval record-eval--${check.pass ? "pass" : "fail"}">${title}</span>`;
                })
                .join("");
            const body =
                kind === "board"
                    ? `<ul class="record-eval-board">${cells}</ul>`
                    : kind === "chip"
                      ? `<a href="${zh ? "/tw" : ""}/ledger/">${zh ? "評測：" : "Evals: "}${Object.values(report.checks).filter((check) => check.pass).length}/${Object.keys(report.checks).length} ${zh ? "通過" : "pass"}</a>`
                      : `<span class="record-eval-list">${cells}</span>`;
            const receipt = `<a href="/evals.json">${zh ? "完整評測紀錄（JSON）" : "Full eval receipts (JSON)"}</a>`;
            return `<div${attributes}>${body}${kind === "chip" ? "" : `<span class="record-eval-built">${zh ? "建置：" : "Built "}${escapeRecord(report.builtAt)} · ${receipt}</span>`}</div>`;
        }
    );
}
