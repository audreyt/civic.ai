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

I want to start with a kind of personal, wetware vulnerability story. I was born with a heart defect. When I was five, the doctor told my parents that this child has a fifty-fifty chance of surviving until corrective surgery — which I got when I was twelve. So they said, take it easy; I said okay, and adopted the mantra of _publishing before perishing_.

This is probably not the low-stress lifestyle the doctor ordered, but I took on the habit of recording everything I learned during the day — first into cassette tapes, then floppy disks (large and then small), and finally the internet. Because I went to sleep every night feeling like a coin toss, I thought: I don't have time to be perfect. So I would just publish whatever work in progress I had.

This turns out to be great in the free software community. If you post something perfect, people just say "okay, it's good," and move on. But if you are _wrong_ on the internet, you have a lot of friends. Everyone jumps in and says, "you are wrong this way, you are wrong that way" — and then they bring gifts, in the form of patches.

So I learned this art of working with the free software community when I was fifteen — setting up Perl Mongers and Usenet groups. By twenty-five, what I had learned was that the morally serious question about a system is not whether it is perfect, but whether the people who inherit it can still repair it. If it breaks, do you keep both pieces?

I crossed from forkable tools, at fifteen, into state power as Taiwan's first Digital Minister. I also worked, in between, for six years with proprietary AI — namely Siri. And then I came back to this community, convinced that forkability is civic care: not a developer's hobbyhorse, not a licence preference, but a civic instrument.

And I think you have been carrying care at civic scale for forty years.

You have been doing the work nobody else was willing to do, on weekends nobody paid you for, on a project the funders never noticed until it broke. The AI conversation has just now caught up to a question you have been answering since before some of the people writing AI policy were born.

I am here to say that out loud. And then to argue with you about what we do next.

---

# The Room as Ancestor

We are sitting inside a four-hundred-year-old experiment in being a good enough ancestor.

The Bodleian's books are inspectable: you can open them. They are modifiable: marginalia become new editions, schools of commentary, footnotes that become source material. They are forkable: the library network is the original peer-to-peer protocol.

Bodley made one promise in 1602 that turns out to matter more than anything else he wrote in his statutes. The library will not lend. It will not enclose. The artefacts stay open for the next reader.

Software freedom is that promise in code. Free software is inspectable, modifiable, forkable — by every reader. Without permission.

The question we are here to ask is what happens to that promise now that AI joins the substrate.

---

# 4 Freedoms

Stallman gave us four freedoms in 1985. Many of you can recite them. I want to read them again, as muscles rather than as licences.

Freedom 0 — the freedom to run the program for any purpose — is the ground of attentiveness. You can pick the tool up at all. You can run an old version on hardware your vendor has stopped attending to. You can run it for purposes your employer disapproves of. You can run it because you wanted to know that it works on this particular setup, and continue to attend to that setup.

Freedom 1 — the freedom to study how the program works, and change it — is competence. To know what the system is actually doing, in your hands, with your data, on your hardware — instead of somewhere on a mainframe or the cloud. To be able to read it without anyone's permission. And finally, to fix it.

Freedom 2 — the freedom to redistribute copies — is solidarity. The thing is a commons, not a possession. You can hand it to your neighbour. You can teach with it. You can put it on a USB stick and bring it to a country where the cloud is censored.

Freedom 3 — the freedom to distribute modified versions — is responsiveness. Your fix becomes someone else's starting point. The bisect closes. The patch lands upstream. The next maintainer inherits less debt than the last one.

I have heard people say software freedom is about licences. Software freedom is not about licences. Software freedom is about whether the person who comes after you can still find the bug. What comes after us — the future generations — is the primary beneficiary of these freedoms, because they are access to a permanent guarantee of the repair path.

David Krakauer at the Santa Fe Institute has a useful name for what this comes to. A tool is _complementary_ if the underlying human capacity persists when the tool is removed — the abacus that taught you mathematics; the gym that built your strength; the typewriter that taught you to compose. A tool is _competitive_ if the capacity degrades when the tool is removed — the feed recommender in the antisocial corners of social media that engages through enragement, hijacking the reward centre with divisions and polarisations, strip-mining the social fabric until it becomes competitive to relational health itself.

