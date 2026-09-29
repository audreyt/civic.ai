// Browser regression for the search dialog and primary-nav current state.
// Ordinary UI assertions against a running production build (not a model eval).
//   BASE_URL=http://127.0.0.1:4321 node tests/search-dialog.browser.mjs
// Optional: CHROME_PATH=/path/to/chrome, SHOTS_DIR=/tmp/shots
import { existsSync, mkdirSync } from "node:fs";
import puppeteer from "puppeteer-core";

const BASE_URL = (process.env.BASE_URL || "http://127.0.0.1:4321").replace(
    /\/$/,
    ""
);
const SHOTS_DIR = process.env.SHOTS_DIR;
const CHROME_CANDIDATES = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
];
const executablePath = CHROME_CANDIDATES.find((p) => p && existsSync(p));
if (!executablePath) {
    console.error("No local Chrome found; set CHROME_PATH.");
    process.exit(2);
}

const failures = [];
let checks = 0;
function check(name, ok, detail = "") {
    checks += 1;
    if (!ok) failures.push(`${name}${detail ? ` :: ${detail}` : ""}`);
    console.log(`${ok ? "ok  " : "FAIL"} ${name}${ok ? "" : ` :: ${detail}`}`);
}

const BASE_ORIGIN = new URL(BASE_URL).origin;

async function newPage(browser, width, height) {
    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.setRequestInterception(true);
    page.on("request", (req) => {
        const url = req.url();
        if (url.startsWith("data:") || new URL(url).origin === BASE_ORIGIN) {
            req.continue();
        } else {
            req.abort();
        }
    });
    return page;
}

async function awaited(name, promise) {
    try {
        await promise;
        check(name, true);
    } catch (error) {
        check(name, false, error.message);
    }
}

const state = (page) =>
    page.evaluate(() => {
        const overlay = document.getElementById("search-overlay");
        const active = document.activeElement;
        return {
            open: overlay.classList.contains("active"),
            ariaHidden: overlay.getAttribute("aria-hidden"),
            focusInside: overlay.contains(active),
            focusId: active && (active.id || active.tagName),
            focusIsInput: !!active && active.matches("input"),
            focusIsToggle: !!active && active.matches(".search-toggle"),
            overflow: document.body.style.overflow,
        };
    });

const TABBABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const markTabbables = (page) =>
    page.evaluate((selector) => {
        document
            .querySelectorAll("[data-qa-tab]")
            .forEach((el) => el.removeAttribute("data-qa-tab"));
        const items = Array.from(
            document.getElementById("search-overlay").querySelectorAll(selector)
        ).filter(
            (el) =>
                el.tabIndex >= 0 &&
                el.getClientRects().length > 0 &&
                !["hidden", "collapse"].includes(
                    getComputedStyle(el).visibility
                )
        );
        items.forEach((el, index) =>
            el.setAttribute("data-qa-tab", String(index))
        );
        return items.length;
    }, TABBABLE);

const focusedTabIndex = (page) =>
    page.evaluate(() => document.activeElement?.getAttribute("data-qa-tab"));

const focusTabIndex = (page, index) =>
    page.evaluate((i) => {
        document.querySelector(`[data-qa-tab="${i}"]`).focus();
    }, index);

async function boundaryChecks(page, label) {
    await page.evaluate(() => {
        const hidden = document.createElement("button");
        hidden.id = "qa-hidden-last";
        hidden.textContent = "hidden";
        hidden.style.visibility = "hidden";
        document.querySelector(".search-overlay__inner").append(hidden);
    });
    try {
        const count = await markTabbables(page);
        check(`${label}: several tabbable items`, count >= 3, String(count));
        const linkCount = await page.$$eval(
            "#search-overlay [data-qa-tab].pagefind-ui__result-link",
            (els) => els.length
        );
        check(
            `${label}: result anchors are tabbable`,
            linkCount > 0,
            String(linkCount)
        );
        check(
            `${label}: visibility:hidden button is excluded`,
            await page.$eval(
                "#qa-hidden-last",
                (el) => !el.hasAttribute("data-qa-tab")
            )
        );

        await focusTabIndex(page, count - 1);
        await page.keyboard.press("Tab");
        check(
            `${label}: Tab from last wraps to first`,
            (await focusedTabIndex(page)) === "0",
            String(await focusedTabIndex(page))
        );

        await focusTabIndex(page, 0);
        await page.keyboard.down("Shift");
        await page.keyboard.press("Tab");
        await page.keyboard.up("Shift");
        check(
            `${label}: Shift+Tab from first wraps to last`,
            (await focusedTabIndex(page)) === String(count - 1),
            String(await focusedTabIndex(page))
        );

        await page.evaluate(() => document.activeElement.blur());
        await page.keyboard.press("Tab");
        check(
            `${label}: Tab from outside returns to first inside`,
            (await focusedTabIndex(page)) === "0",
            String(await focusedTabIndex(page))
        );

        const seen = [];
        for (let i = 0; i < count + 2; i += 1) {
            await page.keyboard.press("Tab");
            seen.push(
                await page.evaluate(() => document.activeElement?.id || "")
            );
        }
        check(
            `${label}: hidden button never receives focus`,
            !seen.includes("qa-hidden-last"),
            seen.join()
        );
    } finally {
        await page.evaluate(() => {
            document.getElementById("qa-hidden-last")?.remove();
            document
                .querySelectorAll("[data-qa-tab]")
                .forEach((el) => el.removeAttribute("data-qa-tab"));
        });
    }
}

