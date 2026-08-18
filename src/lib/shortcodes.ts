import { renderPolisReport } from "../../_data/polis_report.js";
import type { PageRecord } from "./pages";
import { renderConceptMap } from "./conceptMap";
import {
    type ComicsOverlayFrame,
    comics,
    comicsJaOverlays,
    glossary,
    lang2,
    openclawBootstrap,
    paths,
} from "./site";

function escapeHtml(value: string | number | null | undefined): string {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function escapeAttr(value: string | number | null | undefined): string {
    return escapeHtml(value);
}

export function expandShortcodes(
    page: Pick<PageRecord, "sourcePath" | "data">,
    body: string
): string {
    let expanded = body
        .replaceAll(
            "<!-- astro:reading-paths -->",
            renderReadingPaths(page.data.lang)
        )
        .replaceAll(
            "<!-- astro:comics-gallery -->",
            renderComicsGallery(page.data.lang)
        )
        .replaceAll("<!-- astro:comics-gallery-ja -->", renderComicsGalleryJa())
        .replaceAll(
            "<!-- astro:glossary-list -->",
            renderGlossaryList(page.data.lang)
        )
        .replaceAll(
            "<!-- astro:concept-map -->",
            renderConceptMap(page.data.lang)
        )
        .replaceAll(
            "<!-- astro:polis-report -->",
            renderPolisReport(page.data.lang)
        )
        .replaceAll(
            "<!-- astro:openclaw-raw-skill-note en -->",
            renderOpenClawRawSkillNote("en")
        )
        .replaceAll(
            "<!-- astro:openclaw-raw-skill-note tw -->",
            renderOpenClawRawSkillNote("tw")
        );
    expanded = expanded.replaceAll(
        "<!-- astro:openclaw-guide en -->",
        renderOpenClawGuideMarkdown("en")
    );
    expanded = expanded.replaceAll(
        "<!-- astro:openclaw-guide tw -->",
        renderOpenClawGuideMarkdown("tw")
    );
    if (/\{%|\{\{/.test(expanded))
        throw new Error(
            `Unhandled legacy template syntax in ${page.sourcePath}`
        );
    return expanded;
}

export function renderReadingPaths(lang: string | undefined): string {
    const zh = lang2(lang) === "zh";
    const groups = paths
        .map((path) => {
            const title = zh ? path.label_tw : path.label_en;
            const steps = path.steps
                .map((step) => {
                    const href = zh ? step.url_tw : step.url;
                    const label = zh ? step.label_tw : step.label_en;
                    return `<li><a href="${escapeAttr(href)}">${escapeHtml(label)}</a></li>`;
                })
                .join("");
            return `<div class="reading-path"><h3 class="reading-path__title">${escapeHtml(title)}</h3><ol class="reading-path__steps">${steps}</ol></div>`;
        })
        .join("");
    return `<nav class="reading-paths" aria-label="${zh ? "依讀者類型的閱讀路徑" : "Reading paths by audience"}">${groups}</nav>`;
}

export function renderComicsGallery(lang: string | undefined): string {
    const zh = lang2(lang) === "zh";
    const key = zh ? "tw" : "en";
    const base = zh ? "/tw/" : "/";
    const overview = comics.overview[key];
    const caption = zh
        ? `<p class="figure-caption"><strong>概覽圖。</strong>六力一覽，由 Nicky Case 繪製。</p>`
        : `<p class="figure-caption"><strong>Overview.</strong> All six packs at a glance, illustrated by Nicky Case.</p>`;
    const pages = comics.packs
        .flatMap((pack) =>
            pack.pages.map((page) => {
                const img = zh
                    ? `/img/pack${pack.num}-${page.id}-tw.jpg`
                    : `/img/pack${pack.num}-${page.id}.jpg`;
                return `<a href="${base}${pack.slug}/" class="comics-page-link" id="pack-${pack.num}-${page.id}"><noscript><img src="${escapeAttr(img)}" alt="${escapeAttr(page.alt[key])}" width="1437" height="1999" loading="lazy" decoding="async" /></noscript><span class="comics-page-label"><span class="comics-page-pack">${escapeHtml(pack.title[key])}</span><span class="comics-page-type">${escapeHtml(page.type[key])}</span></span></a>`;
            })
        )
        .join("");
    const credit = zh
        ? `插圖由 <a href="https://ncase.me">Nicky Case</a> 繪製（CC0）。<a href="${escapeAttr(comics.source_repo)}">原始檔案</a>見 GitHub。`
        : `Illustrated by <a href="https://ncase.me">Nicky Case</a> (CC0). <a href="${escapeAttr(comics.source_repo)}">Source files</a> on GitHub.`;
    return `<div class="comics-gallery"><section class="comics-overview"><a href="${base}#the-6-pack" class="comics-overview-link"><noscript><img src="${escapeAttr(overview.src)}" alt="${escapeAttr(overview.alt)}" class="overview-image" width="${overview.width}" height="${overview.height}" loading="lazy" decoding="async" /></noscript></a>${caption}</section><div class="comics-grid">${pages}</div><p class="comics-credit">${credit}</p></div>`;
}

// Builds the three polygons (background clip, left float, right float) that
// let a five-tier shape frame's text flow along a curve — same formula as
// the overlay editor that produced comics-ja-overlays.json.
function shapePolys(
    sL: number[],
    sR: number[],
    sD: number[]
): { clip: string; left: string; right: string } {
    const d = [0, ...[...sD].sort((a, b) => a - b), 100];
    const clamp = (v: number) => Math.max(0, Math.min(100, v));
    const clipPts: string[] = [];
    for (let k = 0; k < 5; k++)
        clipPts.push(`${sR[k]}% ${d[k]}%`, `${sR[k]}% ${d[k + 1]}%`);
    for (let k = 4; k >= 0; k--)
        clipPts.push(`${sL[k]}% ${d[k + 1]}%`, `${sL[k]}% ${d[k]}%`);
    const leftPts = ["0% 0%"];
    for (let k = 0; k < 5; k++)
        leftPts.push(
            `${clamp((sL[k] ?? 0) * 2)}% ${d[k]}%`,
            `${clamp((sL[k] ?? 0) * 2)}% ${d[k + 1]}%`
        );
    leftPts.push("0% 100%");
    const rightBound = (k: number) => clamp(((sR[k] ?? 100) - 50) * 2);
    const rightPts = [`${rightBound(0)}% 0%`, "100% 0%", "100% 100%"];
    for (let k = 4; k >= 0; k--)
        rightPts.push(
            `${rightBound(k)}% ${d[k + 1]}%`,
            `${rightBound(k)}% ${d[k]}%`
        );
    return {
        clip: `polygon(${clipPts.join(", ")})`,
        left: `polygon(${leftPts.join(", ")})`,
        right: `polygon(${rightPts.join(", ")})`,
    };
}

function renderOverlayFrame(frame: ComicsOverlayFrame): string {
    // renderOverlayLayer already filters out blank-after-trim frames before
    // calling this, so at least one non-whitespace line always survives —
    // ariaText is guaranteed non-empty here.
    const ariaText = frame.text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line !== "")
        .join(" ");
    const labelAttr = ` aria-label="${escapeAttr(ariaText)}"`;
    // The gallery now draws on the wordless (no baked-in lettering) art, so
    // a background box is no longer needed to hide original English text —
    // always transparent, regardless of the authored frame.bg value.
    const background = "transparent";
    // --fs carries the authored size (frame.fontSize is a bare cqw number,
    // e.g. 2.5 -> "2.5cqw"); the shared stylesheet rule turns it into the
    // real font-size via calc(--fs * --ov-scale), which is fixed at 1 —
    // every frame renders at exactly its authored size, no auto-fit.
    const base = `top:${frame.top};left:${frame.left};width:${frame.width};height:${frame.height};--fs:${frame.fontSize}cqw;padding:${frame.pad}%;color:${frame.color};font-family:${frame.fontFamily};font-style:${frame.italic ? "italic" : "normal"};transform:rotate(${frame.angle});`;
    // Encode line breaks as a numeric character reference rather than a raw
    // "\n" — keeps the whole gallery output on one physical line, so the
    // markdown-it HTML block parser can't mistake an embedded blank-looking
    // line for the block's end. white-space: pre-wrap renders it the same.
    const text = escapeHtml(frame.text).replace(/\n/g, "&#10;");
    if (frame.shapeOn && frame.sL && frame.sR && frame.sD) {
        const { clip, left, right } = shapePolys(frame.sL, frame.sR, frame.sD);
        return `<div class="ov shaped"${labelAttr} style="${base}background:${background};text-align:${frame.align};line-height:1.3;-webkit-clip-path:${clip};clip-path:${clip};"><span style="float:left;width:50%;height:100%;shape-outside:${left};"></span><span style="float:right;width:50%;height:100%;shape-outside:${right};"></span><span class="shaped-text">${text}</span></div>`;
    }
    return `<div class="ov rect"${labelAttr} style="${base}background:${background};"><span style="text-align:${frame.align}">${text}</span></div>`;
}

function renderOverlayLayer(key: string, arVar?: string): string {
    // Drop empty-text frames (stray artifacts from the overlay editor) —
    // an invisible box would still sit pointer-events: auto and steal
    // hover/click from the image underneath it for no visible reason.
    const frames = (comicsJaOverlays[key] ?? []).filter(
        (frame) => frame.text.trim() !== ""
    );
    if (!frames.length) return "";
    const style = arVar ? ` style="--ov-ar:${arVar};"` : "";
    return `<div class="ja-ov-layer"${style}>${frames.map((frame) => renderOverlayFrame(frame)).join("")}</div>`;
}

export function renderComicsGalleryJa(): string {
    const overview = comics.overview.en;
    const caption = `<p class="figure-caption"><strong>概要。</strong>Nicky Case が描いた「ケアの6つの力」全体図。</p>`;
    const note = `<p class="figure-caption">読み上げの動作はEdgeのみで確認しています。<br />画像の保存は各囲い最下部のボタンを利用してください。</p>`;
    const dl = (jaImg: string) =>
        `<a class="next-action-button" href="${escapeAttr(jaImg)}" download><span class="button-text">画像を保存</span></a>`;
    const pages = comics.packs
        .flatMap((pack) =>
            pack.pages.map((page) => {
                const img = `/img/pack${pack.num}-${page.id}-wordless.jpg`;
                const jaImg = `/img/pack${pack.num}-${page.id}-ja.jpg`;
                const key = `pack${pack.num}-${page.id}`;
                const title = pack.title.ja ?? pack.title.en;
                const type = page.type.ja ?? page.type.en;
                const alt = `${title.replace(/^[０-９\d]+\s*/, "")}——${type}（漫画ページ）`;
                const link = `<a href="/${pack.slug}/" class="comics-page-link" id="pack-${pack.num}-${page.id}"><noscript><img src="${escapeAttr(img)}" alt="${escapeAttr(alt)}" width="1437" height="1999" loading="lazy" decoding="async" /></noscript>${renderOverlayLayer(key)}<span class="comics-page-label"><span class="comics-page-pack">${escapeHtml(title)}</span><span class="comics-page-type">${escapeHtml(type)}</span></span></a>`;
                return `<div class="comics-cell">${link}${dl(jaImg)}</div>`;
            })
        )
        .join("");
    const credit = `イラスト：<a href="https://ncase.me">Nicky Case</a>（CC0）。日本語テキストは暫定訳です。<a href="${escapeAttr(comics.source_repo)}">原資料</a>は GitHub を参照。`;
    const overviewImg = "/img/overview-small-wordless.jpg";
    const overviewJa = "/img/overview-small-ja.jpg";
    const overviewAlt = "「ケアの6つの力」全体図";
    return `<div class="comics-gallery">${note}<section class="comics-overview"><a href="/#the-6-pack" class="comics-overview-link"><noscript><img src="${escapeAttr(overviewImg)}" alt="${escapeAttr(overviewAlt)}" class="overview-image" width="${overview.width}" height="${overview.height}" loading="lazy" decoding="async" /></noscript>${renderOverlayLayer("overview-small", "1280 / 1781")}</a>${caption}${dl(overviewJa)}</section><div class="comics-grid">${pages}</div><p class="comics-credit">${credit}</p></div>`;
}

export function renderGlossaryList(lang: string | undefined): string {
    const zh = lang2(lang) === "zh";

    const tiers = [
        {
            id: "diagnosis",
            labelEn: "Diagnosis",
            labelTw: "診斷",
            descEn: "What has gone wrong.",
            descTw: "什麼出了問題。",
        },
        {
            id: "architecture",
            labelEn: "Architecture",
            labelTw: "架構",
            descEn: "What we name, and what we refuse.",
            descTw: "我們如何命名，以及我們拒絕什麼。",
        },
        {
            id: "design",
            labelEn: "Design",
            labelTw: "設計",
            descEn: "What those commitments become as design.",
            descTw: "那些承諾成為設計之後的樣子。",
        },
        {
            id: "instruments",
            labelEn: "Instruments",
            labelTw: "工具",
            descEn: "Named instruments a room can pick up.",
            descTw: "場域可以拿起來用的具名工具。",
        },
    ] as const;

    const navButtons = [
        `<button type="button" data-glossary-filter="all" aria-pressed="true">${zh ? "全部詞條" : "All terms"}</button>`,
        ...tiers.map(
            (tier) =>
                `<button type="button" data-glossary-filter="${escapeAttr(tier.id)}" aria-pressed="false">${zh ? escapeHtml(tier.labelTw) : escapeHtml(tier.labelEn)}</button>`
        ),
    ].join("");

    const nav = `<nav class="faq-filter" aria-label="${zh ? "篩選詞彙表" : "Filter glossary"}">${navButtons}</nav>`;

    const grouped: {
        diagnosis: typeof glossary;
        architecture: typeof glossary;
        design: typeof glossary;
        instruments: typeof glossary;
    } = {
        diagnosis: [],
        architecture: [],
        design: [],
        instruments: [],
    };

    for (const entry of glossary) {
        const rawTier =
            entry &&
            typeof entry === "object" &&
            "tier" in entry &&
            typeof entry.tier === "string"
                ? entry.tier
                : undefined;
        const tierKey: "diagnosis" | "architecture" | "design" | "instruments" =
            rawTier === "diagnosis" ||
            rawTier === "architecture" ||
            rawTier === "design" ||
            rawTier === "instruments"
                ? rawTier
                : "instruments";
        grouped[tierKey].push(entry);
    }

    const sections = tiers
        .map((tier) => {
            const tierEntries = grouped[tier.id];
            const heading = zh ? tier.labelTw : tier.labelEn;
            const desc = zh ? tier.descTw : tier.descEn;
            const labelAttr = tier.labelEn;

            const dts = tierEntries
                .map((entry) => {
                    const term = zh ? entry.term_tw : entry.term_en;
                    const definition = zh ? entry.def_tw : entry.def_en;
                    return `<dt id="${escapeAttr(entry.id)}">${escapeHtml(term)}</dt><dd>${definition}</dd>`;
                })
                .join("");

            return `<section class="glossary-tier" data-glossary-tier="${escapeAttr(tier.id)}" data-glossary-label="${escapeAttr(labelAttr)}"><h2 id="glossary-${escapeAttr(tier.id)}">${escapeHtml(heading)}</h2><p>${escapeHtml(desc)}</p><dl class="glossary-list">${dts}</dl></section>`;
        })
        .join("");

    return `${nav}${sections}`;
}

export function renderOpenClawRawSkillNote(which: "en" | "tw"): string {
    return openclawBootstrap.guides[which].rawSkillNote;
}

export function renderOpenClawGuideMarkdown(which: "en" | "tw"): string {
    const guide = openclawBootstrap.guides[which];
    const separator = which === "tw" ? "：" : ".";
    const lines: string[] = [];
    const section = (heading: string, body?: string) => {
        lines.push(`## ${heading}`, "");
        if (body) lines.push(body, "");
    };
    section(guide.whenToUseHeading, guide.whenToUseText);
    section(guide.firstMoveHeading, guide.firstMoveIntro);
    openclawBootstrap.readingOrder.forEach((item, index) => {
        lines.push(
            `${index + 1}. [${item.title[which]}](${item.url[which]}) — ${item.why[which]}`,
            ""
        );
    });
    lines.push("", guide.firstMoveOutro, "");
    section(guide.identityHeading, guide.identityIntro);
    guide.identityItems.forEach((item) =>
        lines.push(`- **${item.label}${separator}** ${item.text}`, "")
    );
    lines.push("");
    section(guide.conversationHeading, guide.conversationIntro);
    guide.conversationItems.forEach((item) => lines.push(`- ${item}`, ""));
    section(guide.commitmentsHeading, guide.commitmentsIntro);
    guide.commitments.forEach((item) =>
        lines.push(`- **${item.label}${separator}** ${item.text}`, "")
    );
    section(guide.antiPatternsHeading, guide.antiPatternsIntro);
    guide.antiPatterns.forEach((item) => lines.push(`- ${item}`, ""));
    section(guide.mappingHeading, guide.mappingIntro);
    guide.mapping.forEach((item) =>
        lines.push(`- **\`${item.file}\`** — ${item.text}`, "")
    );
    if (guide.memoryHeading) section(guide.memoryHeading, guide.memoryIntro);
    lines.push(guide.closing);
    return lines.join("\n");
}

export function asciifySkill(content: string): string {
    return (
        content
            .replace(/—/g, "--")
            .replace(/[–‑]/g, "-")
            .replace(/['‘’′]/g, "'")
            .replace(/[“”″]/g, '"')
            .replace(/…/g, "...")
            .replace(/→/g, "->")
            .replace(/[    ]/g, " ")
            // oxlint-disable-next-line no-control-regex -- intentional full-ASCII strip (control chars deliberately included)
            .replace(/[^\x00-\x7F]/g, "")
    );
}
