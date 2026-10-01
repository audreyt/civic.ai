// Render a page SVG in Chromium (as the site will) and diff it against the
// reference master: the honest test that nothing was lost.
import {
    existsSync,
    mkdtempSync,
    readFileSync,
    rmSync,
    writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import sharp from "sharp";

const CHROME = [
    "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/chromium",
    "/usr/bin/google-chrome",
];

export async function launch() {
    const executablePath =
        process.env.CHROME_PATH ?? CHROME.find((p) => existsSync(p));
    if (!executablePath) throw new Error("no Chromium found; set CHROME_PATH");
    const { default: puppeteer } = await import("puppeteer-core");
    return puppeteer.launch({
        executablePath,
        args: [
            "--no-sandbox",
            "--allow-file-access-from-files",
            "--force-color-profile=srgb",
            "--font-render-hinting=none",
            "--disable-lcd-text",
        ],
    });
}

export async function renderPage(browser, svg, root, w, h, scale) {
    const dir = mkdtempSync(join(tmpdir(), "comic-verify-"));
    try {
        const base = `file://${resolve(root)}`;
        const local = svg
            .replaceAll('href="/img/', `href="${base}/img/`)
            .replaceAll("url(/fonts/", `url(${base}/fonts/`);
        const W = Math.round(w * scale),
            H = Math.round(h * scale);
        const page = await browser.newPage();
        await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
        const html = join(dir, "page.html");
        writeFileSync(
            html,
            `<!doctype html><html><head><style>html,body{margin:0}svg{display:block;width:${W}px;height:${H}px}</style></head><body>${local.replace(/ width="\d+" height="\d+"/, "")}</body></html>`
        );
        await page.goto(`file://${html}`, { waitUntil: "load" });
        await page.evaluate(async () => {
            await document.fonts.ready;
            for (const img of document.querySelectorAll("image"))
                await img.decode?.().catch(() => {});
            await new Promise((r) => setTimeout(r, 250));
        });
        const shot = await page.screenshot({
            clip: { x: 0, y: 0, width: W, height: H },
            type: "png",
        });
        await page.close();
        return shot;
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
}

// Mean absolute difference and share of strongly differing pixels.
export async function compare(shot, ref, W, H, diffOut) {
    const a = await sharp(shot).removeAlpha().raw().toBuffer();
    const b = await sharp(ref.data, {
        raw: { width: ref.w, height: ref.h, channels: 3 },
        limitInputPixels: false,
    })
        .resize(W, H, { fit: "fill", kernel: "lanczos3" })
        .raw()
        .toBuffer();
    let sum = 0,
        big = 0;
    const diff = diffOut ? Buffer.alloc(W * H * 3, 255) : null;
    for (let i = 0; i < W * H; i++) {
        const j = i * 3;
        const d = Math.max(
            Math.abs(a[j] - b[j]),
            Math.abs(a[j + 1] - b[j + 1]),
            Math.abs(a[j + 2] - b[j + 2])
        );
        sum += d;
        if (d > 64) {
            big++;
            if (diff) diff[j + 1] = diff[j + 2] = 0;
        }
    }
    if (diff)
        await sharp(diff, { raw: { width: W, height: H, channels: 3 } })
            .png()
            .toFile(diffOut);
    return { mean: sum / (W * H), strong: big / (W * H) };
}

export function readSvg(path) {
    return readFileSync(path, "utf8");
}
