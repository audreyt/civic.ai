// Comic pages rebuilt as vector plates by scripts/comics-vector.mjs: the art
// stays a responsive raster, Nicky Case's hand lettering arrives as a traced
// SVG image, and the typeset words are live, selectable SVG text inline in
// the page (DESIGN.md §10, Comics).

export interface VectorComic {
    viewBox: string;
    lang: string | undefined;
    art: string;
    lettering: string | undefined;
    text: string;
}

// The standalone page SVG (img/<stem>.svg) is the single source: its art
// and lettering references and its text layer.
export function parseComicSvg(svg: string): VectorComic | undefined {
    const viewBox = /<svg\b[^>]*\sviewBox="([^"]+)"/.exec(svg)?.[1];
    const art = /<image href="([^"]+)"/.exec(svg)?.[1];
    const text = /<g class="comic-text">([\s\S]*)<\/g><\/svg>/.exec(svg)?.[1];
    if (!viewBox || !art || text === undefined) return undefined;
    return {
        viewBox,
        lang: /<svg\b[^>]*\slang="([^"]+)"/.exec(svg)?.[1],
        art,
        lettering: /<image class="comic-lettering" href="([^"]+)"/.exec(
            svg
        )?.[1],
        text,
    };
}

const NOSCRIPT_IMG =
    /<noscript>\s*(<img\b[^>]*?\ssrc="(\/img\/[^"]+)\.(?:jpe?g|png)"[^>]*>)\s*<\/noscript>/gi;

function attributes(tag: string): Map<string, string> {
    const out = new Map<string, string>();
    for (const [, name, value] of tag.matchAll(/\s([a-z-]+)="([^"]*)"/g))
        out.set(name as string, value as string);
    return out;
}

// Same column sizes as the other content images (legacyMarkdown.ts).
const SIZES = "(max-width: 700px) calc(100vw - 40px), 640px";

const FULL_SIZE_LINK =
    /<a href="(\/img\/[^"]+)\.(?:jpe?g|png)" data-comic-full>/g;

export function vectorComics(
    html: string,
    hasFile: (publicPath: string) => boolean,
    readFile: (publicPath: string) => string
): string {
    // "Open the full-size image" opens the vector page where there is one.
    const linked = html.replace(FULL_SIZE_LINK, (match, stem: string) =>
        hasFile(`${stem}.svg`)
            ? `<a href="${stem}.svg">`
            : match.replace(" data-comic-full", "")
    );
    return linked.replace(NOSCRIPT_IMG, (match, img: string, stem: string) => {
        if (!hasFile(`${stem}.svg`)) return match;
        const comic = parseComicSvg(readFile(`${stem}.svg`));
        if (!comic) throw new Error(`${stem}.svg is not a comic page SVG`);
        const attrs = attributes(img);
        const width = Number(attrs.get("width"));
        const height = Number(attrs.get("height"));
        if (!width || !height)
            throw new Error(`${stem}: comic plates need width and height`);
        // art: "/img/x-wordless-2874w.avif" -> "/img/x-wordless" renditions
        const base = comic.art.replace(/(?:-\d+w)?\.avif$/, "");
        const srcset = [
            hasFile(`${base}-720w.avif`) ? `${base}-720w.avif 720w` : "",
            `${base}.avif ${width}w`,
            hasFile(`${base}-${width * 2}w.avif`)
                ? `${base}-${width * 2}w.avif ${width * 2}w`
                : "",
        ]
            .filter(Boolean)
            .join(", ");
        const fallback = hasFile(`${base}.jpg`) ? `${base}.jpg` : `${stem}.jpg`;
        const lettered = hasFile(`${stem}.jpg`)
            ? `${stem}.jpg`
            : /\ssrc="([^"]+)"/.exec(img)?.[1];
        const loading = attrs.get("loading");
        const keep = ["alt", "width", "height", "loading", "fetchpriority"]
            .filter((name) => attrs.has(name))
            .map((name) => ` ${name}="${attrs.get(name)}"`)
            .join("");
        const cls = [
            "comic",
            comic.lettering ? "comic--lettered" : "",
            attrs.get("class"),
        ]
            .filter(Boolean)
            .join(" ");
        const zh = /^zh/i.test(comic.lang ?? "");
        // Lockdown Mode blocks web fonts: the lettered raster then stands in
        // (styles.css, .fonts-unavailable .comic).
        const style = `aspect-ratio: ${width} / ${height}; --comic-ar: ${width} / ${height};${comic.lettering ? ` --comic-lettered: url(${lettered});` : ""}`;
        const picture = `<picture><source srcset="${srcset}" sizes="${SIZES}" type="image/avif"><img class="comic-art" src="${fallback}"${keep} decoding="async"></picture>`;
        const lettering = comic.lettering
            ? `<img class="comic-lettering" src="${comic.lettering}" alt="" width="${width}" height="${height}"${loading ? ` loading="${loading}"` : ""} decoding="async">`
            : "";
        const label = zh ? "漫畫文字" : "Comic text";
        const text = `<svg class="comic-text${zh ? " comic-text--overlay" : ""}" viewBox="${comic.viewBox}" preserveAspectRatio="none"${comic.lang ? ` lang="${comic.lang}"` : ""} role="group" aria-label="${label}" data-font-subset="skip">${comic.text}</svg>`;
        return `<span class="${cls}" style="${style}">${picture}${lettering}${text}</span>`;
    });
}
