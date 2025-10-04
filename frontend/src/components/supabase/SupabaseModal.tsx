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

  const handleCopySetupSql = async () => {
    const setupSql = `CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
AS $$ BEGIN EXECUTE query; END; $$;

GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;`
    
    await navigator.clipboard.writeText(setupSql)
    alert('✓ Setup SQL copied! Paste it into your Supabase SQL Editor and run it.')
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
                <h3>Choose How to Apply:</h3>
                
                <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(62, 207, 142, 0.1)', borderRadius: '8px', border: '1px solid rgba(62, 207, 142, 0.3)' }}>
                  <h4 style={{ color: '#3ECF8E', marginTop: 0, marginBottom: '0.5rem' }}>Option 1: Auto-Apply (One Click) ⚡</h4>
                  <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
                    <strong>First-time setup required:</strong> Run this SQL once in your Supabase SQL Editor:
                  </p>
                  <pre style={{ 
                    background: '#1a1a1a', 
                    padding: '0.75rem', 
                    borderRadius: '4px', 
                    fontSize: '0.85rem',
                    overflow: 'auto',
                    border: '1px solid #333'
                  }}>
{`CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
AS $$ BEGIN EXECUTE query; END; $$;

GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;`}
                  </pre>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#888' }}>
                    ✓ After running this once, click "Apply Now" to auto-create tables
                  </p>
                </div>

                <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                  <h4 style={{ color: '#fff', marginTop: 0, marginBottom: '0.5rem' }}>Option 2: Manual Copy & Paste 📋</h4>
                  <ol style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                    <li>Click "Copy SQL" below</li>
                    <li>Open your Supabase SQL Editor</li>
                    <li>Paste and run the SQL</li>
                  </ol>
                </div>
              </div>

              <div className="success-sql-preview">
                <details>
                  <summary style={{ cursor: 'pointer', color: '#3ECF8E', marginBottom: '0.5rem' }}>
                    Preview SQL ({successData.sql.length} characters)
                  </summary>
                  <pre style={{ maxHeight: '200px', overflow: 'auto' }}>{successData.sql}</pre>
                </details>
              </div>
            </div>
          </div>

          <footer className="modal-footer">
            <button className="btn btn--ghost" onClick={handleClose} type="button" disabled={isApplying}>
              Cancel
            </button>
            <button className="btn btn--ghost" onClick={handleCopySetupSql} type="button" disabled={isApplying}>
              ⚡ Copy Setup SQL
            </button>
            <button className="btn btn--ghost" onClick={handleCopySql} type="button" disabled={isApplying}>
              📋 Copy Schema SQL
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

