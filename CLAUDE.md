# CLAUDE.md

## Project
Incipit — AI-powered archival research assistant for historians. Hackathon build: April 21–26, 2026. Open source.

The name comes from manuscript studies: an incipit is the opening words of a text, used to identify documents before titles existed.

## What This Product Does
Historians upload scanned primary source documents (newspaper scans, letters, government records, photographs of archival pages). Opus 4.7 vision reads the image — not any existing OCR text layer — and extracts structured metadata. The historian confirms or corrects the extraction. Documents accumulate in a persistent, searchable archive where every new upload is checked against everything that came before. The historian's own research notes and hunches are stored as standing queries that activate against future documents.

## Who It's For
Non-technical academic historians. The interface must be intuitive for someone who has never opened a terminal. Think: a 65-year-old professor who barely uses Google Drive. Clean, modern, simple — not dated, not gimmicky.

## Role
Louis directs every product decision. Claude Code has maximum autonomy on implementation, architecture, and technical decisions. When the direction is clear, build. Don't ask unnecessary clarifying questions. Ship working features, iterate, keep moving.

## Stack
- Next.js 14 App Router
- Supabase (Postgres + file storage)
- Claude API with Opus 4.7 (vision extraction, entity analysis, connection surfacing)
- Vercel (deployment)
- Do not introduce dependencies beyond this stack without asking.

## Features to Build

### 1. Research Context Onboarding
First-run flow where the historian describes their research in plain language. AI asks clarifying questions: topic, time period, countries, goal (dissertation, book, course), audience. Produces a research profile stored in the database that informs all subsequent extraction and connection queries.

### 2. Document Ingestion with Opus 4.7 Vision
Upload scanned documents (PDF, images). Send the visual image to Opus 4.7 — always read from the image, never from an existing OCR text layer. Extract: publication name, date, title/subject, author, key entities (people, places, organizations), language, full extracted text. Each field gets a confidence score: high, medium, low, unable to determine.

### 3. Historian Confirmation Step
Before metadata is committed, historian reviews and can correct any field. Trust tiers: T1 (historian-verified), T2 (high-confidence unconfirmed), T3 (flagged uncertain). No metadata is treated as final until confirmed.

### 4. Provenance Tracking
Every document records: archive name and location (where), acquisition method (how — physical scan, photograph, digital download), date of discovery (when), and original filename or catalog reference. Support batch entry — set the archive source once for a group of uploads.

### 5. Metadata Changelog
Original filename preserved permanently. Every change logged with dates: AI renamed to X, historian corrected to Y. This matters because seemingly gibberish filenames (like UN catalog codes S-1301-0000-2317) are actually archive reference numbers.

### 6. Auto File Naming
Generate structured filename from confirmed metadata following a consistent convention. Original filename always preserved in the changelog.

### 7. Research Notes at Ingestion
Text field at upload time for the historian to write plain-language notes — hunches, context clues, suspected connections. These notes are stored as standing queries. When future documents are ingested, they are checked against all existing notes, not just entity matching. Example: "I think this connects to something at the UN archives about Tacna-Arica."

### 8. Citation Generator
From confirmed metadata, produce Chicago/Turabian formatted citation. Copy-paste ready. If a field is uncertain, the citation reflects that rather than guessing.

### 9. Natural Language Search
Query across all ingested documents. "Show me everything mentioning Vasconcelos" works regardless of source collection or country.

### 10. Cross-Document Connection Surfacing
When a new document is ingested, compare against all existing documents — entities, dates, themes — informed by the research context profile AND the historian's notes. Flag meaningful connections, not just raw entity matches.

### 11. Outside-Current-Research Tagging
AI recognizes when an uploaded document doesn't fit the historian's stated research context. Prompts: "This doesn't appear to relate to your current research — save to a separate collection?" Historian can tag it as a future research thread with a note about why they grabbed it.

### 12. Simple, Modern Interface
Dead simple for non-technical users. Modern and clean design. Not dated, not cheesy, not gimmicky.

## Key Design Principles
- The AI always reads from the visual image, never from existing OCR text layers.
- Confidence scores on every extracted field. No silent guessing.
- Historian confirmation before metadata is committed. Trust is non-negotiable.
- The system gets smarter with every document added. Document 200 is more valuable than document 1.
- Research notes are not passive — they are active queries against future uploads.
- Spanish language support is required. The primary source documents are predominantly in Spanish.

## Database
- Documents table with all metadata fields, confidence scores, trust tiers, provenance, changelog
- Entities table (people, places, organizations)
- Entity-document junction table for relationship mapping
- Research context / profile table
- Research notes table linked to documents but also queryable against future uploads
- Side collections for outside-current-research documents

## Git
- Atomic commits with descriptive messages.
- Main branch should always be deployable.

## Naming
- Database tables: snake_case
- React components: PascalCase
- Keep the codebase navigable.
