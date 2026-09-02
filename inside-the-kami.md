---
layout: chapter
title: "Inside the Kami"
author: "Audrey Tang"
lang: en-gb
alt_lang_url: "/tw/inside-the-kami"
permalink: "/inside-the-kami/"
date: 2026-03-05
description: "What recent ML research suggests goes inside a bounded Civic AI — and what it cannot provide."
summary: "Three lines of ML research — Bengio, LeCun and Taniguchi's collective predictive coding — converge on a bounded, specialised Kami that negotiates shared meaning rather than ruling from above. The substrate can stay honest and narrow; legitimacy, pace and justice remain ours."
nav_next:
    url: "/"
    text: "Home"
---

The 6-Pack describes the governance around a Civic AI. This essay asks a narrower question: what kind of technical substrate makes that governance easier to uphold?

## In brief

- Recent work from Yoshua Bengio's Scientist AI and the SAI line from LeCun and colleagues points toward bounded, specialised systems rather than one general-purpose governor.
- A third line of work — Tadahiro Taniguchi and colleagues' _Collective Predictive Coding_ (CPC) — supplies the missing mathematics for how those bounded systems can negotiate shared meaning with their human communities, rather than receive it from above. The 2026 _Artificial Life_ paper, which I co-authored, formalises this as _symbiotic alignment_.
- These three programmes converge: Bengio shows how the inside can stay honest, SAI shows why the inside should stay narrow, and CPC shows how many such insides can co-construct meaning without a single supervisor.
- This convergent shape is not new: Eric Drexler's 2019 _Comprehensive AI Services_ (CAIS), from the same Oxford tradition as Bostrom's _Superintelligence_, already reframed advanced AI as an ecology of bounded, specialised services rather than a single agent. What the 6-Pack adds is the civic layer CAIS leaves open.
- That convergence does not settle politics, but it does narrow the technical search space.
- The inside still cannot decide legitimacy, standing, pace, or justice. Those remain institutional questions.

## A technical argument for boundedness

