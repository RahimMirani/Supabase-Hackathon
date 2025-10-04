import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'
import type { SchemaData } from '../../state/types'

// Initialize mermaid with config
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'inherit',
})

type MermaidERDProps = {
  schema: SchemaData
}

const convertSchemaToMermaid = (schema: SchemaData): string => {
  const lines = ['erDiagram']

  // Add tables with their columns
  schema.tables.forEach((table) => {
    const columns = table.columns.map((col) => {
      let constraints = []
      
      if (col.isPrimaryKey) constraints.push('PK')
      if (col.isForeignKey) constraints.push('FK')
      if (col.isUnique) constraints.push('UNIQUE')
      
      const constraintStr = constraints.length > 0 ? ` "${constraints.join(',')}"` : ''
      // Sanitize type name by replacing spaces with underscores
      const sanitizedType = col.type.replace(/\s+/g, '_')
      // Mermaid format: type columnName "constraint"
      return `        ${sanitizedType} ${col.name}${constraintStr}`
    })

    lines.push(`    ${table.name} {`)
    lines.push(...columns)
    lines.push(`    }`)
  })

  // Add relations
  schema.relations.forEach((rel) => {
    const fromTable = schema.tables.find((t) => t.id === rel.fromTableId)
    const toTable = schema.tables.find((t) => t.id === rel.toTableId)

    if (fromTable && toTable) {
      let relationSymbol = '||--o{'
      if (rel.relationship === 'one-to-one') relationSymbol = '||--||'
      if (rel.relationship === 'one-to-many') relationSymbol = '||--o{'
      if (rel.relationship === 'many-to-one') relationSymbol = '}o--||'
      if (rel.relationship === 'many-to-many') relationSymbol = '}o--o{'

      const label = rel.description || 'has'
      lines.push(`    ${fromTable.name} ${relationSymbol} ${toTable.name} : "${label}"`)
    }
  })

  return lines.join('\n')
}

export const MermaidERD = ({ schema }: MermaidERDProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const mermaidCode = convertSchemaToMermaid(schema)

  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current) return

      try {
        console.log('Rendering Mermaid diagram with code:', mermaidCode)
        const id = `mermaid-${Date.now()}`
        const { svg } = await mermaid.render(id, mermaidCode)
        containerRef.current.innerHTML = svg
      } catch (error) {
        console.error('Failed to render Mermaid diagram:', error)
        console.error('Mermaid code was:', mermaidCode)
        containerRef.current.innerHTML = `
          <div style="padding: 1rem; color: #d93025;">
            <p><strong>Failed to render ERD</strong></p>
            <p style="font-size: 0.85rem; margin-top: 0.5rem;">Check console for details</p>
          </div>
        `
      }
    }

    renderDiagram()
  }, [mermaidCode])

  return (
    <div className="mermaid-erd">
      <div ref={containerRef} className="mermaid-erd__diagram" />
    </div>
  )
}

