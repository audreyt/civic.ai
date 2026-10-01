import type { Amendment } from "./record";

function xml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;");
}

/** Commit hashes are stable Atom IDs; no build-time pseudo-amendments. */
export function amendmentFeed(
    amendments: readonly Amendment[],
    site: { readonly url: string; readonly builtAt: string }
): string {
    const entries = amendments
        .map(
            (entry) => `<entry>
<id>urn:civic-ai:git:${xml(entry.id)}</id>
<title>${xml(entry.subject)}</title>
<updated>${xml(entry.date)}</updated>
<link href="https://github.com/audreyt/civic.ai/commit/${xml(entry.id)}"/>
${entry.pages.map((page) => `<link rel="related" href="${xml(site.url + page.url)}" title="${xml(page.title)}"/>`).join("\n")}
<summary>${xml(entry.pages.map((page) => page.url).join(" · ") + " — " + entry.subject)}</summary>
</entry>`
        )
        .join("\n");
    return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en-GB">
<id>${xml(site.url)}/feed.xml</id>
<title>Civic AI amendments</title>
<link rel="self" href="${xml(site.url)}/feed.xml"/>
<link href="${xml(site.url)}/ledger/"/>
<updated>${xml(amendments[0]?.date ?? site.builtAt)}</updated>
<author><name>Civic AI stewards</name></author>
<rights>CC0 public domain</rights>
${entries}
</feed>`;
}
