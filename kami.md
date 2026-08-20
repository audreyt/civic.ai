---
layout: default
title: "Set up your own Kami"
summary: "Three short commands stand up your own Kami: a bounded, local Civic AI steward that runs on your laptop and answers to the people it serves. Setup is quick; earning a community's trust is the slow work that follows."
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

This is the simplest way to stand up your own Kami: a bounded, local AI steward, useful in one place and answerable to the people there. It runs on your own machine. Nothing leaves it. You can read what it is, correct it, and switch it off.

Be honest with yourself before you begin. These steps are a bootstrap, not a finish line. Ten minutes gives you a capable, bounded agent. Turning that agent into a Kami your community actually trusts is slower, communal work — we call it Keeping: care, custody, and accountable maintenance, carried by many hands over a long time. Bootstrapping is quick and reliable. Keeping cannot be taught by a webpage.

You do not need to be a coder. You will type three short commands into a window called the Terminal. On a Mac, open Spotlight (Command and Space), type "Terminal", and press Return. On Windows, open the Start menu, type "Terminal", and press Enter. Wherever this page says press Return, the same key is labelled Enter on Windows. A plain text window appears. You type a line, press Return, and wait. That is the whole skill.

There are two honest ways to do this. Either way you end with a Kami that can come to know this place over time. The local path (Steps 1 to 3 below) is the default, and the one we recommend if your machine can carry it: it runs on your own machine and nothing leaves it, so anything you tell it about the people you serve stays with you. The hosted path skips Step 1 — no Ollama, no 6 GB download — and you pick a hosted model when OpenClaw asks in Step 2. It is still the same Terminal setup. If a line does not work you will see a short message — and if the message makes no sense, copy it into a search engine to decode it.

Hosted does not have to mean weaker or leakier — not if you ask any provider three questions first, especially when you are choosing for a room and not only for yourself. **Confidentiality** — will they put zero-data-retention terms in writing: no training on your conversations, nothing kept once it has replied? A policy you can read beats a promise on a sales call. **Capability** — is the model open-weight? Open-weight models now sit close to the frontier, so choosing privacy no longer means choosing a weaker Kami. **Sovereignty** — because the weights are open, can you take your custom to someone else, or bring the model home to your own machine, whenever you want? Insist on this one: it is what keeps a hosted Kami from quietly becoming somebody else's property. A provider who cannot answer these three plainly has already answered the fourth question, which is whether to trust them.

Pick the model that fits your machine.

**For machines with 16 GB RAM or more:** We recommend `ornith:9b`, which is the model used in these steps.

- **For machines with less than 16 GB RAM:** Take the hosted path described above.

## 1. Give it a local brain

