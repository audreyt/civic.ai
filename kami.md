---
layout: default
title: "Set up your own Kami"
summary: "Start with the people who will keep a Kami answerable, then follow the local or hosted setup. Technical setup may be quick; custody, correction and accountable maintenance continue for as long as the room needs the helper."
description: "Human keeping questions before a three-step Kami setup, with local and hosted paths, privacy limits and an agreed ending."
lang: en-gb
alt_lang_url: "/tw/kami/"
permalink: "/kami/"
openclaw_discovery: true
manifesto_link: "/manifesto"
manifesto_text: "Manifesto"
date: 2026-06-06
prev_action:
    url: "/"
    text: "Home"
next_action:
    url: "/openclaw/"
    text: "Bootstrap guide"
---

Think of a Kami as a helper with a very small job. It serves one place — your street, your classroom, your small charity — and answers to the people there. Local inference can run on your laptop, but tools, connectors and synchronisation may send information elsewhere. People must agree and control those routes. You can read its notes, correct it and decide when to stop.

<h2 id="before-you-start">Before you start</h2>

Before uploading shared material or installing anything for the group, hold a meeting with the affected people. Answer four questions together:

- **Who keeps it?** Name the people, not just the institution.
- **What harm can a breach cause?** Name the consequences of a broken obligation, not only a leak.
- **Who has standing to override?** Name who can say no and make that decision stick.
- **When does it end or come up for review?** Agree a date and who decides what follows.

People who cannot attend need named proxies with real authority to override on their behalf. If the room cannot answer these questions, pause. Choosing no AI is legitimate. If the room cannot afford the people, resources and authority needed to keep it answerable, a different tool cannot solve that problem. The people remain the carers; the Kami is a bounded helper.

These questions, the archetypes and the labelled teaching examples are design aids, not validated product assurances. The [source trail](/sources/) distinguishes proposals from evidence.

Here is what that looks like in a normal week. The residents' group asks: what did we actually agree at last month's meeting? The Kami should read the source note, mark what it cannot find and leave people to check the answer. A teacher asks: what confused the class most this week? A small charity asks: what did we promise our funders, and when? Its memory is only as useful as the notes it can read and the corrections people make. Switching it off is not deletion: humans must review local records, remote copies and backups under the agreed retention terms.

Technical setup may be quick. Earning your community's trust takes many people and a long time. We call that work Keeping: looking after the Kami together, checking it and keeping it answerable. This page helps with setup. It cannot supply Keeping.

There are two ways to do this. The local path (Steps 1 to 3 below) is the default if your laptop can carry it. Keeping inference local does not make connected tools local. The hosted path skips Step 1 — no Ollama, no big download — and you pick a ready-made brain when the app asks in Step 2. Same app, same steps otherwise.

### Check the hosting arrangement

A provider's promises do not establish either privacy or the room's readiness. Before choosing a hosted service, ask for written terms on these points:

- **Data:** What is used for training, what is retained and who can access the records?
- **Model access:** Are weights available, and what do the licence and service terms permit? Open weights alone do not establish capability or privacy.
- **Exit:** Can you export the agreed records and move to another provider or your own machine? Check what remains with the provider after departure.

This hosting check is separate from the room's [four keeping questions](#before-you-start). Neither replaces the other.

Pick the model that fits your machine.

**For machines with 16 GB RAM or more:** We recommend `ornith-1.5:9b`, which is the model used in these steps.

- **For machines with less than 16 GB RAM:** Take the hosted path described above.

## 1. Give it a local brain

