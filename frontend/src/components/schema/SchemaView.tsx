import { useState } from 'react'
import { MermaidERD } from './MermaidERD'
import type { SchemaData } from '../../state/types'

type SchemaViewProps = {
  schema: SchemaData
  onViewSql?: () => void
}

export const SchemaView = ({ schema, onViewSql }: SchemaViewProps) => {
  const [activeTab, setActiveTab] = useState<'diagram' | 'tables'>('diagram')

  return (
    <div className="schema-view">
      <header className="schema-view__header">
        <div>
          <h2 className="schema-view__title">Database Schema</h2>
          <p className="schema-view__subtitle">
            {schema.tables.length} {schema.tables.length === 1 ? 'table' : 'tables'},{' '}
            {schema.relations.length} {schema.relations.length === 1 ? 'relation' : 'relations'}
          </p>
        </div>
        <button className="btn" onClick={onViewSql} type="button">
          View SQL
        </button>
      </header>

      <div className="schema-view__tabs">
        <button
          className={`schema-view__tab ${activeTab === 'diagram' ? 'schema-view__tab--active' : ''}`}
          onClick={() => setActiveTab('diagram')}
          type="button"
        >
          ERD Diagram
        </button>
        <button
          className={`schema-view__tab ${activeTab === 'tables' ? 'schema-view__tab--active' : ''}`}
          onClick={() => setActiveTab('tables')}
          type="button"
        >
          Tables
        </button>
      </div>

      <div className="schema-view__content">
        {activeTab === 'diagram' ? (
          <div className="schema-view__diagram-wrapper">
            <MermaidERD schema={schema} />
          </div>
        ) : (
          <div className="schema-view__tables">
            {schema.tables.map((table) => (
              <div key={table.id} className="table-card">
                <div className="table-card__header">
                  <h3 className="table-card__name">{table.name}</h3>
                  {table.description && (
                    <p className="table-card__description">{table.description}</p>
                  )}
                </div>
                <div className="table-card__columns">
                  {table.columns.map((column) => (
                    <div key={column.id} className="column-row">
                      <span className="column-row__name">{column.name}</span>
                      <span className="column-row__type">{column.type}</span>
                      <div className="column-row__badges">
                        {column.isPrimaryKey && <span className="badge badge--primary">PK</span>}
                        {column.isForeignKey && <span className="badge badge--foreign">FK</span>}
                        {column.isUnique && <span className="badge badge--unique">UNIQUE</span>}
                        {!column.isNullable && <span className="badge badge--required">NOT NULL</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