async function typeQuery(page) {
    await page.waitForFunction(
        () => document.activeElement?.matches("#search-overlay input"),
        { timeout: 5000 }
    );
    await page.keyboard.type("care");
    await page.waitForSelector("#search-overlay .pagefind-ui__result-link", {
        visible: true,
        timeout: 12000,
    });
}

async function searchDialog(browser, path, label) {
    const page = await newPage(browser, 1600, 900);
    await page.goto(`${BASE_URL}${path}`, { waitUntil: "networkidle0" });
    const toggle = ".search-toggle";
    await page.waitForSelector(toggle);
    const prior = await page.evaluate(() => {
        document.body.style.overflow = "clip";
        return document.body.style.overflow;
    });

    const dialog = await page.$eval("#search-overlay", (el) => ({
        modal: el.getAttribute("aria-modal"),
        tabindex: el.getAttribute("tabindex"),
        closeLabel: document.getElementById("search-close")?.textContent,
    }));
    check(
        `${label}: dialog is modal and focusable`,
        dialog.modal === "true" && dialog.tabindex === "-1"
    );
    check(`${label}: visible close button`, !!dialog.closeLabel);

    await page.focus(toggle);
    await page.click(toggle);
    let s = await state(page);
    check(
        `${label}: open focuses inside immediately`,
        s.open && s.focusInside && s.ariaHidden !== "true",
        JSON.stringify(s)
    );
    await awaited(
        `${label}: focus reaches the search input`,
        page.waitForFunction(
            () => document.activeElement?.matches("#search-overlay input"),
            { timeout: 5000 }
        )
    );
    s = await state(page);
    check(
        `${label}: focused element is the input`,
        s.focusInside && s.focusIsInput,
        JSON.stringify(s)
    );

    await awaited(
        `${label}: input is ready`,
        page.waitForFunction(
            () =>
                document
                    .querySelector("#search-container input")
                    ?.getAttribute("role") === "combobox",
            { timeout: 5000 }
        )
    );
    await awaited(`${label}: visible results appear`, typeQuery(page));
    const resultLinks = await page.$$eval(
        "#search-overlay .pagefind-ui__result-link",
        (els) => els.filter((el) => el.getClientRects().length > 0).length
    );
    check(
        `${label}: visible result links > 0`,
        resultLinks > 0,
        String(resultLinks)
    );
    console.log(`     ${label}: ${resultLinks} visible result links`);
    await boundaryChecks(page, label);

    await page.click("#search-close");
    s = await state(page);
    check(
        `${label}: close button hides and restores focus`,
        !s.open && s.ariaHidden === "true" && s.focusIsToggle,
        JSON.stringify(s)
    );
    check(
        `${label}: overflow restored after close`,
        s.overflow === prior,
        s.overflow
    );

    await page.focus(toggle);
    await page.click(toggle);
    await page.keyboard.press("Escape");
    s = await state(page);
    check(
        `${label}: Escape closes and restores focus`,
        !s.open && s.focusIsToggle && s.overflow === prior,
        JSON.stringify(s)
    );

    await page.focus(toggle);
    await page.click(toggle);
    await page.mouse.click(4, 4);
    s = await state(page);
    check(
        `${label}: backdrop closes and restores focus`,
        !s.open && s.focusIsToggle,
        JSON.stringify(s)
    );

    for (const key of ["Control", "Meta"]) {
        await page.focus(toggle);
        await page.keyboard.down(key);
        await page.keyboard.press("k");
        await page.keyboard.up(key);
        s = await state(page);
        check(
            `${label}: ${key}+K opens`,
            s.open && s.focusInside,
            JSON.stringify(s)
        );
        await page.keyboard.down(key);
        await page.keyboard.press("k");
        await page.keyboard.up(key);
        s = await state(page);
        check(
            `${label}: ${key}+K closes and preserves focus`,
            !s.open && s.focusIsToggle && s.overflow === prior,
            JSON.stringify(s)
        );
    }

    const fast = await page.evaluate(async () => {
        const btn = document.querySelector(".search-toggle");
        btn.focus();
        btn.click();
        document.getElementById("search-close").click();
        await new Promise((resolve) => setTimeout(resolve, 400));
        const overlay = document.getElementById("search-overlay");
        return {
            hidden: overlay.getAttribute("aria-hidden"),
            active: overlay.classList.contains("active"),
            focusInside: overlay.contains(document.activeElement),
            overflow: document.body.style.overflow,
        };
    });
    check(
        `${label}: fast open/close never focuses hidden dialog`,
        fast.hidden === "true" &&
            !fast.active &&
            !fast.focusInside &&
            fast.overflow === prior,
        JSON.stringify(fast)
    );

    const twice = await page.evaluate(() => {
        const btn = document.querySelector(".search-toggle");
        btn.click();
        btn.click();
        document.getElementById("search-close").click();
        return document.body.style.overflow;
    });
    check(
        `${label}: repeated open keeps original overflow`,
        twice === prior,
        twice
    );
    await page.close();
}

