---
layout: chapter
title: "Inside the Kami"
author: "Audrey Tang"
lang: en-gb
alt_lang_url: "/tw/inside-the-kami"
permalink: "/inside-the-kami/"
date: 2026-03-05
description: "What recent ML research suggests belongs inside a Civic AI with a clear limit, and what it cannot provide."
summary: "Three lines of ML research (Bengio; Goldfeder, LeCun and colleagues; Taniguchi's collective predictive coding) point to a specialised Kami that works out shared meaning with people instead of ruling from above. Honesty and a narrow scope are design goals. Legitimacy, pace and justice stay with us. None of these programmes is a deployed care or safety proof."
nav_next:
    url: "/"
    text: "Home"
---

The 6-Pack describes the governance around a Civic AI. This essay asks a narrower question: what technology underneath makes that governance easier to uphold?

A Kami is an existing AI model with written instructions (a prompt) and a few note files, kept by a group of people who answer for it. It is not a new kind of AI. Instructions shape how the model talks and what it tries to do, but they drift: a restart, a long chat that gets summarised or a model update can all change what it does. A refusal or limit that matters has to be built into the software's permissions and kept by people who can check the Kami and switch it off.

Capability adds up. Limiting each Kami does not limit what an orchestrator builds from many. So the orchestrator needs a named owner and a defined scope, with a readable per-turn record of which model planned, which executed and which checked. Composition rights sunset with the Engagement Contract, and oversight needs a way to pause the chain. This is a governance requirement. No such pipeline is implemented, and watching a chain does not give anyone control of it.

## In brief

- Recent work from Yoshua Bengio's Scientist AI and the SAI line from Judah Goldfeder, Yann LeCun and colleagues points toward specialised systems with narrow jobs, and away from one general-purpose governor.
- A third line of work, Tadahiro Taniguchi and colleagues' _Collective Predictive Coding_ (CPC), offers a theoretical framework for how those systems can work out shared meaning with their human communities by talking it through. The 2026 _Artificial Life_ paper, _Symbiotic Alignment via Collective Predictive Coding: A Theoretical Framework for Co-Creative Human–AI Ecosystems_, which I co-authored, formalises this as _symbiotic alignment_.
- These three programmes share a shape. Bengio argues for an honest inside, SAI for a narrow one, and CPC proposes how many such systems could build meaning together without a single supervisor. They are research arguments. None is a deployed care or safety proof.
- This shape is not new. Eric Drexler's 2019 _Comprehensive AI Services_ (CAIS), from the same Oxford tradition as Bostrom's _Superintelligence_, already described advanced AI as an ecology of specialised services, with no single agent in charge. The 6-Pack adds the civic layer CAIS leaves open.
- That convergence narrows the technical search space without settling politics.
- The inside cannot decide legitimacy, standing, pace or justice. Those are institutional questions.

## A technical argument for boundedness

