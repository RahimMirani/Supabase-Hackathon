import type { SchemaData, SchemaColumn, SchemaTable } from '../state/types'

/**
 * Generates production-ready Postgres DDL from schema JSON
 */
export const generateSqlFromSchema = (schema: SchemaData): string => {
  const lines: string[] = []
  
  lines.push('-- Generated Database Schema for Supabase/Postgres')
  lines.push('-- Copy and run this SQL in your Supabase SQL Editor')
  lines.push('')

  // Create tables
  schema.tables.forEach((table) => {
    lines.push(`-- Table: ${table.name}`)
    if (table.description) {
      lines.push(`-- ${table.description}`)
    }
    
    const columnDefinitions = table.columns.map((col) => generateColumnDefinition(col, table))
    const constraints = generateTableConstraints(table, schema)
    
    const allDefinitions = [...columnDefinitions, ...constraints].join(',\n  ')
    
    lines.push(`CREATE TABLE IF NOT EXISTS public.${table.name} (`)
    lines.push(`  ${allDefinitions}`)
    lines.push(`);`)
    lines.push('')
  })

  // Create indexes
  const indexes = generateIndexes(schema)
  if (indexes.length > 0) {
    lines.push('-- Indexes')
    lines.push(...indexes)
    lines.push('')
  }

  // Add comments
  const comments = generateComments(schema)
  if (comments.length > 0) {
    lines.push('-- Table and Column Comments')
    lines.push(...comments)
    lines.push('')
  }

  return lines.join('\n')
}

const generateColumnDefinition = (col: SchemaColumn, table: SchemaTable): string => {
  const parts: string[] = []
  
  // Column name and type
  parts.push(col.name)
  parts.push(col.type)
  
  // Primary key inline (only if not composite)
  const pkColumns = table.columns.filter(c => c.isPrimaryKey)
  if (col.isPrimaryKey && pkColumns.length === 1) {
    parts.push('PRIMARY KEY')
  }
  
  // Default value
  if (col.defaultValue !== undefined && col.defaultValue !== null) {
    parts.push(`DEFAULT ${col.defaultValue}`)
  }
  
  // Not null
  if (col.isNullable === false) {
    parts.push('NOT NULL')
  }
  
  // Unique
  if (col.isUnique && !col.isPrimaryKey) {
    parts.push('UNIQUE')
  }
  
  return parts.join(' ')
}

const generateTableConstraints = (table: SchemaTable, schema: SchemaData): string[] => {
  const constraints: string[] = []
  
  // Composite primary key
  const pkColumns = table.columns.filter(c => c.isPrimaryKey)
  if (pkColumns.length > 1) {
    const pkNames = pkColumns.map(c => c.name).join(', ')
    constraints.push(`PRIMARY KEY (${pkNames})`)
  }
  
  // Foreign keys
  table.columns.forEach((col) => {
    if (col.isForeignKey && col.references) {
      const refTable = schema.tables.find(t => t.id === col.references?.tableId)
      const refColumn = refTable?.columns.find(c => c.id === col.references?.columnId)
      
      if (refTable && refColumn) {
        const fkName = `fk_${table.name}_${col.name}`
        constraints.push(
          `CONSTRAINT ${fkName} FOREIGN KEY (${col.name}) REFERENCES public.${refTable.name}(${refColumn.name}) ON DELETE CASCADE`
        )
      }
    }
  })
  
  // Check constraints from column descriptions (e.g., "draft | active | archived")
  table.columns.forEach((col) => {
    if (col.description && col.description.includes('|')) {
      // Clean up values: remove quotes, trim whitespace
      const values = col.description
        .split('|')
        .map(v => v.trim())
        .map(v => v.replace(/^['"]|['"]$/g, '')) // Remove leading/trailing quotes
        .filter(v => v.length > 0)
      
      if (values.length > 0) {
        const checkName = `check_${table.name}_${col.name}`
        const valuesList = values.map(v => `'${v}'`).join(', ')
        constraints.push(
          `CONSTRAINT ${checkName} CHECK (${col.name} IN (${valuesList}))`
        )
      }
    }
  })
  
  return constraints
}

const generateIndexes = (schema: SchemaData): string[] => {
  const indexes: string[] = []
  
  schema.tables.forEach((table) => {
    // Index on foreign keys for better query performance
    table.columns.forEach((col) => {
      if (col.isForeignKey && !col.isPrimaryKey) {
        const indexName = `idx_${table.name}_${col.name}`
        indexes.push(`CREATE INDEX IF NOT EXISTS ${indexName} ON public.${table.name}(${col.name});`)
      }
    })
    
    // Index on unique columns (if not already primary key)
    table.columns.forEach((col) => {
      if (col.isUnique && !col.isPrimaryKey && !col.isForeignKey) {
        const indexName = `idx_${table.name}_${col.name}`
        indexes.push(`CREATE INDEX IF NOT EXISTS ${indexName} ON public.${table.name}(${col.name});`)
      }
    })
  })
  
  return indexes
}

const generateComments = (schema: SchemaData): string[] => {
  const comments: string[] = []
  
  schema.tables.forEach((table) => {
    if (table.description) {
      comments.push(`COMMENT ON TABLE public.${table.name} IS '${table.description.replace(/'/g, "''")}';`)
    }
    
    table.columns.forEach((col) => {
      if (col.description) {
        comments.push(`COMMENT ON COLUMN public.${table.name}.${col.name} IS '${col.description.replace(/'/g, "''")}';`)
      }
    })
  })
  
  return comments
}

