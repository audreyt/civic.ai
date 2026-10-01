// Inline language annotation (DESIGN.md §21): rendered prose passes through
// unchanged until mixed-language runs are labelled here.
export function annotateInlineLang(
    html: string,
    _lang: string | undefined
): string {
    return html;
}
