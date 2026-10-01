(function () {
    var overlay = document.getElementById("search-overlay");
    var container = document.getElementById("search-container");
    if (!overlay || !container) return;

    var instance = null;
    var suggestions = [];
    var dropdown = null;
    var activeIdx = -1;
    var input = null;
    var suppressHide = false;
    var lastFocus = null;
    var lastOverflow = "";
    var closeButton = document.getElementById("search-close");

    // The search UI stylesheet styles only this overlay, so it stays off the
    // critical rendering path: fetch it once the page has loaded, or on the
    // first open if that comes sooner.
    var searchCss = overlay.getAttribute("data-search-css");
    function ensureSearchCss() {
        if (!searchCss) return;
        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = searchCss;
        document.head.appendChild(link);
        searchCss = null;
    }
    if (document.readyState === "complete") ensureSearchCss();
    else window.addEventListener("load", ensureSearchCss);
    var TABBABLE =
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    // Build suggestions array from datalist, then remove it
    var datalist = document.getElementById("search-suggestions");
    if (datalist) {
        var opts = datalist.querySelectorAll("option");
        for (var i = 0; i < opts.length; i++) {
            if (opts[i].value) suggestions.push(opts[i].value);
        }
        datalist.remove();
    }

    function normalizePageLang(value) {
        return String(value || "")
            .toLowerCase()
            .startsWith("zh")
            ? "zh"
            : "en";
    }

    var pageLang = normalizePageLang(document.documentElement.lang);
    var isLatinQuery = function (q) {
        // oxlint-disable-next-line no-control-regex -- intentional 7-bit ASCII/Latin-script detection
        return /^[\x00-\x7F]+$/.test(q);
    };
    var isLatinTerm = function (t) {
        // oxlint-disable-next-line no-control-regex -- intentional 7-bit ASCII/Latin-script detection
        return /^[\x00-\x7F]/.test(t);
    };

    // Fuse is the development fallback for English and the production engine for zh.
    var useFuse = typeof Fuse !== "undefined";
    // Fuse.js state
    var fuseIndex = null; // Fuse instance for full-text (searches subsections)
    var fuseFlat = null; // flattened subsection array (source of truth for exact scan)
    var fuseSuggestions = null; // Fuse instance for autocomplete terms
    var fuseLoading = false;
    var fuseLoaded = false;
    var fuseSearchInput = null;
    var fuseResultsEl = null;
    var fuseMessageEl = null;
    var fuseDebounceTimer = null;
    var enFlat = null; // en edition flattened subsections (lazy-loaded)
    var enFailed = false;
    var enToken = 0; // stale-input guard for async en fallback
    var enPromise = null; // cached in-flight en-index fetch promise

    var SEARCH_SUBMIT_SVG = "\u2728";

    function getSearchInput() {
        return (
            fuseSearchInput ||
            input ||
            (container && container.querySelector(".pagefind-ui__search-input"))
        );
    }

    function createSearchSubmitButton() {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "civic-search__submit";
        btn.setAttribute("aria-label", (t && t.search_label) || "Search");
        btn.innerHTML = SEARCH_SUBMIT_SVG;
        btn.addEventListener("click", function () {
            submitSearch();
        });
        return btn;
    }

    function submitSearch() {
        var inp = getSearchInput();
        if (!inp) return;
        var q = inp.value.trim();
        if (dropdown) dropdown.hidden = true;
        activeIdx = -1;
        inp.removeAttribute("aria-activedescendant");
        if (!q) {
            if (useFuse && fuseResultsEl && fuseMessageEl) {
                fuseResultsEl.innerHTML = "";
                fuseMessageEl.textContent = "";
            }
            return;
        }
        var askPromise = Promise.resolve();
        if (window.CivicAsk && typeof window.CivicAsk.runAsk === "function") {
            askPromise = window.CivicAsk.runAsk(q);
        }
        askPromise
            .then(function () {
                window.dispatchEvent(
                    new CustomEvent("civic-search-after-ask", {
                        detail: { query: q },
                    })
                );
            })
            .catch(function () {});
    }

    function wrapSearchFormRow(form) {
        if (!form || form.querySelector(".civic-search__row")) return;
        var inp = form.querySelector(
            '.pagefind-ui__search-input, input[type="search"], input[type="text"]'
        );
        if (!inp) return;
        var row = document.createElement("div");
        row.className = "civic-search__row";
        var wrap = document.createElement("div");
        wrap.className = "civic-search__input-wrap";
        form.insertBefore(row, inp);
        wrap.appendChild(inp);
        row.appendChild(wrap);
        row.appendChild(createSearchSubmitButton());
        var clearBtn = form.querySelector(".pagefind-ui__search-clear");
        if (clearBtn) clearBtn.remove();
    }

    var uiTranslations = {
        en: {
            placeholder: "Search Civic AI…",
            zero_results: "No results for [SEARCH_TERM]",
            exact_summary:
                "[EXACT] exact · [NEAR] near matches for [SEARCH_TERM]",
            exact_only: "[EXACT] exact matches for [SEARCH_TERM]",
            exact_badge: "Exact",
            en_fallback: "[COUNT] exact matches in the English edition",
        },
        zh: {
            placeholder: "搜尋仁工智慧…",
            zero_results:
                "\u627e\u4e0d\u5230 [SEARCH_TERM] \u7684\u76f8\u95dc\u7d50\u679c",
            many_results:
                "\u627e\u5230 [COUNT] \u500b [SEARCH_TERM] \u7684\u76f8\u95dc\u7d50\u679c",
            one_result:
                "\u627e\u5230 [COUNT] \u500b [SEARCH_TERM] \u7684\u76f8\u95dc\u7d50\u679c",
            search_label: "\u641c\u5c0b",
            clear_search: "\u6e05\u9664",
            load_more: "\u8f09\u5165\u66f4\u591a",
            searching: "\u641c\u5c0b [SEARCH_TERM] \u4e2d\u2026",
            exact_summary:
                "「[SEARCH_TERM]」完全符合 [EXACT] 筆・相近結果 [NEAR] 筆",
            exact_only: "「[SEARCH_TERM]」完全符合 [EXACT] 筆",
            exact_badge: "完全符合",
            en_fallback: "英文版完全符合 [COUNT] 筆",
        },
        ja: {
            placeholder: "\u672c\u3092\u691c\u7d22\u2026",
            zero_results: "[SEARCH_TERM] に近い検索結果はありません",
            many_results: "[SEARCH_TERM] に近い検索結果 [COUNT] 件",
            one_result: "[SEARCH_TERM] に近い検索結果 [COUNT] 件",
            search_label: "\u691c\u7d22",
            clear_search: "\u30af\u30ea\u30a2",
            load_more: "\u3082\u3063\u3068\u898b\u308b",
            searching: "[SEARCH_TERM] \u3092\u691c\u7d22\u4e2d\u2026",
        },
        de: {
            placeholder: "Buch durchsuchen\u2026",
            zero_results: "Keine Ergebnisse f\u00fcr [SEARCH_TERM]",
            many_results: "[COUNT] Ergebnisse f\u00fcr [SEARCH_TERM]",
            one_result: "[COUNT] Ergebnis f\u00fcr [SEARCH_TERM]",
            search_label: "Suche",
            clear_search: "L\u00f6schen",
            load_more: "Mehr laden",
            searching: "Suche nach [SEARCH_TERM]\u2026",
        },
        th: {
            placeholder:
                "\u0e04\u0e49\u0e19\u0e2b\u0e32\u0e43\u0e19\u0e2b\u0e19\u0e31\u0e07\u0e2a\u0e37\u0e2d\u2026",
            zero_results:
                "\u0e44\u0e21\u0e48\u0e1e\u0e1a\u0e1c\u0e25\u0e25\u0e31\u0e1e\u0e18\u0e4c\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a [SEARCH_TERM]",
            many_results:
                "\u0e1e\u0e1a [COUNT] \u0e1c\u0e25\u0e25\u0e31\u0e1e\u0e18\u0e4c\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a [SEARCH_TERM]",
            one_result:
                "\u0e1e\u0e1a [COUNT] \u0e1c\u0e25\u0e25\u0e31\u0e1e\u0e18\u0e4c\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a [SEARCH_TERM]",
            search_label: "\u0e04\u0e49\u0e19\u0e2b\u0e32",
            clear_search: "\u0e25\u0e49\u0e32\u0e07",
            load_more:
                "\u0e42\u0e2b\u0e25\u0e14\u0e40\u0e1e\u0e34\u0e48\u0e21\u0e40\u0e15\u0e34\u0e21",
            searching:
                "\u0e01\u0e33\u0e25\u0e31\u0e07\u0e04\u0e49\u0e19\u0e2b\u0e32 [SEARCH_TERM]\u2026",
        },
        el: {
            placeholder:
                "\u0391\u03bd\u03b1\u03b6\u03ae\u03c4\u03b7\u03c3\u03b7 \u03c3\u03c4\u03bf \u03b2\u03b9\u03b2\u03bb\u03af\u03bf\u2026",
            zero_results:
                "\u0394\u03b5\u03bd \u03b2\u03c1\u03ad\u03b8\u03b7\u03ba\u03b1\u03bd \u03b1\u03c0\u03bf\u03c4\u03b5\u03bb\u03ad\u03c3\u03bc\u03b1\u03c4\u03b1 \u03b3\u03b9\u03b1 [SEARCH_TERM]",
            many_results:
                "\u0392\u03c1\u03ad\u03b8\u03b7\u03ba\u03b1\u03bd [COUNT] \u03b1\u03c0\u03bf\u03c4\u03b5\u03bb\u03ad\u03c3\u03bc\u03b1\u03c4\u03b1 \u03b3\u03b9\u03b1 [SEARCH_TERM]",
            one_result:
                "\u0392\u03c1\u03ad\u03b8\u03b7\u03ba\u03b5 [COUNT] \u03b1\u03c0\u03bf\u03c4\u03ad\u03bb\u03b5\u03c3\u03bc\u03b1 \u03b3\u03b9\u03b1 [SEARCH_TERM]",
            search_label:
                "\u0391\u03bd\u03b1\u03b6\u03ae\u03c4\u03b7\u03c3\u03b7",
            clear_search:
                "\u039a\u03b1\u03b8\u03b1\u03c1\u03b9\u03c3\u03bc\u03cc\u03c2",
            load_more:
                "\u03a0\u03b5\u03c1\u03b9\u03c3\u03c3\u03cc\u03c4\u03b5\u03c1\u03b1",
            searching:
                "\u0391\u03bd\u03b1\u03b6\u03ae\u03c4\u03b7\u03c3\u03b7 [SEARCH_TERM]\u2026",
        },
    };

    var t = uiTranslations[pageLang] || uiTranslations.en;

    // ── Matching helpers (used for non-Fuse autocomplete) ──

    function matchTerm(term, query) {
        var q = query.toLowerCase();
        var tl = term.toLowerCase();
        if (!isLatinQuery(q)) {
            return tl.indexOf(q) !== -1;
        }
        var words = tl.split(/[\s\-/(]+/);
        for (var i = 0; i < words.length; i++) {
            if (words[i].indexOf(q) === 0) return true;
        }
        return false;
    }

    function sortMatches(matches) {
        if (pageLang === "en") return matches;
        return matches.sort(function (a, b) {
            var aLatin = isLatinTerm(a);
            var bLatin = isLatinTerm(b);
            if (aLatin === bLatin) return 0;
            return aLatin ? 1 : -1;
        });
    }

    // ── Autocomplete dropdown ──

    function positionDropdown() {
        if (!dropdown || !input) return;
        var rect = input.getBoundingClientRect();
        var overlayRect = overlay.getBoundingClientRect();
        dropdown.style.top = rect.bottom - overlayRect.top + 4 + "px";
        dropdown.style.left = rect.left - overlayRect.left + "px";
        dropdown.style.width = rect.width + "px";
    }

    function showSuggestions(query) {
        if (!dropdown) return;
        activeIdx = -1;
        dropdown.innerHTML = "";

        if (!query || query.length < 1) {
            dropdown.hidden = true;
            if (input) input.removeAttribute("aria-activedescendant");
            return;
        }

        var matches;
        if (useFuse && fuseSuggestions) {
            var fuseResults = fuseSuggestions.search(query, { limit: 20 });
            var raw = [];
            for (var i = 0; i < fuseResults.length; i++) {
                raw.push(fuseResults[i].item);
            }
            matches = sortMatches(raw).slice(0, 8);
        } else {
            var raw = [];
            for (var i = 0; i < suggestions.length && raw.length < 20; i++) {
                if (matchTerm(suggestions[i], query)) raw.push(suggestions[i]);
            }
            matches = sortMatches(raw).slice(0, 8);
        }

        if (matches.length === 0) {
            dropdown.hidden = true;
            if (input) input.removeAttribute("aria-activedescendant");
            return;
        }

        for (var j = 0; j < matches.length; j++) {
            var li = document.createElement("li");
            li.className = "search-suggest__item";
            li.setAttribute("role", "option");
            li.id = "suggest-" + j;
            li.textContent = matches[j];
            li.addEventListener(
                "mousedown",
                (function (val) {
                    return function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        suppressHide = true;
                        selectSuggestion(val);
                    };
                })(matches[j])
            );
            dropdown.appendChild(li);
        }

        positionDropdown();
        dropdown.hidden = false;
    }

    function setNativeInputValue(el, value) {
        Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            "value"
        ).set.call(el, value);
    }

    function selectSuggestion(value) {
        if (!input) return;
        setNativeInputValue(input, value);
        input.dispatchEvent(new Event("input", { bubbles: true }));
        dropdown.hidden = true;
        activeIdx = -1;
        input.removeAttribute("aria-activedescendant");
        input.focus();
        suppressHide = false;
    }

    function handleKeydown(e) {
        if (!dropdown || dropdown.hidden) return;
        var items = dropdown.querySelectorAll(".search-suggest__item");
        if (!items.length) return;

        // keyCode 229 covers IME candidate confirmation where isComposing is false.
        if (e.key === "Enter" && (e.isComposing || e.keyCode === 229)) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            activeIdx = Math.min(activeIdx + 1, items.length - 1);
            updateActive(items);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            activeIdx = Math.max(activeIdx - 1, -1);
            updateActive(items);
        } else if (e.key === "Enter" && activeIdx >= 0) {
            e.preventDefault();
            selectSuggestion(items[activeIdx].textContent);
        } else if (e.key === "Enter") {
            e.preventDefault();
            submitSearch();
        }
    }

    function updateActive(items) {
        for (var i = 0; i < items.length; i++) {
            items[i].classList.toggle(
                "search-suggest__item--active",
                i === activeIdx
            );
        }
        if (input) {
            if (activeIdx >= 0) {
                input.setAttribute(
                    "aria-activedescendant",
                    "suggest-" + activeIdx
                );
                items[activeIdx].scrollIntoView({ block: "nearest" });
            } else {
                input.removeAttribute("aria-activedescendant");
            }
        }
    }

    function initDropdown() {
        dropdown = document.createElement("ul");
        dropdown.className = "search-suggest";
        dropdown.setAttribute("role", "listbox");
        dropdown.id = "search-suggest-list";
        dropdown.hidden = true;
        overlay.appendChild(dropdown);
    }

    // ── Fuse.js helpers ──

    function escapeHtml(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    // Strip CJK punctuation for normalized matching
    // Handles ・、，。；：！？「」『』（）【】…—～ etc.
    var cjkPunct = /[・\u30FB、，。；：！？「」『』（）〔〕【】…—～·\u00B7]/g;

    // Build a position map: for each char in the normalized string,
    // store its original index in the source string
    function buildNormMap(str) {
        var norm = "";
        var map = [];
        for (var i = 0; i < str.length; i++) {
            if (!cjkPunct.test(str[i])) {
                map.push(i);
                norm += str[i];
            }
            cjkPunct.lastIndex = 0; // reset regex state
        }
        return { norm: norm, map: map };
    }

    function normalizeForExact(s) {
        var out = String(s || "")
            .toLowerCase()
            .replace(cjkPunct, "");
        cjkPunct.lastIndex = 0;
        return out;
    }

    function scanExact(flatArr, query) {
        var nq = normalizeForExact(query);
        if (!nq) return [];
        var headingHits = [];
        var contentHits = [];
        for (var i = 0; i < flatArr.length; i++) {
            var item = flatArr[i];
            if (!item.heading) continue;
            if (
                normalizeForExact(item.heading).indexOf(nq) !== -1 ||
                normalizeForExact(item.chapterTitle).indexOf(nq) !== -1
            ) {
                headingHits.push(i);
            } else if (normalizeForExact(item.content).indexOf(nq) !== -1) {
                contentHits.push(i);
            }
        }
        return headingHits.concat(contentHits);
    }

    function buildExcerpt(content, query) {
        if (!content) return "";
        var ctxChars = 40;

        // 1. Try exact substring match first
        var lowerContent = content.toLowerCase();
        var lowerQuery = query.toLowerCase();
        var idx = lowerContent.indexOf(lowerQuery);

        if (idx !== -1) {
            var start = Math.max(0, idx - ctxChars);
            var end = Math.min(content.length, idx + query.length + ctxChars);
            return (
                (start > 0 ? "\u2026" : "") +
                escapeHtml(content.substring(start, idx)) +
                "<mark>" +
                escapeHtml(content.substring(idx, idx + query.length)) +
                "</mark>" +
                escapeHtml(content.substring(idx + query.length, end)) +
                (end < content.length ? "\u2026" : "")
            );
        }

        // 2. Try normalized match (strip CJK punctuation from both sides)
        var info = buildNormMap(lowerContent);
        var normQuery = lowerQuery.replace(cjkPunct, "");
        cjkPunct.lastIndex = 0;
        var normIdx = info.norm.indexOf(normQuery);

        if (normIdx !== -1 && normQuery.length > 0) {
            // Map back to original content positions
            var origStart = info.map[normIdx];
            var origEnd = info.map[normIdx + normQuery.length - 1] + 1;
            var winStart = Math.max(0, origStart - ctxChars);
            var winEnd = Math.min(content.length, origEnd + ctxChars);
            return (
                (winStart > 0 ? "\u2026" : "") +
                escapeHtml(content.substring(winStart, origStart)) +
                "<mark>" +
                escapeHtml(content.substring(origStart, origEnd)) +
                "</mark>" +
                escapeHtml(content.substring(origEnd, winEnd)) +
                (winEnd < content.length ? "\u2026" : "")
            );
        }

        // 3. Fallback: show beginning of content
        var slice = content.substring(0, 100);
        return escapeHtml(slice) + (content.length > 100 ? "\u2026" : "");
    }

    function formatMessage(template, term, counts) {
        var count = (counts && counts.count) || 0;
        var exact = (counts && counts.exact) || 0;
        var near = (counts && counts.near) || 0;
        return template
            .replace("[COUNT]", count)
            .replace("[EXACT]", exact)
            .replace("[NEAR]", near)
            .replace("[SEARCH_TERM]", term);
    }

    var pendingKeywordAfterAsk = null;

    function runKeywordSearchAfterAsk(q) {
        if (!q) return;
        if (useFuse) {
            if (fuseSearchInput) {
                setNativeInputValue(fuseSearchInput, q);
            }
            if (fuseIndex && fuseResultsEl) {
                renderFuseResults(q);
            } else {
                pendingKeywordAfterAsk = q;
            }
            return;
        }
        var pfInput = container.querySelector("input");
        if (pfInput) {
            setNativeInputValue(pfInput, q);
            pfInput.dispatchEvent(new Event("input", { bubbles: true }));
        }
    }

    window.addEventListener("civic-search-after-ask", function (ev) {
        var q = ev.detail && ev.detail.query;
        runKeywordSearchAfterAsk(q);
    });
    // Render one chapter group's HTML (reused by renderFuseResults and en fallback)
    function renderGroupHtml(ch, query) {
        var html = "";
        html += '<li class="pagefind-ui__result">';
        html += '<div class="pagefind-ui__result-inner">';

        html += '<p class="pagefind-ui__result-title">';
        html +=
            '<a class="pagefind-ui__result-link" href="' +
            escapeHtml(ch.url) +
            '">';
        html += escapeHtml(ch.title);
        html += "</a>";
        html += "</p>";

        for (var s = 0; s < ch.subResults.length; s++) {
            var sub = ch.subResults[s];
            if (!sub.heading) continue;

            var subUrl = ch.url + "#" + sub.anchor;
            var subExcerpt = buildExcerpt(sub.content, query);

            html += '<div class="pagefind-ui__result-nested">';
            html += '<p class="pagefind-ui__result-title">';
            html +=
                '<a class="pagefind-ui__result-link" href="' +
                escapeHtml(subUrl) +
                '">';
            html += escapeHtml(sub.heading);
            html += "</a>";
            if (sub.exact) {
                html +=
                    '<span class="civic-search__badge">' +
                    escapeHtml(t.exact_badge) +
                    "</span>";
            }
            html += "</p>";
            html +=
                '<p class="pagefind-ui__result-excerpt">' + subExcerpt + "</p>";
            html += "</div>";
        }

        html += '<ul class="pagefind-ui__result-tags">';
        html +=
            '<li class="pagefind-ui__result-tag">Section: ' +
            escapeHtml(ch.section) +
            "</li>";
        html += "</ul>";

        html += "</div>";
        html += "</li>";
        return html;
    }

    // Search the flat subsection index: exact substring hits first, then Fuse fuzzy results
    function renderFuseResults(query) {
        if (!fuseIndex || !fuseResultsEl || !fuseMessageEl) return;
        enToken++;

        if (!query || !query.trim()) {
            fuseMessageEl.textContent = "";
            fuseResultsEl.innerHTML = "";
            return;
        }

        var exactIdx = scanExact(fuseFlat, query);
        var exactSet = {};
        for (var e = 0; e < exactIdx.length; e++) exactSet[exactIdx[e]] = true;

        var fuzzyResults = fuseIndex.search(query, { limit: 40 });
        var fuzzy = [];
        for (var f = 0; f < fuzzyResults.length; f++) {
            if (exactSet[fuzzyResults[f].refIndex]) continue;
            fuzzy.push(fuzzyResults[f]);
        }

        var ordered = [];
        for (var ei = 0; ei < exactIdx.length; ei++) {
            ordered.push({ item: fuseFlat[exactIdx[ei]], exact: true });
        }
        for (var fi = 0; fi < fuzzy.length; fi++) {
            ordered.push({ item: fuzzy[fi].item, exact: false });
        }

        var grouped = [];
        var chapterMap = {};
        for (var i = 0; i < ordered.length; i++) {
            var item = ordered[i].item;
            var key = item.chapterUrl;
            if (!chapterMap[key]) {
                chapterMap[key] = {
                    title: item.chapterTitle,
                    section: item.chapterSection,
                    url: item.chapterUrl,
                    subResults: [],
                };
                grouped.push(chapterMap[key]);
            }
            if (chapterMap[key].subResults.length < 3) {
                chapterMap[key].subResults.push({
                    heading: item.heading,
                    anchor: item.anchor,
                    content: item.content,
                    exact: ordered[i].exact,
                });
            }
        }

        grouped = grouped.slice(0, 10);

        var EXACT = exactIdx.length;
        var NEAR = fuzzy.length;
        var count = grouped.length;

        var msgTemplate;
        if (EXACT > 0 && NEAR > 0) {
            msgTemplate = t.exact_summary || uiTranslations.en.exact_summary;
        } else if (EXACT > 0 && NEAR === 0) {
            msgTemplate = t.exact_only || uiTranslations.en.exact_only;
        } else if (count === 0) {
            msgTemplate = t.zero_results || "No results for [SEARCH_TERM]";
        } else if (count === 1) {
            msgTemplate =
                t.one_result ||
                t.many_results ||
                "[COUNT] results for [SEARCH_TERM]";
        } else {
            msgTemplate = t.many_results || "[COUNT] results for [SEARCH_TERM]";
        }
        fuseMessageEl.textContent = formatMessage(msgTemplate, query, {
            count: count,
            exact: EXACT,
            near: NEAR,
        });

        var html = "";
        for (var g = 0; g < grouped.length; g++) {
            html += renderGroupHtml(grouped[g], query);
        }
        fuseResultsEl.innerHTML = html;

        // English exact-fallback tier: Latin queries with zero local exact hits
        if (
            exactIdx.length === 0 &&
            isLatinQuery(query) &&
            query.length >= 3 &&
            pageLang !== "en"
        ) {
            var token = ++enToken;
            ensureEnIndex().then(function (flatEn) {
                if (token !== enToken || !flatEn) return;
                var enHits = scanExact(flatEn, query);
                if (!enHits.length) return;
                var enGrouped = [];
                var enChapterMap = {};
                for (var ei2 = 0; ei2 < enHits.length; ei2++) {
                    var enItem = flatEn[enHits[ei2]];
                    var enKey = enItem.chapterUrl;
                    if (!enChapterMap[enKey]) {
                        enChapterMap[enKey] = {
                            title: enItem.chapterTitle,
                            section: enItem.chapterSection,
                            url: enItem.chapterUrl,
                            subResults: [],
                        };
                        enGrouped.push(enChapterMap[enKey]);
                    }
                    if (enChapterMap[enKey].subResults.length < 3) {
                        enChapterMap[enKey].subResults.push({
                            heading: enItem.heading,
                            anchor: enItem.anchor,
                            content: enItem.content,
                            exact: true,
                        });
                    }
                }
                enGrouped = enGrouped.slice(0, 5);
                var enHtml =
                    '<li class="civic-search__en-note">' +
                    escapeHtml(
                        formatMessage(
                            t.en_fallback || uiTranslations.en.en_fallback,
                            query,
                            { count: enHits.length }
                        )
                    ) +
                    "</li>";
                for (var eg = 0; eg < enGrouped.length; eg++) {
                    enHtml += renderGroupHtml(enGrouped[eg], query);
                }
                fuseResultsEl.innerHTML = fuseResultsEl.innerHTML + enHtml;
            });
        }
    }

    function flattenChapters(data) {
        var flat = [];
        for (var c = 0; c < data.length; c++) {
            var ch = data[c];
            var subs = ch.subsections || [];
            for (var s = 0; s < subs.length; s++) {
                flat.push({
                    chapterTitle: ch.title,
                    chapterSection: ch.section,
                    chapterUrl: ch.url,
                    heading: subs[s].heading,
                    anchor: subs[s].anchor,
                    content: subs[s].content,
                });
            }
        }
        return flat;
    }

    function ensureEnIndex() {
        if (enFlat) return Promise.resolve(enFlat);
        if (enFailed) return Promise.resolve(null);
        if (enPromise) return enPromise;
        enPromise = fetch("/search-index.json")
            .then(function (res) {
                if (!res.ok) throw new Error("HTTP " + res.status);
                return res.json();
            })
            .then(function (data) {
                enFlat = flattenChapters(data);
                return enFlat;
            })
            .catch(function () {
                enFailed = true;
                return null;
            });
        return enPromise;
    }

    function loadFuseIndex() {
        if (fuseLoaded || fuseLoading) return;
        fuseLoading = true;
        if (fuseMessageEl) {
            fuseMessageEl.textContent = formatMessage(
                t.searching || "Loading\u2026",
                "",
                null
            );
        }
        var searchIndexUrl =
            pageLang === "en" ? "/search-index.json" : "/tw/search-index.json";
        fetch(searchIndexUrl)
            .then(function (res) {
                if (!res.ok) throw new Error("HTTP " + res.status);
                return res.json();
            })
            .then(function (data) {
                fuseFlat = flattenChapters(data);

                fuseIndex = new Fuse(fuseFlat, {
                    keys: [
                        { name: "heading", weight: 2 },
                        { name: "content", weight: 1 },
                        { name: "chapterTitle", weight: 1.5 },
                    ],
                    includeScore: true,
                    includeMatches: true,
                    ignoreLocation: true,
                    threshold: 0.3,
                    minMatchCharLength: 1,
                    findAllMatches: true,
                });
                fuseLoaded = true;
                fuseLoading = false;
                if (fuseMessageEl) fuseMessageEl.textContent = "";
                if (pendingKeywordAfterAsk) {
                    var pending = pendingKeywordAfterAsk;
                    pendingKeywordAfterAsk = null;
                    runKeywordSearchAfterAsk(pending);
                } else if (fuseSearchInput && fuseSearchInput.value.trim()) {
                    renderFuseResults(fuseSearchInput.value.trim());
                }
            })
            .catch(function () {
                fuseLoading = false;
                useFuse = false;
                initPagefind();
            });
    }

    function buildFuseUI() {
        container.innerHTML = "";

        var wrapper = document.createElement("div");
        wrapper.className = "pagefind-ui pagefind-ui--fuse";

        var form = document.createElement("form");
        form.className = "pagefind-ui__form";
        form.setAttribute("role", "search");
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            submitSearch();
        });

        fuseSearchInput = document.createElement("input");
        fuseSearchInput.className = "pagefind-ui__search-input";
        fuseSearchInput.type = "search";
        fuseSearchInput.setAttribute("enterkeyhint", "search");
        fuseSearchInput.placeholder = t.placeholder || "Search\u2026";

        form.appendChild(fuseSearchInput);
        wrapSearchFormRow(form);

        var drawer = document.createElement("div");
        drawer.className = "pagefind-ui__drawer";

        fuseMessageEl = document.createElement("div");
        fuseMessageEl.className = "pagefind-ui__message";

        fuseResultsEl = document.createElement("ol");
        fuseResultsEl.className = "pagefind-ui__results";

        drawer.appendChild(fuseMessageEl);
        drawer.appendChild(fuseResultsEl);

        wrapper.appendChild(form);
        wrapper.appendChild(drawer);
        container.appendChild(wrapper);

        // Input handler with debounce for full-text, immediate for autocomplete
        fuseSearchInput.addEventListener("input", function () {
            var val = fuseSearchInput.value;
            showSuggestions(val);
            clearTimeout(fuseDebounceTimer);
            fuseDebounceTimer = setTimeout(function () {
                renderFuseResults(val.trim());
            }, 200);
        });

        input = fuseSearchInput;

        fuseSearchInput.addEventListener("keydown", handleKeydown);
        fuseSearchInput.addEventListener("focus", function () {
            if (fuseSearchInput.value.length >= 1)
                showSuggestions(fuseSearchInput.value);
        });
        fuseSearchInput.addEventListener("blur", function () {
            if (suppressHide) return;
            setTimeout(function () {
                if (dropdown) dropdown.hidden = true;
            }, 200);
        });
    }

    function initPagefind() {
        if (instance) return;
        if (typeof PagefindUI === "undefined") {
            container.innerHTML =
                '<p class="pagefind-ui__message">' +
                (pageLang === "zh"
                    ? "搜尋載入失敗。"
                    : "Search is unavailable.") +
                "</p>";
            return;
        }
        var opts = {
            element: container,
            showSubResults: true,
            showImages: false,
            translations: t,
        };
        opts.mergeFilter = {};
        opts.mergeFilter.lang = [pageLang];
        instance = new PagefindUI(opts);
    }

    function initFuseSuggestions() {
        if (fuseSuggestions || !suggestions.length) return;
        fuseSuggestions = new Fuse(suggestions, {
            includeScore: true,
            ignoreLocation: true,
            threshold: 0.3,
            minMatchCharLength: 1,
        });
    }

    // ── Open / Close ──

    function isOpen() {
        return overlay.classList.contains("active");
    }

    function open() {
        ensureSearchCss();
        if (!isOpen()) {
            lastFocus = document.activeElement;
            lastOverflow = document.body.style.overflow;
        }
        overlay.classList.add("active");
        overlay.removeAttribute("aria-hidden");
        document.body.style.overflow = "hidden";
        if (closeButton) closeButton.focus();

        if (useFuse) {
            if (!fuseSearchInput) {
                buildFuseUI();
                initFuseSuggestions();
                if (!dropdown && suggestions.length) {
                    initDropdown();
                }
                if (input && suggestions.length) {
                    input.setAttribute("role", "combobox");
                    input.setAttribute("aria-autocomplete", "list");
                    input.setAttribute("aria-controls", "search-suggest-list");
                    input.setAttribute("autocomplete", "off");
                }
                loadFuseIndex();
            }
            setTimeout(function () {
                if (!isOpen()) return;
                if (fuseSearchInput) fuseSearchInput.focus();
            }, 50);
        } else {
            if (!instance) {
                initPagefind();
            }
            setTimeout(function () {
                if (!isOpen()) return;
                input = container.querySelector("input");
                if (input && suggestions.length && !dropdown) {
                    initDropdown();

                    input.setAttribute("role", "combobox");
                    input.setAttribute("aria-autocomplete", "list");
                    input.setAttribute("aria-controls", "search-suggest-list");
                    input.setAttribute("autocomplete", "off");

                    input.addEventListener("input", function () {
                        showSuggestions(input.value);
                    });
                    input.addEventListener("keydown", handleKeydown);
                    input.addEventListener("focus", function () {
                        if (input.value.length >= 1)
                            showSuggestions(input.value);
                    });
                    input.addEventListener("blur", function () {
                        if (suppressHide) return;
                        setTimeout(function () {
                            if (dropdown) dropdown.hidden = true;
                        }, 200);
                    });
                }
                var pfForm = container.querySelector(".pagefind-ui__form");
                if (pfForm) wrapSearchFormRow(pfForm);
                input = getSearchInput();
                if (input) input.focus();
            }, 100);
        }
    }

    function close() {
        if (!isOpen()) return;
        var target = lastFocus;
        var overflow = lastOverflow;
        lastFocus = null;
        lastOverflow = "";
        if (target instanceof HTMLElement && target.isConnected) {
            target.focus();
        }
        overlay.classList.remove("active");
        overlay.setAttribute("aria-hidden", "true");
        document.body.style.overflow = overflow;
        if (dropdown) dropdown.hidden = true;
        activeIdx = -1;
    }

    function tabbableItems() {
        return Array.prototype.filter.call(
            overlay.querySelectorAll(TABBABLE),
            function (el) {
                if (el.disabled || el.tabIndex < 0) return false;
                if (el.getClientRects().length === 0) return false;
                var visibility = window.getComputedStyle(el).visibility;
                return visibility !== "hidden" && visibility !== "collapse";
            }
        );
    }

    function trapTab(e) {
        var items = tabbableItems();
        if (!items.length) {
            e.preventDefault();
            overlay.focus();
            return;
        }
        var first = items[0];
        var last = items[items.length - 1];
        var current = document.activeElement;
        if (!overlay.contains(current) || current === overlay) {
            e.preventDefault();
            (e.shiftKey ? last : first).focus();
        } else if (e.shiftKey && current === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && current === last) {
            e.preventDefault();
            first.focus();
        }
    }

    document.querySelectorAll(".search-toggle").forEach(function (btn) {
        btn.addEventListener("click", open);
    });

    if (closeButton) closeButton.addEventListener("click", close);

    overlay.addEventListener("click", function (e) {
        if (e.target === overlay) close();
    });

    window.CivicSearch = { submit: submitSearch };

    document.addEventListener("keydown", function (e) {
        if ((e.metaKey || e.ctrlKey) && e.key === "k") {
            e.preventDefault();
            if (overlay.classList.contains("active")) {
                close();
            } else {
                open();
            }
        }
        if (
            e.key === "Escape" &&
            isOpen() &&
            !e.isComposing &&
            e.keyCode !== 229
        ) {
            e.preventDefault();
            close();
        }
        if (e.key === "Tab" && isOpen()) trapTab(e);
    });
})();