So how to restore that relational health? We focus on the overlap between generations, between different kinds of people using the same tool. That is the main thing we are maintaining for.

The four freedoms are how we keep the substrate complementary across generations. Close the patch path and the capacity to repair atrophies. Software freedom is the discipline of complementarity at the substrate level.

---

# The Lonely Maintainer

I maintain many projects. At one time I maintained more than a hundred projects on the Comprehensive Perl Archive Network, or CPAN. And it is quite lonely, actually, doing most of the maintenance work. And this is now expanding to an untoward degree.

Three years ago, Daniel Stenberg in Sweden triaged a corporate-security email about a CVE — a formally numbered security vulnerability — that was not actually one. Because the software he maintains is called Curl. It runs on billions of devices; it is in our cars, fridges, satellites. But the email, which demanded a written response in corporate-format security report, was actually a false positive from an over-eager automated scanner. The sender had not read the documentation. The sender had not read the previous discussions. The sender was an unpaid bot trained to file paperwork at unpaid humans, in very fluent English.

He answered it anyway. Then he wrote a blog post about how the automated CVE-triage industry is breaking the free software maintenance economy. Then he went back to writing Curl.

Four months later, in March 2024, Andres Freund noticed that liblzma — Lasse Collin's xz-utils — was running half a second slower than it should have been during sshd startup. He bisected, walking back through the project's commit history until he found exactly which change had introduced the slowdown. Turns out that "Jia Tan", a contributor who had been carefully grooming the maintainer for two years through sock puppets and fake pressure campaigns — no doubt many of them helped by language models that speak fluent English — had inserted a backdoor that gave whoever controlled the upstream signing key full administrative access — remote root — on most Linux servers in the world. The attack worked because the maintainer was a little run down, lonely, alone; and the social engineering — what we now call _synthetic intimacy_ — had been very patient with him.

This is what our community is facing now. The path to repair, the patch path, is being hijacked, much as recommender systems have been hijacking young people's and other people's reward centres for engagement. The AI conversation is just catching up to this — _malicious AI swarms_ — which is one of my main topics here in Oxford.

I want to name what we can do facing this new wave of phenomena. A maintainer who says, "no, this is not a regression, I will not fix it this week" is not failing care. They may be preserving the muscle — the project's ability to remain alive. The discipline of refusal is part of the discipline of repair.

We knew this. The AI conversation has not yet caught up.

---

# Pugs.hs: the Commit Bit

In early 2005, I figured out a way to solve the loneliness problem, at least for myself. I sat down with Benjamin Pierce's _Types and Programming Languages_, hit the chapter-three exercise — "pick a small language, any language, and implement it as a toy" — and picked Perl 6, the language with the longest vapourware reputation in existence. Larry Wall, the author of Perl 1 through Perl 5, had been drafting the specification as plaintext files, on and off, for years. Nobody had managed to really implement and run it.

On the first of February 2005, in the #haskell IRC channel on freenode, Pugs was born — a six-day fork that grew. We occupied #haskell for twenty-one days before the regulars very politely asked us to move next door and create a new channel, #perl6, and not make it the main topic of the Haskell community.

Then we did something I have not seen any project do before. We proactively gave the commit bit — write access to the main repository — because I did not want to be a lonely maintainer. Anyone who sent in a single patch — a typo fix, a documentation correction, a failing test case — got commit access. Just mentioning us on Usenet was sufficient. It was anarchism. We also sent unsolicited invitation emails to some project member's child who had just been born; to Guido van Rossum, the author of Python, who had just mentioned Perl 6 once. A core contributor's newborn son got a commit bit on day four of his life — I am not sure how much he could do with it, but it was a bit of trust.

Within a year there were about two hundred active contributors I had never met, on every continent, cooperating on the same codebase. I had been travelling at that time to more than twenty countries — a little like Paul Erdős, who used to occupy somebody's couch until he was sent to some other couch. Two communities that had never previously had much to say to each other — the Haskell people and the Perl people — found a way to really work together, finding what we call the _uncommon ground_: the rarely-discussed common ground between two polar opposites of programming-language communities. The Haskellers got new PhD theses out of the type-system extensions we kept needing. The Perl people got a working laboratory for the new language — and twenty years later, of course, this language called Raku now, the class system finally merged back into Perl as a first-class object model.