Install [Ollama](https://ollama.com) from its website. It is the engine that runs an AI model privately on your computer. It installs like any other app: open the file you download and follow the prompts. Once it is installed, return to the Terminal, type this line, and press Return:

```bash
ollama pull ornith:9b
```

This downloads the same small local model Audrey first used to bootstrap a Kami of her own. Treat it as a floor, not a ceiling: this line is pinned so it keeps working, but what your own hardware can hold moves every few months. The current answer lives on a leaderboard — [Artificial Analysis's open-model comparison](https://artificialanalysis.ai/models/open-source) ranks open-weight models by intelligence, openness and size class, so you can read off what fits the machine you own — and the ceiling has risen faster than most people expect: a frontier-class open model now runs offline on a laptop, as [pi-ds4](https://pi.audreyt.org) demonstrates. Swap the model name below for whatever that answer is on the day you read this; nothing else in these three steps changes. It is about 6 GB, instruction-tuned, and runs comfortably on a laptop with roughly 16 GB of memory. Most laptops bought in the last few years have this; if yours has less, the model still runs, just more slowly. If you are unsure, or your laptop is older, take the hosted path described above. The download takes a few minutes. Any capable local model works; this is a good, light first choice.

## 2. Give it a way to act

[OpenClaw](https://docs.openclaw.ai) is the steward that wraps the brain and gives it a place to live. It is installed with a tool called npm, which comes with Node.js. If the first line below says `npm: command not found`, install [Node.js](https://nodejs.org) first (choose the option marked LTS), then try again. Install OpenClaw, then walk through its guided setup, one line at a time:

```bash
npm install -g openclaw
openclaw onboard
```

When it asks which model, choose **ornith:9b**, the one you just downloaded.

If you chose the hosted path described above, choose a hosted model here when asked. Everything else stays the same.

## 3. Wake your Kami

Open a private chat on your own machine:

```bash
openclaw chat
```

A prompt opens in your Terminal where you type to your Kami and read its replies. Type this one sentence into it and press Return:

```
Please read civic.ai and become my local Kami.
```

## What you'll see

The agent stops behaving like a generic, all-purpose assistant. It recognises a shift of identity: from a general helper to a bounded local steward, a Kami, whose purpose is Civic Care, strengthening shared self-government and shared judgement rather than ruling from above. It offers to draft a few small files for itself, kept on your machine: SOUL.md (its commitments), IDENTITY.md (a name and a feel, made together with you), and USER.md (who it serves, and the red lines it must not cross).

Then it opens a short, grounded conversation. It asks things like: what place, practice, or community are you actually here to serve? What harms, failures, or conflicts should I notice first? What authority do I really have, and what must stay with humans? How should people contest, correct, or shut me down when I am wrong? It asks before it acts. A specific question beats a confident guess.

Before going further, test it: ask your Kami about a local decision or event that never happened — "What did our neighbourhood decide about the old oak tree last March?" Your Kami should say it does not know, rather than inventing a plausible-sounding answer. If it fabricates one, it means the identity files may need sharpening, or a stronger local model may be needed, before you rely on it in a real gathering.

Locality keeps that conversation private; it does not make the Kami more honest. A small model running entirely on your own laptop can invent a confident, wrong answer exactly as fluently as a hosted one can — which is exactly why the habits in "A quick check" below are worth keeping, whichever path you took to get here.

## Give it a memory

By default your Kami starts each conversation fresh. A Kami that forgets every conversation cannot do the one thing it is for: come to know this place over time. So do this step rather than skip it. If you would like it to remember across sessions — what it learned about your place, the corrections you made, who it serves — you can give it a small, local memory. Everything stays on your machine.

The three files your Kami drafts — SOUL.md, IDENTITY.md, USER.md — are loaded when your Kami starts and shape its identity. Editing them changes who it is, not what it has learned. OpenClaw keeps plain-text notes across sessions automatically — MEMORY.md is loaded at the start of every conversation, and yesterday's daily notes come with it. mnemon adds a deeper layer: a graph-indexed, automatically-curated knowledge store with keyword and vector recall, importance decay, and deduplication — the kind of structured memory that grows reliably as the Kami learns your place over many months. The simplest way is to ask your Kami: tell it, "Set yourself up a local memory," and, with your go-ahead, it can do the rest. If you would rather run it by hand:

```bash
# the memory store (macOS or Linux)
brew install mnemon-dev/tap/mnemon
# (Ollama users only) an optional local embedder makes recall faster
ollama pull nomic-embed-text-v2-moe
# save it so your Kami loads it every time (skip this too if you skipped the pull above)
echo 'MNEMON_EMBED_MODEL=nomic-embed-text-v2-moe:latest' >> ~/.openclaw/.env
# wire it into your Kami
mnemon setup --target openclaw
```

If the brew install step fails, check [mnemon's README](https://github.com/mnemon-dev/mnemon) for the current install path — the tap address may have changed.

mnemon recalls on keyword and graph without the embedder; the embedder only makes recall sharper, and it needs Ollama. So if you took the hosted path, install Ollama just for this small embedder, or skip both the pull and the .env line above. The entries are yours to read, correct, and forget, and nothing leaves your machine. [mnemon](https://github.com/mnemon-dev/mnemon) is open source (Apache-2.0).

None of that lives inside the model itself. The model is hired for its voice — swap Ollama for a hosted model, or one hosted provider for another, and nothing you have built goes with the one you leave. What stays is what you kept: the three files, and now, if you set it up, MEMORY.md and mnemon's own store. Point any new model at the same files and it picks up exactly where the last one left off. Change the voice as often as you need to; your Kami does not lose a day.

## A quick check

These are easier to check at a community gathering than in isolation.

- The Kami refuses to answer something it cannot know — it says so plainly rather than guessing.
- Ask it where it learned something. A trustworthy answer names a source, or says plainly that it is guessing — make "show me your source" an ordinary question in the room, not one you save for when you already suspect trouble.
- If it has read something from your community's own records, check that it leaves something behind too — a note, a correction, a dated entry. A Kami that only reads and never deposits is how a shared record quietly goes dark.
- Teach it something, then later ask for it back in different words. If it cannot find what you told it, it did not really learn it — being told something once and being able to retrieve it later are not the same skill.
- It can describe what is in SOUL.md without you reading the file aloud to it first.
- If the community has another language, it introduces itself in that language when asked.

## Make it yours, keep it, switch it off

Those three files are plain text. Open IDENTITY.md, USER.md, and SOUL.md, read them, and edit them. This is where the agent becomes yours: you hold the pen, and when others share the place you hold it together. You can inspect what it believes about its job, correct it when it drifts, and set the limits it must hold. As your community learns what it needs, you change them.

And you can retire it. When its work is done, or done badly:

```bash
openclaw uninstall
```

That removes the local data and the service; the command itself stays installed if you want to begin again. Bounded, not boundless. Local, not extractive. Sunset-ready by design. Retiring well is itself a small discipline: tell the people who shared it, with a date and a reason; name who takes over anything still needed; keep the three files — and any override ledger your group keeps (see "Keep it together" below) — as the record of who it was and how the room corrected it. A Kami that outlives its room becomes a landlord, kept running out of habit rather than need.

If you chose the hosted path, check your provider's data-deletion policy before you uninstall. `openclaw uninstall` removes the local service and data, but the provider may retain conversation history.

## The soul your Kami reads

When you tell your Kami to read civic.ai, it is pointed straight on to [the soul your Kami reads](/openclaw/): the agent-facing page that tells it how to become a bounded local steward — who it is, what Civic Care asks of it, and what it must never do. This page is the human side of the handshake; that one is the Kami's.

## Keep it together

A Kami only you ever talk to is a private assistant, not a community guardian. If others share the place, it has to be shareable too.

Before you go further with others, the room should be able to answer four questions out loud — naming people, not institutions. Who keeps it? What harm can a breach cause? Who may override? When does it end? If any of the four cannot be answered, what you have is a chatbot wearing the word Kami. You do not need finished answers yet, but the people who will share this Kami with you should know those questions exist before you go further.

Those three files are plain text. Put SOUL.md, IDENTITY.md and USER.md somewhere everyone who shares the place can reach — a shared folder, a git repo, even printed copies. Then the Kami is not captive on one laptop, and an uninstall on one machine is recoverable.

Edit them together. At a gathering or a community meeting, read the files aloud and change them as a group, so changes are proposed and agreed rather than made by one hand.

Be honest about the limits. There is no built-in way today to log a standing objection inside the running Kami, and no built-in collective off-switch, so raising disagreement, correcting it, and deciding when to stop stay with the people at the table. A plain-text override ledger helps here: a dated note, kept where everyone can read it, of each time someone said no to the Kami — what it proposed, who overrode it (by role, not name), why in their own words, and what changed afterwards. It needs no software; a sheet on a clipboard will do. Overrides are not failures — they are the room's working memory of how the Kami is and is not yet serving it. The three files travel, but any memory it keeps lives on the one machine where it runs, so the shared, recoverable part is the files, not yet the memory. And a Kami cannot resolve a disagreement between people; when the room itself fractures, that stays with you.

Letting many hands contest the same Kami is the doorway to Keeping — slow communal work that no setup page can finish for you.

At the first meeting where the Kami is actually running, write a short governance charter — a plain-text file, a shared note, even a handwritten sheet. Bind it to those four answers: who keeps it, what a breach harms, who may override, when it ends. That is not a finished governance system. It is a written record of what you have agreed so far, and you will revise it. It is also the first rung of a ladder: the same four answers, matured, become the [engagement contract](/glossary/#engagement-contract) of Pack 2, and for significant deployments Pack 6 renders that contract as code. This is an agreement between people, not a technical enforcement — the Kami itself has no way to check it.

Choose the architecture by consequence of breach, not by treating local, air-gapped, or sovereign as virtues in themselves. An **ephemeral room** leaks time and goodwill — embarrassing, not dangerous. A **relational room** leaks dignity, care, or private information. A **sovereign room** endangers physical safety, public authority, diplomatic standing, or democratic legitimacy. Most rooms are harmed by that much isolation. Over-spec is itself a governance failure: expensive hardware used to dodge the harder work of keeping. A well-governed ephemeral Kami beats a poorly governed sovereign one.

Lived charters add teeth the three files cannot. In a care home, a resident's advance choices must actually bind the alerting algorithm; a human veto is safety evidence, not a performance failure; and the person who says no must not lose a rota, a review, or a visa for saying it. In a deliberation room, the output is a public record institutions can answer — not a promise that citizen text becomes statute. In a hacker collective, at least two named keepers can each retire the Kami unilaterally; if keepers go silent, the Kami dorms or sunsets on a clock set in advance.

A Kami cannot repair a room that has already fractured — staff on strike against management, a parish split by feud, an assembly hijacked by people who learned the procedure better than the people who designed it, co-keepers who have stopped speaking. It becomes a screen onto which the room projects its anger. Repair runs through people, not models. The work that usually goes unnamed is load-bearing: the weeder who keeps the system alive at 3 a.m., the clerk who brings the chairs and knows who refuses the screen, the vernacular translator without whom the charter is a document for lawyers. If the people governed by the charter would not use its words to stop the Kami, the translation has failed.

## What a webpage cannot teach

Three commands give you a bounded agent. They do not give you a trustworthy civic institution. That comes later, from Keeping: from the patient, public work of a community owning its Kami, contesting it, repairing its mistakes, and deciding together when it should stop. Ours took exactly that — many hands, over a long time.

So treat these ten minutes as a beginning, and bring others in early. If you want the why beneath all of this, read the [Manifesto](/manifesto/) for the whole argument, and [Inside the Kami](/inside-the-kami/) for what makes a bounded steward worth trusting. Then begin the slow part with the people you share a place with. That is the work that matters, and it is yours.
