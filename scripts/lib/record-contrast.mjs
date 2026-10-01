function luminance(hex) {
    const expanded =
        hex.length === 4
            ? `#${Array.from(hex.slice(1), (c) => c + c).join("")}`
            : hex;
    const channels = [1, 3, 5].map((i) => {
        const n = Number.parseInt(expanded.slice(i, i + 2), 16) / 255;
        return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
    });
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

export function contrastRatio(a, b) {
    const light = luminance(a);
    const dark = luminance(b);
    return (Math.max(light, dark) + 0.05) / (Math.min(light, dark) + 0.05);
}

/** Static root token eval, not a claim to have audited arbitrary page pixels. */
export function evaluateContrast(css) {
    const light = {};
    const dark = {};
    const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
    for (const [, selector, declarations] of clean.matchAll(
        /([^{}]+)\{([^{}]*)\}/g
    )) {
        const selectors = selector.split(",").map((s) => s.trim());
        let target;
        if (
            selectors.some((s) =>
                /^(?::root|html)(?:\[data-theme=["']light["']\])?$/.test(s)
            )
        )
            target = light;
        else if (
            selectors.some((s) =>
                /^(?::root|html)\[data-theme=["']dark["']\]$/.test(s)
            )
        )
            target = dark;
        if (!target) continue;
        for (const [, key, value] of declarations.matchAll(
            /(--[\w-]+)\s*:\s*([^;{}]+);/g
        ))
            target[key] = value.trim();
    }
    const rows = [];
    for (const [theme, tokens] of [
        ["light", light],
        ["dark", { ...light, ...dark }],
    ]) {
        function colour(key, seen = new Set()) {
            if (seen.has(key)) return undefined;
            seen.add(key);
            const value = tokens[key];
            if (/^#[\da-f]{3}(?:[\da-f]{3})?$/i.test(value)) return value;
            const ref = /^var\((--[\w-]+)\)$/.exec(value);
            return ref ? colour(ref[1], seen) : undefined;
        }
        // Body, secondary text, links and contest text on both prose grounds.
        for (const text of ["--ink", "--soil", "--moss", "--cinnabar"]) {
            for (const ground of ["--field", "--surface"]) {
                const fg = colour(text);
                const bg = colour(ground);
                const ratio = fg && bg ? contrastRatio(fg, bg) : null;
                rows.push({
                    theme,
                    text,
                    ground,
                    foreground: fg ?? null,
                    background: bg ?? null,
                    ratio,
                    pass: ratio !== null && ratio >= 4.5,
                });
            }
        }
    }
    return {
        pass: rows.every((row) => row.pass),
        detail: rows,
        scope: "Static root text/ground tokens, both themes; WCAG AA 4.5:1. Missing or unresolved tokens fail. Not a full pixel audit.",
        scopeZh:
            "核對明暗主題的根層文字與底色變數，門檻為 WCAG AA 4.5：1。缺失或無法解析即未通過；非全頁像素稽核。",
    };
}
