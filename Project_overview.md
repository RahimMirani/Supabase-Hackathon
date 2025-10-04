Project:
This project is part of a 6 hour hackathon
Describe your app in plain English → get an editable ERD → click “Connect to Supabase” to provision a production-ready Postgres schema (tables, keys, indexes, and optional RLS).

What it does:
- Converts a short natural-language description into a strict JSON schema (tables, columns, PK/FK, unique, checks, indexes).
- Renders an ERD from the schema (Mermaid) and provides a minimal side-panel to edit tables/columns/relations.
- Generates idempotent SQL (DDL) and either (a) applies it directly to a Supabase project or (b) exports a migration file compatible with supabase db push.
- Optionally adds starter RLS policies when a user_id column exists.
- Exports artifacts: JSON schema, SQL migration, ERD image/SVG.