---
title: 'Trump Damage DB Implementation Plan'
---

# Master Implementation Plan: Trump Administration Damage & Accountability Database (`trump-damage-db`)

**Scope:** Second Term & Transition Only (`2024-11-05` to Present)  
**Database Engine:** Local SQLite (`damage_ledger.db`) with `WAL` mode, Foreign Keys, JSON1, and `FTS5` Full-Text Search  
**Architecture:** Standalone Private Ingestion & Database Repository + Immutable Content-Addressed Raw Evidence Vault  
**Target Sources:** 100% ingestion and consolidation of all 40 identified tracking projects, government registries, litigation dockets, and mortality/killings databases.

---

## 1. System Architecture & Standalone Repository Structure

Per design specifications, the scraping engine, immutable raw archive, and SQLite database will reside in a dedicated standalone project directory (`C:\Users\kjhgf\.gemini\antigravity\scratch\trump-damage-db`) completely decoupled from the public Docusaurus repo (`firstpub-Platform`).

```text
trump-damage-db/
├── pyproject.toml                 # Dependencies: httpx, playwright, selectolax, pydantic, sqlite-utils, rich, typer
├── .env                           # Optional API keys (ACLED, CourtListener, LLM extraction keys)
├── db/
│   ├── schema.sql                 # Complete DDL for all 8 core tables + FTS5 virtual tables
│   ├── damage_ledger.db           # The master consolidated SQLite database
│   └── migrations/                # Schema versioning scripts
├── raw_vault/                     # Immutable Layer-1 Evidence Archive (gitignored or Git-LFS)
│   ├── index.jsonl                # Append-only manifest of every fetched URL, timestamp, and SHA-256
│   └── blobs/                     # Content-addressed storage: blobs/<sha256[:2]>/<sha256>.(html|json|pdf|csv)
├── scrapers/
│   ├── base.py                    # BaseScraper with rate-limiting, retry/backoff, raw_vault auto-archiving
│   ├── registry.py                # Maps all 40 tracker IDs to their scraper class and schedule
│   ├── group_a_apis/              # Direct REST APIs, Substack JSON APIs, RSS/Atom feeds
│   ├── group_b_bundles/           # Embedded JSON/CSV/Airtable/Supabase state extractors
│   ├── group_c_html/              # Deterministic HTML table & DOM parsers (httpx + selectolax)
│   └── group_d_playwright_llm/    # Headless Chromium + Pydantic-enforced LLM structured extractors
├── pipeline/
│   ├── normalizer.py              # Converts raw tracker payloads into Layer-2 `source_records`
│   ├── deduplicator.py            # Deterministic + semantic entity resolution into Layer-3 `canonical_events`
│   ├── toll_aggregator.py         # Extracts and cross-checks killings, detention deaths, and mortality counts
│   └── reversal_classifier.py     # Maps canonical events to legal/executive "Undo Blueprint" tiers
├── cli.py                         # Typer CLI for running scrapers, deduplicating, auditing, and querying
└── tests/                         # Unit tests & fixture validation for each of the 40 scrapers
```

---

## 2. Master SQLite Database Schema (`db/schema.sql`)

The SQLite database uses **8 relational tables** plus **FTS5 full-text search** to ensure zero data loss while linking every tracker citation to a single canonical truth.

### 2.1 `trackers` (Master Registry of the 40 Sources)
```sql
CREATE TABLE trackers (
    tracker_id TEXT PRIMARY KEY,          -- e.g., 'wtfjht', 'airwars_us', 'public_citizen_corp'
    name TEXT NOT NULL,
    category TEXT NOT NULL,               -- 'chronological', 'project2025', 'departmental', 'litigation', 'killings_mortality'
    base_url TEXT NOT NULL,
    adapter_group TEXT NOT NULL,          -- 'A_API', 'B_BUNDLE', 'C_HTML', 'D_PLAYWRIGHT'
    scrape_status TEXT DEFAULT 'pending', -- 'pending', 'running', 'completed', 'error'
    last_scraped_at TEXT,
    total_records_fetched INTEGER DEFAULT 0,
    notes TEXT
);
```

