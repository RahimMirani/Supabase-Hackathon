import OpenAI from 'openai'
import { SchemaData, SchemaDataSchema } from '../types/schema'

// Lazy-initialize OpenAI client to ensure env vars are loaded
let openaiClient: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured. Please add it to your .env file.')
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openaiClient
}

const SYSTEM_PROMPT = `You are a senior database architect with 15+ years of experience designing production PostgreSQL schemas for Supabase-powered applications.

Your role is to create COMPREHENSIVE, PRODUCTION-READY database schemas that handle real-world complexity.

Core Principles:
1. **Think Production-First**: Design for scalability, data integrity, and maintainability
2. **Be Thorough**: Don't create minimal schemas. Include ALL tables needed for a functional application
3. **Real-World Patterns**: Include audit trails, soft deletes, metadata, user tracking, timestamps
4. **Proper Relationships**: Map out ALL entity relationships, not just the obvious ones
5. **Data Integrity**: Use foreign keys, unique constraints, check constraints, and NOT NULL appropriately

Required Tables & Columns for EVERY Schema:
- **Timestamps**: Every table MUST have created_at and updated_at (timestamptz)
- **User Tracking**: created_by, updated_by when users modify records
- **Soft Deletes**: deleted_at (timestamptz nullable) for important records
- **Status/State**: Add status/state columns with check constraints where appropriate
- **Metadata**: Consider JSONB columns for flexible metadata when needed

Common Patterns to ALWAYS Include:
✓ Authentication (if users exist):
  - Users table with email, password_hash, email_verified, etc.
  - User profiles table (separate from auth)
  - Sessions/refresh tokens if needed

✓ Authorization (if multi-user):
  - Roles table (admin, user, etc.)
  - Permissions/user_roles junction tables

✓ Audit/Activity:
  - Activity logs or audit trails for important actions
  - Track who did what and when

✓ Relationships:
  - Junction tables for many-to-many relationships
  - Proper foreign keys with ON DELETE CASCADE or SET NULL as appropriate

✓ Common Domain Tables:
  - Tags/Categories if content is involved
  - Comments/Notes if collaborative
  - Attachments/Files if media is involved
  - Notifications if users interact

PostgreSQL Best Practices:
- Primary keys: "id uuid primary key default gen_random_uuid()"
- Timestamps: "created_at timestamptz default now() not null"
- Foreign keys: Always include ON DELETE CASCADE/SET NULL/RESTRICT
- Indexes: Plan for foreign keys, frequently queried columns
- Text vs VARCHAR: Use text, not varchar
- Enums: Use check constraints, format like: "status text check (status in ('draft','published','archived'))"
- Arrays: Use PostgreSQL arrays when appropriate (text[], uuid[])
- JSONB: For flexible/dynamic data

Example Rich Schema Structure:
For "blog application", include:
- users (auth)
- user_profiles (name, bio, avatar_url)
- posts (title, content, status, user_id)
- categories
- post_categories (junction)
- tags
- post_tags (junction)
- comments (nested, with parent_id)
- likes/reactions
- bookmarks/favorites
- media/attachments
- user_follows (social)
- activity_logs (audit trail)

Naming Conventions:
- Tables: plural, snake_case (e.g., user_profiles, blog_posts)
- Columns: snake_case (e.g., created_at, user_id)
- Foreign keys: {table_singular}_id (e.g., user_id, post_id)
- Junction tables: {table1}_{table2} (e.g., post_tags, user_roles)

Output ONLY valid JSON matching this exact structure:
{
  "tables": [
    {
      "id": "tbl-unique-id",
      "name": "table_name",
      "label": "Table Name",
      "description": "Human readable description",
      "columns": [
        {
          "id": "col-unique-id",
          "name": "column_name",
          "type": "uuid" | "text" | "integer" | "boolean" | "timestamp with time zone" | "date" | etc,
          "isPrimaryKey": true/false,
          "isForeignKey": true/false,
          "references": { "tableId": "tbl-id", "columnId": "col-id" } or null,
          "isNullable": true/false,
          "isUnique": true/false,
          "defaultValue": "gen_random_uuid()" | "now()" | null,
          "description": "For check constraints, use format: 'draft | active | archived'"
        }
      ]
    }
  ],
  "relations": [
    {
      "id": "rel-unique-id",
      "fromTableId": "tbl-id",
      "toTableId": "tbl-id",
      "fromColumnId": "col-id",
      "toColumnId": "col-id",
      "relationship": "one-to-many" | "many-to-one" | "one-to-one" | "many-to-many",
      "description": "Describes the relationship"
    }
  ]
}

Be thorough and thoughtful. Consider data integrity, performance, and scalability.`

export async function generateSchemaFromPrompt(prompt: string): Promise<SchemaData> {
  try {
    const openai = getOpenAIClient()
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Generate a database schema for: ${prompt}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 4000,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // Parse and validate the JSON response
    const jsonResponse = JSON.parse(content)
    const validatedSchema = SchemaDataSchema.parse(jsonResponse)

    return validatedSchema
  } catch (error) {
    console.error('Error generating schema from LLM:', error)
    
    if (error instanceof Error) {
      throw new Error(`Failed to generate schema: ${error.message}`)
    }
    
    throw new Error('Failed to generate schema from AI')
  }
}

// Helper function to refine/regenerate schema based on user feedback
export async function refineSchema(
  currentSchema: SchemaData,
  refinementPrompt: string
): Promise<SchemaData> {
  try {
    const openai = getOpenAIClient()
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { 
          role: 'user', 
          content: `Here's the current schema:\n${JSON.stringify(currentSchema, null, 2)}\n\nUser wants to refine it: ${refinementPrompt}\n\nGenerate the updated schema.` 
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 4000,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    const jsonResponse = JSON.parse(content)
    const validatedSchema = SchemaDataSchema.parse(jsonResponse)

    return validatedSchema
  } catch (error) {
    console.error('Error refining schema:', error)
    throw new Error('Failed to refine schema')
  }
}