async function proofShots(browser, path, label) {
    if (!SHOTS_DIR) return;
    mkdirSync(SHOTS_DIR, { recursive: true });
    const mobile = await newPage(browser, 390, 844);
    await mobile.goto(`${BASE_URL}${path}`, { waitUntil: "networkidle0" });
    await mobile.click(".search-toggle");
    await mobile.waitForFunction(
        () =>
            document
                .querySelector("#search-container input")
                ?.getAttribute("role") === "combobox",
        { timeout: 5000 }
    );
    await typeQuery(mobile);
    await mobile.screenshot({ path: `${SHOTS_DIR}/${label}-modal-390.png` });
    await mobile.close();
    for (const width of [390, 1600]) {
        const page = await newPage(browser, width, 900);
        await page.goto(`${BASE_URL}${path}`, { waitUntil: "networkidle0" });
        await page.evaluate(() =>
            document
                .getElementById("start-today")
                .scrollIntoView({ behavior: "instant", block: "start" })
        );
        await awaited(
            `${label}@${width}: start-today section is pictured`,
            page.waitForFunction(
                () => {
                    const el = document.getElementById("start-today");
                    const rect = el.getBoundingClientRect();
                    const margin =
                        parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
                    return (
                        Math.abs(rect.top - margin) <= 4 &&
                        rect.height > 0 &&
                        rect.bottom <= window.innerHeight
                    );
                },
                { timeout: 5000 }
            )
        );
        await page.screenshot({
            path: `${SHOTS_DIR}/${label}-start-today-${width}.png`,
        });
        await page.close();
    }
}

async function navCurrent(browser, path, expected, label) {
    const page = await newPage(browser, 1600, 900);
    await page.goto(`${BASE_URL}${path}`, { waitUntil: "domcontentloaded" });
    const current = await page.$$eval(
        'nav.site-nav a[aria-current="page"]',
        (els) =>
            els.map((el) => el.querySelector(".nav-label-full").textContent)
    );
    check(
        `${label}: aria-current`,
        JSON.stringify(current) === JSON.stringify(expected),
        JSON.stringify(current)
    );
    await page.close();
}

async function overflow(browser, path, width, label) {
    const page = await newPage(browser, width, 900);
    await page.goto(`${BASE_URL}${path}`, { waitUntil: "networkidle0" });
    const res = await page.evaluate(() => ({
        doc:
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
    }));
    check(
        `${label}@${width}: no document horizontal overflow`,
        res.doc <= 1,
        String(res.doc)
    );
    if (SHOTS_DIR) {
        mkdirSync(SHOTS_DIR, { recursive: true });
        const name = `${label}-${width}.png`;
        await page.screenshot({
            path: `${SHOTS_DIR}/${name}`,
            fullPage: false,
        });
    }
    await page.close();
}

const browser = await puppeteer.launch({ executablePath, headless: true });
try {
    await searchDialog(browser, "/", "EN home (Pagefind)");
    await searchDialog(browser, "/tw/", "TW home (Fuse)");
    await proofShots(browser, "/", "en-home");
    await proofShots(browser, "/tw/", "tw-home");

    await navCurrent(browser, "/", ["Home"], "EN home");
    await navCurrent(browser, "/tw/", ["首頁"], "TW home");
    await navCurrent(browser, "/faq/", ["FAQ"], "EN faq");
    await navCurrent(browser, "/tw/faq/", ["常見問答"], "TW faq");
    await navCurrent(browser, "/measures/", ["Map"], "EN measures");
    await navCurrent(browser, "/tw/measures/", ["地圖"], "TW measures");
    await navCurrent(browser, "/1/", [], "EN pack 1");
    await navCurrent(browser, "/tw/1/", [], "TW pack 1");

    for (const width of [1600, 390]) {
        for (const [path, name] of [
            ["/", "en-home"],
            ["/tw/", "tw-home"],
            ["/faq/", "en-faq"],
            ["/tw/faq/", "tw-faq"],
            ["/sources/", "en-sources"],
            ["/tw/sources/", "tw-sources"],
            ["/kami/", "en-kami"],
            ["/tw/kami/", "tw-kami"],
        ]) {
            await overflow(browser, path, width, name);
        }
    }
} finally {
    await browser.close();
}

console.log(`\n${checks - failures.length}/${checks} checks passed`);
if (failures.length) {
    console.error(
        `\n${failures.length} failure(s):\n- ${failures.join("\n- ")}`
    );
    process.exit(1);
}
