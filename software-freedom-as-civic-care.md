---
layout: chapter
title: "Software Freedom as Civic Care"
author: "Audrey Tang"
lang: en-gb
alt_lang_url: "/tw/software-freedom-as-civic-care"
permalink: "/software-freedom-as-civic-care/"
date: 2026-05-22
description: "Tang discusses how the Free Software movement is foundational to her theory of care ethics, democracy, local stewardship and self-governance."
nav_next:
    url: "/"
    text: "Home"
---

Thank you all for making this a room for a bridge from Free Software to Ethics in AI.

I was born with a heart defect. When I was 5, the doctors gave me a 50-50 chance of surviving until I was old enough for corrective surgery. They said, “take it easy,” I said “OK” and adopted the mantra of publishing before perishing. This is probably not the low-stress lifestyle the doctors had in mind, but when the clock is ticking, there is not a moment to lose.

That is how I came to free software, at 15. By 25, what I had learned from it was that the morally serious question about a system is not whether it is powerful. It is whether the people who inherit it can still repair it.

I crossed from forkable tools into state power. I also worked for 5 years with proprietary AI before that. Then I came back. I came back convinced that forkability is civic care — not a developer's hobbyhorse, not a licence preference, but civic care.

And I think you have been carrying care at civic scale for forty years.

You have been doing the work nobody else was willing to do, on weekends nobody paid you for, on a project the funders never noticed until it broke. The AI conversation has just now caught up to a question you have been answering since before some of the people writing AI policy were born.

I am here to say that out loud. And then to argue with you about what we do next.

---

# The Room as Ancestor

We are sitting inside a four-hundred-year-old experiment in being a good enough ancestor.

The Bodleian's books are inspectable: you can open them. They are modifiable: marginalia become new editions, schools of commentary, footnotes that become source material. They are forkable: the library network is the original peer-to-peer protocol.

Bodley made one promise in 1602 that turns out to matter more than anything else he wrote in his statutes. The library will not lend. It will not enclose. The artefacts stay open for the next reader.

Software freedom is that promise in code. Free software is inspectable, modifiable, forkable — by every reader. Without permission.

What Bodley wrote into his statutes in 1602, Stallman rewrote into code in 1985. The question we are here to ask is what happens to that promise now that AI joins the substrate.

---

# 4 Freedoms

Stallman gave us four freedoms in 1985. Many of you can recite them. I want to read them again, as muscles rather than as licences.

Freedom 0 — the freedom to run the program for any purpose — is the ground of attentiveness. You can pick the tool up at all. You can run an old version on hardware your vendor has stopped supporting. You can run it for purposes your employer disapproves of. You can run it because you wanted to know if it worked.

Freedom 1 — the freedom to study how the program works, and change it — is competence. To know what the system is actually doing in your hands, with your data, on your hardware. To be able to read it without anyone's permission. To be able to fix it without waiting for a release cycle.

Freedom 2 — the freedom to redistribute copies — is solidarity. The thing is a commons, not a possession. You can hand it to your neighbour. You can teach with it. You can put it on a USB stick and bring it to a country where the cloud is censored.

Freedom 3 — the freedom to distribute modified versions — is responsiveness. Your fix becomes someone else's starting point. The bisect closes. The patch lands upstream. The next maintainer inherits less debt than the last one.

I have heard people say software freedom is about licences. Software freedom is not about licences. Software freedom is about whether the person who comes after you can still find the bug.

The freedom that matters is not access to the artefact. It is access to the repair path.

David Krakauer at the Santa Fe Institute has a useful name for what this comes to. A tool is _complementary_ if the underlying human capacity persists when the tool is removed — the abacus that taught you mathematics; the gym that built your strength; the typewriter that taught you to compose. A tool is _competitive_ if the capacity degrades when the tool is removed — the feed recommender that ate your taste in what to think about; the algorithm that ate your patience for anything longer than a swipe. The four freedoms are how we keep the substrate complementary across generations. Close the patch path and the capacity to repair atrophies. Software freedom is the discipline of complementarity at the substrate level.

---

# The Lonely Maintainer

