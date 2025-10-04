Project:
This project is part of a 6 hour hackathon
Describe your app in plain English to a chat option on the left side → get an editable ERD → click “Connect to Supabase” to provision a production-ready Postgres schema (tables, keys, indexes, and optional RLS).

What it does:
- Converts a short natural-language description into a strict JSON schema (tables, columns, PK/FK, unique, checks, indexes).
- Renders an ERD from the schema (Mermaid) and provides a minimal side-panel to edit tables/columns/relations.
- Generates idempotent SQL (DDL) and either (a) applies it directly to a Supabase project or (b) exports a migration file compatible with supabase db push.
- Optionally adds starter RLS policies when a user_id column exists.
- Exports artifacts: JSON schema, SQL migration, ERD image/SVG.

Steps:

- Phase 1 - Frontend First (~2 hrs)
  - Scaffold Vite UI, add global state, ensure layout works with placeholder data.
  - Deliverable: fully wired frontend experience using mock data, ready for real APIs.

- Phase 2 - Backend API & LLM (~2.5 hrs)
  - Set up Node/Express backend with env config and CORS.
  - Implement `POST /schema/generate` and `POST /schema/sql` with validation and temporary stub logic.
  - Integrate frontend calls to these endpoints; handle loading/errors cleanly.
  - Deliverable: prompt produces and displays schema/SQL from backend (stubbed if needed).

- Phase 3 - Schema Logic & Visualization (~2 hrs)
  - Finalize shared JSON schema contract (tables, columns, relations) using zod types.
  - Render real Mermaid ERD from schema JSON; enable edits that update state and re-render.
  - Deliverable: accurate, editable ERD reflecting live schema data.

- Phase 4 - SQL Generation & RLS (~1.5 hrs)
  - Build deterministic SQL/RLS generation from schema JSON; ensure idempotence.
  - Surface SQL preview in UI with copy/download options; test with multiple sample prompts.
  - Deliverable: reliable SQL + optional RLS output flowing through the app.

- Phase 5 - Supabase Integration (~2 hrs)
  - Create credential modal to capture Supabase URL/service key (transient storage).
  - Backend applies SQL/RLS via `supabase-js`; add export endpoints for JSON/SQL/ERD assets.
  - Deliverable: end-to-end apply to Supabase project plus artifact downloads.

- Phase 6 - Polish & Demo Prep (~1 hr)
  - Harden error handling, loading states, and success toasts.
  - Document run steps, env vars, and craft demo script with reset plan (`supabase db reset`).
  - Deliverable: demo-ready app with clear instructions and fallback plan.