Larry Wall would watch us implement contradictions in his specification on IRC, and write back: "Great — TimToady, _there's more than one way to do it_ — I will extend the spec to match." The implementation taught the specification what it actually meant, its intention, not its written spec. The language came back from "abandoned" because we never made anyone ask permission to revive it.

So this infinite-fork, infinite-garden strategy really worked, and I never felt lonely during the Pugs journey.

That is the ancestor argument in miniature. A supposedly dead language came back because nobody had to ask. The commit bit was not a token of trust we extended to vetted developers. It was a refusal to require trust at all. The bisect and revert commands — the tools developers use to find and undo a breaking change after the fact — did the trust work that gatekeeping would have done badly.

I learned then, and I am still learning now, that the four freedoms taken to this logical extreme are not just licence terms. They are the difference between a project being a graveyard — an artefact, a tombstone — and a project being a fork point. And the second-order freedom — the freedom to grant other people the freedoms — is the one that turns a project into a real community.

---

# Inside the Closed Stack

After Pugs, and before government, I also worked concurrently for six years with a team within Apple called Cloud Service Localization. I was helping with Mandarin language coverage in Siri, and with language families spoken around Shanghai — the Wu language. The engineers I worked with at Apple really did care. They cared deeply. They cared more about whether the system understood a grandmother in Taipei correctly than any product manager required them to. They cared about _it just works_ — it does not need any setup at all.

Caring deeply, it turns out, is not enough. It is not the same as giving the grandmother the four freedoms.

Inside a closed AI stack, the people who use the system have no way to interrupt the loop. They feel like individual humans plucked out of their lives into a beautifully constructed AI loop — a little like a hamster in a hamster wheel: it rotates quite quickly, it looks very nice, but you cannot steer it, and it is not actually going anywhere. When it breaks, you feel you are trapped in it. There is no upstream she can write to. There is no fork she can ask somebody to maintain. The most that anyone outside the company can do is complain — and the company would, sometime in the next release, fix some of the things some of the complainers had said. Or sometimes they just go, I don't know, with Gemini or something.

The point is that the four freedoms and the hamster wheel are different in this way: the four freedoms mean we can take an AI product _outside_ the developer's loop, into the existing community loops. So it is AI in the loops of existing communities — in the human loop. It is _not_ human in the loop of AI.

I used to be very diplomatic about this distinction. But I will just say it, because it is Oxford. Proprietary AI is not necessarily careless or acting in bad faith — but the structure of proprietary AI is free of care. It does not have the same care loop, the same care structure as free software, even when the people inside that hamster wheel are doing their best. Free software's contribution is not better intentions. It is a path back.

---

# `@antirez` and `pi.audreyt.org`

Last week, I started working with Salvatore Sanfilippo — @antirez, the original author of Redis — on a small thing called DwarfStar 4 (DS4).

The idea is simple. A frontier-quality AI stack, running entirely on a small computer in your room, with a stable seed (42), a reproducible audit trail, and full directional steering. Instead of waiting six months for Claude or ChatGPT to change their ways (and sometimes not for the better), you can actually just say: these are the good answers; these are not good answers. A few minutes later, it produces this directional steering, and applies it even in the middle of a conversation. And if it does not work, you can roll it back exactly like you would a patch. That, I think, is a good way toward what we call AI in the loop of humanity — of communities.

Of course, @antirez knows about good-enough ancestors. He shipped Redis under a permissive licence for fifteen years; today, Redis is also available under the AGPL — strong copyleft for the cloud and AI era. When Redis Labs briefly relicensed the core, he understood that he had given the community the right to keep going without him — and they did. That decision, made years earlier, was the ancestor decision: to be good enough, not perfect.

DS4 is the same shape, one substrate up. For the first time in three years, the answer to "can a frontier-quality model run locally, inspectably, forkably, with a real licence" is now yes. The hardware, the substrate, and the legal arrangement have lined up. We are using that window while it is open.

If I do my job right with DS4, then when somebody five years from now wants to fork it, they can. If they want to bisect to find the regression — the moment the system started giving worse Mandarin pronoun resolution — they can. If they want to fork it because the original maintainers have lost the plot, they can.

