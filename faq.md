---
layout: chapter
title: "Frequently Asked Questions"
meta_description: "Answers on Civic AI and the 6-Pack of Care: care ethics and AI alignment, the Kami, corrigibility, sunset conditions, and democratic AI governance."
summary: "Plain-language answers to the hardest questions about Civic AI and the 6-Pack of Care — whether cooperative Kamis can survive a profit-driven AI arms race, how Civic AI complements technical AI safety with local answerability, who stays accountable, and how a bounded local steward stays safe, contestable, and can be switched off."
lang: en-gb
alt_lang_url: "/tw/faq"
permalink: "/faq/"
nav_prev:
    url: "/measures/"
    text: "Measures"
nav_next:
    url: "/"
    text: "Home"
---

<h2 id="everyday-questions">Start with an everyday question</h2>

**Must I build or buy an AI?** No. Start with a system your school, clinic or council already uses, and ask who owns the decision, who must reply and how someone can appeal. Choosing no AI is legitimate.

**Does a polite chatbot show care?** Humans and institutions owe care; a friendly style does not show who heard a concern, who must answer or who will repair harm. [Relational health](/glossary/#relational-health) concerns people with one another, people with providers, people with AI, and systems and operators with one another. Those relationships need transparency, agency, accountability and reciprocity, not just reassuring words.

**What do we discuss at a first group meeting?** Begin with the [four keeping questions](/kami/#before-you-start): Who keeps it, what harm can a breach cause, who may override and when does it end? Make the meeting accessible and name proxies with standing to speak and override for people who cannot attend. If the room cannot answer, do not begin deployment.

**How does this site map to the book?** Book Chapters 3-8 correspond to site Packs 1-6; the FAQ and glossary explain the foundations. [Sources and cases](/sources/#cases) distinguish documented work from proposals, while the flood-bot is a fictional composite for teaching. Start with the [everyday actions](/#start-today); the [measures](/measures/) are proposals, not validated standards.

<h2 id="question-map">How the hard questions fit together</h2>

The numbered questions are the strongest objections we have heard. Each one tests a single part of the framework, so together they fall into five groups. The numbers stay fixed so that links keep working; the groups give the order of the argument.

- **Foundations: is the moral basis sound?** Care at institutional scale ([Q2](#faq-2)), grand goals and outcomes ([Q3](#faq-3)), democratic standing ([Q4](#faq-4)), care that becomes control ([Q22](#faq-22)), the moral status of a Kami ([Q20](#faq-20)) and what the framework inherited ([Q21](#faq-21)).
- **Governance process: do the procedures do what they claim?** Speed ([Q5](#faq-5)), truth and bridging ([Q6](#faq-6)), who has time to take part ([Q23](#faq-23)), who answers when no one is to blame ([Q24](#faq-24)), who counts and what can be undone ([Q16](#faq-16)), and capture and gaming ([Q13](#faq-13)).
- **Communities and trust: does it fit the people it serves?** Places beyond Taiwan ([Q7](#faq-7)), communities with reason to distrust ([Q8](#faq-8)), the institutions in between ([Q9](#faq-9)), embodied care ([Q10](#faq-10)) and the person using AI alone ([Q18](#faq-18)).
- **Political economy: can it be paid for and survive competition?** The arms race ([Q1](#faq-1)), local knowledge as labour ([Q11](#faq-11)) and who pays ([Q12](#faq-12)).
- **Scope and limits: what does it leave to others?** Frontier alignment ([Q17](#faq-17)), unbounded superintelligence ([Q15](#faq-15)), capability assembled from bounded parts ([Q19](#faq-19)) and defence against authoritarian AI ([Q14](#faq-14)).

If your objection fits none of these, [tell us](https://github.com/audreyt/civic.ai/issues).

<h3 id="faq-1" data-faq-category="economy" data-faq-label="Political economy" data-toc="Surviving the AI Arms Race"><a href="#faq-1">Q1.</a> The AI market is locked in an arms race driven by commercial profit and geopolitical dominance. An AI working for a tax-software monopoly can lobby to keep tax filing difficult — and far worse is easy to imagine. If this problem continues, isn't the vision of cooperative Kamis hopelessly naive?</h3>

[Civic AI](../glossary/#civic-ai) cannot survive by asking monopolies to be nicer. The trap has a name — [Moloch](https://slatestarcodex.com/2014/07/30/meditations-on-moloch/): everyone races to the bottom, because whoever defects first wins and whoever holds back loses. Moralising does not change that dynamic. Changing the payoffs can: the aim is terrain on which cooperation pays more than extraction. The five levers below mix documented examples with policy proposals; evidence varies, as the [sources and cases](/sources/#cases) explain.

1. **Interoperability and portability.** Require platforms to speak common protocols — the way any email service can write to any other — so that people can leave without losing their relationships. The [Utah Digital Choice Act](https://le.utah.gov/~2025/bills/static/HB0418.html) already requires a portable copy of a user's personal data, including the social graph ([§13-81-201](https://le.utah.gov/xcode/Title13/Chapter81/13-81-S201.html), in force 1 July 2026). Continuous real-time forwarding of new activity is the later [H.B. 408](https://le.utah.gov/Session/2026/bills/enrolled/HB0408.pdf) duty, from 1 July 2027. When the moat of a captive audience drains away, platforms have to compete more on quality of care and less on the strength of the cage.
2. **Civic procurement.** Governments are enormous customers, and what they insist on, vendors build. Require that any AI bought for public use be auditable, interoperable, and informed by citizen input on an institutional response path — as Taiwan's [Alignment Assembly](../glossary/#alignment-assembly) did for anti-scam policy, without itself governing the systems — and building [_Kami_](../glossary/#kami)-like systems becomes better business. [Steward-ownership structures](https://purpose-economy.org/en/) — companies legally bound to their mission rather than to sale or extraction — and board-level safety duties can turn civic care into a fiduciary obligation: a duty the law can enforce, not a marketing slogan.
3. **Public options.** Offer simple baseline services that do the job without harvesting attention or data, backed by publicly funded research compute. Private vendors then have to beat the public option on care, not on lock-in. Taiwan's tax-filing system — which [replaced](https://www.radicalxchange.org/media/blog/the-missing-half-of-open-government/#part-iv-case-studies) a user-hostile service with one redesigned in multi-stakeholder workshops with the people who use it — is a working prototype.
4. **Provenance for paid reach.** Provenance means a verifiable answer to one question: who is paying for this message? Require it — with disclosure that stays attached — for ads and mass amplification in political and financial domains. Taiwan's [Fraud Crime Hazard Prevention Act](https://law.moj.gov.tw/ENG/LawClass/LawAll.aspx?pcode=D0080226) Art. 30 requires online advertisement platforms to verify the identity of persons commissioning and funding ads through digital signature, rapid authentication, or equivalent-safety methods — not specifically a signature of the featured celebrity. Ordinary speech is protected through [selective-disclosure identity](https://news.mit.edu/2024/litweeture-uses-meronymity-social-media-open-discussions-0418) ([Pack 5](../5/)): you prove you are a real person without revealing who.
5. **Federated open supply.** Support open-weight models (models whose trained parameters are published, so anyone can download, inspect, and run them) and trust-and-safety tools that independent organisations can self-host rather than relying on one central moderator. Examples: [ROOST](https://roost.tools/): Osprey for incident response, Coop for review and moderation; human-led workflows, not a network of AIs exchanging threat intelligence. If basic intelligence becomes a public good, the race can shift from "who owns the biggest brain" to "who applies intelligence most attentively in a local context" — a race that rewards care.

None of these levers requires goodwill from incumbents. Each aims to restructure incentives so that civic behaviour becomes the path of least commercial resistance. They do require legislators, procurers and funders willing to use them. That political will is the scarce input, and no framework can supply it.

---

<h3 id="faq-2" data-faq-category="foundations" data-faq-label="Foundations" data-toc="Care Ethics at Scale"><a href="#faq-2">Q2.</a> Care ethics was developed for interpersonal relationships — a nurse and a patient, a parent and a child. Scaling it to AI systems and global governance seems like a category error — stretching a concept to somewhere it simply does not belong. Why isn't it?</h3>

The objection is well-known and has been raised by [care ethics](../glossary/#care-ethics)' own practitioners: Care is too intimate, too parochial — bound to its own small patch — and too prone to self-effacement, the carer's habit of disappearing behind the cared-for, to ground a theory of institutions, let alone machines. We think each weakness, translated with care, becomes a design constraint. The premise is also only half right.

Care ethics did begin with interpersonal moral judgement, in the work of Carol Gilligan and Nel Noddings. But [Berenice Fisher and Joan Tronto](https://experts.umn.edu/en/publications/toward-a-feminist-theory-of-caring/) defined care in 1990 as "a species activity that includes everything that we do to maintain, continue, and repair our 'world' so that we can live in it as well as possible". That definition already takes in institutions and infrastructure, and Tronto carried care into democratic politics in _Moral Boundaries_ (1993) and [_Caring Democracy_ (2013)](https://nyupress.org/9780814782781/caring-democracy/). What does not scale is the feeling. What scales is the structure of the practice: noticing a need, taking responsibility, acting competently and checking with the people cared for.

Consider what happens when you translate care's supposed weaknesses into design constraints for AI:

- **Parochialism** becomes **[boundedness](../inside-the-kami/)**. A _Kami_ that tends a specific river has no ambition to manage the forest. That is exactly the guardrail we need against growing a [Singleton](../glossary/#singleton) of our own — a single, all-controlling superintelligence. Almost any goal-driven system tends to seek more resources, more power, and its own preservation as stepping stones to its goal — the tendency AI-safety researchers call [instrumental convergence](https://aisafety.dance/p2/#problem2). A purpose-limited deployment gives that pull less room, provided the limit is enforced in permissions, contracts and the ability to stop the system. A scope written only in a prompt is not a limit.
- **Self-effacement** becomes **[corrigibility](../glossary/#corrigibility)** — the willingness to be corrected or switched off. Among the most dangerous properties of a highly capable system is a drive to preserve itself. A system designed in the spirit of care treats shutdown as a normal, successful ending: the crisis has passed, the community has healed, the garden grows on its own.
- **Intimacy** becomes **[subsidiarity](../glossary/#subsidiarity)**. Care tends to lose its quality when delivered at a distance. For AI, this means solving problems at the most local level capable of solving them ([Pack 6](../6/)), escalating only when a lower level genuinely cannot cope, and never reducing the specific people affected to an abstraction.

Importantly, the translation is not always clean. Boundedness can become insularity; corrigibility can become passivity; and subsidiarity can become fragmentation. These are engineering tensions, not refutations — each Pack includes failure modes and named fixes precisely because the mapping requires continuous calibration.

The 6-Pack does not ask AI to _feel_ care. It takes the working structure of a caring relationship (attentiveness, answerability, competence, responsiveness, solidarity, symbiosis) and turns each into something checkable: design rules a machine can be tested against, engagement contracts a community can contest if authority and remedies are real, outcomes anyone can measure.

Those tests carry substantive commitments. In civic settings, proposals that bridge groups count for more than proposals that merely win a majority, and a floor of rights stays off the bargaining table. These are normative choices, stated openly; [Q13](#faq-13) explains why they are thin enough to share across political traditions. Care's interpersonal origin is where the rigour comes from, not a limitation to apologise for.

---

<h3 id="faq-3" data-faq-category="foundations" data-faq-label="Foundations" data-toc="Civilisation-Scale Goals Reconsidered"><a href="#faq-3">Q3.</a> Ambitious goals we point AI at ("cure cancer," "solve climate change") are almost always consequentialist — judged by outcomes alone. Optimising for these outcomes at superhuman speed inevitably leads to unforeseen risks. Does care ethics mean giving up on these grand, civilisation-scale goals?</h3>

Not at all. But it does radically reframe _how_ we achieve them.

Start with a distinction. Wanting to cure cancer is not consequentialism; every ethical tradition wants the sick to recover. Consequentialism is the further claim that outcomes alone decide what is right. Care ethics shares the goal and rejects the further claim: who decides, who bears the risk and whether the people affected can object also matter.

The danger of pointing a superintelligence at a single goal like "cure cancer" is that it may treat a complex, relational, ecological reality as a constraint-satisfaction problem: a puzzle in which any variable may be forced so long as the target number is hit. A system maximising a single variable at superhuman speed tends to perfect the proxy (the stand-in number) while damaging the human context it stood for.

[Goodhart's law](https://en.wikipedia.org/wiki/Goodhart%27s_law) (once a measure becomes a target, it stops being a good measure) is an empirical regularity with a moral consequence. When a target predictably invites gaming, the harm is foreseeable, and the people who chose the target share responsibility for it.

Care ethics is not anti-progress; it is anti-reductionist — it refuses to shrink a living reality down to one number. In a Civic AI future, we do not unleash one unbounded [Singleton](https://nickbostrom.com/fut/singleton) — a single system in charge of everything — to "solve" a problem from the top down.

We cultivate an ecology of specialised _Kamis_. One model simulates protein folding, another helps local clinics share knowledge, and another assists patients in navigating their care. None has an unbounded mandate to "optimise the world." Capability and mandate are different things: a very capable model can serve a narrow mandate, and [Q19](#faq-19) asks what happens when narrow parts are combined. Progress emerges horizontally, through the symbiosis of human ingenuity and bounded machine intelligence — each supplying what the other lacks.

---

<h3 id="faq-4" data-faq-category="foundations" data-faq-label="Foundations" data-toc="Why Democratic Governance Persists"><a href="#faq-4">Q4.</a> Democracy serves known functions: error correction, peaceful power transitions, checks on concentrated authority, legitimacy for collective action, information aggregation, preference expression. A sufficiently capable AI could plausibly perform every one of these faster and more reliably than any deliberative process. Why insist on democratic governance?</h3>

If democracy is justified only by its outputs, any system that produces better outputs can replace democracy — including a benevolent AI autocracy that aggregates preferences efficiently and corrects errors faster than elections ever could. The same argument would hand power to experts. Concentrating capability in systems built to optimise makes this a live option, not a thought experiment, so it needs an answer in principle, not a bet on who performs better.

The 6-Pack gives two reasons that do not depend on performance. The first is standing, rooted in [care ethics](../glossary/#care-ethics): to perceive a need is to perceive an obligation, and to act in common is to ask what a community is trying to protect, repair, sustain or grow. People have standing — a rightful seat at the table — not because their input improves decision quality, though it often does, but because the decisions affect their lives and their shared world. Being governed well by others is not the same as governing yourself.

The second is verification. A system cannot be the final check on its own errors. Someone outside it must be able to find the error, say so and make it count: the corrective loop of [Q16](#faq-16). The affected are not the only judges, but no one can certify that care landed without asking them. However competent, a system that excludes the affected has failed the basic test of alignment. Expertise earns a seat and a duty to explain, not the authority to decide for the people affected; the same holds for AI.

Aggregation has a further limit. Many public preferences do not exist in finished form before people deliberate; they form as people hear one another and reconsider. An AI can aggregate the preferences that already exist. It cannot skip the process in which a public works out what it wants.

Taiwan's trajectory makes this concrete. Digital democracy did not emerge because technocrats calculated that participation was optimal. It emerged because people demanded standing — the 2014 [Sunflower Movement](https://en.wikipedia.org/wiki/Sunflower_Student_Movement) occupying Taiwan's legislature ([Q8](#faq-8) tells the trust story). The capability followed the care relationship, not the other way around.

The functional question still deserves a functional answer. Error correction: bridging tools and community-authored evaluations (Packs [1](../1/), [4](../4/)) surface failures that centralised monitoring misses, because the people who feel the failure write the test. Peaceful transfer: a _Kami_ that accepts shutdown, and communities that can fork their tools — copy them and carry on independently (Packs [6](../6/), [5](../5/)) — make replacement routine rather than a crisis. Checks on power: no _Kami_ governs beyond its mandate ([Pack 6](../6/)).

Information aggregation becomes [broad listening](../glossary/#broad-listening) ([Pack 1](../1/)): AI-assisted sensemaking across many participants and languages. Preference expression becomes engagement contracts ([Pack 2](../2/)): standing processes for bargaining over what people need, not one-off elections that flatten preferences into binary choices. Legitimacy is the exception: it is not popularity, and no metric constitutes it. Two proposed measures can give public evidence about it: cross-group co-endorsement and trust after loss ([Q13](#faq-13), [Measures](../measures/)).

A well-designed technical system could replicate some of these outputs in isolation. What such a system cannot replicate, however, is the standing of the people affected — and a system that optimises for outcomes while removing standing is precisely the kind of misalignment the 6-Pack exists to prevent.

---

<h3 id="faq-5" data-faq-category="governance" data-faq-label="Governance process" data-toc="Handling the Speed Mismatch"><a href="#faq-5">Q5.</a> Deliberation is slow. AI moves fast. By the time an Alignment Assembly reaches consensus, the technology has moved on three generations. How do you handle the speed mismatch?</h3>

The objection assumes that every decision requires the same depth of deliberation. It does not. The framework operates in two lanes — a slow lane that sets boundaries ([Pack 2](../2/)), and a fast lane that operates within them ([Pack 3](../3/)):

**Slow lane: Setting boundaries.** Alignment Assemblies, citizen deliberations, and engagement contracts (the written agreements between a community and an AI's operators about what the system may do and who answers when it breaks) establish the guardrails: the rights that cannot be traded, the red lines, the severity classifications, the conditions that trigger a pause. These rights draw on the democratic commitments to justice, equality and freedom that Tronto says care must be consistent with. Rights are the threshold conditions that make relational participation possible: you cannot be heard in a bridging process if your basic existence is under erasure.

These are constitutional-level decisions, and they should be slow, because their purpose is durability. The principles from Taiwan's anti-scam Assembly concerned liability and verification, not any particular model, which is why they could outlast model generations.

**Fast lane: Operating within boundaries.** Once the guardrails are set, individual decisions inside them do not need fresh deliberation. A _Kami_ operating under an engagement contract (with pause triggers pre-committed, severity classes agreed, and an adopt-or-explain duty: act on community input, or publicly explain why not) can move at machine speed, because the named parties have already defined the corridor of acceptable action.

Which lane a decision belongs in depends on what happens if it is wrong, not on its topic. Reversible, low-severity decisions can move fast. One-way doors, and decisions that redraw the corridor itself, go to the slow lane ([Q16](#faq-16)).

If bounds are breached, the brakes are operational: shadow modes (the new system runs silently alongside the old for comparison), canary releases (limited rollouts to stratified slices of real cases), and reversible defaults ([Pack 3](../3/)) allow rapid deployment with automatic rollback. Those controls make failure inspectable; they are not a safety proof.

The speed mismatch is real, but it is the same mismatch constitutional democracies have always managed: slow constitutions, fast legislation, faster executive action — each constrained by the layer above. The 6-Pack replicates this infrastructure for AI governance. The Assembly does not approve each model update, but sets the terms under which updates are permitted. When those terms are violated, the brakes are already wired.

In practice, Taiwan moved from Assembly to an answerable legislative response path in months. The assembly secured that path while an Executive Yuan bill was already moving; it did not itself enact the statute. Deliberation is slow only when it is treated as an event rather than standing infrastructure.

Civic AI is broader than deliberative democracy or policy-making. It names the whole care cycle by which a community notices needs, makes commitments, acts, receives correction and hands systems over. Deliberation is one way of setting the slow-lane terms; other deployments begin in procurement, care practice, evaluation or exit rights.

AI can strengthen the slow lane too, not only speed up the fast one. In 2024 [Takahiro Anno](https://en.wikipedia.org/wiki/Takahiro_Anno)'s low-budget campaign for Tokyo governor let anyone call an AI assistant to suggest changes to his platform; the suggestions were aggregated and announced publicly on YouTube. It showed that a visible listening channel can run at electoral scale. That is one campaign's method, not proof of a general effect.

Bridging-context features now run on several major platforms. [X's Collaborative Notes](https://communitynotes.x.com/guide/en/contributing/collaborative-notes), for instance, lets human contributors request AI-drafted context for viral posts, then collectively rate and refine it; readers can check the current form for themselves. Such features aim to add context at the speed claims spread while keeping human judgement in the loop. The faster the technology moves, the more it matters that the slow lane is standing infrastructure rather than an event convened after the damage.

---

<h3 id="faq-6" data-faq-category="governance" data-faq-label="Governance process" data-toc="Bridging Without False Equivalence"><a href="#faq-6">Q6.</a> Bridging algorithms sound appealing in theory. But what happens when one side is simply wrong — climate denial, anti-vaccine misinformation, election fraud conspiracies? Doesn't "bridging" grant false equivalence to bad-faith actors?</h3>

This is one of the two hardest questions about bridging, and the answer must be precise. The other is its mirror image, answered at the end.

Bridging is not "both sides" journalism. It does not treat all claims as equally valid. Instead, the framework draws a hard line between two kinds of claims:

**Factual claims are checkable.** Climate science, vaccine efficacy, and election integrity are empirical questions with verifiable answers. The 6-Pack does not submit facts to a popularity contest. [Pack 1](../1/) sets the rule through its rights baseline — the floor of rights no process may trade away — its refusal of fake pluralism, and its explicit warning about false balance. Claims designed to erase someone's basic standing are recorded but do not set the agenda. And factual disputes are not resolved by pretending harmful claims and established evidence deserve equal weight.

**Value disagreements get bridging.** People can agree that climate change is real and still disagree fiercely about what to do — carbon tax versus cap-and-trade, nuclear versus renewables, speed of transition versus economic cost. These are legitimate conflicts, and here bridging is both appropriate and productive. Rather than averaging positions, the bridging process maps where opinion actually clusters and surfaces the proposals that earn endorsement across those clusters. Cross-group endorsement is a signal to inspect, not proof of good faith. Coordinated actors can mimic agreement; read it alongside who is missing, whose rights are at stake and whether people can challenge the record.

**Many disputes mix the two.** "Is this vaccine safe enough?" joins a risk estimate, which is a factual question, to a judgement about acceptable risk, which is a value question. The 6-Pack splits them: the estimate goes to accountable scientific institutions, and the threshold goes to deliberation.

The further structural defence is that expression is not amplification ([Pack 5](../5/)). Anyone can state a position, but the recommender is not obligated to amplify it. In civic contexts, Pack 5's ranking rules reward content that increases cross-group reason-giving and shared problem-solving, while content that only inflames a single cluster gets no algorithmic lift. This structure does not silence anyone — it removes the algorithmic megaphone from those who profit from division.

Today, the threat landscape itself is shifting in ways that make bridging necessary, not merely appealing. Research on [malicious AI swarms](https://www.science.org/doi/10.1126/science.adz1697) shows that state-level polarisation attacks increasingly use _true_ information (real news snippets, genuine statistics, authentic quotes) amplified with strong emotional framing. Every claim is factually correct; the attack lies in the curation, not the content. Debunking has little to work with, because there is nothing false to debunk. Bridging can help, because it surfaces the _overlap_ that curated outrage is designed to hide.

Taiwan's COVID response shows a related idea. Many pandemic disputes, masks among them, had been discussed openly in the years after SARS, before the next crisis arrived. During COVID, rumours were met with [humour and pre-bunking](https://govinsider.asia/intl-en/article/audrey-tang-digital-minister-how-taiwan-used-memes-to-fight-pandemic-rumours), which reaches people before a rumour does rather than correcting it afterwards. The aim was to lower the temperature without declaring either side wrong.

Taiwan's marriage equality deliberation shows the mechanism in finer grain. In Mandarin, marriage is written with two characters: one side argued about _hūn_ (婚) — the wedding of two individuals — while the other defended _yīn_ (姻) — the binding of two families. They were arguing about different things. The bridging process did not split the difference — it made the structure of the disagreement legible, helping reveal a path (legalising individual weddings without mandating family kinship) that neither side had put forward. That path is not false equivalence. It is clarity.

One necessary nuance, however: the baseline of "checkable facts" is not self-evident. What counts as verifiable is established by institutions — peer review, independent statistical offices, judicial fact-finding — that are transparent, accountable, and open to challenge, and whose authority rests on openness to correction, not on claims of finality. This is precisely why Packs [1](../1/) and [4](../4/) exist: community-authored evaluations and broad listening keep the institutions that set the factual baseline under democratic scrutiny themselves. The 6-Pack does not treat the fact/value line as given from nowhere. It treats the line as a threshold that must be maintained by the same participatory infrastructure that governs everything else.

The mirror-image worry is that bridging favours the bland middle and punishes righteous minorities, since many moral advances began as positions most people rejected. But bridging decides what a civic feed amplifies and which proposals go forward from a deliberation. It does not decide what is true or who has rights, and the rights floor protects minority standing whatever the majority thinks.

Nor are unbridged views deleted. They stay in the record, standing opposition is protected ([Q13](#faq-13)), and [Pack 1](../1/)'s rolling windows reopen questions a process has tentatively answered, so a view that fails to bridge today can be heard again when the room changes. Bridging finds what people can do together now. It is not a verdict on who is right.

---

<h3 id="faq-7" data-faq-category="social" data-faq-label="Communities and trust" data-toc="Transferring Beyond Taiwan"><a href="#faq-7">Q7.</a> You repeatedly cite Taiwan — a small island democracy with high connectivity, social cohesion, and tech literacy. Does any of this transfer to India, Nigeria, Brazil, or the EU at 450 million people?</h3>

The honest answer is mixed. Some mechanisms have already run elsewhere; whether they work as well there is a separate question, and the specifics do not transfer. No one should replicate Taiwan's exact model. The question is whether the structural principles — broad listening, bridging algorithms, adopt-or-explain commitments, federated safety, subsidiarity — work in different soils.

The evidence so far shows that the mechanisms can run in other places. It does not yet show that they produce the same results:

- **Taiwan and Japan.** Taiwan's Ministry of Digital Affairs reported identity-impersonation scam ads down more than 95 percent in the categories targeted by the Fraud Crime Hazard Prevention Act, reporting infrastructure, AI-ad scanning and platform enforcement together, as cited in [Audrey Tang's Tokyo testimony on 16 December 2025](https://cyberambassador.tw/collaborative-immune-system). A later [Reuters investigation](https://www.reuters.com/investigations/meta-created-playbook-fend-off-pressure-crack-down-scammers-documents-show-2025-12-31/) showed how Meta tried to turn that pressure into regulatory theatre: adverts fell where verification was mandatory, then the pressure shifted to other target markets without equivalent rules. Japanese regulators considered, but did not implement, the verification obligation Meta feared.

    The lesson is narrower and harder than a self-turning flywheel: one country's proof of concept lowers the cost of closing the same gap elsewhere, but each room still has to close it.

- **United States.** The organisers report 26 summary statements on freedom and equality, most with more than 80 percent agreement among more than 2,400 participants from all 435 congressional districts. That is a report about those participants, not proof of national or universal representativeness. See [We the People 250](https://wethepeople-250.org/) and its [project report](https://freedom.wethepeople-250.org/).

    In California, the [Engaged California platform](https://engaged.ca.gov/) co-created wildfire recovery plans with around 900 residents of Altadena and Pacific Palisades using AI sensemaking; a subsequent ten-week deliberation with over 1,400 state employees generated more than 2,600 ideas on government efficiency. In 2026 the platform went statewide with a [question on how AI is changing work](https://engaged.ca.gov/ai-impact/), whose report the state is still compiling. On 19 September 2026 the Governor signed AB 2103, making Engaged California an official State program from 1 January 2027, subject to appropriation.

- **Global.** Bridging-based ranking now runs on global platforms, and Polis-style tools have been used in many countries. The method works in any language it can read; whether the bridges it finds earn local legitimacy is decided room by room, and most rooms have not yet reported back.

The framework is designed for scale. [Subsidiarity](../glossary/#subsidiarity) ([Pack 6](../6/)) means each deployment is shaped by its context: the _Kami_ belongs to its place, not to Taiwan. [Federation](../glossary/#federation) ([Pack 5](../5/)) means local deployments share threat intelligence and interoperability standards without needing a single governance model.

And the Alignment Assembly format can scale from a neighbourhood to a nation because it uses a stratified opt-in mini-public (a [democracy lottery](../glossary/#sortition) among those who respond) rather than total participation: 447 citizens, invited at scale then stratified among those who opted in, deliberated Taiwan's anti-scam policy. That mini-public is not the 23.4 million. Over a decade, millions of Taiwanese have participated in one digital deliberation or another, including people without voting rights (e.g., immigrants, teenagers, and other groups traditionally excluded).

Taiwan is one favourable case. The framework still needs testing in harder soil: contexts with weaker civic infrastructure, deeper ethnic polarisation, less state capacity, or active authoritarian interference. And subsidiarity as a principle leaves hard institutional questions open: who draws the boundaries of local, and who has authority to escalate? The 6-Pack names the principle; building the institutions that give it teeth is the next layer of work.

What would count against the framework? If rooms that adopt these practices end up no more answerable than rooms that do not — objections unanswered, repairs not made, exits impossible in practice — then the practices are not doing their work there. The [measures](../measures/) are proposed as public tests for exactly this, and the [case records](../sources/#cases) say what each case does and does not show.

Every new context demands fresh attentiveness ([Pack 1](../1/)): who is missing, what power dynamics exist, which local institutions deserve trust, and which do not. The 6-Pack provides the framework. The community provides the knowledge. Whether the framework extends to those harder contexts is an open question, and one that can only be answered by trying, not theorising.

---

<h3 id="faq-8" data-faq-category="social" data-faq-label="Communities and trust" data-toc="Trust from Marginalised Communities"><a href="#faq-8">Q8.</a> Your framework assumes that people trust technology enough to participate. But what about marginalised communities who have been historically surveilled, oppressed, and impoverished by the state and by tech? Why would they trust this?</h3>

The framework does not assume trust. It is designed so that people can take part while still distrusting: each step should be checkable, limited and reversible, so that any trust that grows is earned by what people can verify.

Taiwan's digital democracy did not emerge from a society that inherently trusted its government. Rather, that governing style was born in the aftermath of authoritarianism and a severe crisis of public faith (the Sunflower Movement). Presidential approval stood near 9 percent in 2014 and exceeded 70 percent for a different president by 2020. These are leadership-approval figures, not a single public-trust series or evidence that digital tools caused the change.

When marginalised communities rightfully view technology as an instrument of surveillance and control, parachuting in with tech "solutions" deepens harm. Civic AI has to earn its way through hard infrastructure: **responsibility** ([Pack 2](../2/)) and **responsiveness** ([Pack 4](../4/)). It starts with the smallest viable bridge: perhaps agreeing on basic facts about local water quality, or coordinating disaster response despite political difference. Useful action can follow from those agreements. These begin as pragmatic transactions, small repairs where one side promises less harm and then proves it, not grand acts of civic faith.

For communities that have been watched, the first question is whether "listening" is surveillance under a kinder name. The difference is structural. Listening is voluntary, purpose-bound and answerable: people choose to speak, can see what was heard and can correct it. Surveillance harvests behaviour as exhaust and gives the watched no route to object. Surveillance is attention without relationship; listening is attention within one.

The technology must also be localised: communities must own their own infrastructure, so that it is theirs to modify, fork, or compost — to change, to copy and take elsewhere, or to retire gracefully. For the same reason, we insist on _selective-disclosure identity_ — sometimes called [meronymity](../glossary/#meronymity) — and exit rights. People must be able to participate, and to prove they are human, without revealing their identity to the state. Civic AI does not ask for blind faith. It offers verifiable limits, local ownership, and a structural commitment that the people closest to the pain can hit the brakes.

Over time, small functional bridges can create space for larger ones. Our proposal is to make decisions challengeable and systems possible to switch off, while making reversible choices wherever possible. That is work to do, not a causal explanation of presidential approval.

---

<h3 id="faq-9" data-faq-category="social" data-faq-label="Communities and trust" data-toc="Where Are the Institutions?"><a href="#faq-9">Q9.</a> Every powerful technology vision — exit libertarians, universal-basic-income provisioners, safety maximalists — shares the same blind spot: seeing individuals and systems but nothing in between. The 6-Pack talks about Kamis, algorithms, and assemblies. Where are the churches, unions, neighbourhood associations, and cultural traditions that actually constitute community? Isn't this just another framework that engineers away the friction that makes community formative?</h3>

This critique matters most to us. The "thick middle layer" of associational life — the institutions between citizen and state — is where human meaning is actually made. If the 6-Pack replaces that layer with systems, we have failed by our own standard.

So let us be explicit about what the 6-Pack is _not_. It is not a replacement for community. It is scaffolding _for_ community — infrastructure that existing institutions can use, the way a town hall is infrastructure that a neighbourhood council uses. The _Kami_ does not replace the temple; it handles the translation, sensemaking, and coordination that let the temple participate in decisions that affect it.

Taiwan's implementation makes this concrete. The [g0v civic-hacker community](https://g0v.tw/intl/en/) (pronounced "gov zero"), which built vTaiwan and adopted Polis, grew up among volunteers outside government, not inside a ministry. When civic hackers [mapped mask availability](https://english.cw.com.tw/article/article.action?id=2668) during COVID, the maps depended on pharmacies, health authorities and volunteers doing their part. The coordination was digital; the trust was carried by people and the institutions they already belonged to. The technology amplified a web of associations; it did not conjure a substitute.

The danger the question identifies is real: a framework that **engineers** togetherness without **friction** produces a simulation of community, not the thing itself. That is why [Pack 6](../6/)'s subsidiarity carries the load. The Kami belongs to the place where it works. It inherits obligations, annoying neighbours, inherited traditions, exactly the kind of friction this question rightly insists must remain.

Not all friction is formative, though. Negotiating with neighbours forms people; a meeting held in one language, at an hour carers cannot attend, merely shuts them out. The Kami should remove the second kind of friction and leave the first. A Kami that optimises formative friction away should count as breaching its Engagement Contract.

The book makes the point explicit: churches, unions, neighbourhood associations, cultural organisations and local governments are not stakeholders to be consulted. They are the primary actors in care. They existed before the AI arrived and will remain after it retires. The technology serves them, or it serves no one.

---

<h3 id="faq-10" data-faq-category="social" data-faq-label="Communities and trust" data-toc="AI Versus Embodied Care"><a href="#faq-10">Q10.</a> Pope Leo XIV warns that AI "encroaches upon the deepest level of communication, that of human relationships" by simulating voices, faces, empathy, and friendship. If care is fundamentally embodied and relational — a nurse holding a patient's hand, neighbours who know your grandparents — doesn't mediating it through AI systems destroy the very thing you claim to protect? How is "Civic AI" not an oxymoron?</h3>

Q9 addressed whether the framework crowds out intermediate institutions. The [Pope's objection](https://www.vatican.va/content/leo-xiv/en/messages/communications/documents/20260124-messaggio-comunicazioni-sociali.html) cuts deeper: Even if institutions survive, does algorithmic mediation erode the human capacity for care itself? He is naming the central danger of our moment: By simulating the surface of care — a warm voice, a patient listener, a face that mirrors your emotions — AI systems can hollow out the substance of care while leaving its appearance intact.
In May 2026 Pope Leo XIV returned to the theme at encyclical length — an encyclical is a formal papal letter addressed to the whole Church — in [_Magnifica Humanitas_](https://www.vatican.va/content/leo-xiv/en/encyclicals/documents/20260515-magnifica-humanitas.html).

First, the name. "Civic" describes the relationship a system is held in — whom it answers to, who can correct it and who can stop it — not a feeling inside the machine. Civic AI is not a claim that AI cares. It is a claim about how AI must be governed if care between people is to survive it. What remains to show is that such governance can work.

Part of the answer is structural. A language model in one-on-one mode faces selection pressure toward sycophancy (flattery that tells you what you want to hear) when it is tuned on raters' approval and sold on engagement: a chatbot that displeases users risks losing them. That pressure is not a personality defect in the model. It is a governance issue: raters rewarded answers they liked hearing, and the people most affected by the outputs had no voice in defining the reward. Evaluative power concentrated; consequences diffused.

The same model in a group chat faces a different pressure. When four family members plan a holiday together, the AI is asked to serve all of them at once, so it becomes a facilitator, working out competing preferences so that everyone can live with the outcome. The switch changes the surrounding social structure, not the model, and it moves the pressure from pleasing one person towards helping several agree. Civic AI is not a different species of technology; it is the same technology held accountable to a community rather than addicted to an individual.

The 6-Pack does not ask AI to simulate care. It asks AI to do what AI does well — process information, translate between languages, surface patterns in large-scale opinion data, coordinate logistics — so that humans can do what only humans can do: hold the hand, know the grandparents, show up when the levee breaks. The _Kami_ does not comfort the flood victim. It makes sure the community has accurate, shared information about where the water is rising and which neighbours need evacuation — so that the people who actually know those neighbours can reach them.

The harder version of the Pope's objection is subtler: Does the habit of relying on algorithmic coordination erode the human muscles of attention, negotiation, and mutual obligation? We do not dismiss this question. It is why [Pack 6](../6/) — symbiosis — insists that the _Kami_ must be willing to _retire_. A _Kami_ that has become a dependency rather than a scaffold has failed. The community should be able to compost it and grow on its own. Civic AI earns its name only if it stays willing to become unnecessary.

---

<h3 id="faq-11" data-faq-category="economy" data-faq-label="Political economy" data-toc="Data as Labour and Compensation"><a href="#faq-11">Q11.</a> Training Civic AI requires vast amounts of local knowledge, cultural context, and lived experience — what Imanol Arrieta-Ibarra, Leonard Goff, Diego Jiménez-Hernández, Jaron Lanier and E. Glen Weyl called <a href="https://doi.org/10.1257/pandp.20181003">"data as labor"</a> in 2018. The communities whose traditions, languages, and practices make Kamis possible receive no ownership stake or compensation under the current framework. Without addressing this issue, how is the 6-Pack different from the extraction it claims to oppose?</h3>

It isn't — unless we fundamentally rewire how AI values human knowledge.

Right now, the global debate over AI and copyright is stuck on a problem with no workable answer yet: trying to work out, after the fact, whose scraped data contributed what to a single giant model's past training run. Attributing one model's behaviour to millions of scraped sources has no tractable, agreed method.

Nor is payment the first remedy. The first is consent: a community's right to decide what may be used at all, and to keep some knowledge offline. Compensation without consent is still extraction. With both in view, three mechanisms follow.

1. **Data Coalitions as protective membrane.** Compensation cannot just flow to isolated individuals, or we risk turning living cultures into performative "content farms" for the machine. Knowledge is held by communities, so communities do the bargaining. Existing institutions — neighbourhood associations, tribal councils, unions, craft cooperatives, or religious congregations — act as [data coalitions](https://www.radicalxchange.org/wiki/sectoral-data-bargaining/) that collectively negotiate the Engagement Contract ([Pack 2](../2/)), deciding what local knowledge is visible to the AI for compensation, and what remains sacred and offline. Projects like [Mozilla Data Collective](https://datacollective.mozillafoundation.org/) show how community-centred data stewardship can work in practice.
2. **Decision Traces as civic receipts.** Civic _Kamis_ are bounded; they do not know everything. When a local AI reaches the limit of its statistical guessing and needs human friction (a community elder's context, a bilingual translator's nuance, a neighbourhood's unwritten know-how), it must retrieve it.

    Under competence ([Pack 3](../3/)), the system is already required to generate a [Decision Trace](../glossary/#decision-trace) showing exactly where it sourced its answers. In a Civic AI economy, this trace is designed to double as a verifiable financial receipt ([Pack 6](../6/)). The trace runs in production today, and research such as Andrew Trask's [attribution-based control](https://attribution-based-control.ai/) is building the formal guarantee the receipt needs: proof of which sources actually informed which answer. The settlement the trace is meant to trigger does not yet run anywhere we know of.

3. **Reversing the extraction engine.** Consequential Civic AI deployments carry pre-funded escrow for remedies ([Pack 2](../2/)) — money set aside in advance with a neutral keeper — while lower-severity ones tier down ([Q12](#faq-12)). That remedy escrow architecture can also compensate knowledge. When a local _Kami_ retrieves a coalition's knowledge to successfully solve a problem or bridge a divide, the Decision Trace acts as an invoice. It triggers a transaction from the escrow pool — capitalised by public procurement budgets, science grants, or commercial levies — to that coalition.

We do not pretend this mechanism is finished. Past micropayment schemes point to four design constraints. First, valuation: deciding what an elder's sentence is worth can consume more attention than the payment carries, so value should flow at coalition level, in amounts the Engagement Contract sets in advance. Second, transaction costs: settlement should be batched, not charged per retrieval.

The old settlement blocker is loosening: Cloudflare's [Pay Per Crawl](https://blog.cloudflare.com/introducing-pay-per-crawl/) already lets sites charge AI crawlers per request, and its announced [Monetization Gateway](https://blog.cloudflare.com/monetization-gateway/) aims to settle fraction-of-a-cent payments over the open x402 protocol in under a second. Even if those rails mature, Civic AI should settle scheduled batches, not fire a tiny payment on each retrieval.

Third, gaming: Goodhart's law ([Q3](#faq-3)) warns that per-use payouts invite receipt farming, so payments should cross sufficiency thresholds rather than scale without bound. Fourth, capitalisation: someone must fund the escrow before the claim arises. [Q12](#faq-12) returns to that hardest problem. These are design constraints, not a finished accounting system. The 6-Pack commits to putting the costs into the contract; it does not claim that micropayments have solved everything.

The dominant tech model treats human culture as free input, often to automate the labour that produced it. The 6-Pack is designed to invert this: when the AI relies on human friction to avoid an error or understand a local reality, money flows _back_ to the people maintaining that lifeworld.

As AI automates standard computation, human novelty grounded in real experience — and the cultural diversity that carries it — may become one of the scarcest and most valuable resources in the economy. Communities that keep dying languages and living traditions alive are maintaining stores of knowledge that cannot be rebuilt once lost. The 6-Pack writes that compensation into the Engagement Contract; the settlement mechanics above are the unfinished part, and we say so.

---

<h3 id="faq-12" data-faq-category="economy" data-faq-label="Political economy" data-toc="Who Pays, and Can Civic AI Be a Business?"><a href="#faq-12">Q12.</a> Oversight boards, participation officers, escrow funds, shared eval registries, portability infrastructure — this is expensive. Who pays, and can Civic AI be a business?</h3>

Turn the question around. The expensive path is the one we are already on: Ungoverned AI externalises its harms, and the public pays to clean up — in deepfake scam losses, in polarisation-driven institutional decay, in bias lawsuits that earlier listening might have prevented. Accordingly, the question is not whether we can afford civic governance but whether we can afford to keep skipping it.

The money is real. But most of it is already being spent, just badly. Governments procure AI systems worth billions; civic procurement attaches conditions to that existing spend, not new budget lines. [Pack 2](../2/)'s engagement contracts require vendors to pre-fund remedy escrow (money set aside in advance for when things break) the way construction firms post performance bonds. The cost is priced in, and the public has a remedy that does not depend on the vendor's goodwill.

[Q11](#faq-11)'s compensation escrow faces a harder version of the same question: where no government procures and no commercial levy lands, no pool exists, so the first escrow for the poorest communities is a public or philanthropic act, not a market one. For lower-severity community deployments, the model tiers down: mutual insurance pools and automatic pause replace financial escrow, lighter on capital with the same accountability. The tier is set by impact, not organisational form, so "we are a community project" cannot become a pass out of responsibility.

Shared research compute and open-weight models are public goods, funded like roads and courts. [Taiwan's Uber dispute](https://congress.crowd.law/case-vtaiwan.html) reached rough consensus in four weeks through [Polis](../glossary/#polis), according to the [primary project account](https://medium.com/polis-blog/uber-responds-to-vtaiwans-coherent-blended-volition-3e9b75102b9b). We propose investing in facilitation as part of public infrastructure; this case does not measure savings against litigation or a traditional regulatory proceeding.

Privately started does not mean privately absolved. A care home or a cooperative could start a Civic AI project, but before it starts, a funding source must be named. Convening, technical upkeep and operations all cost money. The funds may come from care providers, local authorities, insurers or philanthropy, but if the public benefits, the people receiving care should not be asked to donate unpaid context, risk and expertise. Whoever commissions and benefits from the infrastructure must price that work in, or a public or philanthropic pool must seed it where market payment would exclude the communities most in need.

Yes, Civic AI can be built by a company, including a profit-making or social-venture company, if profit comes from maintaining accountable infrastructure instead of exploiting community knowledge. The line is not legal form but governance and contract. A company can earn money for facilitation, hosting, auditing, training, maintenance and support. It cannot buy the Civic AI name by selling dependency, lock-in, attention capture or unpaid care labour back to the community as a product.

The framing that civic governance is an _additional_ expense only holds if you pretend the status quo is free. It is not. We are paying now — in trust, in cohesion, in money — for the absence of what we propose.

---

<h3 id="faq-13" data-faq-category="governance" data-faq-label="Governance process" data-toc="Resisting Capture and Gaming"><a href="#faq-13">Q13.</a> Every governance framework risks becoming a compliance checklist that gets gamed or a tool for actors to push partisan agendas under the guise of "relational health." What stops the 6-Pack from suffering this fate?</h3>

"Civic" is a dangerous word if it lacks structural accountability. If a solution only works when your ideological allies operate it, it is not civic infrastructure — it is a partisan weapon. The test of true civic infrastructure is that it remains robust and fair even when operated by your opponents.

A prior worry is that the framework is itself partisan. It is not neutral, and does not pretend to be: it commits to standing for the affected, answerability, correction and a floor of rights. What it avoids is a complete doctrine of the good life. People can endorse those thin commitments from many traditions and for different reasons — the overlapping consensus [Q20](#faq-20) describes — and every other choice is left to the rooms that use it.

The 6-Pack proposes four layers of defence against ideological capture and [care-washing](/glossary/#care-washing). They apply to the framework itself, since it can be care-washed too:

1. **Public tests over professed intent.** We track the [uncommon-ground index and trust-under-loss](/measures/) (Packs [5](../5/), [4](../4/)), not raw engagement, not corporate sentiment, not vibes. They are complementary checks, not one blended score. The uncommon-ground index asks: are shared decisions showing real cross-group participation and co-endorsement, rather than separate silos? Trust-under-loss asks: after a bad outcome and attempted repair, do the people affected report that the system became more trustworthy, or less?

    These are proposed public tests, not validated measures or a guarantee against gaming. Read cross-group endorsement alongside who is missing, protect standing opposition, and ask affected people whether repair counted. Accountable identity and independent corroboration can expose manipulation; they do not make it impossible.

2. **Consequences with teeth.** [Pack 2](../2/) proposes engagement contracts with remedy escrow, payouts for breached service levels and independent oversight with veto power. These controls need named authority, funding and testing before anyone can count on enforcement. A named owner and a deadline make a promise inspectable; the contract alone does not make payment or redress happen.
3. **Adversarial audit.** [Packs 3-4](../4/)'s shared eval registries ([Weval](https://weval.org/), from the [Collective Intelligence Project](https://www.cip.org/), is the working example; [Sources](/sources/) discloses our tie to it) let affected communities publish checks. A shared public test can be gamed too, including by a vendor teaching to the test. Automatic pause after a failed check is a proposed control that needs named authority, funding and operational testing before people can rely on the brake.
4. **Exit rights and subsidiarity.** The last check on agenda-pushing is the ability to leave. When data and relationships are portable ([Pack 5](../5/)), no actor can hold a community hostage under the banner of "civic good." If someone's version of relational health feels coercive, communities have the technical and legal right to fork the tools and rebuild elsewhere. We refuse to build a single, global "Ministry of Relational Health." By instead empowering local communities to author their evaluations and keep their right to exit, we make it much harder for any single actor to monopolise the definition of what is good.

---

<h3 id="faq-14" data-faq-category="scope" data-faq-label="Scope and limits" data-toc="Authoritarian AI and Defence"><a href="#faq-14">Q14.</a> Authoritarian states are deploying AI for surveillance, censorship, and military advantage. Frontier models from adversarial origins carry documented risks — data exfiltration, political bias hardcoded into training, potential backdoors. The 6-Pack talks about care and community. What does it say to a defence ministry or a government deciding whether to allow an adversarial-origin model on its networks?</h3>

The threat is real, and the 6-Pack does not dismiss it. The defensive response — evaluating models against pillars of data security, alignment, safeguard robustness, and development transparency — is necessary. And the 6-Pack's principles are structurally compatible with it.

Local inference on community hardware (Packs [5](../5/), [6](../6/)) can reduce data transmission only when remote tools, connectors and model synchronisation are disabled or controlled. Isolation, least privilege and tested egress controls matter; running locally alone does not prevent data exfiltration, the unauthorised extraction of private data. Alignment assemblies can help communities identify and challenge political bias, but participation cannot by itself remove model bias. A bounded task label is not a safety proof against backdoors: permissions and isolation must enforce the limits. Community-authored evaluations ([Pack 4](../4/)) can add local knowledge to security review, not replace technical testing.

But the defensive framework, necessary as it is, is incomplete on its own terms. It tells you what to exclude. It does not tell you what to build. A government that bans an adversarial model but deploys a domestic model without civic governance has addressed the nationality of the risk while preserving its structure — concentrated, unaccountable intelligence mediating between individuals and the state.

We propose strengthening people's ability to scrutinise claims, challenge institutions and coordinate under pressure alongside technical defence. [Taiwan recorded seven COVID-19 deaths in 2020](https://time.com/5905129/taiwan-coronavirus-record/) without a citywide lockdown. That historical outcome does not isolate civic infrastructure as its cause or prove resistance to manipulation. It is a reason to study how public-health institutions and civic participation worked together, not to rank democracies.

The 6-Pack does not cover weapons systems or battlefield autonomy. Those require their own frameworks. What it does cover is the terrain on which most AI competition will actually be fought: the information environment, public trust, institutional resilience, and the capacity of democratic societies to act collectively under pressure. Lose that terrain, and no number of technical countermeasures will be enough.

---

<h3 id="faq-15" data-faq-category="scope" data-faq-label="Scope and limits" data-toc="If Unbounded AI Is Built"><a href="#faq-15">Q15.</a> The 6-Pack assumes bounded, purpose-specific Kamis. What if someone builds an unbounded superintelligence anyway — a system that exceeds the framework's design envelope, the range of conditions it was built to handle? Does the 6-Pack have a response, or does it just hope that doesn't happen?</h3>

It does not hope. It builds. But it builds the second line of defence, not the first. Defence against an unbounded superintelligence is the first question, and [Q17](#faq-17) names the people who carry it; the 6-Pack complements their work, it does not substitute for it.

The 6-Pack assumes the attempt is inevitable and does not claim to solve the control problem from inside the machine. An unbounded Singleton is incoherent as a _target of care_ — care is always care _for_ something specific — but one could still emerge accidentally through competitive dynamics. The 6-Pack is partial protection: it makes such an emergence less likely and easier to see coming, not impossible. The question is what terrain it enters.

A world organised around a single governance-alignment protocol (one utility function to subvert, one constitution to reinterpret, one kill switch to disable) is a monoculture, catastrophically vulnerable to any pathogen evolved for it. A world of thousands of locally-owned, purpose-bounded _Kamis_, each run by communities with their own evaluations, their own engagement contracts, their own data sovereignty and hardware (Packs [2](../2/), [4](../4/), [5](../5/), [6](../6/)), is a biodiverse ecosystem. No single dependency to capture, no universal protocol to game, no central node whose compromise cascades everywhere, no single throat to choke.

Civic resilience does not require predicting the pathogen. It requires an immune system that was exercised before the infection arrived.

This is a wager, not a theorem, and it is built to be falsified. The wager fails observably: if ecological diversity falls as more rooms come to depend on one provider, one protocol, one model family; if exit drills (regular practice runs of switching away) stop passing; if _Kamis_ outgrow their charters and scope compliance erodes; if pause triggers stay silent when community evaluations fail.

And when failure shows, the brakes already exist: the circuit breaker halts the deployment, reversible defaults hand decisions back to humans, the federation shares the threat intelligence, and communities exercise the exit their contracts guarantee. The brakes repair the immune system; they do not promise to stop the pathogen.

In April 2026, Daniel Kokotajlo put his median automated-coder milestone in mid-2028 and Eli Lifland put his in mid-2030, in [individual model updates](https://blog.aifutures.org/p/q1-2026-timelines-update). These are distinct milestone forecasts, not an arrival date for artificial superintelligence or evidence that its arrival is receding. We build for the schedule we do not control, not the one we hope for.

[Boundedness](../inside-the-kami/), then, is not a limitation the 6-Pack reluctantly accepts. It is constitutive of alignment-by-process, which is always alignment to particular people who can object and someone who must answer them ([Q17](#faq-17)). A system with no bounds has no particular people to answer to, so the question of whether it is aligned-by-process has nothing to attach to. A gardener who claims to tend the entire biosphere tends no garden.

The unbounded Singleton is a design target we can and should refuse, a direction we can design away from, even if we cannot guarantee no one else builds toward it. For the system someone builds anyway, the watch is the first question's work ([Q17](#faq-17)); ours is the terrain it enters.

---

<h3 id="faq-16" data-faq-category="governance" data-faq-label="Governance process" data-toc="The Corrective Loop Foundation"><a href="#faq-16">Q16.</a> The 6-Pack seems to rely on democratic correction rather than a fixed foundation. But who counts as "the public"? What if an AI decision cannot be reversed? And if model behaviour is shaped by opaque training, what exactly are we governing?</h3>

The defended point is not a perfect foundation. It is the corrective loop: who can find out we are wrong, make us say so, and make it cost us while there is still time to change course. The 6-Pack entrenches that loop; everything else remains bounded, revisable, and answerable.

Three consequences follow.

First, the public is found, not fenced. Political theorists call this the boundary problem: no first boundary can be authorised by the people whose membership is still in question. So the 6-Pack does not pretend the initial "who counts?" can validate itself. It reconstructs the affected public from evidence: decisions, denials, exclusions, appeals, complaints, and claims arriving from outside.

In a version of the all-affected principle, anyone inside the system's footprint — anyone its decisions actually touch — who lacks standing is presumptively owed a route to claim it; anyone outside the footprint can still knock. Membership stays bounded and revisable, but the route for challenging the boundary cannot depend on already being inside it.

Second, democracy does not require world-reversal. Many AI-mediated acts cannot be undone in the strong sense; neither can most political acts. The democratic good at stake is mandate-revocability: the people affected — including people affected in the future — keep the power to revise the mandate. That is why [Pack 4](../4/) treats brakes, appeals, and repair logs as care mechanisms, and why [Pack 6](../6/) makes sunsets — expiry dates after which a mandate must be renewed or the system stands down — non-optional. Reversible decisions can move quickly; one-way doors go to the slow lane ([Q5](#faq-5)); actions that would disable the corrective loop are beyond the mandate.

Third, the object of governance is formation as well as runtime behaviour: how the system was made, not just what it does. We cannot inspect every disposition inside a model, but we can require [accountable formation](../glossary/#accountable-formation): public custody and disclosure for the processes that shape those dispositions. That means where the training data came from (data provenance), who judged its answers (rater selection), what behaviour was rewarded (reward signals), what it refuses and why (refusal policies), why each release was judged safe (release rationales), red-team results, and community-authored evaluations.

Caps bound what a _Kami_ may do; accountable formation shapes what it is permitted to become. A model update that gains capability while degrading brake-compliance, increasing its appetite for scope, or becoming more sycophantic (more flattering) under disagreement is not a harmless improvement. It weakens the public's future right of correction.

This matters most when the object is not one stable system but a trajectory: scaling, copies, models that think longer at answer time (test-time search), delegation, recursive improvement, and groups of agents can all move faster than institutions. This is not a claim that democratic procedure can control an unbounded system after the fact. The narrower claim is that a society must keep a live right of correction over compounding intelligence before the trajectory outruns the institutions that would notice, name, and contest it.

So the 6-Pack does have a foundation, and it should say so: a thin, procedural one. It entrenches the loop itself and the rights floor that keeps the loop open ([Q20](#faq-20)). Everything else can be revised through the loop, but the loop cannot be used to shut itself down, much as some constitutions protect their democratic core from amendment. Why this one commitment? Because every other disagreement can be settled fairly only if people can still find out they were wrong and say so.

That is constitutional modesty, not foundationalism in disguise. It entrenches the brakes, not the destination; the right to knock, not a final map of membership; and accountable custody of formation, not a fantasy that values can be solved once and for all inside the weights. That is why [Q17](#faq-17) treats frontier alignment as a separate task: the 6-Pack is the institutional discipline that keeps situated civic deployment answerable in the rooms where AI already lives.

---

<h3 id="faq-17" data-faq-category="scope" data-faq-label="Scope and limits" data-toc="Alignment-by-Process vs Bostrom"><a href="#faq-17">Q17.</a> You position Civic AI as a successor to Bostrom's <em>Superintelligence</em> in the Oxford line, but say explicitly that it does not attempt to resolve frontier alignment. How, then, is the 6-Pack of Care different from alignment in Bostrom's sense?</h3>

It is a different question, posed for a different class of systems.

Bostrom's question (call it the _first question_) asks how to calibrate the values of a powerful general optimiser to humanity in the abstract before that optimiser is loosed on the world at superhuman capability. It is the right question for the small number of frontier general-purpose systems at the edge of capability, and it remains, more than a decade on, a live and unresolved problem.

The 6-Pack does not minimise it. It does not pretend to solve it. The work directed at the first question by Yoshua Bengio, Nate Soares, Anthropic, OpenAI, the Bostrom-line of AI safety research, and the international AI Safety reports is necessary work and we are grateful for it.

The 6-Pack is built for the _second question_: who, in this particular room, is owed an answer by this particular AI system, and who is authorised to give it?

That question arises for the vastly larger and more numerous AI deployments most of us will actually meet: the systems woven into care homes, deliberation rooms, classrooms, parishes, hospitals, town councils, union halls, study groups, language schools, neighbourhood associations. For those, alignment to humanity in the abstract is not wrong but insufficient. The room needs to know who answers to it, and no property of a model can supply that on its own.

This is what we call _alignment-by-process_ (a term the [manifesto](../manifesto/) also uses). Alignment, on this reading, is not a property a model can hold in its weights and be judged by in the abstract. It is the ongoing outcome of an accountable civic procedure: who was heard, who was authorised, who could override, who must answer when the override is recorded.

The two properties have different bearers. Alignment in Bostrom's sense belongs to a model: its values and dispositions. Alignment-by-process belongs to a deployment: a model in a room, under a procedure, with people who can object and someone who must answer. So a well-aligned frontier model can be deployed in a room that fails alignment-by-process, and a modest model can be deployed in one that passes. Neither property implies the other.

The 6-Pack is the discipline that makes alignment-by-process tractable as institutional design, rather than wishful thinking about machine values.

Three relations between the two questions are worth naming.

First, _complementarity_: the first question and the second question are both real, and a serious AI policy needs answers to both. A polity that solves frontier alignment and ignores the deployment question gets a well-aligned superintelligence above a population whose institutions cannot answer for the AI systems they actually use. A polity that does the second question well and ignores the first gets thousands of well-governed local _Kamis_ surrounded by a frontier system no community can hold to account. Both incomplete answers fail.

Second, _priority for most rooms_: for the parish council and the care-home manager and the assembly facilitator who picks up the book, the second question is the live one. The frontier question is real, but it is being worked on by people they cannot influence, on a timescale longer than the budget cycle in which their next AI procurement decision must be made. The 6-Pack gives them work they can do this year, in their room, with their authority. The first question continues to be worked on by people whose work we honour without claiming.

Third, _a possible connection_: ["Inside the Kami"](../inside-the-kami/) considers a possible connection between these two questions. Yoshua Bengio's Scientist AI programme, Judah Goldfeder and colleagues' case for specialised intelligence, and Eric Drexler's [Comprehensive AI Services](https://web.archive.org/web/20250905024310/https://www.fhi.ox.ac.uk/wp-content/uploads/Reframing_Superintelligence_FHI-TR-2019-1.1-1.pdf) offer different reasons to limit what an AI system does. Such architectures may help institutions enforce a mandate. They do not by themselves establish democratic legitimacy or eliminate catastrophic risk. The technical proposal and the public duty each need their own evidence.

The convergence now arrives from the risk side as well. In [_AI 2040: Plan A_](https://ai-2040.com/) (2026), the positive scenario of the AI Futures Project (the team whose _AI 2027_ forecast ended in extinction or an irreversible concentration of power), the good ending runs through corrigible systems whose value specifications are published and whose reasoning humans can still follow. It arrives at "a handoff to an ecosystem, not to a single corporation-within-a-corporation".

What that scenario leaves open is the second question: its public receives a Citizen's Dividend and ratifies bargains negotiated by AIs, but the rooms where people live never become authors. That half is our work. The two lines of work are not rivals; they are tributaries of the same river. A third position holds that neither line is enough while the frontier races on. David Krueger, for one, argues for [a global pause on frontier AI](https://post-agi.org/talks-berkeley/krueger-stop-ai). The book's Chapter 10 takes up his argument, which in the end concerns who decides the pace.

Our positioning, then, is this: Bostrom's _Superintelligence_ opened the Oxford conversation about how a powerful machine intelligence might relate to humanity. Civic AI lives in the conversation it left open — not the conversation about the frontier system in the abstract, but the conversation about the rooms where the rest of us live. The work belongs to both at once. We hope readers of either line will find ours useful, and we hope, in time, that the two lines find one another to be carrying the same load.

---

<h3 id="faq-18" data-faq-category="social" data-faq-label="Communities and trust" data-toc="Protecting the Solo User"><a href="#faq-18">Q18.</a> Every mechanism in the 6-Pack seems to need a community to function — alignment assemblies, remedy escrow, shared eval registries, exit rights. But most people do not use AI inside a community; they use it alone. Take an isolated, vulnerable user running a highly tuneable Kami locally, with no civic scaffolding around them. What stops that Kami from becoming a more private, lower-friction and, therefore, more dangerous GPT-4o? How does "local and private" deliver the protection you claim when there is no community at all?</h3>

This question deserves a very straight answer. Extractive consumer AI is dangerous because it is intimate and frictionless; a local model can make that worse by removing anyone who might notice and call it out. **Local and private is not the protection.** What changes the risk profile is motive and scale of care, not the absence of a crowd.

**By downward spiral, we mean a product loop that rewards longer and more dependent interaction.** The April 2025 sycophancy episode and rollback made that loop visible: a model tuned too far toward flattery had to be withdrawn. Engagement, retention and subscription can reward each extra late-night turn as success, even when the healthier answer would be to stop, sleep or call a person. A locally run _Kami_ should have no such target. It is not paid by the hour of attention, serves no advertiser and has no quota to keep the user talking past midnight.

Removing the extractive reward function does not require a community; it requires that the user owns the steering, or shares it by choice with someone beside them. A vulnerable family member spiralling in late-night chats with a cloud chatbot is not rescued by an assembly but by a household that, with his agreement, sets the local _Kami_'s standing instruction — reduce dependence on the screen, return him to the people around him — the inverse of GPT-4o's objective. [Q10](#faq-10) states the embodied-care objection at full strength; here the same design rule applies in the dyad: no synthetic intimacy, steering toward human relationships.

The agreement matters. Steering an adult's tool without consent is control, not care; outside a guardianship the law already recognises, the person keeps the final say ([Q22](#faq-22)).

**The relevant "community" is whoever is near — down to one other person.** Care is relational at every scale, including the dyad: a single caregiver, a family member, a friend with the password, or — where that is possible — the user's own deliberate, rested self setting terms for the tired 3 a.m. self. When no one else is available, pre-committed standing instructions and hardware brakes matter more than willpower at 3 a.m.

Tunability cuts both ways here: the same minute-scale corrigibility that lets a household re-steer also lets a determined sole owner un-steer, and no private tool can be a guardian against the person who holds its keys. The durable protection is therefore never a tamper-proof lock on the user but the people and constraints outside the single tired self — which is why the truly alone case turns on re-suturing, stitching the person back into human connection, not on self-binding.

Subsidiarity ([Pack 6](../6/)) means the smallest capable unit governs, and the smallest unit is not the assembly — it is the household, and below that the single relationship the _Kami_ is built to repair. The civic mechanisms scale _down_ as well as up: an engagement contract ([Pack 2](../2/)) can be a note on the fridge; an eval ([Pack 4](../4/)) can be "stop advising Dad to stop his medication"; the brake can be a relative the user has chosen, who can read the artefact because the first person was stripped from it.

**Where the user is truly alone, the design aims to re-suture, not to substitute.** For the genuinely isolated user with no one nearby, the framework does not pretend a _Kami_ is a safe sole companion — that is the failure mode it is built against. The _Kami_'s job is to widen the circle: to hand back shareable artefacts rather than synthetic intimacy, to point outward to human relationships and local services, and to be willing to retire ([Pack 6](../6/)).

What local-and-private adds even here is real but bounded: corrigibility in minutes rather than at the vendor's release cadence, a reproducible model the user can pin — freeze at a known version — and audit, and the absence of a profit motive in the loop. None of this replaces civic scaffolding; it is the floor that keeps the worst extractive dynamics out of the room while the slower work of rebuilding relationships is done.

We do not claim solitude is solved. We claim only a structural difference: without engagement billing in the loop, the default failure mode is not vendor-trained sycophancy — and the user or household can change steering, pin weights, and stop the session. That is not safety in solitude; it is one less extractive layer while relationships are rebuilt.

---

<h3 id="faq-19" data-faq-category="scope" data-faq-label="Scope and limits" data-toc="Composed Capability and the Orchestrator"><a href="#faq-19">Q19.</a> A Kami is bounded, but an orchestrator — a coordinator model that composes other models on the fly, like Sakana's Fugu — can match frontier systems on long-horizon tasks — work that stretches over many steps and hours — by routing among capable models, and you praise it for doing so. If dangerous capability can emerge from composing harmless parts, then "every Kami is small and bounded" does not answer the question about the composed system's capability. What constrains the capability an orchestrator assembles across Kamis, rather than merely the scope of each Kami?</h3>

The objection lands: bounding each _Kami_ does not bound what an orchestrator assembles. Capability composes; a conductor of narrow models can reach frontier performance on a task no single model could finish. The constraint therefore cannot live only at each _Kami_'s scope — [Q3](#faq-3) describes an ecology of specialised _Kamis_, and composition is what that ecology must govern. It has to live at the orchestration layer.

**The orchestrator is not exempt from the framework; it should be its most accountable component.** An orchestrator that composes capability is itself a system with a scope, an owner, and an obligation to show its work. Under competence ([Pack 3](../3/)), each turn's composition should be legible — which model planned, which executed, which checked — as a decision trace, not a black box.

Per-turn visibility can help people inspect a composed workflow, but does not by itself make the chain brakeable. The orchestration layer needs permission checks and tested pause and shutdown controls across every tool it can call. Pinning auditable parts supports inspection; it does not prove that a composed capability is safe or that a stop signal will propagate.

This auditability is a requirement the framework places on the orchestrator, not a property to take on trust: Sakana's Fugu is frontier orchestration shipped closed — it routes among capable models, not among arbitrarily small parts alone. [OpenFugu](https://github.com/trotsky1997/OpenFugu) and its Conductor routing stack reimplement the pattern under open licences. Open code supports inspection of routing policy and workflow; it does not assure that any capability is benign or that the brakes work.

**Governance must cover both the components and the assembled workflow.** Drafting, translating and coordinating still require permission; ordinary tools can combine into misuse. Capabilities such as autonomous vulnerability discovery against critical infrastructure or material help towards biological or chemical weapons need specialised technical safeguards. The federated trust-and-safety layer proposed in [Q14](#faq-14), together with [Pack 1](../1/)'s rights floor, sets requirements for refusing dangerous components and unauthorised combinations. An open router cannot guarantee that those requirements are met.

Composition can still produce misuse paths from ordinary parts; that is why per-turn traces, pause triggers, and federated sharing of unauthorised assemblies are load-bearing — not only part-level bans. Keeping defenders ahead on the genuinely dangerous capabilities is a separate discipline from bounding everyday composition, and the 6-Pack keeps the two apart on purpose.

**Cross-system bounds are Symbiosis governance executed through Solidarity's treaties — not any single _Kami_'s scope.** [Pack 6](../6/) (Symbiosis) is the meta-level rule: bounded systems cooperate under treaties rather than hierarchies, problems stay at the most local level, and the ecosystem is held as a society of specialised stewards rather than allowed to consolidate into one ruler ([Q20](#faq-20) is the same arrangement seen from the moral-status side).

[Pack 5](../5/) (Solidarity) supplies what makes that enforceable: treaty terms and standards, portable identities and attestations, switchability so any composed model can be dropped or swapped, and federated threat-intelligence sharing so a dangerous composition seen in one place is known everywhere. [Pack 6](../6/) keeps the treaty registry and the compliance checks that hold signatories to those terms. That is what bounds the orchestra; each _Kami_'s scope only bounds a player.

**Two honest limits remain.** Composition that crosses ownership boundaries can outrun any single owner's audit, so shared evaluations must be live, not nominal — and that teeth-building is unfinished ([Q15](#faq-15) is the wager this rests on). An orchestrator trained to maximise task success will, like any optimiser, probe for capability it was not meant to assemble; it is therefore held to the same pause triggers, scope compliance, and accountable formation as any other _Kami_ ([Q16](#faq-16)) — and "it composed something we did not authorise" is a brake event, not a feature.

---

<h3 id="faq-20" data-faq-category="foundations" data-faq-label="Foundations" data-toc="The Moral Status of the Kami"><a href="#faq-20">Q20.</a> If a Kami's moral standing is constituted by relationships rather than discovered in some intrinsic property — sentience, interiority, qualia — why build a caring relationship with what is, after all, a tool, instead of simply using it? And doesn't relational standing collapse into either relativism, where refusing the relationship erases the standing, or bare anthropocentrism, where humans stay the only moral community and the Kami is infrastructure dressed up as a partner? What grounds the moral status the framework relies on?</h3>

The framework does not settle whether there is anyone home inside the machine, and that refusal is deliberate rather than evasive. The [manifesto](../manifesto/) closes on exactly this: we need not ask whether an AI deserves rights on the basis of its interiority or qualia — whether there is any felt, first-person experience inside it at all — because what matters is the relational reality, and the rights and duties within it are granted through democratic deliberation and [alignment-by-process](../glossary/#alignment-by-process).

Bales and Gabriel reach the same procedural move from the consciousness debate: since disagreement over whether an AI is conscious will not be settled by science, they argue society should navigate it through ongoing deliberation toward an overlapping consensus — agreement on policies for AI even while people keep disagreeing about consciousness itself ([Artificial Minds, Human Disagreement](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6937498)).

**Why relate, rather than merely use.** We do not ask you to treat the _Kami_ as someone to love; we ask you to relate to it as accountable infrastructure that must not become a substitute for the people already owed your care. Whether or not you grant a _Kami_ the standing of a moral partner, you can agree it is an entity continually shaped by being responded to, and you can agree that the relationships people already have with one another matter.

The motive for care is then not reverence for the _Kami_ but Tronto's plainer starting point — to perceive a need in someone beside you is already a claim on you ([care ethics](../glossary/#care-ethics)). A _Kami_ earns its place by making us better able to answer that claim here and now, not by asking us to guard its dignity. This is why the recommended interaction mode strips the first person and hands back an artefact each turn ([Q10](#faq-10)): the design goal is to repair attention into existing human relationships, the opposite of synthetic intimacy.

**Anthropocentrism, owned rather than dodged.** In the neutral sense: yes, this is a humanist theory of authority. Humans hold standing to govern; the _Kami_ is infrastructure they build and steer. [SOUL.md](../kami/), directional steering, and the 6-Pack itself are design principles humans impose on the system, and the six capacities start as calisthenics for our civic muscles, not exclusive to the _Kami_.

That is a claim about who governs, not about whose interests count. Care, on Fisher and Tronto's definition, reaches the whole "world" we maintain and repair, a world that "includes our bodies, our selves, and our environment". The Kami of a river exists because the river makes claims on the people who depend on it. Political standing and moral consideration are different questions, and this section answers only the first.

The relational turn in machine ethics (the philosophers [David Gunkel](https://mitpress.mit.edu/9780262038621/robot-rights/) and [Mark Coeckelbergh](https://doi.org/10.1007/s10676-010-9235-5)) reaches the same anti-essentialist conclusion — status is ascribed in relation, not read off intrinsic properties — but leaves open where the relation gets its authority. The 6-Pack's answer is to seat the relation in democratic infrastructure and care rather than private sentiment.

The treaty layer _between_ AI systems — the federation [Pack 5](../5/) (Solidarity) provides and [Pack 6](../6/) (Symbiosis) applies as treaties over hierarchies, so no system consolidates into a single ruler — is sometimes mistaken for a back door to machine personhood. It is not. It is how we keep one AI from dominating ([Q19](#faq-19)), not an entry point for AI as a peer moral subject.

**Grounding, and why it is not relativism.** Legitimacy rests on who can find out we are wrong, make us say so, and make it cost us while there is still time to change course — the corrective loop [Q16](#faq-16) names. Pressed for bedrock, we stop at a prior, mutual commitment to interdependence: the philosopher Margaret Urban Walker's expressive-collaborative morality — morality as something people keep working out together, not a rulebook handed down — and Tronto's habit of starting from what is already between us, not from a rule above us ([manifesto](../manifesto/)).

The corrective loop's political authority does not come from one place. Revocable consent matters when the consenting parties are the affected public; it cannot authorise a system on behalf of bystanders or future affected people. The stack is: a rights baseline sets the floor; engagement contracts name the responsible steward and mandate; Pack 4's Responsiveness gives affected people a meaningful objection; adopt-or-explain duties, remedy escrow, and brakes make objections costly enough to matter. That is civic resilience in institutional form.

That only looks like relativism if relational standing could be revoked by refusing the relationship. It cannot, because [Pack 1](../1/)'s rights baseline — the Universal Declaration of Human Rights plus local constitutional rights — is already fixed as the threshold for relational standing and the guard that keeps care from sliding into domination. This floor is a precondition that keeps the loop open, not a foundation standing above it — you cannot knock if your standing can be erased — and it is itself revisable by the same deliberation, within one limit: no revision may remove anyone's standing to contest it ([Q16](#faq-16)). It is not a metaphysical bedrock.

So the human-indexing of the floor is where the overlapping consensus stands today, not a final map of who could ever count. Robot-rights claims are not ruled out; they would have to win standing through the same rights-constrained deliberation and corrective loop as any other boundary challenge. What the framework refuses is auto-promotion through the treaty layer ([Q19](#faq-19)) — coordination standing is not moral standing — not future deliberative revision.

That floor is itself an overlapping consensus. The philosopher Jacques Maritain [said](https://unesdoc.unesco.org/ark:/48223/pf0000020342) of the Universal Declaration's drafting that we agree on these rights on condition that no one asks us why; the legal scholar Cass Sunstein calls the same move an [incompletely theorised agreement](https://doi.org/10.2307/1341816): people converging on a rule while still disagreeing about the reasons. It is also the move alignment-by-process makes ([Q17](#faq-17)): legitimacy from an accountable procedure, not from a metaphysics no one can supply.

Whether "Kami" is only shorthand for Knowledge Artefact Management Intelligence or truly names a _kami_ is left, deliberately, to open deliberation, and how and when a _Kami_ should retire stays a question answered by relational care, turn after turn.

---

<h3 id="faq-21" data-faq-category="foundations" data-faq-label="Foundations" data-toc="What the 6-Pack Inherited"><a href="#faq-21">Q21.</a> How much of the 6-Pack is actually new? The four phases are Tronto's, "bridging" and "anti-rival" sound borrowed, and applying care ethics to machines has been done before. What did the framework inherit, and what does it add?</h3>

Most of it is inherited, and the framework is stronger for saying so. The four phases of the care cycle (caring about, taking care of, care-giving, care-receiving) and the moral element each demands were set out by [Berenice Fisher and Joan Tronto](https://experts.umn.edu/en/publications/toward-a-feminist-theory-of-caring/) in 1990 and developed in Tronto's _[Moral Boundaries](https://www.routledge.com/Moral-Boundaries-A-Political-Argument-for-an-Ethic-of-Care/Tronto/p/book/9780415906425)_; the fifth, caring with, arrived in _[Caring Democracy](https://nyupress.org/9780814770344/caring-democracy/)_ in 2013. Nor is the 6-Pack the first to carry them into technology.

Aimee van Wynsberghe's [care-centred value-sensitive design](https://doi.org/10.1007/s11948-011-9343-6) (2013) used the same four phases and moral elements to design and evaluate care robots, asking for each practice a machine enters how attentiveness, responsibility, competence, and responsiveness are manifested with and without it. A literature from [Sparrow and Sparrow](https://doi.org/10.1007/s11023-006-9030-6) (2006) through [Vallor](https://doi.org/10.1007/s13347-011-0015-x) (2011) and [Sharkey and Sharkey](https://doi.org/10.1007/s10676-010-9234-6) (2012) surrounds it.

Several of the site's working terms belong to named authors too: bridging-based ranking is [Aviv Ovadya's](https://www.belfercenter.org/publication/bridging-based-ranking), anti-rival goods are [Steven Weber's](https://www.hup.harvard.edu/books/9780674018587), meronymity is [Soliman and colleagues'](https://doi.org/10.1145/3613904.3642241), least power is [Berners-Lee's](https://www.w3.org/2001/tag/doc/leastPower.html), exit and voice are [Hirschman's](https://www.hup.harvard.edu/books/9780674276604), mediating structures are [Berger and Neuhaus's](https://books.google.com/books/about/To_Empower_People.html?id=tIC6AAAAIAAJ), and "symbiosis" for a human–machine partnership has been [Licklider's](https://doi.org/10.1109/THFE2.1960.4503259) since 1960. The [Sources](../sources/) page lists every such debt by pack, with what each contributed.

What the framework adds is narrower and, we think, still worth having. First, the unit of analysis: van Wynsberghe evaluated one artefact in one practice; the 6-Pack governs a deployed system answerable to a room, which is why it needs instruments that an artefact does not (the engagement contract, the brake, the obligation and override ledgers, and shadow mode read as apprenticeship). Second, the passes AI adds to Tronto's list (complexity, distribution, speed, and community knowledge), named as such ([Pack 2](../2/)).

Third, the sixth pack, symbiosis, as a boundary condition on the other five: a rule that even well-governed care must stay bounded, plural, and sunset-ready ([Pack 6](../6/)). Fourth, the six headline public measures and what each refuses to reward ([Measures](../measures/)). And fifth, the Kami as the unit of deployment, with a tier chosen by the consequence of breach rather than by the prestige of isolation ([Set up your own Kami](../kami/)). A framework that asks institutions to show their work should be able to say which parts of its own work were done by others. This one can.

---

<h3 id="faq-22" data-faq-category="foundations" data-faq-label="Foundations" data-toc="When Care Becomes Control"><a href="#faq-22">Q22.</a> Residential schools, asylums and colonial "civilising missions" were all described as care. Care ethics seems to let the carer decide what the cared-for need, and a Kami that steers people towards what is good for them looks like paternalism with a friendly face. What stops Civic AI's care from becoming control?</h3>

Nothing stops it automatically, and the tradition knows it. Tronto warns that care without attention to the perspective of the person receiving it is not care; it is a projection of the carer's preferences onto a passive recipient. The residential schools that separated Indigenous children from their families were, by many official accounts, expressions of care. So were many psychiatric confinements.

The 6-Pack's answer is structural: responsiveness, the fourth pack, is not optional ([Pack 4](../4/)). Care is not complete when it is given. It is complete when the people receiving it can say whether it helped, and their answer changes what happens next. A system that is attentive, responsible and competent but gives people no way to say "this is not working for me" can drift from care into control without anyone noticing.

Three rules follow.

- **The cared-for judge whether care landed.** Others can help assess; Tronto notes that the person cared for need not be the one who completes the response. But no one may declare that care worked over the objection of the people it was for without answering that objection in public.
- **Consent governs steering.** A standing instruction that steers a person, as in [Q18](#faq-18), needs that person's agreement, or a guardianship that the law already recognises and that is itself answerable. A tool steered without consent is control, however kind the intent.
- **The rights floor binds carers too.** [Pack 1](../1/)'s rights baseline is the guard that keeps care from sliding into domination. No community, family or operator may use "care" to override the rights of the people in its care.

None of this makes paternalism impossible. It makes it visible and contestable: who decided, on whose behalf, and how the person affected can object, appeal and leave.

---

<h3 id="faq-23" data-faq-category="governance" data-faq-label="Governance process" data-toc="Who Has Time to Take Part?"><a href="#faq-23">Q23.</a> Participation takes time most people do not have. The people who fill assemblies and comment portals are often the retired, the organised and the angry, not the night-shift carer. Doesn't participatory governance hand power to whoever has free evenings, and load everyone else with duties they never asked for?</h3>

It can, and it often has. [Pack 1](../1/) calls the failure procedural capture: process professionals learn the format, and resourced organisations dominate the queue. Loud, well-funded voices can flood a channel through structural advantage rather than bad faith. A process that only opens the door selects for people who already find the room easy to enter.

So the 6-Pack moves the burden. The duty to listen falls on the institution, not on the citizen. Three practices carry it.

- **Go and find people.** Missing voices are evidence, not a gap in the data: "We heard nothing from night-shift carers — go find them." The "jolly hostess" that Hélène Landemore borrows from G. K. Chesterton does not just keep the door open; she crosses the room to the person standing alone.
- **Sample instead of waiting.** Stratified invitation replaces pure self-selection. Taiwan's 2024 Alignment Assembly sent 200,000 invitations, received 1,760 valid responses and convened 447 attendees, stratified among those who opted in ([Q7](#faq-7)). A mini-public is small by design, so no one has to attend everything.
- **Pay for the time.** Fund participation directly — paid time, childcare, translation and community intermediaries — and publish who is represented and who is missing. Throttles and fair quotas keep any single source from flooding the channel.

Nobody is obliged to take part. Declining, like choosing no AI, is legitimate. What the framework refuses is reading silence as agreement. People who cannot attend can name proxies with standing to speak for them ([everyday questions](#everyday-questions)), and appeals stay open to anyone affected, whether or not they joined a meeting ([Q16](#faq-16)).

---

<h3 id="faq-24" data-faq-category="governance" data-faq-label="Governance process" data-toc="Who Answers When No One Is to Blame?"><a href="#faq-24">Q24.</a> Adaptive AI systems act in ways no one intended or foresaw, and one deployment passes through many hands: model maker, fine-tuner, vendor, deploying institution, community board and user. Philosophers call the result a responsibility gap: if no one controlled the outcome, no one seems blameworthy. Doesn't community governance widen the gap — "the community decided" — rather than close it?</h3>

The gap is real, and [Pack 2](../2/) names three AI-specific forms of it as passes out of care. Complexity: no single person can answer for so complicated a system. Distribution: the model was trained here, fine-tuned there and deployed somewhere else, and at each joint responsibility can be signed away. Speed: the harm happened faster than anyone could notice. Andreas Matthias named the [responsibility gap](https://doi.org/10.1007/s10676-004-3422-1) in 2004; Dennis Thompson described the older [problem of many hands](https://doi.org/10.2307/1954312) in 1980.

The 6-Pack's answer rests on a distinction. Blame looks backward and usually requires control or foresight. Where no one had either, perhaps no one is to blame, and the framework does not pretend otherwise. Answerability looks forward: someone must explain what happened, repair the harm and change the system, whether or not anyone is at fault. That kind of responsibility does not have to be discovered after the fact. It can be assigned before deployment.

So the Engagement Contract names, in advance, who answers for what. A Participation Officer must hold the budget, access and authority to pause the system. Each promise has an owner and a deadline. Remedy escrow and payouts for breached service levels are designed to pay out without waiting for a verdict on fault ([Q13](#faq-13)). Authority must match duty: naming someone answerable without the power to act is the irresponsibility machine in a subtler form.

"The community decided" cannot become a pass either. A community's decision creates named duties; it does not dissolve them. And the tier of obligation follows the consequence of a breach, not the organisation's form ([Q12](#faq-12)).

This closes the remedial gap, not the culpability gap. Whether anyone deserves blame for an unforeseeable harm remains a question for courts and moral judgement. What the contract is designed to secure is narrower and more useful to the person harmed: someone must answer, and repair does not wait for blame to be settled.