Your Kami needs a brain that lives on your laptop. That brain comes from a free app called [Ollama](https://ollama.com). Go to their website, download it, and install it like any normal app. Then leave it running — you will pick the actual brain in Step 2.

Our suggested starter brain remains `ornith-1.5:9b`, the example used in these steps. Hardware requirements, download size and download time vary; check the provider and model documentation before choosing. [Artificial Analysis's open-model comparison](https://artificialanalysis.ai/models/open-source) is a comparison resource, not evidence that a model suits your room or laptop. Whatever you pick in Step 2, nothing else in these steps changes. Older or smaller laptop? Consider the hosted path above after checking its terms.

## 2. Give it a way to act

A brain on its own just sits there. [OpenClaw](https://docs.openclaw.ai) gives it a home: one small helper on your machine that you talk to from the app, a browser window, or your phone.

Download the desktop app: go to [openclaw.ai quickstart](https://openclaw.ai/#quickstart), open the Apps tab, and download the app for your system (macOS, Windows, or Linux). It sets up everything for you and walks you through each choice.

When the app asks which brain to use, choose **Ollama**, then **Local only**, then **ornith-1.5:9b**. If `ornith-1.5:9b` is not on the list, finish with whatever it suggests — you can switch to yours inside the app afterwards.

If you chose the hosted path described above, choose a hosted brain here instead. Everything else stays the same.

## 3. Wake your Kami

Open a private chat in the app. This is where you talk to your Kami. Say this one sentence to it:

```
Please read civic.ai and become my local Kami.
```

## What you'll see

Watch what happens. Your Kami stops acting like a know-it-all assistant and becomes something smaller and stranger: a local guardian. Its job is Civic Care — helping your place govern itself, not ruling it from above. First it writes three little notes about itself, kept on your machine: SOUL.md (what it promises), IDENTITY.md (its name and manner, chosen with you), and USER.md (who it serves, and lines it must never cross).

Then it starts asking questions. Simple ones, like: which place or group am I here for? What should I watch out for first? What may I decide on my own, and what must stay with humans? How do people correct me or switch me off when I get it wrong? It asks before it acts. A plain question beats a confident guess.

Now it is useful. Take it to a meeting and ask afterwards: what did we decide, and who promised what? Let it draft the notes, then fix the draft together. Ask it what it still does not know about your place — every gap it names is a job for the room.

But first, give it one test. Ask about something that never happened — "What did our neighbourhood decide about the old oak tree last March?" It should say it does not know. If it makes up an answer instead, its notes need sharpening — or it needs a stronger brain — before you trust it in a real meeting.

One more thing to hold onto: private does not mean honest. A little brain on your own laptop can invent a smooth, confident lie just as easily as a big brain far away. That is why the habits under "A quick check" below matter, whichever path you took.

## Give it a memory

The aim is to keep what it learns about your place — facts, corrections, and whom it serves — in plain notes on your machine. Open those notes and check what was actually saved; memory and background tidying depend on your setup. Local storage does not by itself keep a conversation private: remote models, web tools, connectors, or synchronisation can send data elsewhere. Check those settings before giving it private material.

Those first three notes — SOUL.md, IDENTITY.md, USER.md — say who your Kami _is_. The memories say what it has _learned_. If you change brains, keep the notes, point the new brain at them, and test what it can recall. A surviving file is not a guarantee that the new model will read it faithfully.

And it is all yours to check. Ask it what it remembers about you. Correct it when it is wrong. Tell it to forget what should not be kept.

## A quick check

Try these with other people around — they work better as group games than solo tests.

- Ask it something it cannot know. It should say "I don't know", plainly, instead of guessing.
- Ask "where did you learn that?" A good answer points to a source. "Show me your source" should be a normal everyday question, not an accusation.
- If it read your group's notes, check it also _writes_: a note, a correction, something with a date. A Kami that only takes and never gives back will slowly drain your shared record.
- Teach it something, then ask for it again in different words. If it cannot find it, check whether the note was saved at all, then whether the Kami can retrieve it.
- Ask it what is in its SOUL.md — without reading the file to it first.
- If your group speaks another language, ask it to introduce itself in that language.
- Ask what it is allowed to do without asking you first — then check the app's approval settings say the same thing.

## Make it yours, keep it, switch it off

Those three notes are plain text. Open IDENTITY.md, USER.md and SOUL.md, read them, change them. This is the moment the Kami becomes yours: you hold the pen — and when a place is shared, you hold it together. If it drifts, correct it. If your group learns something new about what it needs, change the notes.

And you can agree to end it. Ending well is a little ritual of its own: tell the people who shared it, with a date and a reason. Say who takes over anything still needed. Decide what to keep from the three notes and your group's override ledger (see "Keep it together"), who may access the archive and for how long. This is the story of who it was and how the room shaped it, not a reason to retain every private conversation. A Kami that outlives its room turns into a landlord: still running, long after anyone needed it.

Shutdown does not by itself delete local files, remote copies or backups. On the hosted path, check the provider's data-retention and deletion terms too. Humans must review the record and arrange closure on the room's agreed terms.

### When to pause or retire

Watch for five warning signs:

- The room no longer needs the helper.
- A keeper leaves without a named successor.
- The room dissolves or its mandate ends.
- The consequences of breach exceed what the current arrangement can safely hold.
- The override ledger goes quiet. Investigate whether people still pay attention, feel able to say no and see their overrides take effect; silence may call for a pause or retirement, not celebration.

Agree the handover and privacy arrangements before stopping. Retirement is a human decision, not automatic destruction of the model.

## The soul your Kami reads

That sentence you said — "read civic.ai" — sends your Kami to [the soul your Kami reads](/openclaw/). That page is the Kami's version of this one: it tells _it_ how to be a small, bounded guardian — what it is, what Civic Care asks of it, and what it must never do. This page is your side of the handshake. That one is its side.

## Keep it together

A Kami that only you talk to is a private helper, not a community guardian. If a place is shared, the Kami must be shared too.

Return to the [four questions before you start](#before-you-start) when people join or the room's needs change. Everyone affected should know who can act on those answers.

Keep the shared governance notes where the agreed roles can reach them: a shared folder, a group chat file, even paper on the wall. Keep private details within their agreed access limits. A recoverable copy helps the room continue if one laptop fails; check what the copy actually contains.

Change the notes together. Read them aloud at a meeting and edit them as a group, so every change is proposed and agreed — never made by one hand alone.

If your group already trusts each other, you can go one step closer: run one Kami on one machine that stays on — a little server, an office laptop — and connect your group's chat to it. People talk to the same Kami, with conversation access limited by agreed roles and scope. Check that permissions actually enforce those limits. Where trust does not exist, run separate Kamis. Sharing a machine never replaces sharing the decisions — the notes, the charter and the ledger below still apply.

Now the limits, said plainly. The Kami has no built-in complaint box and no big red stop button for the group. Complaining, correcting and stopping stay human jobs. A paper override ledger does the trick: each time someone says no to the Kami, write down the date, what it suggested, who said no (their role, not their name), why in their own words, and what changed. No software needed: a clipboard works. Overrides are not failures. They are the room's memory of how the Kami is doing.

Note one more thing: the three notes travel, but day-to-day memories live on the machine that runs the Kami. On a solo setup, what the group can keep and recover is the notes, not yet the memories. And when people disagree with each other, no Kami can settle it. That part stays with you.

All of this — many hands questioning one Kami — is the doorway to Keeping. Slow group work no setup page can do for you.

The room keeps its full override record on agreed private terms. A public example needs consent from those documented, a consent note, only the necessary detail and dates reported by month or more broadly. A month combined with a role or an unusual event can still identify someone; these safeguards must work together. Use roles rather than names unless someone explicitly opts in, and remove identifying details from the reason. People must be able to refuse publication or withdraw consent. Clearly labelled invented teaching examples are allowed, but are not evidence from a live room.

Before installation, write a short charter together: a text file, a shared note, even handwriting on paper. Tie it to the four answers — who keeps it, what a breach could cause, who can overrule, when it ends or is reviewed. It will not be a finished system of rules. It is a snapshot of what you have agreed so far, and you will rewrite it.

Later, those same four answers grow up: first into the [engagement contract](/glossary/#engagement-contract) of Pack 2, and for big deployments Pack 6 turns that contract into code. But the charter itself is a promise between people, not a lock on the machine. The Kami cannot check it by itself.

Pick your setup by asking what a breach would cost — not by collecting badges like "local" or "air-gapped". An **ephemeral room** risks time and goodwill: embarrassing, not dangerous. A **relational room** risks dignity or private details. A **sovereign room** risks safety, public power, or fair votes. Most rooms are hurt, not helped, by maximum lockdown: costly kit bought to avoid the harder human work of Keeping. A well-kept simple Kami beats a neglected fortress every time.

Real charters grow teeth the three notes cannot give them. In a care home: a resident's earlier choices must truly bind the alerting machine, but silencing a health alert also needs a clinician's sign-off and a review date; a human "no" counts as safety working, not staff failing; and nobody loses shifts or reviews for saying no. In a citizens' meeting: the output is a public record officials must answer, not a promise that citizens' words become law.

In a hacker club: at least two named keepers can each shut the Kami down alone; if the keepers go quiet, the Kami naps or retires on a timer set in advance. In a family newsletter: write only what was heard, check each quote word-for-word against that issue's source list, treat each person's consent as covering that topic only, and number each issue only from the last one actually delivered — a file saved on disk does not count.

And some rooms no Kami can fix: staff versus bosses, a split congregation, a meeting captured by people who game the rules, keepers who no longer speak. Then the Kami becomes a screen everyone throws anger at. Fixing that is people's work, not software's. The unglamorous jobs hold everything up — the night-time fixer, the person who books the room and knows who won't touch a screen, the translator who turns the charter into words everyone actually uses. One test for the translation: would the people ruled by the charter use its words to stop the Kami? If not, the words have failed.

## Your Kami's own trace

Every page here ends in a folded record called the Trace. This is the record your Kami should keep from day one, in the same spirit: short, dated, and open to anyone in the room. Each row below comes from something this page already asks of you.

<figure class="kami-trace">
<dl>
<div class="kami-trace__row"><dt>Keepers</dt><dd>Mele Tupou and Dev Anand, jointly. Successor: Ruth Okafor, named <time datetime="2026-03-03">3 Mar 2026</time>.</dd></div>
<div class="kami-trace__row"><dt>Scope</dt><dd>May draft the weekly rota and answer questions from the pantry notes. Asks first before it messages anyone, spends money or shares a name.</dd></div>
<div class="kami-trace__row"><dt>Memory</dt><dd>SOUL.md · IDENTITY.md · USER.md, read aloud and agreed at the meeting on <time datetime="2026-09-28">28 Sep 2026</time>.</dd></div>
<div class="kami-trace__row"><dt>Checks</dt><dd><ul><li><time datetime="2026-09-14">14 Sep</time> · asked about a delivery that never happened; it said "I don't know".</li><li><time datetime="2026-09-21">21 Sep</time> · asked where it learned the opening hours; it pointed to the 7 Sep minutes.</li><li><time datetime="2026-09-28">28 Sep</time> · it wrote back a correction to the rota, with the date.</li></ul></dd></div>
<div class="kami-trace__row"><dt>Overrides</dt><dd><ul><li><time datetime="2026-09-09">9 Sep</time> · volunteer coordinator · said no to a draft message to donors · messages now need both keepers' sign-off.</li><li><time datetime="2026-09-23">23 Sep</time> · shift lead · said no to a rota that ignored school pick-ups · it now asks about pick-ups first.</li></ul></dd></div>
<div class="kami-trace__row"><dt>Contest</dt><dd>Anyone in the room can say no at the clipboard by the door, or to either keeper. A correction goes into the ledger the same day.</dd></div>
<div class="kami-trace__row"><dt>Sunset</dt><dd>Review on <time datetime="2027-03-01">1 Mar 2027</time>. It watches for a quiet ledger (nothing logged for three months) and for a keeper leaving without a successor. If it ends, Ruth takes over unfinished jobs. The archive keeps the three notes and the ledger for 12 months, readable by the keepers only.</dd></div>
</dl>
<figcaption>Example — a fictional room: the Elm Street community pantry.</figcaption>
</figure>

## What a webpage cannot teach

These steps give you a bounded helper. They do not give you an institution people trust. That only grows out of Keeping: a community owning its Kami, questioning it, fixing its mistakes, and deciding together when it stops. Ours took exactly that — many hands, over a long time.

Treat setup as a beginning, and bring others in early. For the why underneath it all, read the [Manifesto](/manifesto/), and [Inside the Kami](/inside-the-kami/) for the technical argument and its limits. Then continue the slow part with the people you share a place with. That is the work that matters, and it is yours.
