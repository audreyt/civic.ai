// conceptMap.ts — the Measures map. Renders the framework map from one data
// file (_data/concept_map.json) as three plain zones read top to bottom: the
// four-pack care cycle (a loop of cards on wide screens, a sequence on phones),
// the field between organisations (Pack 5), and Pack 6, the boundary in time,
// whose outline frames the whole map. Every relation is written out in words;
// a pack's hue only says which pack it is. Zero client JS.

import conceptMapData from "../../_data/concept_map.json";
import { lang2 } from "./site";

interface Bilingual {
    en: string;
    tw: string;
}

interface MeasureRef {
    anchor: string;
    name: Bilingual;
}

export interface PackNode {
    num: number;
    slug: string;
    hue: string;
    title: Bilingual;
    measure: MeasureRef;
}

interface Handoff {
    from: number;
    to: number;
    kind: "cycle" | "chord" | "field" | "membrane";
    cargo: Bilingual;
    both?: boolean;
}

interface ConceptMapData {
    aria: Bilingual;
    cycleLabel: Bilingual;
    fieldLabel: Bilingual;
    measureLabel: Bilingual;
    handsLabel: Bilingual;
    loopLabel: Bilingual;
    /** Relation lead-ins; "{pack}" becomes the linked pack name. */
    alsoTemplate: Bilingual;
    fromTemplate: Bilingual;
    toTemplate: Bilingual;
    bothTemplate: Bilingual;
    membrane: PackNode;
    packs: PackNode[];
    handoffs: Handoff[];
    guard: Bilingual;
    legend: Bilingual;
    legendUrl: Bilingual;
}

export const conceptMap = conceptMapData as unknown as ConceptMapData;

type Key = "en" | "tw";

