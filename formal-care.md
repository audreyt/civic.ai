---
layout: chapter
title: "Lean formalization of the 6-Pack of Care"
meta_description: "A Lean 4 formalization of the 6-Pack of Care: the six care primitives, the care-cycle topology, and a proof that Pack 5 solidarity cannot be reduced to a sum of individual utilities."
summary: "A small Lean-checked contract for the framework's shape, with the central theorem proving Pack 5's non-separability claim."
lang: en-gb
alt_lang_url: "/tw/formal-care"
permalink: "/formal-care/"
nav_prev:
    url: "/measures/"
    text: "Measures"
nav_next:
    url: "/inside-the-kami/"
    text: "Inside the Kami"
---

Lean cannot prove that an institution is caring. It can prove a smaller thing this framework should not leave informal: the Pack 5 claim that solidarity is not just a sum of individual rewards.

<h2 id="solidarity-non-separability">Solidarity non-separability</h2>

The finite model has two agents and two actions. Each agent can either `stayWithinGroup` or `bridgeAcrossGroup`. The social score `bridgingValue` is `1` only when both agents bridge across group boundaries together. It is `0` whenever at least one agent stays within group.

The theorem `bridging_not_nat_separable` proves the observable result: No functions `u` and `v` from individual actions to natural-number utilities can satisfy `bridgingValue a b = u a + v b` for all action pairs.

Read the source:

- [`formal/CivicAi/Care/Solidarity.lean`](/formal/CivicAi/Care/Solidarity.lean)
- [`formal/CivicAi/Care/Pack.lean`](/formal/CivicAi/Care/Pack.lean)
- [`formal/CivicAi.lean`](/formal/CivicAi.lean)
- [`formal/lakefile.toml`](/formal/lakefile.toml)

What this does not claim: The proof does not settle ethics by mathematics. It checks one structural sentence in the prose: if solidarity depends on cross-group co-action, an architecture that only sums individual rewards cannot express it. Here `bridgingValue` rewards only joint, same-step bridge crossing by both agents, so the value vanishes whenever either side optimises alone.

## The rest of the skeleton

The supporting Lean file names the six care primitives, the four-pack care cycle, Pack 5 as the field condition, and Pack 6 as the membrane condition. It also records the thirteen handoffs from the concept map: four care-cycle edges, two chords, three field edges into solidarity, and four membrane handoffs through symbiosis.

That scaffold is deliberately modest. The proof payload is not that the whole 6-Pack is ethically complete. It is that one sentence in Pack 5 has a finite, checkable mathematical form.
