# Incipit

**The research brain that grows with every document you feed it.**

Incipit is an AI-powered archival research assistant for historians. It turns messy fieldwork scans — degraded microfiche, century-old newsprint, handwritten letters, multilingual documents — into a persistent, searchable, relationship-aware personal research archive.

The name comes from manuscript studies: an *incipit* is the opening words of a text, used to identify documents before titles existed. Incipit gives unnamed documents an identity.

**Live at [incipit.dev](https://www.incipit.dev)**

---

## The Problem

Academic historical research depends on primary source documents: newspaper scans, handwritten letters, government records, photographs of archival pages. The workflow for handling these documents is fundamentally broken.

You scan 60 documents in a day and they all come out as `IMG_0047.pdf`. OCR mangles degraded text. Metadata lives in the researcher's head. Connections between documents across different archives and countries are tracked on sticky notes — or not at all. Citations are formatted by hand. And the hunch you had in an archive in Lima about a document you saw in New York? Gone the moment you walked out the door.

Before building Incipit, I used Claude Code to organize my own research archive — 15,000 files trimmed to 6,337 after deduplication and cleanup. AI solved the grunt work. But I still ended up with a folder-based metadata system that couldn't be searched, cross-referenced, or queried. The research problem remained unsolved.

Existing AI tools let you "chat with your documents." That's a feature, not a product. Chat doesn't remember yesterday. Chat doesn't build a growing archive where document 201 is checked against the previous 200. Chat doesn't capture your research intuition and turn it into a standing query that activates six months later when you upload the right document.

## What Incipit Does

### Research Context Onboarding

Tell Incipit what your research is about in plain language. It asks clarifying questions to understand your topic, time period, goals, and audience. This research profile shapes everything the system does: every extraction, every connection, every flag.

### Document Ingestion with Opus 4.7

Upload a scan. Opus 4.7 reads the actual image — not a broken OCR text layer — and extracts structured metadata: publication name, date, title, author, entities, language, full text. Each field gets a confidence score. Degraded 1920s microfiche in Spanish? Multi-column layouts with period typography? Handwritten marginalia? Opus 4.7 reads what OCR cannot.

### Historian Confirmation & Trust Tiers

Before metadata is committed, you review and correct it. Verified fields are marked T1. High-confidence unconfirmed fields stay at T2. Uncertain fields are flagged T3. In academic research, a wrong date or attribution can end a career. Incipit never guesses silently.

### Provenance Tracking

Every document records where it came from, how you got it, when you found it, and the original filename or catalog reference. Set it once per batch so you're not repeating yourself for every file.

### Metadata Changelog

The original filename is preserved permanently. Every change is logged. That gibberish filename `S-1301-0000-2317`? It's a UN catalog reference you'll need later.

### Research Notes as Standing Queries

At upload time, write a plain-language note: *"I think this connects to something I saw at the UN archives about Tacna-Arica."* That note becomes a live query. When a matching document is uploaded weeks later, Incipit surfaces the connection — not just from entity matching, but from your own recorded intuition.

### Cross-Document Connection Surfacing

When a new document enters the archive, Opus 4.7 compares it against everything already there — entities, dates, themes — informed by your research context and your notes. It flags meaningful connections with historical reasoning, not just raw keyword matches. A Bolivian newspaper and a Puerto Rican letter from a different decade, linked through the same anti-imperialist network? Incipit finds it and explains why it matters to your research.

### Outside-Current-Research Tagging

Incipit recognizes when a document doesn't fit your stated research. Instead of burying it in the main archive, it asks if you want to save it to a side collection with a note about what it could become. Your future research threads, preserved with context.

### Citation Generator

Chicago/Turabian citations generated automatically from confirmed metadata. Copy-paste ready. If a field is uncertain, the citation reflects that. Never fabricates.

### Natural Language Search

"Show me everything mentioning Vasconcelos" works across your entire archive regardless of collection, country, or language.

## How Opus 4.7 Powers Incipit

Incipit doesn't just use Opus 4.7 as a build tool — it runs on Opus 4.7 as the core intelligence layer. Every feature depends on it:

- **Vision extraction** reads degraded historical documents that defeat traditional OCR
- **Entity analysis** identifies people, places, organizations, and events in context
- **Connection surfacing** finds substantive historical relationships across documents, informed by the researcher's own goals and intuition
- **Standing query matching** compares new uploads against the historian's recorded hunches
- **Research context interpretation** shapes every extraction and analysis around what the historian is actually studying

All code was directed through Claude Code with Opus 4.7.

## Why This Isn't "Just a Claude Wrapper"

Claude can read a single document. Incipit builds a research brain that compounds over time.

What a chat window cannot do:

- Maintain a persistent, growing archive where every new document is checked against all previous ones
- Store research notes as standing queries that activate against future uploads
- Track confidence scores and verification status across fields
- Preserve provenance and metadata changelogs
- Shape its analysis around a historian's specific research context
- Recognize when a document falls outside the current research frame
- Serve a non-technical user who will never open a terminal

## Who Built This

**Louis Kunasek** — Solo builder. Not a software engineer. Completed all coursework for a PhD in History at the University of Puerto Rico, Río Piedras. Conducted firsthand archival research across eight countries in Latin America. Holds a researcher credential from the Archivo General de la Nación in Lima, Peru. US Army combat veteran (Iraq 2003–2004).

Every feature in Incipit comes from years of direct experience in archives. This is the tool I needed and nobody had built.

## Demo Documents

Incipit is demonstrated with real primary source documents from my personal research archive:

- **El Nacionalista** (Ponce, Puerto Rico, 1924–1930) — 90+ nationalist newspaper articles scanned from microfiche. Degraded quality, multi-column layouts, period Spanish typography.
- **Mariátegui/Peru correspondence** — Letters between Puerto Rican intellectuals and José Carlos Mariátegui's network in Peru. Shares entities and themes with the Nacionalista articles but from a completely different country and archive.
- **CIA/FBI files, UN archives, Bolivian press** — Additional documents in English, Spanish, and French across multiple formats.

## Stack

- **Next.js 14** App Router
- **Supabase** — Postgres, Row Level Security, file storage, Google & Apple OAuth
- **Claude API with Opus 4.7** — Vision extraction, entity analysis, connection surfacing, research context interpretation
- **Vercel** — Production deployment at [incipit.dev](https://www.incipit.dev)

## Getting Started

1. Clone the repo
2. Create a Supabase project and run the migrations in `supabase/migrations/`
3. Configure Google OAuth (and optionally Apple) in your Supabase dashboard
4. Get an Anthropic API key with Opus 4.7 access
5. Copy `.env.local.example` to `.env.local` and fill in your keys
6. `npm install && npm run dev`

---

## Screenshots

<p>
  <img src="public/screenshots/landing-hero.png" alt="Incipit landing page" width="400">
  <img src="public/screenshots/how-it-works.png" alt="How It Works page" width="400">
</p>
<p>
  <img src="public/screenshots/about.png" alt="About page" width="400">
  <img src="public/screenshots/signin.png" alt="Sign in page" width="400">
</p>

*Built for the [Built with Opus 4.7](https://cerebralvalley.ai/e/built-with-4-7-hackathon) hackathon — Cerebral Valley & Anthropic, April 21–26, 2026.*