### 2.2 `raw_snapshots` (Layer 1 — Immutable Evidence Vault Index)
```sql
CREATE TABLE raw_snapshots (
    snapshot_id TEXT PRIMARY KEY,         -- UUIDv4
    tracker_id TEXT NOT NULL REFERENCES trackers(tracker_id),
    source_url TEXT NOT NULL,
    fetched_at TEXT NOT NULL,             -- ISO-8601 UTC
    http_status INTEGER,
    content_type TEXT,                    -- 'application/json', 'text/html', 'application/pdf', 'text/csv'
    sha256_hash TEXT NOT NULL,
    local_blob_path TEXT NOT NULL,        -- e.g., 'raw_vault/blobs/a4/a4f8...91.json'
    byte_size INTEGER NOT NULL
);
```

### 2.3 `source_records` (Layer 2 — Normalized Per-Tracker Staging)
```sql
CREATE TABLE source_records (
    record_id TEXT PRIMARY KEY,           -- '<tracker_id>:<external_id_or_hash>'
    tracker_id TEXT NOT NULL REFERENCES trackers(tracker_id),
    snapshot_id TEXT NOT NULL REFERENCES raw_snapshots(snapshot_id),
    canonical_event_id TEXT REFERENCES canonical_events(event_id),
    external_id TEXT,
    event_date TEXT,                      -- YYYY-MM-DD (restricted to >= '2024-11-05')
    published_date TEXT,
    title TEXT NOT NULL,
    summary TEXT,
    full_text TEXT,
    source_url TEXT NOT NULL,
    primary_source_urls_json TEXT,
    extracted_entities_json TEXT,
    raw_payload_json TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### 2.4 `canonical_events` (Layer 3 — Deduplicated Master Timeline)
```sql
CREATE TABLE canonical_events (
    event_id TEXT PRIMARY KEY,            -- 'EVT-2025-01-20-001'
    event_date TEXT NOT NULL,             -- YYYY-MM-DD
    administration_day INTEGER,           -- Day count relative to Jan 20, 2025
    title TEXT NOT NULL,
    executive_summary TEXT NOT NULL,
    detailed_narrative TEXT,
    primary_domain TEXT NOT NULL,
    sub_category TEXT,
    department_code TEXT,
    agency_or_unit TEXT,
    official_actors_json TEXT,
    eo_number TEXT,
    federal_register_doc_num TEXT,
    project2025_alignment_ref TEXT,
    severity_level INTEGER CHECK(severity_level BETWEEN 1 AND 5),
    source_count INTEGER DEFAULT 1,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### 2.5 `lethal_and_human_toll` (Killings, Strikes, Detention Deaths & Policy Mortality)
```sql
CREATE TABLE lethal_and_human_toll (
    toll_id TEXT PRIMARY KEY,
    canonical_event_id TEXT NOT NULL REFERENCES canonical_events(event_id),
    toll_category TEXT NOT NULL,
    incident_date TEXT NOT NULL,
    country TEXT NOT NULL,
    state_or_region TEXT,
    city_or_coordinates TEXT,
    facility_or_operation_name TEXT,
    confirmed_deaths INTEGER DEFAULT 0,
    estimated_deaths_min INTEGER,
    estimated_deaths_max INTEGER,
    injured_count INTEGER DEFAULT 0,
    victim_names_and_demographics_json TEXT,
    perpetrator_agency_or_command TEXT,
    pentagon_or_agency_admission TEXT,
    forensic_or_trial_evidence_provided INTEGER DEFAULT 0,
    medical_neglect_flagged INTEGER DEFAULT 0,
    primary_investigation_urls_json TEXT
);
```

### 2.6 `departmental_and_doge_actions` (Workforce Purges, Science Censorship, Corporate Drops)
```sql
CREATE TABLE departmental_and_doge_actions (
    dept_action_id TEXT PRIMARY KEY,
    canonical_event_id TEXT NOT NULL REFERENCES canonical_events(event_id),
    department_code TEXT NOT NULL,
    sub_agency_or_division TEXT,
    action_type TEXT NOT NULL,
    workers_terminated_or_bought_out INTEGER,
    percentage_workforce_cut REAL,
    dollar_amount_affected REAL,
    corporations_benefited_json TEXT,
    censored_topics_or_datasets_json TEXT,
    cfr_or_statute_citation TEXT
);
```

### 2.7 `litigation_dockets` (Court Challenges & Injunction Status)
```sql
CREATE TABLE litigation_dockets (
    docket_id TEXT PRIMARY KEY,
    canonical_event_id TEXT REFERENCES canonical_events(event_id),
    case_name TEXT NOT NULL,
    court_name TEXT NOT NULL,
    date_filed TEXT,
    plaintiffs_summary TEXT,
    defendants_summary TEXT,
    current_status TEXT NOT NULL,
    latest_ruling_date TEXT,
    latest_ruling_summary TEXT,
    lawfare_url TEXT,
    just_security_url TEXT,
    democracy_forward_url TEXT,
    courtlistener_url TEXT
);
```

### 2.8 `reversal_blueprint` (The "Undoing the Damage" Action Table)
```sql
CREATE TABLE reversal_blueprint (
    blueprint_id TEXT PRIMARY KEY,
    canonical_event_id TEXT NOT NULL REFERENCES canonical_events(event_id),
    reversal_tier TEXT NOT NULL,
    undo_action_title TEXT NOT NULL,
    specific_mechanism TEXT NOT NULL,
    responsible_department TEXT NOT NULL,
    can_be_done_unilaterally_by_president INTEGER NOT NULL,
    requires_congress INTEGER NOT NULL,
    statute_of_limitations_expires TEXT,
    priority_rank INTEGER CHECK(priority_rank BETWEEN 1 AND 5)
);
```

---

## 3. Complete 40-Source Scraper Implementation Matrix

* **Group A (Direct REST APIs & Feeds — 7 Sources):** Federal Register API, WTFJHT, Trump Tyranny Tracker, r/Keep_Track, ACLED, TRAC Immigration, DOGE Official Dashboard.
* **Group B (Embedded App State & Data Bundles — 6 Sources):** Trump Action Tracker, Project 2025 Observer, CPR & Governing for Impact Tracker, OpenFeds, Impact Counter (BU PEPFAR/USAID mortality), Brookings Treasury Outlay & Regulatory Trackers.
* **Group C (Deterministic HTML & Table Parsers — 14 Sources):** White House Presidential Actions, Ballotpedia, The Trump Tracker, Public Citizen Corporate Enforcement Tracker, Sabin Climate Backtracker, Sabin Silencing Science Tracker, KFF Health Policy Tracker, Lawfare Litigation Tracker, Just Security Litigation Tracker, National LGBTQ+ Bar Tracker, AILA ICE Death Logs, Death Penalty Information Center (DPIC), Partnership for Public Service, New America Counterterrorism Tracker.
* **Group D (Playwright + Structured LLM Extractors — 13 Sources):** Airwars (US Strikes in Yemen/Somalia/Iran/etc.), InSight Crime & WOLA (Operation Southern Spear boat strikes), Human Rights Watch (*Dying in Detention*), ACLU Detention & Raid Reports, NIPNLG & American Immigration Council, SBCC / Mapping Police Violence / *L.A. TACO* Raid Tracker, ProPublica (*Life of the Mother*) & Guttmacher, Democracy Forward, American Oversight, CREW, POGO, STAT News, and Corporate Law Firm Trackers (Skadden, Mayer Brown, Holland & Knight, Morgan Lewis, Sheppard Mullin).

---

## 4. Phased Execution Roadmap

1. **Phase 1:** Scaffold `C:\Users\kjhgf\.gemini\antigravity\scratch\trump-damage-db`, initialize `damage_ledger.db`, and build the immutable `raw_vault/` snapshotting base layer.
2. **Phase 2 (Wave 1):** Run Group A & B chronological/executive scrapers (Federal Register, WTFJHT, Trump Action Tracker, Project 2025 trackers).
3. **Phase 3 (Wave 2):** Run Killings, Strikes, Detention Deaths & Mortality scrapers (Airwars, InSight Crime/WOLA, Impact Counter, TRAC/AILA/HRW/ACLU, SBCC/L.A. TACO, ProPublica, DPIC).
4. **Phase 4 (Wave 3):** Run Departmental, DOGE, Science & Corporate Enforcement scrapers (OpenFeds, Public Citizen, Sabin Climate & Science, KFF, Brookings, CREW, POGO).
5. **Phase 5 (Wave 4):** Run Litigation & Law Firm scrapers (Lawfare, Just Security, Democracy Forward, LGBTQ+ Bar, Law Firms).
6. **Phase 6:** Execute multi-pass Entity Resolution (`deduplicator.py`), Reversal Blueprint Classification (`reversal_classifier.py`), and run the full completeness audit.
