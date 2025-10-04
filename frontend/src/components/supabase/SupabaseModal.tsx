import { useState } from 'react'

type SupabaseModalProps = {
  isOpen: boolean
  onClose: () => void
  onConnect: (credentials: { url: string; serviceKey: string }) => Promise<{
    sql: string
    tablesCreated: string[]
    instructions: string
    credentials: { url: string; serviceKey: string }
  }>
  onApplyNow: (credentials: { url: string; serviceKey: string }, sql: string) => Promise<{
    success: boolean
    message: string
    tablesCreated: string[]
  }>
}

export const SupabaseModal = ({ isOpen, onClose, onConnect, onApplyNow }: SupabaseModalProps) => {
  const [url, setUrl] = useState('')
  const [serviceKey, setServiceKey] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showFinalSuccess, setShowFinalSuccess] = useState(false)
  const [successData, setSuccessData] = useState<{
    sql: string
    tablesCreated: string[]
    credentials: { url: string; serviceKey: string }
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
        credentials: result.credentials,
      })
      setShowSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to Supabase')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleApplyNow = async () => {
    if (!successData) return

    setIsApplying(true)
    setError(null)

    try {
      const result = await onApplyNow(successData.credentials, successData.sql)
      
      if (result.success) {
        // Show final success
        setShowFinalSuccess(true)
      } else {
        // Auto-execute not available, show message
        alert(result.message + '\n\nPlease copy the SQL and paste it into your Supabase SQL Editor.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply schema')
      alert('Failed to apply schema automatically. Please copy the SQL and paste it manually.')
    } finally {
      setIsApplying(false)
    }
  }

  const handleCopySql = async () => {
    if (successData?.sql) {
      await navigator.clipboard.writeText(successData.sql)
      alert('✓ SQL copied to clipboard!')
    }
  }

  const handleClose = () => {
    if (!isConnecting && !isApplying) {
      setUrl('')
      setServiceKey('')
      setError(null)
      setShowSuccess(false)
      setShowFinalSuccess(false)
      setSuccessData(null)
      onClose()
    }
  }

  if (!isOpen) return null

  // Final success view - tables created!
  if (showFinalSuccess && successData) {
    return (
      <div className="modal-overlay" onClick={handleClose}>
        <div className="modal-content modal-content--success" onClick={(e) => e.stopPropagation()}>
          <header className="modal-header">
            <div>
              <h2 className="modal-title">🎉 Tables Created!</h2>
              <p className="modal-subtitle">
                Successfully created {successData.tablesCreated.length} tables in Supabase!
              </p>
            </div>
            <button className="modal-close" onClick={handleClose} type="button" aria-label="Close">
              ×
            </button>
          </header>

          <div className="modal-body">
            <div className="success-content">
              <div className="success-tables">
                <h3>✓ Tables created:</h3>
                <div className="success-tables-list">
                  {successData.tablesCreated.map((table) => (
                    <span key={table} className="success-table-badge">
                      {table}
                    </span>
                  ))}
                </div>
              </div>

              <div className="success-instructions">
                <p style={{ fontSize: '1.1rem', color: '#3ECF8E', fontWeight: 600 }}>
                  🚀 Your database is ready! Check your Supabase dashboard.
                </p>
              </div>
            </div>
          </div>

          <footer className="modal-footer">
            <button className="btn" onClick={handleClose} type="button">
              Done
            </button>
          </footer>
        </div>
      </div>
    )
  }

  // Success view - ready to apply
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
            <button className="btn btn--ghost" onClick={handleClose} type="button" disabled={isApplying}>
              Cancel
            </button>
            <button className="btn btn--ghost" onClick={handleCopySql} type="button" disabled={isApplying}>
              📋 Copy SQL
            </button>
            <button className="btn" onClick={handleApplyNow} type="button" disabled={isApplying}>
              {isApplying ? '🔄 Creating Tables...' : '🚀 Apply Now (Auto-Create)'}
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