export function escapeHtml(value: string | number | null | undefined): string {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

export function byNum(num: number): PackNode {
    if (num === 6) return conceptMap.membrane;
    const pack = conceptMap.packs.find((p) => p.num === num);
    if (!pack) throw new Error(`concept map: unknown pack ${num}`);
    return pack;
}

export function cycleHand(from: number): Handoff {
    const hand = conceptMap.handoffs.find(
        (h) => h.kind === "cycle" && h.from === from
    );
    if (!hand) throw new Error(`concept map: missing cycle handoff ${from}`);
    return hand;
}

function packUrl(pack: PackNode, zh: boolean): string {
    return zh ? `/tw/${pack.slug}/` : `/${pack.slug}/`;
}

function measureUrl(measure: MeasureRef, zh: boolean): string {
    return zh
        ? `/tw/measures/#${measure.anchor}`
        : `/measures/#${measure.anchor}`;
}

// Chapters open beside the map so the reader keeps their place; links within
// this page stay in it.
function mapHrefAttrs(href: string): string {
    const escaped = escapeHtml(href);
    return href.includes("#")
        ? `href="${escaped}"`
        : `href="${escaped}" target="_blank" rel="noopener"`;
}

/** Fill a relation template's "{pack}" slot with the linked pack name. */
export function relation(
    template: string,
    pack: PackNode,
    zh: boolean,
    key: Key
): string {
    const [before, after] = template.split("{pack}");
    return `${escapeHtml(before)}<a class="cmap-pack" ${mapHrefAttrs(packUrl(pack, zh))} style="--hue:${pack.hue}">${escapeHtml(pack.title[key])}</a>${escapeHtml(after)}`;
}

function rel(
    template: Bilingual,
    pack: PackNode,
    cargo: Bilingual,
    zh: boolean,
    key: Key
): string {
    return `<li><span class="cmap-rel">${relation(template[key], pack, zh, key)}</span><span class="cmap-cargo">${escapeHtml(cargo[key])}</span></li>`;
}

function rels(items: string[]): string {
    return items.length ? `<ul class="cmap-rels">${items.join("")}</ul>` : "";
}

function card(
    pack: PackNode,
    zh: boolean,
    key: Key,
    body: string,
    cls: string
): string {
    return `<div class="cmap-card${cls}" id="st-p${pack.num}" style="--hue:${pack.hue}"><h5 class="cmap-card-title"><a ${mapHrefAttrs(packUrl(pack, zh))}>${escapeHtml(pack.title[key])}</a></h5><p class="cmap-measure"><span class="cmap-label">${escapeHtml(conceptMap.measureLabel[key])}</span><a ${mapHrefAttrs(measureUrl(pack.measure, zh))}>${escapeHtml(pack.measure.name[key])}</a></p>${body}</div>`;
}

// Packs 1–4, each followed by what it hands the next; the last hands back to 1.
function renderCycle(zh: boolean, key: Key): string {
    const parts: string[] = [];
    for (const num of [1, 2, 3, 4]) {
        const pack = byNum(num);
        const also = conceptMap.handoffs
            .filter((h) => h.kind === "chord" && h.from === num)
            .map((h) =>
                rel(conceptMap.alsoTemplate, byNum(h.to), h.cargo, zh, key)
            );
        parts.push(
            card(pack, zh, key, rels(also), ` cmap-step cmap-step--${num}`)
        );
        const hand = cycleHand(num);
        const gap = zh ? "" : " ";
        const heard = `${pack.title[key]}${gap}${conceptMap.handsLabel[key]}${gap}${byNum(hand.to).title[key]}${zh ? "：" : ": "}`;
        const back =
            num === 4
                ? `<a class="cmap-back" href="#st-p1">${escapeHtml(conceptMap.loopLabel[key])}</a>`
                : "";
        parts.push(
            `<p class="cmap-hand cmap-hand--${num}"><span class="visually-hidden">${escapeHtml(heard)}</span><span class="cmap-cargo">${escapeHtml(hand.cargo[key])}</span>${back}</p>`
        );
    }
    return `<div class="cmap-zone cmap-zone--cycle"><h4 class="cmap-zone-title">${escapeHtml(conceptMap.cycleLabel[key])}</h4><div class="cmap-cycle">${parts.join("")}</div></div>`;
}

// Pack 5, with what the cycle hands it.
function renderField(zh: boolean, key: Key): string {
    const from = conceptMap.handoffs
        .filter((h) => h.kind === "field")
        .map((h) =>
            rel(conceptMap.fromTemplate, byNum(h.from), h.cargo, zh, key)
        );
    return `<div class="cmap-zone cmap-zone--field"><h4 class="cmap-zone-title">${escapeHtml(conceptMap.fieldLabel[key])}</h4>${card(byNum(5), zh, key, rels(from), "")}</div>`;
}

// Pack 6: what comes into the boundary, what goes out, and what runs both ways.
function renderBoundary(zh: boolean, key: Key): string {
    const links = conceptMap.handoffs
        .filter((h) => h.kind === "membrane")
        .map((h) => {
            const outward = h.from === 6;
            const template = h.both
                ? conceptMap.bothTemplate
                : outward
                  ? conceptMap.toTemplate
                  : conceptMap.fromTemplate;
            return rel(
                template,
                byNum(outward ? h.to : h.from),
                h.cargo,
                zh,
                key
            );
        });
    const guard = `<p class="cmap-guard">${escapeHtml(conceptMap.guard[key])}</p>`;
    return `<div class="cmap-zone cmap-zone--boundary">${card(byNum(6), zh, key, rels(links) + guard, " cmap-card--boundary")}</div>`;
}

export function renderConceptMap(lang: string | undefined): string {
    const zh = lang2(lang) === "zh";
    const key: Key = zh ? "tw" : "en";
    return (
        `<div class="cmap" role="group" aria-label="${escapeHtml(conceptMap.aria[key])}">` +
        `<style>@view-transition{navigation:auto}</style>` +
        `<div class="cmap-frame">${renderCycle(zh, key)}${renderField(zh, key)}${renderBoundary(zh, key)}</div>` +
        `<p class="cmap-legend"><a ${mapHrefAttrs(conceptMap.legendUrl[key])}>${escapeHtml(conceptMap.legend[key])}</a></p>` +
        `</div>`
    );
}
