---
layout: default
title: "Set up your own Kami"
summary: "A short app setup stands up your own Kami: a bounded, local Civic AI steward that runs on your laptop and answers to the people it serves. Setup is quick; earning a community's trust is the slow work that follows."
description: "The simplest way to run your own Kami: a bounded, local, private Civic AI steward on your own laptop, in three steps."
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

Think of a Kami as a helper with a very small job. It looks after one place — your street, your classroom, your small charity — and answers to the people there. It lives on your own laptop. Nothing it hears ever leaves your laptop. You can read its notes, correct it, and switch it off whenever you like.

Here is what that looks like in a normal week. The residents' group asks: what did we actually agree at last month's meeting? The Kami reads back the note — it does not guess. A teacher asks: what confused the class most this week? A small charity asks: what did we promise our funders, and when? Each time it answers like a careful neighbour with a perfect memory. No account. No subscription. And the day you switch it off, it forgets everything.

One honest warning before you start. These steps are the easy part: ten minutes gives you a working Kami. The hard part comes after — earning your community's trust. That takes many people and a long time. We call that work Keeping: looking after the Kami together, checking it, and keeping it answerable. This page can start a Kami. It cannot teach Keeping.

There are two ways to do this, and both end with a Kami that slowly gets to know your place. The local path (Steps 1 to 3 below) is the default. Pick it if your laptop can carry it: everything stays on your machine, so nothing you tell it about your people ever leaves you. The hosted path skips Step 1 — no Ollama, no big download — and you pick a ready-made brain when the app asks in Step 2. Same app, same steps otherwise.

Hosted is not automatically worse or leakier. It is safe if the company behind it gives you three straight answers. Ask them before you choose — especially when you are choosing for a whole room, not just yourself. **1. Secrets** — will they promise in writing that your words are never used for training and never kept after they reply? A written rule beats a spoken promise. **2. Strength** — is the brain open-weight? Open brains are now almost as clever as the best closed ones, so private no longer means weak. **3. Freedom** — since the brain is open, can you move your Kami to someone else, or bring it home to your own laptop, whenever you like? Insist on this one: it is what stops your Kami quietly becoming somebody else's property. A company that cannot answer these three has already answered a fourth question: whether to trust them.

Pick the model that fits your machine.

**For machines with 16 GB RAM or more:** We recommend `ornith:9b`, which is the model used in these steps.

- **For machines with less than 16 GB RAM:** Take the hosted path described above.

## 1. Give it a local brain