On a Sunday morning in 2023, Daniel Stenberg sat at his desk in Sweden and triaged another corporate-security email about a CVE — that is, a formally numbered security vulnerability — that was not actually one.

Curl runs on billions of devices. It is in your car. It is in your fridge. It is in the satellite that re-transmitted this talk. Daniel maintains it largely alone, with a small group of volunteers, on weekends.

The email Daniel was reading that day was demanding a written response, in a corporate-format security report, about an automated scanner's false positive. The sender had not read the project's documentation. The sender had not read the previous discussions. The sender was an unpaid bot that had been trained to file paperwork at unpaid humans.

I do not need to tell you how this story ends. He answered it anyway. Then he wrote a blog post about how the automated CVE-triage industry is breaking the open-source maintenance economy. Then he went back to writing Curl.

Four months later, in March 2024, Andres Freund noticed that liblzma — Lasse Collin's xz-utils — was running half a second slower than it should have been during sshd startup. He bisected — walked back through the project's commit history until he found exactly which change had introduced the slowdown. What he found was that "Jia Tan", a contributor who had been carefully grooming Lasse for two years through sock puppets and fake pressure campaigns, had inserted a backdoor that gave whoever controlled the upstream signing key — the key the project uses to authenticate its releases — full administrative access (what we call remote root) on most Linux servers in the world. The attack worked because Lasse was burned out, alone, and the social engineering had been patient.

This is what you have been holding open. The patch path. The repair path. The thing that, when it closes, takes most of the digital world with it. You have been holding it open with weekends and unpaid emails and an ethics of triage that nobody in a policy paper has ever fully named.

I want to name it now. Maintenance is care under scarcity. A maintainer who says "no, this is not a regression, I will not fix it this week" is not failing care. They may be preserving the project's ability to remain alive. The discipline of refusal is part of the discipline of repair.

We knew this. The AI conversation has not yet caught up.

---

# Pugs.hs: the Commit Bit

In early 2005, I sat down with Benjamin Pierce's _Types and Programming Languages_, hit the chapter-three exercise — "pick a small language and implement it as a toy" — and picked Perl 6, the language with the longest vapourware reputation I could find. Larry Wall had been drafting its specification for years; nobody had managed to implement it.

On the first of February 2005, in the #haskell IRC channel on freenode, Pugs was born — a six-day fork that grew. We occupied #haskell for twenty-one days before the regulars politely asked us to move next door and create a new channel, #perl6.

Then we did something I have not seen any project do before.

We gave the commit bit — write access to the main repository — to anyone who sent in a single patch. A typo fix. A documentation correction. A failing test case. We then sent unsolicited invitation emails to anyone we could find who had mentioned Perl 6 in a blog post. A core contributor's newborn son got a commit bit on day four of his life.

Within a year there were about two hundred contributors I had never met, on every continent, cooperating on the same codebase. Two communities that had not previously had much to say to each other — Haskell people and Perl people — found a way to work together, because each could see what they got out of it. The Haskellers got theses out of the type-system extensions we kept needing. The Perl people got a working laboratory for the new language — and, twenty years later, Raku's class system finally merged back into Perl as a first-class object model.

Larry Wall would watch us implement contradictions in his specification and write back: "Great, I'll extend the spec to match." The implementation taught the specification what it actually meant. The language came back from "abandoned" because we never made anyone ask permission to revive it.

That is the ancestor argument in minutia. A supposedly dead language came back because nobody had to ask. The commit bit was not a token of trust we extended to vetted developers. It was a refusal to require trust at all. The bisect and revert commands — the tools developers use to find and undo a breaking change after the fact — did the trust work that gatekeeping would have done badly.

I learned then what I am still learning now. The four freedoms are not abstractions. They are the difference between a project being a graveyard and a project being a fork point. And the second-order freedom — the freedom to grant other people the freedoms — is the one that turns a project into a community.

---

# Inside the Closed Stack

After Pugs and before government, I worked for six years with Apple's Cloud Service Localization team. I was helping with Mandarin language coverage in Siri, and with language families spoken around Shanghai. I will not pretend the team did not care. They cared deeply. The engineers I worked with at Apple cared more about whether the system understood a grandmother in Taipei correctly than any product manager required them to.