The 6-Pack deliberately does not depend on any one technology, so its governance can outlast any one model family. That does not make the technology irrelevant. A deceptive model turns oversight into permanent combat. A general-purpose optimiser strains every limit placed on it. A system built to treat the world as a fixed, external source of feedback is, on the argument in [Solipsistic Superintelligence is Unlikely to be Cooperative](https://arxiv.org/abs/2606.03237), unlikely to cooperate with anyone once deployed. An opaque system makes Pack 3 impossible to verify.

Two recent ML programmes, Yoshua Bengio's [Scientist AI](https://lawzero.org/en) and the [Superhuman Adaptable Intelligence](https://arxiv.org/abs/2602.23643) (SAI) agenda from Goldfeder, LeCun and colleagues, reach the same design lesson. The best technology to build Civic AI on is a specialised system with a narrow job, whose actions people authorise.

Honesty and a narrow scope are design goals. Citing these programmes does not give a model either.

None of this is a new intuition. In 2019, within the same Oxford tradition that produced Bostrom's _[Superintelligence](https://global.oup.com/academic/product/superintelligence-9780199678112)_, Eric Drexler's [_Reframing Superintelligence: Comprehensive AI Services as General Intelligence_](https://web.archive.org/web/20250905024310/https://www.fhi.ox.ac.uk/wp-content/uploads/Reframing_Superintelligence_FHI-TR-2019-1.1-1.pdf) (CAIS) argued that advanced AI is most plausibly reached as a growing ecology of specialised services, with no single self-improving agent. Bengio and the SAI authors now reach the same shape from arguments about trust and capability. CAIS left open the question of legitimacy, which the 6-Pack takes up: who authorises a service, who is owed an answer and who can revoke the mandate.

## Bengio: truth without appetite

Bengio's Scientist AI starts from a simple model of trust. The laws of physics do not want anything. A good scientific model earns trust by describing the world, with no goal to push it toward.

His programme asks whether AI can be trained in that spirit, as a predictor of reality with no objectives of its own.

The key move is the **truthification pipeline.** Training data is rewritten with
explicit epistemic markers. A verified measurement or proved theorem is
represented as a factual claim: "X is true." A tweet, speech or paper claim is
represented differently: "someone wrote X."

That distinction teaches the system to tell the state of the world from what people say about it. At runtime, a factual query asks "what does the model judge to be true?" A communicative query asks "what have people said?" They are different tasks.

In Bengio's framing, this yields **epistemic correctness**: asymptotically,
high-confidence factual answers are not deceptive. The programme is strongest
when the system says "this is true" with confidence. It is weaker when the
system says "unknown", which may be honest uncertainty or strategic silence. That gap matters for governance.

The second claim is about architecture. Agency is not the default. It enters through the scaffold around the model: the questions people ask, the tools they attach and the actions they authorise. That is where governance belongs.

## SAI: capability through specialisation

The SAI programme of Goldfeder, LeCun and colleagues questions a different assumption: that the right goal is one
general intelligence good at everything.

The [No Free Lunch result][no-free-lunch] concerns averages taken uniformly over all cost functions in Wolpert and Macready's formal optimisation setting. It says nothing about whether a specialist beats a generalist on a practical task. That takes measurement.

Learning theory adds an empirical caution. Multi-task systems can suffer **negative transfer** when tasks compete for a shared representation. Whether splitting into specialist subsystems helps depends on the task distribution and the mechanism.
Even models that look general often specialise internally, routing
different tasks to different subsystems.

The slogan goes further than the theorem, which proves nothing about any particular
pair of tasks. It still names the lesson: **the AI that folds our proteins should
not be the AI that folds our laundry.**

For Civic AI, the implication is direct. A Kami (**k**nowledge **a**rtefact **m**anagement **i**ntelligence; the word came first, the initials caught up) should be a specialist: good at one class of
community work, replaceable when its job changes, and unable to turn local
success into a universal mandate. A specialist design does not win on its own: without rules, the most autonomous and self-improving systems could outcompete specialists. Who sets those rules is a separate question. One answer is [a standing citizens' assembly for frontier AI](https://www.noemamag.com/let-the-people-decide-the-pace-of-frontier-ai/).

SAI does not solve governance either, since a specialist can still be deployed for
bad ends. It does remove one bad default, the assumption that safer or
smarter AI requires one system to do everything.

## Taniguchi: meaning by negotiation, not by decree

A third programme, less prominent in Western AI-safety debates but central to Civic AI, comes from Tadahiro Taniguchi and colleagues' _Collective Predictive Coding_ (CPC). Its 2026 _Artificial Life_ paper, _Symbiotic Alignment via Collective Predictive Coding: A Theoretical Framework for Co-Creative Human–AI Ecosystems_, which I co-authored, asks the next question after Bengio's epistemic honesty and SAI's specialisation: how should a community of specialised systems and their human counterparts negotiate the shared meanings (words, norms, categories, agreements) that make coordination possible at all?

The dominant alignment approach answers this top-down. A supervisor (a single human, a model card, a reinforcement-learning-from-human-feedback ([RLHF](https://arxiv.org/abs/2203.02155)) preference dataset) holds a privileged "ground-truth" distribution, and every other system is taught to converge on it. The paper calls this _hierarchical alignment_ and names its political cost: alignment becomes one community imposing its values on all others, the singleton condition the 6-Pack is built to refuse.

CPC offers a different formulation, _symbiotic alignment_. It treats the population of agents, humans and AIs together, as a _symbol-emergence system_. Each agent has its own internal states and its own observations of the world, and the group maintains a shared communicative variable: language, norms, categories, a Polis cluster label, a deliberation outcome. The system's total collective free energy, a single measure of how badly the agents' predictions fit the world and each other, splits into two parts:

- an **individual** part, where each agent minimises its own prediction error about the world and keeps its internal state consistent with the shared symbols
- a **collective** part that pulls the shared symbol system toward coherence across the population

The collective term is the new object. It cannot be rewritten as a sum of agent-wise terms, so it belongs to the population as a whole. A single agent acting in its own interest cannot minimise it; only the group can, through communication. In this model, that is one formal way to say why solidarity ([Pack 5](/5/)) cannot be reduced to individual virtue. That is a modelling choice, and the maths does not show that solidarity is required.

This negotiation needs no central coordinator. The paper shows that decentralised turn-taking dialogue (a speaker samples a message, a listener accepts or rejects it based on its own observation, and the group iterates) is mathematically equivalent to a _Metropolis–Hastings Naming Game_ (MHNG). That is a form of Markov Chain Monte Carlo, a standard method for approximating a hard probability calculation by taking many small, locally judged steps. Shared symbols emerge from local accept/reject exchanges in a way that provably approximates Bayesian inference over the collective posterior.

Finally, CPC describes plurality as a multimodal collective posterior. When a society is genuinely divided, the distribution has several peaks, each a locally coherent worldview, separated by high-energy "barriers" of distrust and partial observation. Bridging tools like Polis do not collapse these peaks into a single average. They search for low-energy paths between them: communicative variables that lower the barriers without erasing the modes. This is the formal counterpart of uncommon ground ([Pack 1](/1/)).

CPC is a research agenda. It gives the relational vocabulary of care a mathematical shape that engineers, regulators and procurement officers can argue about. Solidarity can be written as a non-decomposable term in an objective function. Plurality can be treated as a multimodal distribution worth preserving. Deliberation can be read as a sketch of decentralised Bayesian inference. These are theoretical correspondences. They carry no convergence guarantees in the field.

## The shared design lesson

Bengio, the SAI authors and Taniguchi are solving different problems. One is asking how
to make prediction trustworthy. Another is asking how to make capability
efficient. The third is asking how shared meaning can be negotiated. Still,
they point toward the same Civic AI shape.

- **Separate truth-tracking from speech imitation** (Bengio) — Decision traces can distinguish verified claims from reported claims.
- **Specialisation supports narrow mandates** (Goldfeder, LeCun and colleagues) — Each Kami should do one job.
- **Modular systems support federation** (Bengio + SAI authors) — Civic AI should be composable, replaceable and federated.
- **Action is the danger point** (Bengio) — Put the authorisation of tools and interventions in governance, where people can see it, and keep it out of opaque weights.
- **Non-decomposable collective regularisation** (CPC; Taniguchi et al., 2026) — Solidarity as a proposed term in the loss that no agent can minimise alone. No machine-enforceable version is in production.
- **Decentralised Bayesian inference via MHNG** (CPC) — Local Kamis with narrow jobs can build shared meaning through peer-to-peer dialogue, without handing sovereignty to a central server.
- **Multimodal collective posterior distribution** (CPC) — Plurality becomes a maths problem, and diverse worldviews can be mapped, bridged and preserved without flattening.

The strongest reading is modest: these programmes make the 6-Pack easier to implement. They cut the governance effort wasted on fighting the wrong kind of machine.

## Implementing through the 6-Pack

**Pack 1: Attentiveness.** Truthification (Bengio) helps a bridging system tell apart three things that usually get muddled together: what is verified, what is claimed, and what is contested. That makes disagreement more legible. CPC then gives the disagreement a _shape_: a polarised society is a multimodal posterior with distinct peaks, and bridging algorithms are searches for communicative variables that lower the energy barriers between those peaks without collapsing them. Neither programme says whose voices get into the data in the first place. That takes listening.

**Pack 2: Responsibility.** Bengio leaves one gap open: who decides which
questions may be asked, in which domains, for which purposes? The Engagement
Contract ([Pack 2](/2/)) fills that gap. It governs the scaffold around the
model: authorised queries, source rules, pause conditions, escrow and
adopt-or-explain duties.

**Pack 3: Competence.** Better-calibrated uncertainty makes decision traces
more honest: a trace that says "0.92 likely" should mean it. Pack 3 covers more than prediction quality, though. Sandboxing, least power, data minimalism and graduated release remain operational duties. CPC offers one further analogy. An apprentice that learns through accept/reject turn-taking with its cultivator (the Apprentice Model of shadow mode, canary and general release) can be read as approximate Bayesian inference. The analogy has a limit. In the naming game both sides take turns to propose and to judge. In apprenticeship the cultivator holds the brake. So the analogy fits the learning and says nothing about who holds the authority. Apprenticeship remains a civic practice, and the maths gives no proof that shadow-mode deployment converges in the field.

**Pack 4: Responsiveness.** A truth-tracking model gives cleaner failure
analysis: was the factual judgement wrong, was uncertainty miscalibrated or was
the harm introduced by the deployment layer? That is useful, but it is not
repair. Appeals, public repair logs and community-authored evals such as
[Weval](https://weval.org/) do the moral work of responding. They are also
how we probe the hardest case in Bengio's framework: "unknown." In CPC terms, every accepted appeal adds a sample to the collective posterior, so repair is also an update to the evidence.

**Pack 5: Solidarity.** These architectures suggest a better basis for
federation. Kamis can share provenance, schemas, eval results and verified
factual claims without flattening local context into one global authority.
Federation should move institutional knowledge and leave intimate histories where they are. Shared
facts, local judgement. CPC sharpens this: the _non-decomposable collective regularisation term_ in the symbiotic-alignment objective is a theoretical statement of what solidarity demands. It is the part of the loss function that no agent can minimise by self-interest; only the population can. It is one way to formalise solidarity. No Civic AI architecture is required to satisfy it.

**Pack 6: Symbiosis.** SAI strengthens the case for narrow jobs: specialisation is politically safer and, on well-defined tasks, can also be technically better. CPC adds that even narrowly scoped Kamis must stay in _communicative reach_ of each other and of the humans they serve. Symbol emergence is a population-level process, and a Kami that drops out of the dialogue stops contributing to shared meaning. Pack 6 still has to do the work the ML programmes leave undone: sunset, succession, anti-capture rules and non-expansion pacts. Any world-model planner, however tightly scoped, also needs agency audits, because goal-directed behaviour inside a limit can still be dangerous.

## What the substrate cannot decide

Start governance with the [human keeping questions](/kami/#before-you-start), before installation or shared uploads.

**It cannot decide standing.** A non-agentic predictor can still be used
without the consent of the people it affects. Architecture cannot grant the
affected a voice.

**It cannot decide legitimacy.** "What counts as true?", "Which sources
qualify?", and "What tasks matter?" are constitutional questions, for people to settle.

**It cannot decide pace.** Machine outputs arrive quickly. Democratic
authorisation takes time. The two-lane system of the 6-Pack exists because
responsible use requires slow guardrails around fast tools.

**It cannot decide justice.** A prediction can be accurate and still be used
cruelly. Repair, compensation and restored trust do not come from a posterior
distribution.

**It cannot prevent capture.** The same truthful specialist can serve a
democracy, a monopoly or an authoritarian state. Governance determines which.

## The Kami of Care

Put the pieces together and a plausible technical setup comes into view:

- a non-agentic, truth-tracking core
- specialist modules, each with a limited domain
- explicit governance over tools, queries and actions
- community-authored evals probing both confident answers and strategic
  silence
- end-date and handover rules so the service can continue without depending permanently on one model or one keeper

This is what I mean by a **Kami of Care**: a civic instrument that is trustworthy inside and accountable outside.

That describes a direction. Today's setup is different. The Kami on the [setup page](/kami/) runs
an ordinary open-weight model inside OpenClaw, an agent runtime, so its tools
and actions are exactly what needs explicit governance. What makes it a Kami is the instructions and notes it carries, the
permissions that limit it, and the people who keep it. Instructions alone cannot
hold a model to a limit, so the limit lives in those permissions and those people.

Of the substrates now in view, the Kami of Care is the strongest for civic deployments with clear limits. Bengio helps explain how the inside can stay honest. Goldfeder, LeCun and colleagues help explain
why the inside should stay narrow. Taniguchi's collective predictive coding helps explain how _many_ such insides can negotiate shared meaning without a master variable above them. The 6-Pack explains how that whole arrangement remains answerable to the people around it.

If the previous decade of AI research was dominated by the question _how do we align one powerful model to one fixed ground truth?_, the work assembled here points to a different question: _how do many specialised models and the communities they serve build ground truth together, again and again, in settings where people can hold them to account?_ That second question is the one the 6-Pack was always asking. A theory that can describe it changes what we can say to engineers and regulators. It gives politics terms it can stand on.

The field is getting clearer about what belongs inside a Kami. The more
important question is who gets to authorise it, limit it and retire it, and that
stays with us. That question has a literature too: Seth Lazar's [democratic duties of explanation](https://arxiv.org/abs/2208.08628) and Kate Vredenburgh's [right to explanation](https://doi.org/10.1111/jopp.12262) ask, in political philosophy's terms, who is owed an account of why a system did what it did. The [Sources](/sources/) page places this essay's substrate arguments beside them.

[no-free-lunch]: https://doi.org/10.1109/4235.585893
