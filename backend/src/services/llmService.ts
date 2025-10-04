import OpenAI from 'openai'
import { SchemaData, SchemaDataSchema } from '../types/schema'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `You are an expert database architect specializing in PostgreSQL schema design for Supabase.

Given a user's natural language description of their application, generate a complete database schema as JSON.

Requirements:
1. Identify all entities (tables) needed
2. Define appropriate columns with correct PostgreSQL types
3. Set primary keys (prefer uuid with gen_random_uuid() default)
4. Identify foreign key relationships
5. Add unique constraints where appropriate
6. Use appropriate nullability
7. Add helpful descriptions for tables and special columns
8. Use snake_case for table and column names

Common patterns:
- Use "id uuid primary key default gen_random_uuid()"
- Use "created_at timestamptz default now()"
- Use "updated_at timestamptz default now()"
- For user references, use "user_id uuid references auth.users(id)" if auth is needed
- Add status columns with check constraints (e.g., status: 'draft | active | archived')

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

