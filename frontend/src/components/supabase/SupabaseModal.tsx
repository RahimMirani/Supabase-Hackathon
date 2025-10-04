import { useState } from 'react'

type SupabaseModalProps = {
  isOpen: boolean
  onClose: () => void
  onConnect: (credentials: { url: string; serviceKey: string }) => Promise<void>
}

export const SupabaseModal = ({ isOpen, onClose, onConnect }: SupabaseModalProps) => {
  const [url, setUrl] = useState('')
  const [serviceKey, setServiceKey] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url || !serviceKey) {
      setError('Both URL and Service Key are required')
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      await onConnect({ url: url.trim(), serviceKey: serviceKey.trim() })
      // Success - close modal
      setUrl('')
      setServiceKey('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to Supabase')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleClose = () => {
    if (!isConnecting) {
      setUrl('')
      setServiceKey('')
      setError(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content modal-content--supabase" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <div>
            <h2 className="modal-title">Connect to Supabase</h2>
            <p className="modal-subtitle">Apply your schema directly to a Supabase project</p>
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
                  Service Role Key
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
                  Find this in your Supabase project settings under "API" → "service_role"
                </p>
              </div>

              <div className="form-warning">
                <div className="form-warning__icon">⚠️</div>
                <div className="form-warning__content">
                  <strong>Security Notice:</strong> Your credentials are only used for this session 
                  and are NOT stored. The Service Role key has full database access - use with caution.
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