Caring deeply, it turns out, is not enough. It is not the same as giving the grandmother the four freedoms.

Inside a closed stack, the people who use the system have no way to participate in the loop of civic care. If Siri misunderstood, the grandmother could not file an issue. There was no upstream she could write to. There was no fork she could maintain. The most that anyone outside the company could do was complain, and the company would, occasionally, in its next release, fix some of the things some of the complainers had said.

That is not the same as the four freedoms. That is the appearance of responsiveness without its structure. Competent people inside closed systems can still care. But care has nowhere to land if the patch path is structurally unavailable.

I need to be diplomatic here. I am not saying everyone in proprietary AI is acting in bad faith. I am saying that the structure of proprietary AI is not the same as the structure of free software, even when the people inside it are doing their best. Free software's contribution is not better intentions. It is a path back.

---

# `@antirez` and `pi.audreyt.org`

Last week, I started working with Salvatore Sanfilippo — @antirez, the original author of Redis — on a small thing called DwarfStar 4 (DS4).

The idea is simple. A frontier-quality AI stack, running entirely on a small computer in your room, with a stable seed, a reproducible audit trail, full directional steering. If it does not work the way you want, you can tell it: I want it to work this way. A few minutes later, it steers the story that way.

Of course, @antirez knows about good-enough ancestors. He shipped Redis under a permissive licence for fifteen years; today Redis is also available under the AGPL — strong copyleft for the AI era. When Redis Labs first relicensed the core, he understood that he had given the community the right to keep going without him — and they did. That decision, made years earlier, was the ancestor decision. He left the descendants the right to find the bug.

DS4 is the same shape, one substrate up. For the first time in three years, the answer to "can a frontier-quality model run locally, inspectably, forkably, with a real licence" is yes. The hardware, the substrate, and the legal arrangement have lined up. We are taking advantage of that window.

If I do my job right with DS4, then when somebody five years from now wants to fork it, they can. If they want to bisect to find the regression — the moment the system started giving worse Mandarin pronoun resolution — they can. If they want to fork it because the original maintainers have lost the plot, they can.

---

# 447

Software freedom does not stop at the editor's window. It walks out into the room.

Two years ago in Taiwan we saw a surge in deepfake-scam ads on social media. The easy answer was censorship. But as Taiwan has the freest internet in Asia, this was not an option.

So, we did something different. The Ministry of Digital Affairs sent text messages to two hundred thousand people, randomly chosen, through the government's 111 SMS number. One thousand seven hundred and sixty responded. By lottery conducted in the full spirit of democracy, we chose four hundred and forty-seven of them to deliberate online, in forty-four groups of ten.

Civic AI was in each table — not judging, just listening. Summarising. Reminding quiet people to speak. Helping each table find rough consensus.

Eighty-five per cent of those four hundred and forty-seven said that the major platforms should bear primary responsibility for the ads they promote. Parliament passed it within months.

The anti-fraud enforcement that followed was associated with category-specific drops: ninety-six per cent in investment-scam ads, ninety-four per cent in identity-impersonation-scam ads. Not all scams. Not deepfake ads as a whole. The specific categories of ad we had named.

