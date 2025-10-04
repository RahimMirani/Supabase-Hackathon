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

- Phase 1 - Frontend First (~2 hrs) ✅ COMPLETE
  - Scaffold Vite UI with Supabase theme (dark + green accents)
  - Add global state management (Zustand)
  - Build chat panel interface with mock responses
  - Create Mermaid ERD visualization component
  - Implement SQL generation from schema JSON
  - Build SQL modal with copy/download functionality
  - Deliverable: Fully polished frontend with mock data, ready for real APIs

- Phase 2 - Backend API & LLM Integration (~2.5 hrs) 🔨 IN PROGRESS
  - Backend Setup (30 mins):
    - Create Express/TypeScript backend with CORS
    - Install dependencies (OpenAI/Anthropic SDK, Zod, dotenv)
    - Setup folder structure (routes, services, types)
  - LLM Integration (1 hour):
    - Configure OpenAI/Anthropic API
    - Write system prompt for schema generation
    - Parse LLM JSON response with error handling
  - API Endpoints (1 hour):
    - POST /api/schema/generate (natural language → schema JSON)
    - POST /api/schema/sql (schema JSON → SQL)
    - Add Zod validation middleware
  - Frontend Integration (30 mins):
    - Create API service layer
    - Update ChatPanel to call real backend
    - Add loading/error states
  - Deliverable: Working AI schema generation from user prompts

- Phase 3 - Schema Editing & Polish (~1 hour)
  - Add inline editing capabilities (optional):
    - Edit table/column names
    - Add/remove columns
    - Modify relationships
  - Schema regeneration with AI refinement
  - Keep chat history for context
  - Deliverable: Interactive, editable schema experience

- Phase 4 - SQL Generation & RLS (~1 hour)
  - RLS Policy Generation:
    - Detect user_id columns
    - Generate Row Level Security policies
    - Add auth.uid() checks for Supabase
  - Enhanced SQL Export:
    - Add migration timestamps
    - Generate separate RLS file
    - Export schema JSON artifact
  - Deliverable: Production-ready SQL with security policies

- Phase 5 - Supabase Integration (~2 hrs)
  - Supabase Connection Modal (45 mins):
    - Create credential capture UI (URL + service key)
    - Validate connection
    - Store credentials securely (in-memory only)
  - Apply to Supabase (1 hour):
    - Backend endpoint: POST /api/supabase/apply
    - Use @supabase/supabase-js to execute SQL
    - Add progress indicators and error handling
  - Export Features (15 mins):
    - GET /api/export/schema (JSON download)
    - GET /api/export/sql (SQL file download)
    - GET /api/export/erd (SVG diagram)
  - Deliverable: One-click apply to live Supabase project

- Phase 6 - Polish & Demo Prep (~1 hr)
  - Error Handling & UX (30 mins):
    - Add toast notifications
    - Implement loading skeletons
    - Add error boundaries
    - Input validation with helpful messages
  - Demo Preparation (30 mins):
    - Create demo script with 3-4 example prompts
    - Test reset flow (supabase db reset)
    - Write README with setup instructions
    - Prepare backup screenshots/video
  - Deliverable: Demo-ready app with polished UX
