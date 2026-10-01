import { loadPages } from "../lib/pages";
import { record } from "../lib/record";
import { amendmentFeed } from "../lib/recordFeed";
import { site } from "../lib/site";

export function GET() {
    return new Response(
        amendmentFeed(record.amendments(loadPages()), {
            url: site.url,
            builtAt: new Date().toISOString(),
        }),
        { headers: { "Content-Type": "application/atom+xml; charset=utf-8" } }
    );
}
