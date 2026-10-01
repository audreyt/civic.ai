/**
 * Civic AI site search — streams from civic-ai-ask worker (sayit-style UX).
 */
(function () {
    var overlay = document.getElementById("search-overlay");
    var inner = overlay && overlay.querySelector(".search-overlay__inner");
    if (!overlay || !inner) return;

    function normalizePageLang(value) {
        return String(value || "")
            .toLowerCase()
            .startsWith("zh")
            ? "zh"
            : "en";
    }
    var pageLang = normalizePageLang(document.documentElement.lang);
    var askAnswer = document.getElementById("civic-ask-answer");
    if (!askAnswer) return;

    var askAvailable = false;
    var askLoading = false;
    var askAbort = null;

    var HISTORY_KEY = "civic-ask-history-v1";
    var askHistoryEl = document.getElementById("civic-ask-history");
    var askHints = {
        en: "Press Enter \u23ce to ask the AI about the site",
        zh: "\u6309 Enter \u23ce \u7531 AI \u4f9d\u7ad9\u4e2d\u5167\u5bb9\u56de\u7b54",
    };

    function isLocalDevAskHost() {
        var host = window.location.hostname;
        if (host !== "localhost" && host !== "127.0.0.1") return false;
        var port = window.location.port;
        return port === "4321" || port === "8080" || port === "";
    }

    function explicitAskBaseOverride() {
        try {
            var o = new URLSearchParams(window.location.search).get("ask_base");
            if (!o) return "";
            return String(o).trim().replace(/\/$/, "");
        } catch {
            return "";
        }
    }

    function resolveAskBaseUrl() {
        var override = explicitAskBaseOverride();
        if (override) return override;
        return "https://civic-ai-ask.audreyt.workers.dev";
    }

    var ASK_BASE = resolveAskBaseUrl();

    function askEndpoint(q) {
        var lang = normalizePageLang(document.documentElement.lang);
        var base = ASK_BASE + "/au/" + encodeURIComponent(q.trim());
        return (
            base +
            (base.indexOf("?") >= 0 ? "&" : "?") +
            "lang=" +
            encodeURIComponent(lang)
        );
    }

    function escapeHtml(str) {
        var div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
    }

    function isSafeHttpUrl(value) {
        if (/[\s"'<>]/.test(value) || /&(quot|#39|lt|gt);/i.test(value))
            return false;
        try {
            var url = new URL(value);
            return url.protocol === "http:" || url.protocol === "https:";
        } catch {
            return false;
        }
    }

    function sanitizeHtml(html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var blocked = doc.body.querySelectorAll(
            "script, iframe, object, embed, base, meta, link"
        );
        for (var i = 0; i < blocked.length; i++) blocked[i].remove();

        var walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT);
        var element = walker.nextNode();
        while (element) {
            var attrs = Array.prototype.slice.call(element.attributes);
            for (var j = 0; j < attrs.length; j++) {
                var attr = attrs[j];
                var name = attr.name.toLowerCase();
                if (
                    name.indexOf("on") === 0 ||
                    name === "srcdoc" ||
                    name === "style"
                ) {
                    element.removeAttribute(attr.name);
                    continue;
                }
                if (
                    /^(href|src|xlink:href|action|formaction|poster)$/i.test(
                        name
                    ) &&
                    !isSafeHttpUrl(attr.value)
                ) {
                    element.removeAttribute(attr.name);
                }
            }
            if (element.tagName.toLowerCase() === "a") {
                element.setAttribute("target", "_blank");
                element.setAttribute("rel", "nofollow noopener noreferrer");
            }
            element = walker.nextNode();
        }

        return doc.body.innerHTML;
    }

    function escapeAttribute(value) {
        return escapeHtml(value);
    }

    /** ask.archive.tw parity: [^n] defs + clickable superscript citations */
    function parseAnswer(raw) {
        var sources = [];
        var seen = new Map();
        var body = raw
            .replace(
                /^\[\^(\d+)\]:\s*\[([^\]]*)\]\(([^)\s]+)\)\s*$/gm,
                function (_m, num, label, href) {
                    if (!isSafeHttpUrl(href)) return "";
                    var index = Number(num);
                    if (!seen.has(index)) {
                        seen.set(index, {
                            index: index,
                            label: (label || "").trim() || href,
                            href: href,
                        });
                    }
                    return "";
                }
            )
            .trim();

        sources = Array.from(seen.values()).sort(function (a, b) {
            return a.index - b.index;
        });
        var hrefByIndex = new Map(
            sources.map(function (s) {
                return [s.index, s.href];
            })
        );

        var html = escapeHtml(body);
        html = html.replace(
            /^(#{1,6})[ \t]+([^\n]+?)[ \t]*(?:\n|$)/gm,
            function (_m, hashes, text) {
                return (
                    "<h" +
                    hashes.length +
                    ">" +
                    text +
                    "</h" +
                    hashes.length +
                    ">"
                );
            }
        );
        html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
        html = html.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
        html = html.replace(
            /\[([^\]]+)\]\((https?:[^)\s]+)\)/g,
            function (_m, label, href) {
                if (!isSafeHttpUrl(href)) return label;
                return (
                    '<a href="' +
                    escapeAttribute(href) +
                    '" target="_blank" rel="noopener noreferrer">' +
                    label +
                    "</a>"
                );
            }
        );
        html = html.replace(/\[\^(\d+)\]/g, function (m, num) {
            var href = hrefByIndex.get(Number(num));
            if (!href) return m;
            return (
                '<sup class="cite"><a href="' +
                escapeAttribute(href) +
                '" target="_blank" rel="noopener noreferrer">[' +
                num +
                "]</a></sup>"
            );
        });
        html = html.replace(/\n\n/g, "</p><p>");
        html = html.replace(/\n/g, "<br>");
        if (html) html = "<p>" + html + "</p>";
        return { html: sanitizeHtml(html), sources: sources };
    }

    function renderAsk(raw, loading, err) {
        if (err) {
            askAnswer.hidden = false;
            askAnswer.innerHTML =
                '<p class="civic-ask-answer__error">' +
                sanitizeHtml(escapeHtml(err)) +
                "</p>";
            return;
        }
        askAnswer.hidden = false;
        var parsed = raw ? parseAnswer(raw) : { html: "", sources: [] };
        var body = parsed.html;
        var cursor = loading
            ? '<span class="civic-ask-answer__cursor" aria-hidden="true">▌</span>'
            : "";
        var sourcesHtml = "";
        if (parsed.sources.length > 0) {
            sourcesHtml =
                '<div class="civic-ask-answer__sources"><h3>Sources</h3><ol>';
            for (var i = 0; i < parsed.sources.length; i++) {
                var source = parsed.sources[i];
                sourcesHtml +=
                    '<li value="' +
                    source.index +
                    '"><a href="' +
                    escapeAttribute(source.href) +
                    '" target="_blank" rel="noopener noreferrer">' +
                    escapeHtml(source.label) +
                    "</a></li>";
            }
            sourcesHtml += "</ol></div>";
        }
        askAnswer.innerHTML =
            '<div class="civic-ask-answer__body">' +
            body +
            cursor +
            "</div>" +
            sourcesHtml;
    }
    function readHistory() {
        try {
            var data = JSON.parse(sessionStorage.getItem(HISTORY_KEY));
            if (!Array.isArray(data)) return [];
            return data.filter(function (e) {
                return typeof e.q === "string" && typeof e.raw === "string";
            });
        } catch (_e) {
            return [];
        }
    }

    function saveToHistory(q, raw) {
        if (!raw || !raw.trim()) return;
        var entries = readHistory().filter(function (e) {
            return e.q !== q;
        });
        entries.unshift({ q: q, raw: raw, lang: pageLang, ts: Date.now() });
        if (entries.length > 10) entries = entries.slice(0, 10);
        try {
            sessionStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
        } catch (_e) {}
        renderHistory();
    }

    function renderHistory() {
        if (!askHistoryEl) return;
        var entries = readHistory();
        var html = "";
        if (askAvailable) {
            html +=
                '<p class="civic-ask-history__hint">' +
                escapeHtml(askHints[pageLang] || askHints.en) +
                "</p>";
        }
        if (entries.length) {
            html += '<div class="civic-ask-history__chips">';
            for (var i = 0; i < entries.length; i++) {
                var q = entries[i].q;
                var label = q.length > 48 ? q.slice(0, 48) + "\u2026" : q;
                html +=
                    '<button type="button" class="civic-ask-history__chip" data-idx="' +
                    i +
                    '" title="' +
                    escapeHtml(q).replace(/"/g, "&quot;") +
                    '">' +
                    escapeHtml(label) +
                    "</button>";
            }
            html += "</div>";
        }
        askHistoryEl.innerHTML = html;
        askHistoryEl.hidden = !askAvailable && entries.length === 0;
    }

    if (askHistoryEl) {
        askHistoryEl.addEventListener("click", function (e) {
            var btn =
                e.target.closest &&
                e.target.closest(".civic-ask-history__chip");
            if (!btn) return;
            var idx = Number(btn.getAttribute("data-idx"));
            var entry = readHistory()[idx];
            if (!entry) return;
            renderAsk(entry.raw, false, "");
            window.dispatchEvent(
                new CustomEvent("civic-search-after-ask", {
                    detail: { query: entry.q },
                })
            );
        });
    }

    function hideAsk() {
        if (askAbort) {
            askAbort.abort();
            askAbort = null;
        }
        askLoading = false;
        if (askAnswer) {
            askAnswer.hidden = true;
            askAnswer.innerHTML = "";
        }
    }
    async function runAsk(question) {
        var q = (question || "").trim();
        if (!askAvailable || !q || askLoading) return;
        if (Array.from(q).length > 100) {
            renderAsk("", false, "Question too long (max 100 characters).");
            return;
        }
        if (askAbort) askAbort.abort();
        askAbort = new AbortController();
        askLoading = true;
        renderAsk("", true, "");
        try {
            var res = await fetch(askEndpoint(q), { signal: askAbort.signal });
            if (!res.ok) {
                var t = await res.text();
                throw new Error(t || "Request failed");
            }
            if (!res.body || !res.body.getReader) {
                var text = await res.text();
                saveToHistory(q, text);
                renderAsk(text, false, "");
                return;
            }
            var reader = res.body.getReader();
            var dec = new TextDecoder();
            var raw = "";
            while (true) {
                var { done, value } = await reader.read();
                if (done) {
                    raw += dec.decode();
                    saveToHistory(q, raw);
                    renderAsk(raw, false, "");
                    break;
                }
                raw += dec.decode(value, { stream: true });
                renderAsk(raw, true, "");
            }
        } catch (e) {
            if (e && e.name === "AbortError") return;
            renderAsk("", false, (e && e.message) || "Network error");
        } finally {
            askLoading = false;
            askAbort = null;
        }
    }

    function initCapacity() {
        if (!window.fetch) return;
        var host = window.location.hostname;
        var override = explicitAskBaseOverride();
        var localDev = isLocalDevAskHost();
        var shouldProbe =
            host === "civic.ai" ||
            host === "www.civic.ai" ||
            host === "civic-ai-ask.audreyt.workers.dev" ||
            localDev ||
            !!override;
        if (!shouldProbe) return;

        function probeBase(base, cb, errCb) {
            fetch(base + "/capacity", {
                headers: { Accept: "application/json" },
            })
                .then(function (r) {
                    return r.ok ? r.json() : Promise.reject();
                })
                .then(function (d) {
                    if (d && d.status === "available") {
                        cb(base);
                    } else {
                        errCb();
                    }
                })
                .catch(function () {
                    errCb();
                });
        }

        if (localDev && !override) {
            probeBase(
                "http://127.0.0.1:8788",
                function (base) {
                    ASK_BASE = base;
                    askAvailable = true;
                    renderHistory();
                },
                function () {
                    probeBase(
                        "https://civic-ai-ask.audreyt.workers.dev",
                        function (base) {
                            ASK_BASE = base;
                            askAvailable = true;
                            renderHistory();
                        },
                        function () {
                            ASK_BASE =
                                "https://civic-ai-ask.audreyt.workers.dev";
                            askAvailable = false;
                            renderHistory();
                        }
                    );
                }
            );
        } else {
            probeBase(
                ASK_BASE,
                function (base) {
                    ASK_BASE = base;
                    askAvailable = true;
                    renderHistory();
                },
                function () {
                    if (override && localDev) {
                        askAvailable = true;
                    } else {
                        askAvailable = false;
                        renderHistory();
                    }
                }
            );
        }
    }

    // Ask the remote service whether it is up only once a reader opens search,
    // not on every page load: reading a page makes no cross-origin request.
    var capacityChecked = false;

    var obs = new MutationObserver(function () {
        if (!overlay.classList.contains("active")) {
            hideAsk();
        } else {
            if (!capacityChecked) {
                capacityChecked = true;
                initCapacity();
            }
            renderHistory();
        }
    });
    obs.observe(overlay, { attributes: true, attributeFilter: ["class"] });

    overlay.addEventListener(
        "keydown",
        function (e) {
            if (!overlay.classList.contains("active")) return;
            // keyCode 229 covers IME candidate confirmation where isComposing is false.
            var imeKeyCode = /** @type {any} */ (e).keyCode;
            if (e.key !== "Enter" || e.isComposing || imeKeyCode === 229)
                return;
            if (e.metaKey || e.ctrlKey || e.altKey) return;
            var inp = overlay.querySelector(
                ".pagefind-ui__search-input, #search-container input"
            );
            if (!inp || e.target !== inp) return;
            if (!askAvailable || askLoading) return;
            var q = inp.value;
            if (!q || !q.trim()) return;
            e.preventDefault();
            e.stopPropagation();
            if (
                window.CivicSearch &&
                typeof window.CivicSearch.submit === "function"
            ) {
                window.CivicSearch.submit();
                return;
            }
            runAsk(q)
                .then(function () {
                    window.dispatchEvent(
                        new CustomEvent("civic-search-after-ask", {
                            detail: { query: q.trim() },
                        })
                    );
                })
                .catch(function () {});
        },
        true
    );

    renderHistory();

    window.CivicAsk = { runAsk: runAsk, hideAsk: hideAsk, askBase: ASK_BASE };
})();
