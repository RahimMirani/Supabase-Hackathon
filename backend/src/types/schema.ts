import { z } from 'zod'

// Column schema
export const SchemaColumnSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  isPrimaryKey: z.boolean().optional(),
  isForeignKey: z.boolean().optional(),
  references: z.object({
    tableId: z.string(),
    columnId: z.string(),
  }).nullable().optional(),
  isNullable: z.boolean().optional(),
  isUnique: z.boolean().optional(),
  defaultValue: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
})

export type SchemaColumn = z.infer<typeof SchemaColumnSchema>

// Table schema
export const SchemaTableSchema = z.object({
  id: z.string(),
  name: z.string(),
  label: z.string().optional(),
  description: z.string().nullable().optional(),
  columns: z.array(SchemaColumnSchema),
})

export type SchemaTable = z.infer<typeof SchemaTableSchema>

// Relation schema
export const SchemaRelationSchema = z.object({
  id: z.string(),
  fromTableId: z.string(),
  toTableId: z.string(),
  fromColumnId: z.string(),
  toColumnId: z.string(),
  relationship: z.enum(['one-to-one', 'one-to-many', 'many-to-one', 'many-to-many']),
  description: z.string().nullable().optional(),
})

export type SchemaRelation = z.infer<typeof SchemaRelationSchema>

// Complete schema data
export const SchemaDataSchema = z.object({
  tables: z.array(SchemaTableSchema),
  relations: z.array(SchemaRelationSchema),
})

export type SchemaData = z.infer<typeof SchemaDataSchema>

// API Request/Response types
export const GenerateSchemaRequestSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
})

export type GenerateSchemaRequest = z.infer<typeof GenerateSchemaRequestSchema>

export const GenerateSchemaResponseSchema = z.object({
  schema: SchemaDataSchema,
  message: z.string().optional(),
})

export type GenerateSchemaResponse = z.infer<typeof GenerateSchemaResponseSchema>

