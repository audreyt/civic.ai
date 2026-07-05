---
layout: chapter
title: "關懷六力的 Lean 形式化"
meta_description: "一份關懷六力的 Lean 4 形式化：六項關懷要素、關懷循環拓樸，以及第五力團結力不能化約為個體效用加總的證明。"
summary: "一份 Lean 檢查的框架契約，核心定理證明第五力的不可分解性主張。"
lang: zh-tw
alt_lang_url: "/formal-care"
permalink: "/tw/formal-care/"
nav_prev:
    url: "/tw/measures/"
    text: "衡量指標"
nav_next:
    url: "/tw/inside-the-kami/"
    text: "地神之內"
---

Lean 不能證明一個制度就是關懷的。它能證明一件這個框架不該只留在非正式文字裡的小事：第五力團結力不是個體獎勵的簡單加總。

<h2 id="solidarity-non-separability">團結力的不可分解性</h2>

這個有限模型有兩個智慧體、兩種行動。每個智慧體可以選擇 `stayWithinGroup`，也可以選擇 `bridgeAcrossGroup`。社會分數 `bridgingValue` 只有在兩個智慧體一起跨越群體邊界時才是 `1`。只要至少一方留在群體內，分數就是 `0`。

定理 `bridging_not_nat_separable` 證明了可觀察的結果：不存在從個體行動到自然數效用的函數 `u` 與 `v`，能對所有行動配對滿足 `bridgingValue a b = u a + v b`。

閱讀原始碼：

- [`formal/CivicAi/Care/Solidarity.lean`](/formal/CivicAi/Care/Solidarity.lean)
- [`formal/CivicAi/Care/Pack.lean`](/formal/CivicAi/Care/Pack.lean)
- [`formal/CivicAi.lean`](/formal/CivicAi.lean)
- [`formal/lakefile.toml`](/formal/lakefile.toml)

這不主張什麼：這個證明不是用數學解決倫理。它檢查正文中的一個結構性句子：如果團結力仰賴跨群體共同行動，只會計算個體效用加總的架構就無法表達它。在這裡，`bridgingValue` 只獎勵雙方在同一步一起跨越橋接，因此只要任一方單獨最佳化，這個值就會消失。

## 其餘骨架

支撐用的 Lean 檔案命名六項關懷要素、前四力的關懷循環、作為場域條件的第五力，以及作為膜邊界條件的第六力。它也記錄概念地圖中的十三項交接：四條關懷循環邊、兩條弦、三條進入團結力的場域邊，以及四條經由共生力的膜交接。

這份骨架刻意保持節制。它的證明重點不是說整套關懷六力在倫理上已經完備，而是說第五力中的一句話，有一個有限且機器可檢驗的數學形式。
