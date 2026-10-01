// The stylesheet's comments document the source for editors; readers do not
// need them, and they are about a quarter of its gzip weight (DESIGN.md §15).
export function stripCssComments(css) {
    return css
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\n[ \t]*\n(?:[ \t]*\n)+/g, "\n\n");
}