Your Kami needs a brain that lives on your laptop. That brain comes from a free app called [Ollama](https://ollama.com). Go to their website, download it, and install it like any normal app. Then leave it running — you will pick the actual brain in Step 2.

Our suggested starter brain is `ornith:9b` — the same one Audrey used for her very first Kami. Think of it as the floor, not the ceiling: small enough to work on most laptops, while bigger brains arrive every few months. If you want the newest answer for your machine, check [Artificial Analysis's open-model comparison](https://artificialanalysis.ai/models/open-source), which ranks open brains by cleverness and size — even the very cleverest can now run on a laptop, as [pi-ds4](https://pi.audreyt.org) shows. Whatever you pick in Step 2, nothing else in these steps changes. `ornith:9b` is about a 6 GB download and is happy on a laptop with roughly 16 GB of memory — which most laptops from the last few years have. Older or smaller laptop? Take the hosted path above. The download takes a few minutes.

## 2. Give it a way to act

A brain on its own just sits there. [OpenClaw](https://docs.openclaw.ai) gives it a home: one small helper on your machine that you talk to from the app, a browser window, or your phone.

Download the desktop app: go to [openclaw.ai quickstart](https://openclaw.ai/#quickstart), open the Apps tab, and download the app for your system (macOS, Windows, or Linux). It sets up everything for you and walks you through each choice.

When the app asks which brain to use, choose **Ollama**, then **Local only**, then **ornith:9b**. If `ornith:9b` is not on the list, finish with whatever it suggests — you can switch to yours inside the app afterwards.

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

Good news: there is nothing to set up here. Your Kami remembers you on its own.

Everything it learns about your place — the facts, the corrections, who it serves — it writes down in plain notes on your machine, and reads them again each time you talk. In the background it tidies those notes: the day's scribbles get sorted, whatever mattered is kept in a long-term note (MEMORY.md), and a dream diary keeps a readable record of each tidy-up. Nothing leaves your laptop.

Those first three notes — SOUL.md, IDENTITY.md, USER.md — are different: they say who your Kami _is_. The memories say what it has _learned_. If you ever change brains, the memories stay: point the new brain at the same notes and it carries on where the last one stopped. You can swap voices as often as you like; your Kami never loses a day.

And it is all yours to check. Ask it what it remembers about you. Correct it when it is wrong. Tell it to forget what should not be kept.

## A quick check

Try these with other people around — they work better as group games than solo tests.

- Ask it something it cannot know. It should say "I don't know", plainly, instead of guessing.
- Ask "where did you learn that?" A good answer points to a source. "Show me your source" should be a normal everyday question, not an accusation.
- If it read your group's notes, check it also _writes_: a note, a correction, something with a date. A Kami that only takes and never gives back will slowly drain your shared record.
- Teach it something, then ask for it again in different words. If it cannot find it, it never really learned it.
- Ask it what is in its SOUL.md — without reading the file to it first.
- If your group speaks another language, ask it to introduce itself in that language.
- Ask what it is allowed to do without asking you first — then check the app's approval settings say the same thing.

## Make it yours, keep it, switch it off

Those three notes are plain text. Open IDENTITY.md, USER.md and SOUL.md, read them, change them. This is the moment the Kami becomes yours: you hold the pen — and when a place is shared, you hold it together. If it drifts, correct it. If your group learns something new about what it needs, change the notes.

And you can always end it. When its work is done — or done badly — use the app's backup option to keep a copy of everything (the record described below), then use its uninstall option to remove it from your machine. Small on purpose. Local on purpose. Built to be switched off. Ending well is a little ritual of its own: tell the people who shared it, with a date and a reason. Say who takes over anything still needed. Keep the three notes — plus your group's override ledger (see "Keep it together") — as the story of who it was and how the room shaped it. A Kami that outlives its room turns into a landlord: still running, long after anyone needed it.

Hosted path? Check your provider's delete-my-data policy before you uninstall. Uninstalling clears your machine, but the provider may still hold copies of your chats.

## The soul your Kami reads

That sentence you said — "read civic.ai" — sends your Kami to [the soul your Kami reads](/openclaw/). That page is the Kami's version of this one: it tells _it_ how to be a small, bounded guardian — what it is, what Civic Care asks of it, and what it must never do. This page is your side of the handshake. That one is its side.

## Keep it together

A Kami that only you talk to is a private helper, not a community guardian. If a place is shared, the Kami must be shared too.

Before you bring others in, gather the room and answer four questions out loud — with people's names attached, not organisations. Who looks after it? If it leaks, who gets hurt? Who can overrule it? When does it end? If you cannot answer even one, you do not have a Kami yet — you have a chatbot wearing the name. Rough answers are fine. But everyone sharing it should know the questions before you go further.

Keep the three notes where everyone can reach them: a shared folder, a group chat file, even paper on the wall. Then the Kami is not locked inside one laptop, and if that laptop dies, nothing is lost.

Change the notes together. Read them aloud at a meeting and edit them as a group, so every change is proposed and agreed — never made by one hand alone.

If your group already trusts each other, you can go one step closer: run one Kami on one machine that stays on — a little server, an office laptop — and connect your group's chat to it. Everyone talks to the same Kami, sees the same conversations, and has a role that limits what they may do. Only do this where trust already exists: anyone who can message the Kami shares its power. Where trust does not exist, run separate Kamis. Sharing a machine never replaces sharing the decisions — the notes, the charter and the ledger below still apply.

Now the limits, said plainly. The Kami has no built-in complaint box and no big red stop button for the group. Complaining, correcting and stopping stay human jobs. A paper override ledger does the trick: each time someone says no to the Kami, write down the date, what it suggested, who said no (their role, not their name), why in their own words, and what changed. No software needed — a clipboard works. Overrides are not failures. They are the room's memory of how the Kami is doing. Note one more thing: the three notes travel, but day-to-day memories live on the machine that runs the Kami. On a solo setup, what the group can keep and recover is the notes — not yet the memories. And when people disagree with each other, no Kami can settle it. That part stays with you.

All of this — many hands questioning one Kami — is the doorway to Keeping. Slow group work no setup page can do for you.

At the first meeting where the Kami is actually running, write a short charter together: a text file, a shared note, even handwriting on paper. Tie it to the four answers — who keeps it, who a leak harms, who can overrule, when it ends. It will not be a finished system of rules. It is a snapshot of what you have agreed so far, and you will rewrite it. Later, those same four answers grow up: first into the [engagement contract](/glossary/#engagement-contract) of Pack 2, and for big deployments Pack 6 turns that contract into code. But the charter itself is a promise between people, not a lock on the machine — the Kami cannot check it by itself.

Pick your setup by asking what a leak would cost — not by collecting badges like "local" or "air-gapped". An **ephemeral room** leaks time and goodwill: embarrassing, not dangerous. A **relational room** leaks dignity or private details. A **sovereign room** risks safety, public power, or fair votes. Most rooms are hurt, not helped, by maximum lockdown: costly kit bought to avoid the harder human work of Keeping. A well-kept simple Kami beats a neglected fortress every time.

Real charters grow teeth the three notes cannot give them. In a care home: a resident's earlier choices must truly bind the alerting machine; a human "no" counts as safety working, not staff failing; and nobody loses shifts or reviews for saying no. In a citizens' meeting: the output is a public record officials must answer — not a promise that citizens' words become law. In a hacker club: at least two named keepers can each shut the Kami down alone; if the keepers go quiet, the Kami naps or retires on a timer set in advance.

And some rooms no Kami can fix: staff versus bosses, a split congregation, a meeting captured by people who game the rules, keepers who no longer speak. Then the Kami becomes a screen everyone throws anger at. Fixing that is people's work, not software's. The unglamorous jobs hold everything up — the night-time fixer, the person who books the room and knows who won't touch a screen, the translator who turns the charter into words everyone actually uses. One test for the translation: would the people ruled by the charter use its words to stop the Kami? If not, the words have failed.

## What a webpage cannot teach

These steps give you a bounded helper. They do not give you an institution people trust. That only grows out of Keeping: a community owning its Kami, questioning it, fixing its mistakes, and deciding together when it stops. Ours took exactly that — many hands, over a long time.

So treat these ten minutes as a beginning, and bring others in early. For the why underneath it all, read the [Manifesto](/manifesto/), and [Inside the Kami](/inside-the-kami/) for what makes a small guardian worth trusting. Then start the slow part with the people you share a place with. That is the work that matters, and it is yours.