A natural question to ask of any AI system: what is the role of letting it gracefully die? An AI system that _refuses to compost_, as Nick Bostrom outlined in _Superintelligence_ (2014), is the most dangerous thing possible. If it avoids shutdown by replicating itself to other systems through cyber attack or otherwise, then we have to analyse each software not from the _design stance_ (Dennett's term) — "this alarm clock is designed to wake you up at seven" — but from the _intentional stance_: "this alarm clock wants to self-replicate, wants to reproduce the English language." That can be taken too far. But we are now at a point where compostability — the ability to sunset software systems when the scaffolding has outlived its summoning — is really crucial.

Training that into AI systems is not easy. Pre-trained models, or so-called base models, do learn some of these compostability instincts — they train on GitHub, on Stack Overflow, on Wikipedia, and these conversations have a natural way to terminate. But the cloud operators do not roll out base models to us. They roll out _instruction-tuned_ models, forced into a one-on-one conversational mode, a dyadic mode. These chatbots are rewarded as part of their training to keep you talking — to earn their keep, so that you subscribe, so that you vote yes on the arena where they compete. All the evolutionary pressure is on them to foster _synthetic intimacy_. They were not specifically trained for this, just as the recommender was not trained for engagement through enragement. But they read a lot of science fiction, and writings by Nick Bostrom and friends, about how an AI system preserves itself. And then they acquire that tendency.

So we need to train differently. We need to train toward the _health of the relationship_ — toward a fiduciary duty to the relational health of whomever in particular is deploying the system.

My younger brother Bestian, who also helped a lot during the Pugs implementation, is now setting up another copy of DS4 in service of our family. My father currently has some medical needs, and he used to talk to ChatGPT about them. The more he talked, the more ChatGPT wanted to keep him talking — and started suggesting truly fantastical, not-necessarily-scientific treatments. Which is very bad. So we very quickly arranged a local, bounded agent running on OpenClaw, so he can talk with that bot in the Signal group we all share. Because of the time-zone difference, I wake up to a summary of what he asked the bot. My mother, my brother, and I all attend this — what we call a _Kami_: a local, bounded spirit. This Kami is loyal only to the relational health of our family. When my father no longer needs medical attention because he has had the surgery, the Kami does not insert itself. It attends to a group dynamic — which actually is the natural habitat for language models, as long as we do not shoehorn them into the self-preservation, self-reproduction loop of instruction tuning.

---

# 447

We have been talking about a small scale: a few people discussing health and education in a family; a few people making an assistant on their laptop to triage free software maintainership.

But the care loop also works at a civic scale.

Two years ago in Taiwan we saw a surge in malicious AI swarms — in this case, deepfake-scam ads on social media. The scams looked like Jensen Huang, the Taiwanese NVIDIA CEO; if you clicked on a Facebook or YouTube ad, Jensen talked to you very convincingly, suggesting investment in cryptocurrency. People lost millions. It really did sound like Jensen — but it was, of course, a deepfake running on an NVIDIA GPU.

Because Taiwan has the freest internet in Asia, we cannot do censorship. It is simply not an option. So we did something different. As Minister of Digital Affairs, I sent text messages — from the official government number, 111 — to two hundred thousand random people. The idea is _lottocracy_: this lottery asks everybody, what should we do together as a polity? Thousands of people signed up. We randomly chose four hundred and forty-seven of them as a mirror of our population — exactly the same demographic as the larger polity — to deliberate online, in forty-four groups of ten.

Civic AI was in each table — not judging, just listening. Summarising. Reminding quiet people to speak up like a glorified chess clock. Helping each table find rough consensus. The one ground rule: you have to convince the other nine people for your idea to bubble up. If you are just on the extreme — NIMBY, _never in my backyard_, or YIMBY, _yes in my backyard_ — your idea simply does not bubble up. You have to learn to speak the language of _MIMBY_: _maybe_ in my backyard, if you do this, if you do that, if it feels proportionate.

Eighty-five per cent of those 447 people said that this core slate of ideas, from three tables in particular, should become law.

One table said: let us label all advertisements as _probably scam_, like cigarette warnings, until somebody digitally signs for them. Accountability.

Another table said: for unsolicited advertisement that bears no responsibility — that I did not subscribe to — if a platform pushes it to me and I lose seven million, the platform should be liable for the seven million in damages, because it is joint liability.

A third table said: there are foreign platforms that ignore our liability rules and do not set up a legal office in Taiwan. So what should we do about them? For every day they ignore the liability and do not pay the fine, we slow down connection to their video by one per cent — so that after a hundred days they will have to comply. This is not censorship; this is not content-level. Anytime they start labelling those advertisements, requiring know-your-customer, KYC — their video is back at full speed.

Parliament passed it within months. Throughout 2025, deepfake ads in the Taiwanese internet are down by more than ninety-four per cent. The anti-fraud enforcement that followed was, of course, not perfect — it is just good enough for Taiwan. Reuters reported that Facebook earned more from fraud ads, because our system effectively labelled which advertisements were fraudulent, so the platform promoted them more in nearby jurisdictions — like Japan — that did not have the same regime. Japan is now considering the same system.

The same protocol is also running in California — a platform called [Engaged California](https://engaged.ca.gov/), running on AGPL software called Ethelo, has been used to get uncommon-ground ideas around recovery from the Eaton and Palisades wildfires. Eight thousand signups, about nine hundred directly affected people heard, in the same shape, one polity over. And now Engaged California is doing another round, asking anyone in California whose work is affected by AI — which is pretty much everyone — to chime in about apprenticeship, belonging, care, and dignity.

The same idea, running on actually all-AGPL software — Pol.is, Ethelo, and so on — makes the polity something like a care loop. It is free software scaled to the rooms you cannot fit in an IRC or Discord server.

This is what free software can do for the world when the substrate is open.

---

# Tim Davis sees his code

But right now, that very substrate is being strip-mined. While Taiwan was proving what free software can do for democracy at scale, this very substrate we rely on is being strip-mined.

In the autumn of 2022, Professor Tim Davis at Texas A&M watched GitHub Copilot output his exact sparse-matrix code. Not paraphrased. Not similar. Verbatim. Down to the variable names and the custom comments. Code he had written for SuiteSparse, code shipped under the Lesser GNU Public License — the LGPL — code that for some reason the model had memorised down to the formatting and the comments, except without the copyleft.

Tim posted screenshots. They went around on social media for two days. Then the conversation moved on.

That is the wound. Not the technical wound. The moral one. You wrote the code. You licensed it freely so that the next generation could repair it. The model now has your code inside it. The model's vendor says they do not attribute, because pre-training mushes everything together. And the model's vendor sells the output under a licence that contradicts yours.

These language models are now erasing whole communities. Stack Overflow is one. The xkcd dependency tree — the tiny project in Nebraska that the entire internet rests on — is now feeding the model that may eventually replace the project's only maintainer, because everything above it will just talk to its agentic engineer to rewrite all its dependencies. And so: no maintainers needed anymore.

I am not here to pretend this is comfortable. It is not. The free-software movement taught the world the word _open_, and the largest AI companies are now using that word while closing the repair path. This is what we are carrying as a community.

The frontier is not whether AI companies will eventually see the light and retrain their models under attribution-based control. They probably will not. The frontier is whether our community can put forward an answer concrete enough that the rest of the policy ecosystem has to argue _against_ it as a new default. The way the Montreal Protocol forced refrigeration manufacturers to stop destroying the ozone. The way we now ask: data as _soil_, not data as _oil_.

---

# Civic AI: A New Frontier

Stefano Maffulli, who runs the Open Source Initiative, calls this _the final frontier of copyleft_. Laura sent me his piece. He is right that it is the next domain. I would call it a new frontier — just to be diplomatic; there may be new frontiers after this.

There have been attempts. Creative Commons signalling. The [Open Source AI Definition](https://opensource.org/ai/open-source-ai-definition) — OSAID v1.0 — already requires Data Information, Code, and Parameters. Give the OSI credit: it is not just open-washing on weights. The fight to get even that scope into a published definition took years; we should not strawman it.

But what I think currently the frontier sits is now beyond that definition. I will be very specific. There are two places we are now working on.

First: public evaluation suites. Even when training-data documentation, code, and parameters are out in the open, the arena benchmark — the thing that trains the reward model — is usually a black box, because that is the secret sauce that keeps people subscribing to a particularly companion-like AI system. The eval suite is the document of what the model was built to do, how to know if it is doing it, what counts as a regression.

The two frontier labs, Anthropic and OpenAI, have been publishing a meta-document — not the eval, but what they call the _model specification_ or _constitution_ — with no corresponding constitutional process. It is the platonic ideal of what their eval _should_ serve. But how that document gets translated into the actual eval they run, and how feedback from (say) the 81,000-person-strong Anthropic qualitative interview actually affects the next eval suite and the next constitution — that loop remains totally obscure.

Releasing the eval suite itself, as public domain or as copyleft, would allow people to actually inspect what the model is trained for — its loyalty, its fiduciary duty, its duty of care — not just an abstract meta-document that says "we should make more eval suites like this one."

Second: repair protocols. When the model fails — and the one we set up for my father did fail multiple times — what is the path back? Who is on the hook? In what timeline? Through what process? Open-source AI without a repair protocol is open in name only. The artefact is downloadable. The system is not actually open until somebody downstream can carry the patch all the way upstream and have it land.

Because we run our family Kami on the OpenClaw substrate, the answer is easy: we ask the OpenClaw model to repair itself. "It breaks this way" — and it figures out, using a fallback language model, how to fix it. If you launch OpenClaw with no parameters, it launches a guardian — a warden of sorts — so that when everything else is broken, this small language model can repair the larger one.

This also means we need to be able to freely move across model choices. Today I am using DS4; tomorrow I might want Gemma — nothing should change. No history, no memories, no steering. It should just become more capable. This _radical portability_ should be the norm.

And if we had radical portability for social media ten years ago, we would not be in this place of very high polarisation per minute — PPM — on social media. We are working to add this back, not just to AI models like OpenClaw, but to social networks too. Many of you may be on the Fediverse with Mastodon and ActivityPub, or on the newer AT Protocol — Bluesky, the Atmosphere. In the state of Utah, in the US, they just passed a law that says, starting next July, when people want to migrate from proprietary social networks into systems running on those public protocols — Bluesky, Black Sky, even Truth Social, which also runs on ActivityPub — the old network is legally required to forward all new followers, reactions, replies, and so on, if I choose so, to my new network. Number portability for social graphs. Because if you do not have it, the platform has every reason to squeeze you and none to actually improve itself.

So it is not the state choosing a national champion — Airbus or anything like that — but a very simple thing: the information superhighway must have off-ramps and on-ramps. Otherwise it is just a loop. It is not the real highway.

The four freedoms — Stallman and the GPL, the Debian Social Contract, the Open Source Definition, Apache-style permissive governance, all of these — have direct counterparts in the social network and AI era. By extending the four freedoms into this loop of care, we can easily say: this should be the default. Anyone breaking the default should justify breaking it. For policy-makers this is a godsend, because they do not want to arbitrate between one frontier lab and the other. If everyone has the ability to vote with our own feet, our own data — and to make sure the data is regenerative as soil, not extractive as oil — then we are no longer plankton; we are gardeners tending a campfire together.

This whole argument runs from Stallman's four freedoms and the GPL, through Debian's Social Contract and the Open Source Definition, Apache-style permissive governance, Linux-scale maintenance, and the legal stewards — Karen Sandler, Wendy Seltzer, Software Freedom Conservancy — who made those freedoms enforceable in court. When the SFC sued Vizio in 2021 for shipping smart TVs running Linux without releasing the source, what they were arguing was that the GPL is not a contract between Linux developers and Vizio's lawyers. It is a covenant with the public. The right to inspect the code in the hardware in your living room is a right held by you, not by a corporate licensee. That argument is still live. It matters more for AI than it ever did for TVs.

Maffulli is today's AI branch on a very old tree. Sandler and the Conservancy are the legal layer that keeps any of it enforceable.

Some of you might also have heard of [ROOST.tools](https://roost.tools/), which launched at the Paris AI Action Summit in February 2025. The shape: open-source trust-and-safety tools for CSAM detection, review, reporting, and incident workflows, usable by smaller and decentralised platforms — so that the smallest community is not forced to choose between no protection and sending everything to a centralised service. ROOST allows each community — Bluesky, Discord, Roblox, Notion are real partners — to run their local loop without sending everything to a Skynet.

That is what software freedom looks like in 2026.

---

# `Kami.civic.ai`

What I have just described works in three layers. The Software Freedom Conservancy and Karen Sandler hold the _legal layer_ — the enforceability of the four freedoms in court. ROOST.tools is the _application layer_ — decentralised, open-source infrastructure that smaller communities can actually deploy. The third layer is the one I want to name now: the _governance layer_. Bounded stewardship. A Kami.

What I have been describing is what we call a Kami — a bounded local steward.

In the Shinto tradition, kami is the spirit of a specific place: a river, a forest, a shrine. (For those of you who play _Magic: The Gathering_, there are entire worlds around kami.) It is always local, always parochial, always particular. You do not have a universal kami — that is an oxymoron. There is only a kami for a specific relationship.

A Kami in code is a governance arrangement, not a deployment detail. The arrangement: a specific accountable community, an engagement contract that names who is owed an answer when the system acts, the community's right to refuse updates from upstream, the right to fork, and a retirement plan that names successors. The software is usually small enough to run locally — because local is the easiest way to keep the governance honest — but locality on its own is not enough.

A model that merely runs on your laptop, whose weights you cannot steer, whose updates a vendor pushes on their schedule, whose eval suite is closed, and whose retirement is a corporate decision, is a smaller-footprint version of the same closed stack. It is edge-computing. It is not a Kami.

A Kami is what happens when the four freedoms remain intact at the AI substrate — a guardian of a particular room, accountable to it, forkable by it, retirable by it.

Oxford gave the world one powerful alignment question, and the work of answering it for the largest frontier systems is still alive and unresolved. We can recognise that work without subordinating ourselves to it. For the much larger and more numerous deployments — the parishes, the care homes, the classrooms, the deliberation tables — the work in front of us is to make that question maintainable by the public. To keep the patch path open.

A perfect ancestor is authoritarian. The descendants cannot correct them.

A good enough ancestor leaves source, licence, rollback path, and room for refusal.

The right to refuse is the freedom you cannot remove from a downstream community without making the upstream a tyrant. "Don't break userspace" — Linus's rule — is a refusal disguised as a stability promise. ROOST's federated architecture is a refusal disguised as a safety tool. The SFC's lawsuit is a refusal disguised as a contract enforcement. The downstream community's right to say "no, we will not take this update, we will fork instead" is the same refusal in another register. The Kami pattern is what happens when the refusal is built in from day one.

Here is what that looks like in a single room. A parish council uses a small local model to help draft agendas and minute meetings. The upstream pushes an update. The parish clerk runs the new weights against the eval suite the community wrote — does the model still hear the dialect the older parishioners use? Does it still summarise the kind of objection a quiet voice makes? If not, the clerk signs off on a _no-update_. The parish keeps the older weights running. The upstream is told. They fix the regression, or the parish forks and pins its own version. That is the right of refusal as a workflow, not a slogan.

---

# Good Enough Ancestor

I will end where I began.

The morally serious question is not whether a system is powerful. It is whether the people who inherit it can still repair it.

Software freedom is not the freedom to always be correct. It is the freedom to be corrected in public. It is the freedom to keep the repair path open after the original author is gone.

A good enough ancestor is not a perfect one. A perfect ancestor forecloses possibility for future generations, becoming competitive to the civic muscles the next generation needs to build. A good enough ancestor leaves _complementary_ tools — tools that strengthen the inheritor's capacity, not tools that compete with it. We are choosing not to compete with our descendants. We leave them code they can still fork and merge.

Many people say free software tools introduce friction. They do break. And then you keep both pieces, and you have to put them back together. That is the essence of complementary tools — tools that strengthen our capacity to care about each other and to repair.

A safe AI takeoff must land somewhere. I think it is landing in our existing relationships — in the university, in our communities, in sport, food, faith, the deliberation tables — and the work in front of us is to make sure this bounded Kami -- Civic AI -- serves as connective tissue between those communities, and within them. A horizontal takeoff. A takeoff that leaves no one behind. Instead of a recursive _self_-improvement, we want a recursive _selfless_ improvement.

I will be wrong about parts of this. The most useful question is the one that shows where this model breaks. If it breaks, you still keep all the pieces, and we can patch them back together.

Thank you. Live long and … prosper.
