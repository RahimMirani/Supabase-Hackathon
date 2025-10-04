import { useState } from 'react'

type SupabaseModalProps = {
  isOpen: boolean
  onClose: () => void
  onConnect: (credentials: { url: string; serviceKey: string }) => Promise<{
    sql: string
    tablesCreated: string[]
    instructions: string
  }>
}

export const SupabaseModal = ({ isOpen, onClose, onConnect }: SupabaseModalProps) => {
  const [url, setUrl] = useState('')
  const [serviceKey, setServiceKey] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successData, setSuccessData] = useState<{
    sql: string
    tablesCreated: string[]
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url || !serviceKey) {
      setError('Both URL and Service Key are required')
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      const result = await onConnect({ url: url.trim(), serviceKey: serviceKey.trim() })
      // Show success with SQL
      setSuccessData({
        sql: result.sql,
        tablesCreated: result.tablesCreated,
      })
      setShowSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to Supabase')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleCopySql = async () => {
    if (successData?.sql) {
      await navigator.clipboard.writeText(successData.sql)
      alert('SQL copied to clipboard!')
    }
  }

  const handleOpenSqlEditor = () => {
    if (url) {
      const projectUrl = url.replace('https://', '').replace('.supabase.co', '')
      window.open(`https://supabase.com/dashboard/project/${projectUrl}/editor/sql`, '_blank')
    }
  }

  const handleClose = () => {
    if (!isConnecting) {
      setUrl('')
      setServiceKey('')
      setError(null)
      setShowSuccess(false)
      setSuccessData(null)
      onClose()
    }
  }

  if (!isOpen) return null

  // Success view
  if (showSuccess && successData) {
    return (
      <div className="modal-overlay" onClick={handleClose}>
        <div className="modal-content modal-content--success" onClick={(e) => e.stopPropagation()}>
          <header className="modal-header">
            <div>
              <h2 className="modal-title">🎉 Ready to Apply!</h2>
              <p className="modal-subtitle">
                Your schema is ready with {successData.tablesCreated.length} tables
              </p>
            </div>
            <button className="modal-close" onClick={handleClose} type="button" aria-label="Close">
              ×
            </button>
          </header>

          <div className="modal-body">
            <div className="success-content">
              <div className="success-tables">
                <h3>Tables to create:</h3>
                <div className="success-tables-list">
                  {successData.tablesCreated.map((table) => (
                    <span key={table} className="success-table-badge">
                      {table}
                    </span>
                  ))}
                </div>
              </div>

              <div className="success-instructions">
                <h3>Next Steps:</h3>
                <ol>
                  <li>Click "Copy SQL" below</li>
                  <li>Open your Supabase SQL Editor</li>
                  <li>Paste and run the SQL</li>
                  <li>Your tables will be created! 🚀</li>
                </ol>
              </div>

              <div className="success-sql-preview">
                <pre>{successData.sql.substring(0, 300)}...</pre>
              </div>
            </div>
          </div>

          <footer className="modal-footer">
            <button className="btn btn--ghost" onClick={handleClose} type="button">
              Done
            </button>
            <button className="btn btn--ghost" onClick={handleOpenSqlEditor} type="button">
              Open SQL Editor →
            </button>
            <button className="btn" onClick={handleCopySql} type="button">
              📋 Copy SQL
            </button>
          </footer>
        </div>
      </div>
    )
  }

  // Connection form view
  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content modal-content--supabase" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <div>
            <h2 className="modal-title">Connect to Supabase</h2>
            <p className="modal-subtitle">Verify connection and prepare your schema</p>
          </div>
          <button 
            className="modal-close" 
            onClick={handleClose} 
            type="button" 
            aria-label="Close"
            disabled={isConnecting}
          >
            ×
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="supabase-form">
              <div className="form-group">
                <label htmlFor="supabase-url" className="form-label">
                  Project URL
                </label>
                <input
                  id="supabase-url"
                  type="url"
                  className="form-input"
                  placeholder="https://your-project.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isConnecting}
                  required
                />
                <p className="form-help">
                  Find this in your Supabase project settings under "API"
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="supabase-key" className="form-label">
                  Service Role Key (Secret Key)
                </label>
                <input
                  id="supabase-key"
                  type="password"
                  className="form-input"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={serviceKey}
                  onChange={(e) => setServiceKey(e.target.value)}
                  disabled={isConnecting}
                  required
                />
                <p className="form-help">
                  Find this in Project Settings → API → "service_role" (secret key) - NOT the anon/public key
                </p>
              </div>

              <div className="form-warning">
                <div className="form-warning__icon">⚠️</div>
                <div className="form-warning__content">
                  <strong>Important:</strong> Use the <strong>service_role</strong> (secret) key, NOT the anon/public key. 
                  Your credentials are only used for this session and are NOT stored. 
                  The service role key has full database access.
                </div>
              </div>

              {error && (
                <div className="form-error" role="alert">
                  {error}
                </div>
              )}
            </div>
          </div>

          <footer className="modal-footer">
            <button 
              className="btn btn--ghost" 
              onClick={handleClose} 
              type="button"
              disabled={isConnecting}
            >
              Cancel
            </button>
            <button 
              className="btn" 
              type="submit"
              disabled={isConnecting}
            >
              {isConnecting ? 'Applying Schema...' : 'Apply to Supabase'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}

