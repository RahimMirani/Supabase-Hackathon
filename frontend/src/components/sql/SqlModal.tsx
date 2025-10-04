import { useState } from 'react'
import { generateSqlFromSchema } from '../../utils/sqlGenerator'
import type { SchemaData } from '../../state/types'

type SqlModalProps = {
  schema: SchemaData
  isOpen: boolean
  onClose: () => void
}

export const SqlModal = ({ schema, isOpen, onClose }: SqlModalProps) => {
  const [copied, setCopied] = useState(false)
  const sql = generateSqlFromSchema(schema)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sql)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy SQL:', err)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([sql], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'schema.sql'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <div>
            <h2 className="modal-title">Generated SQL</h2>
            <p className="modal-subtitle">Copy and run this in your Supabase SQL Editor</p>
          </div>
          <button className="modal-close" onClick={onClose} type="button" aria-label="Close">
            ×
          </button>
        </header>

        <div className="modal-body">
          <pre className="sql-preview">
            <code>{sql}</code>
          </pre>
        </div>

        <footer className="modal-footer">
          <button className="btn btn--ghost" onClick={onClose} type="button">
            Close
          </button>
          <button className="btn btn--ghost" onClick={handleDownload} type="button">
            Download .sql
          </button>
          <button className="btn" onClick={handleCopy} type="button">
            {copied ? '✓ Copied!' : 'Copy SQL'}
          </button>
        </footer>
      </div>
    </div>
  )
}