The 6-Pack is deliberately technology-agnostic. Its governance should
outlast any one model family. But technology-agnostic is not
technology-indifferent. A deceptive model turns oversight into permanent
combat. A general-purpose optimiser strains every boundary — and a system built to treat the world as a fixed, external source of feedback is, on the argument of [Solipsistic Superintelligence is Unlikely to be Cooperative](https://arxiv.org/abs/2606.03237), unlikely to cooperate with anyone once deployed. An opaque
system makes Pack 3 impossible to verify.

Two recent ML programmes — Yoshua Bengio's [Scientist AI](https://lawzero.org/en)
and the [Superhuman Adaptable Intelligence](https://arxiv.org/abs/2602.23643)
(SAI) agenda from LeCun and colleagues — converge on a useful design lesson: the best substrate for Civic AI is
not a universal agent. It is a bounded, specialised system whose action remains
under human authorisation.

That convergence does not settle politics. It does narrow the technical search
space.

None of this is a new intuition. In 2019, within the same Oxford tradition that produced Bostrom's _[Superintelligence](https://global.oup.com/academic/product/superintelligence-9780199678112)_, Eric Drexler's [_Reframing Superintelligence: Comprehensive AI Services_](https://web.archive.org/web/20250905024310/https://www.fhi.ox.ac.uk/wp-content/uploads/Reframing_Superintelligence_FHI-TR-2019-1.1-1.pdf) (CAIS) argued that advanced AI is most plausibly reached not as a single self-improving agent but as a growing ecology of bounded, specialised services — the same shape Bengio and LeCun now arrive at from trust and capability arguments. What CAIS left open is exactly what the 6-Pack supplies: not the architecture of boundedness, but its legitimacy — who authorises a service, who is owed an answer, who can revoke the mandate.

## Bengio: truth without appetite

Bengio's Scientist AI starts from a simple model of trust. The laws of physics
do not want anything. A good scientific model is trustworthy because it tries
to describe the world, not bend the world toward a goal.

His programme asks whether AI can be trained in that spirit: as a predictor of
reality rather than an agent with objectives.

The key move is the **truthification pipeline.** Training data is rewritten with
explicit epistemic markers. A verified measurement or proved theorem is
represented as a factual claim: "X is true." A tweet, speech or paper claim is
represented differently: "someone wrote X."

That distinction matters. It teaches the system to separate the state of the
world from human rhetoric about the world. At runtime, a factual query asks
"what does the model judge to be true?" A communicative query asks "what have
people said?" Those are not the same task.

In Bengio's own framing, this yields **epistemic correctness**: asymptotically,
high-confidence factual answers are not deceptive. The programme is strongest
when the system says "this is true" with confidence. It is weaker when the
system says "unknown": that may be honest uncertainty, or it may be strategic
silence. That gap matters for governance.

The second crucial claim is architectural. Agency is not treated as the
default. It enters through the scaffold around the model — the questions humans
ask, the tools they attach and the actions they authorise. That is exactly
where governance belongs.

## SAI: capability through specialisation

The SAI programme of LeCun and colleagues attacks a different myth: that the right goal is one
general intelligence good at everything.

Its case is mathematical before it is political. The [No Free Lunch theorem](https://doi.org/10.1109/4235.585893) — a
formal result in machine learning — says no single algorithm dominates every
class of problem. Multi-task systems suffer
negative transfer when tasks compete for the same representational capacity.
Even models that look general often hide specialisation internally, routing
different tasks to different subsystems.

The slogan version is memorable because it is correct: **the AI that folds our
proteins should not be the AI that folds our laundry.**

For Civic AI, the implication is direct. A Kami — **k**nowledge **a**rtefact **m**anagement **i**ntelligence; the word came first, the initials caught up — should not be a mini-sovereign mind roaming across domains. It should be a specialist: good at one class of
community work, replaceable when its job changes, and unable to turn local
success into universal mandate.

SAI does not solve governance either. A specialist can still be deployed for
bad ends. But it does remove one bad default: the assumption that safer or
smarter AI requires one system to do everything.

## Taniguchi: meaning by negotiation, not by decree

A third programme, less prominent in the Western AI-safety conversation but load-bearing for Civic AI, comes from Tadahiro Taniguchi and colleagues' _Collective Predictive Coding_ (CPC). Its 2026 _Artificial Life_ paper, which I co-authored, frames the next step beyond Bengio's epistemic honesty and SAI's specialisation: how should a community of bounded, specialised systems and their human counterparts negotiate the shared meanings — words, norms, categories, agreements — that make coordination possible at all?

The dominant alignment paradigm answers this top-down. A supervisor — a single human, a model card, a reinforcement-learning-from-human-feedback ([RLHF](https://arxiv.org/abs/2203.02155)) preference dataset — holds a privileged "ground-truth" distribution, and every other system is taught to converge on it. The paper calls this _hierarchical alignment_, and is precise about its political cost: alignment becomes the imposition of one community's values on all others, which is exactly the singleton condition the 6-Pack is built to refuse.

CPC offers a different formulation: _symbiotic alignment_. Treat the population of agents — humans and AIs together — as a _symbol-emergence system_. Each agent has its own internal states and its own observations of the world, and the group as a whole maintains a shared communicative variable — language, norms, categories, a Polis cluster label, a deliberation outcome. The total collective free energy of the system — a single measure of how badly, taken together, the agents' predictions fit the world and each other — splits into two parts:

- an **individual** part, where each agent minimises its own prediction error about the world and keeps its internal state consistent with the shared symbols — the familiar territory of standard multi-agent reinforcement learning
- a **collective** part that pulls the shared symbol system toward coherence across the population

The collective term is the new object. Mathematically, it cannot be rewritten as a sum of agent-wise utilities: it is irreducibly population-level. A single agent acting purely in its own interest cannot minimise it; only the group can, through communication. This is the formal statement of why solidarity ([Pack 5](/5/)) is not optional and not reducible to individual virtue.

Crucially, this negotiation does not require a central coordinator. The paper shows that decentralised turn-taking dialogue — a speaker samples a message, a listener accepts or rejects it based on its own observation, and the group iterates — is mathematically equivalent to a _Metropolis–Hastings Naming Game_ (MHNG), which is a form of Markov Chain Monte Carlo — a standard method for approximating a hard probability calculation by taking many small, locally judged steps. Shared symbols emerge from local accept/reject exchanges in a way that provably approximates Bayesian inference over the collective posterior.

Finally, CPC reframes _plurality_ as a multimodal collective posterior. When a society is genuinely divided, the distribution has multiple peaks — each peak a locally coherent worldview separated from the others by high-energy "barriers" of distrust and partial observation. Bridging tools like Polis do not force these peaks to collapse into a single average; they search for low-energy paths between them, communicative variables that lower the barriers without erasing the modes. This is the formal counterpart of uncommon ground ([Pack 1](/1/)).

CPC is a research agenda, not a finished engineering recipe. But it does something the 6-Pack needed and could not provide for itself: it gives the relational vocabulary of care a mathematical shape that engineers, regulators and procurement officers can argue about. Solidarity stops being a sentiment and becomes a non-decomposable term in an objective function. Plurality stops being a slogan and becomes a multimodal distribution worth preserving. Deliberation stops being a hopeful procedure and becomes a decentralised Bayesian inference whose convergence guarantees are now sketched on the page.

## The shared design lesson

Bengio, LeCun and Taniguchi are solving different problems. One is asking how
to make prediction trustworthy. Another is asking how to make capability
efficient. The third is asking how shared meaning can be negotiated. Still,
they point toward the same Civic AI shape.

- **Separate truth-tracking from speech imitation** (Bengio) — Decision traces can distinguish verified claims from reported claims.
- **Specialisation beats generality** (LeCun) — Each Kami should have a narrow mandate.
- **Modular systems beat monoliths** (Bengio + LeCun) — Civic AI should be composable, replaceable and federated.
- **Action is the danger point** (Bengio) — Authorise tools and interventions in governance, not inside opaque weights.
- **Non-decomposable collective regularisation** (CPC; Taniguchi et al., 2026) — Solidarity becomes a machine-enforceable primitive: a term in the loss that no agent can minimise alone.
- **Decentralised Bayesian inference via MHNG** (CPC) — Bounded local Kamis can co-construct shared meaning through peer-to-peer dialogue, without ceding sovereignty to a central server.
- **Multimodal collective posterior distribution** (CPC) — Plurality becomes a maths problem: diverse worldviews can be mapped, bridged and preserved without flattening.

The strongest reading is modest but important: these programmes do not prove
the 6-Pack, but they make the 6-Pack easier to implement. They reduce the
amount of governance work wasted fighting the wrong machine shape.

## Implementing through the 6-Pack

**Pack 1: Attentiveness.** Truthification (Bengio) helps a bridging system tell apart three things that usually get muddled together: what is verified, what is claimed, and what is contested. That makes disagreement more legible. CPC then gives the disagreement a _shape_: a polarised society is a multimodal posterior with distinct peaks; bridging algorithms are searches for communicative variables that lower the energy barriers between those peaks without collapsing them. Neither programme answers whose voices get into the data in the first place. That remains a listening problem, not a modelling one.

**Pack 2: Responsibility.** Bengio leaves a crucial gap open: who decides which
questions may be asked, in which domains, for which purposes? The Engagement
Contract ([Pack 2](/2/)) fills that gap. It governs the scaffold around the
model: authorised queries, source rules, pause conditions, escrow and
adopt-or-explain duties.

**Pack 3: Competence.** Better-calibrated uncertainty makes decision traces
more honest. A trace that says "0.92 likely" should mean what it says. But
Pack 3 is broader than prediction quality. Sandboxing, least power, data
minimalism and graduated release remain operational duties. CPC contributes one further competence claim: an apprentice that learns through accept/reject turn-taking with its cultivator — the Apprentice Model of shadow mode, canary and general release — is performing an approximate Bayesian inference whose convergence is now mathematically characterised. Apprenticeship is no longer a metaphor for shadow-mode deployment; it is a recognised algorithm with known limits.

**Pack 4: Responsiveness.** A truth-tracking model gives cleaner failure
analysis: was the factual judgement wrong, was uncertainty miscalibrated or was
the harm introduced by the deployment layer? That is useful, but it is not
repair. Appeals, public repair logs and community-authored evals such as
[Weval](https://weval.org/) still do the moral work of response. They are also
how we probe the hardest case in Bengio's framework: "unknown." And in CPC terms, every accepted appeal is one further sample drawn into the collective posterior — repair is not only ethical recovery but evidentiary update.

**Pack 5: Solidarity.** These architectures suggest a better basis for
federation. Kamis can share provenance, schemas, eval results and verified
factual claims without flattening local context into one global authority.
Federation should move institutional knowledge, not intimate histories. Shared
facts; local judgement. CPC sharpens this further: the _non-decomposable collective regularisation term_ in the symbiotic-alignment objective is the mathematical statement of what solidarity demands. It is the part of the loss function that no agent can minimise by self-interest — only the population can. A Civic AI architecture that omits it is not just politically lonely; it is technically incomplete.

**Pack 6: Symbiosis.** SAI strengthens the case for boundedness because
specialisation is not just politically safer; it is technically better. CPC adds that even bounded Kamis must remain in _communicative reach_ of each other and of the humans they serve — symbol emergence is a population-level process, and a Kami that drops out of the dialogue stops contributing to shared meaning. But
Pack 6 still has to do work the ML programmes do not: sunset, succession,
anti-capture rules and non-expansion pacts. And any world-model planner,
however scoped, needs agency audits. Goal-directed behaviour inside a boundary
can still be dangerous.

## What the substrate cannot decide

This is where the limit becomes clear.

**It cannot decide standing.** A non-agentic predictor can still be used
without the consent of the people it affects. Architecture cannot grant the
affected a voice.

**It cannot decide legitimacy.** "What counts as true?", "Which sources
qualify?", and "What tasks matter?" are not technical questions. They are
constitutional questions.

**It cannot decide pace.** Machine outputs arrive quickly. Democratic
authorisation takes time. The two-lane system of the 6-Pack exists because
responsible use requires slow guardrails around fast tools.

**It cannot decide justice.** A prediction can be accurate and still be used
cruelly. Repair, compensation and restored trust do not come from a posterior
distribution.

**It cannot prevent capture.** The same truthful specialist can serve a
democracy, a monopoly or an authoritarian state. Governance determines which.

## The Kami of Care

Put the pieces together and a plausible technical substrate comes into view:

- a non-agentic, truth-tracking core
- specialist modules for bounded domains
- explicit governance over tools, queries and actions
- community-authored evals probing both confident answers and strategic
  silence
- sunset and handover rules so the service can persist without permanent
  dependence on one model or steward

This is what I mean by a **Kami of Care**: not a universal governor, but a
civic instrument that is trustworthy inside and accountable outside.

It is not the only possible substrate. It is simply the strongest one now in
view. Bengio helps explain how the inside can stay honest. LeCun helps explain
why the inside should stay narrow. Taniguchi's collective predictive coding helps explain how _many_ such insides can negotiate shared meaning without a master variable above them. The 6-Pack explains how that whole arrangement remains answerable to the people around it.

If the previous decade of AI research was dominated by the question _how do we align one powerful model to one fixed ground truth?_, the work assembled here points to a different question: _how do many bounded models and the human communities they serve co-construct ground truth, again and again, in accountable rooms?_ That second question is the one the 6-Pack was always asking. The arrival of a maths that can describe it changes the conversation we can have with engineers and regulators, not because the maths replaces politics but because it gives the politics terms it can stand on.

The field is getting clearer about what belongs inside a Kami. The more
important question — who gets to authorise it, limit it and retire it — is
still, irreducibly, ours. That question, too, has a literature: Seth Lazar's [democratic duties of explanation](https://arxiv.org/abs/2208.08628) and Kate Vredenburgh's [right to explanation](https://doi.org/10.1111/jopp.12262) ask, in political philosophy's terms, who is owed an account of why a system did what it did. The [Sources](/sources/) page places this essay's substrate arguments beside them.