The same protocol is running now in California — [Engaged California](https://engaged.ca.gov/), post-Eaton and -Palisades wildfires. Eight thousand signups; about nine hundred directly affected people heard. The same shape, one polity over. Same copyleft software underneath — Polis, an open-source consensus-seeking tool that anyone can fork, audit, and patch.

This is free software scaled to the rooms you cannot fit in a Discord server.

This is what free software can do for the world when the substrate is open. But right now, that very substrate is being strip-mined.

---

# Tim Davis sees his code

Now, while Taiwan is proving what free software can do for democracy at scale, today the very substrate we rely on to do that is being strip-mined. Let me show you what that looks like.

In the autumn of 2022, Professor Tim Davis at Texas A&M watched GitHub Copilot output his exact sparse-matrix code. Not paraphrased. Not similar. Verbatim. Down to the variable names and the custom comments. Code he had written for SuiteSparse, code shipped under licences including the LGPL, code that for some reason the model had memorised down to the formatting.

Tim posted screenshots. They went around on social media for two days. Then the conversation moved on.

That is the wound. Not the technical wound. The moral one. You wrote the code. You licensed it freely so that the next generation could repair it. The model now has your code inside it. The model's vendor does not attribute. The model's vendor does not pass on the licence. The model's vendor sells the output under a licence that contradicts yours.

Stack Overflow trained the LLM that is now killing Stack Overflow. The xkcd dependency tree — the tiny project in Nebraska that the entire internet rests on — is now feeding the model that may eventually replace the project's only maintainer. The licences you wrote, in good faith, to keep the four freedoms alive — those licences have been treated by AI vendors as input to be laundered, not commitments to be inherited.

I am not here to pretend this is comfortable. It is not comfortable. The free-software movement taught the world the word "open", and the largest AI companies are now using that word while closing the repair path. This is what you have been carrying. This is what no AI policy person has yet said back to you in your own voice. You should hear it said.

The frontier is not whether AI companies will eventually do the right thing. The frontier is whether our community can put forward an answer concrete enough that the rest of the policy ecosystem has to argue against it rather than around it.

That is what the next slide is for.

---

# Civic AI: A New Frontier

Stefano Maffulli, who runs the OSI, calls this the final frontier of copyleft. Laura sent me his piece. He is right that it is the next domain.

The [Open Source AI Definition](https://opensource.org/ai/open-source-ai-definition) — OSAID v1.0 — already requires Data Information, Code, and Parameters. Give the OSI credit for that scope. It is not just weights. The fight to get even that scope into a published definition took years; we should not strawman it.

Where I think the frontier sits, beyond the definition, is two specific places.

First: public evaluation suites. Even when training-data documentation, code, and parameters are out, the suite that produced the model is itself a black box. The eval suite is the document of what the model was built to do, how to know if it is doing it, what counts as a regression. Without that suite, you cannot bisect. You cannot tell five years from now whether a fork is still doing the thing the original was for. Release the eval suite as free software, and you can actually inspect what the model is for, not just what it weighs.

Second: repair protocols. When the model fails — in a parish, in a care home, in a deliberation room — what is the path back? Who is on the hook? In what timeline? Through what process? Open-source AI without a repair protocol is open in name only. The artefact is downloadable. The system is not actually open until somebody downstream can carry the patch all the way upstream and have it land.

This runs from Stallman's four freedoms and the GPL, through Debian's Social Contract and the Open Source Definition, Apache-style permissive governance, Linux-scale maintenance, and the legal stewards — Karen Sandler, Wendy Seltzer, Software Freedom Conservancy — who made those freedoms enforceable in court. When the Software Freedom Conservancy sued Vizio in 2021 for shipping smart TVs running Linux without releasing the source, what they were arguing was that the GPL is not a contract between Linux developers and Vizio's lawyers. It is a covenant with the public. The right to inspect the code in the hardware in your living room is a right held by you, not by a corporate licensee. That argument is still alive. It matters more for AI than it ever did for TVs.

Maffulli is today's AI branch on a very old tree. Sandler and the Conservancy are the legal layer that keeps any of it enforceable.

Some of you might have heard of [ROOST.tools](https://roost.tools/), which launched at the Paris AI Action Summit in February 2025. The shape is: open-source trust-and-safety tools for CSAM detection, review, reporting, and incident workflows, usable by smaller and decentralised platforms. So that the smallest community is not forced to choose between either no protection or sending everything to a centralised service.

That is what software freedom looks like in 2026.

---

# `Kami.civic.ai`

What I have just described works in three layers. The Software Freedom Conservancy and Karen Sandler hold the _legal layer_ — the enforceability of the four freedoms in court. ROOST.tools is the _application layer_ — decentralised, open-source infrastructure that smaller communities can actually deploy. The third layer is the one I want to name now: the _governance layer_. Bounded stewardship. A Kami.

What I have been describing is what we call a Kami — a bounded local steward.

In the Shinto tradition, Kami is the spirit of a specific place: a river, a forest, a shrine. It is always local, always parochial, always particular. You do not have a universal Kami. You have the Kami of this river.

A Kami in code is a governance arrangement, not a deployment detail. The arrangement: a specific accountable community, an engagement contract that names who is owed an answer when the system acts, the community's right to refuse updates from upstream, the right to fork, and a retirement plan that names successors. The software is usually small enough to run locally — because local is the easiest way to keep the governance honest — but locality on its own is not enough.

A model that merely runs on your laptop, whose weights you cannot steer, whose updates a vendor pushes on their schedule, whose eval suite is closed, and whose retirement is a corporate decision, is a smaller-footprint version of the same closed stack. It is edge-computing. It is not a Kami.

A Kami is what happens when the four freedoms remain intact at the AI substrate — a guardian of this room, accountable to it, forkable by it, retirable by it.

The contrast matters. Oxford gave the world one powerful alignment question, and the work of answering it for the largest frontier systems is still alive and unresolved. We can recognise that work without subordinating ourselves to it. For the much larger and more numerous deployments — the parishes, the care homes, the classrooms, the deliberation tables — the work in front of us is to make that question maintainable by the public. To keep the patch path open.

A perfect ancestor is authoritarian. The descendants cannot correct them.

A good enough ancestor leaves source, licence, rollback path, and room for refusal.

The right to refuse is the freedom you cannot remove from a downstream community without making the upstream a tyrant. "Don't break userspace" — Linus's rule — is a refusal disguised as a stability promise. ROOST's federated architecture is a refusal presented as a safety tool. The SFC's lawsuit is a refusal presented as a contract enforcement. The downstream community's right to say "no, we will not take this update, we will fork instead" is the same refusal in another register. The Kami pattern is what happens when the refusal is built in from day one.

Here is what that looks like in a single room. A parish council uses a small local model to help draft agendas and minute meetings. The upstream pushes an update. The parish clerk runs the new weights against the eval suite the community wrote — does the model still hear the dialect the older parishioners use? Does it still summarise the kind of objection a quiet voice makes? If not, the clerk signs off on a _no-update_. The parish keeps the older weights running. The upstream is told. They fix the regression, or the parish forks and pins its own version. That is the right of refusal as a workflow, not a slogan.

---

# 3 Moves

I will close with three moves. None of them require permission. All of them are things you have been doing already; I will just name them so they show up in next year's policy memos under the names you would actually use.

Move one. When you ship code, ask whether your future descendants — not your current users, your descendants — can read it. Documentation is care. Tests are care. A successor plan is care. Write your git commits and your test coverage as if your successor is reading them cold at three in the morning, trying to fix a critical bug.

Move two. When you ship an AI system, ship the evaluation suite with it. The model tells us what the AI does; the eval suite tells us what its creators valued. Open weights without open evals is like handing someone a compiled binary without the documentation.

Move three. Build the retirement plan in from day one. A good enough ancestor names their own succession. Write a sunset clause. Name three downstreams you would entrust the project to. Make it boring. Make it findable. Make it inheritable. And if you are a funder or a policymaker: do not just demand 'safety' guardrails. Demand the repair path. Fund the eval suites.

I do not think these are radical. I think they are what most of you do already, in fragments, in different projects. The contribution of this talk, if it has one, is naming them: This is what civic care looks like when it is wired into the substrate. You have been doing care ethics for forty years. Nobody told you. Nobody asked you. You just did it.

---

# Good Enough Ancestor

I will end where I began.

The morally serious question is not whether a system is powerful. It is whether the people who inherit it can still repair it.

Software freedom is not the freedom to always be correct. It is the freedom to be corrected in public. It is the freedom to keep the repair path open after the original author is gone.

A good enough ancestor is not a perfect one. A good enough ancestor leaves _complementary_ tools — tools that strengthen the inheritor's capacity, not tools that compete with it. We are choosing not to compete with our descendants. We leave them code they can still fork and merge.

I will be wrong about parts of this. The most useful question in the time we now have together for Q&A is the one that shows where this model breaks. If it breaks, you still keep all the pieces, and we can patch them back together.

Thank you. Live long and … prosper.
