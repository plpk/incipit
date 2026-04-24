# CLAUDE.md

## Project
Incipit is an AI-powered archival research assistant for historians. Built for the Cerebral Valley / Anthropic "Built with Opus 4.7" hackathon (April 21 to 26, 2026). Live in production at [incipit.dev](https://www.incipit.dev). License: AGPL-3.0.

The name comes from manuscript studies. An *incipit* is the opening words of a text, used to identify documents before titles existed.

## What Incipit Does
Historians upload scanned primary source documents: newspaper scans, handwritten letters, government records, photographs of archival pages. Opus 4.7 vision reads the image itself, never an existing OCR text layer, and extracts structured metadata. The historian confirms or corrects the extraction before anything is committed to the archive. Documents accumulate in a persistent, searchable archive where every new upload is checked against everything that came before. The historian's own research notes and hunches are stored as standing queries that activate against future documents.

## Who It's For
Non-technical academic historians. The interface must be intuitive for someone who has never opened a terminal. Think: a 65-year-old professor who barely uses Google Drive. Clean, modern, simple. Not dated, not gimmicky.

## Working Relationship
Louis directs every product decision. Louis does not write code. Claude Code has maximum autonomy on implementation, architecture, and technical decisions. When the direction is clear, build. Don't ask unnecessary clarifying questions. Ship working features, iterate, keep moving.

Before making changes, read the relevant existing code. Don't assume based on the feature list below. The codebase is the source of truth.

## Stack
- Next.js 14 App Router
- Supabase: Postgres, Row Level Security, file storage, Google and Apple OAuth
- Claude API with Opus 4.7 (vision extraction, entity analysis, connection surfacing, research context interpretation)
- Vercel (production deployment at incipit.dev, auto-deploy from main)
- Do not introduce dependencies beyond this stack without asking.

## Current State (shipped and working in production)

### Marketing site
- Landing page, How It Works page, About page, /early explainer, Terms, Privacy, Sign In

### Auth and access
- Google OAuth and Apple OAuth via Supabase
- Routing state machine enforced at middleware level with three states: unauthenticated, authenticated without profile, authenticated with profile
- Full account deletion (typed DELETE confirmation, cascades to all user-scoped data)
- Early access gate: 5 documents per account

### Core research workflow
- Research context onboarding (AI-guided, plain language, produces a research profile stored in DB)
- Single-document ingestion with Opus 4.7 vision
- Structured metadata extraction with confidence scores
- Historian confirmation with trust tiers (T1 verified, T2 high-confidence unconfirmed, T3 uncertain)
- Provenance tracking (archive source, acquisition method, date, original filename)
- Metadata changelog (every change logged, original filename preserved permanently)
- Auto file naming from confirmed metadata
- Research notes at upload time stored as standing queries
- Cross-document connection surfacing (new documents compared against full archive, informed by research context and notes)
- Outside-current-research tagging with side collection
- Citation generator (Chicago/Turabian from confirmed metadata)
- Natural language search across the archive
- Document download (zip with renamed scan and metadata sidecar JSON)

### Held back from the hackathon build
- Batch document upload with Claude Managed Agents: paused for post-hackathon commercial development
- All other commercial features (voice notes, mobile capture, archive recommender, parallel research projects, collaboration, additional citation formats, enriched file download, Stripe integration)

## Key Design Principles
- The AI always reads from the visual image, never from an existing OCR text layer.
- Confidence scores on every extracted field. No silent guessing.
- Historian confirmation before metadata is committed. Trust is non-negotiable.
- The system gets smarter with every document added. Document 200 is more valuable than document 1.
- Research notes are not passive. They are active queries against future uploads.
- Spanish language support is required. Primary source documents are predominantly in Spanish.
- Archival integrity: the original scan is never altered. Metadata travels as a sidecar, not baked into the file.

## Database
All tables are user-scoped. Row Level Security is enforced. All user-scoped tables have ON DELETE CASCADE tied to auth.users as a safety net.

Core tables:
- `profiles` (user profile + research context)
- `documents` (metadata, confidence scores, trust tiers, provenance, changelog)
- `entities` (people, places, organizations)
- `document_entities` (junction table)
- `research_notes` (linked to documents, queryable against future uploads)
- `connections` (surfaced relationships between documents)
- `side_collections` (outside-current-research documents)

Migrations live in `supabase/migrations/`.

## Git
- Atomic commits with descriptive messages using conventional commit prefixes (feat, fix, chore, refactor, docs).
- Main branch is always deployable.
- Vercel auto-deploys production from main. Preview deploys on PRs.
- Do not commit secrets. `.env.local` is gitignored.

## Code Conventions
- Database tables and columns: snake_case
- React components: PascalCase
- TypeScript preferred over JavaScript for new code
- Keep the codebase navigable. Don't create new top-level folders without reason.

## Rules for Changes
- Do not refactor working features without being asked.
- Do not restructure folders without being asked.
- Do not update dependencies without being asked.
- When in doubt, make the smallest change that solves the problem.
- Test end-to-end after every change. Production is live with real users.
