import type { ReactNode } from 'react'

type AppLayoutProps = {
  header?: ReactNode
  footer?: ReactNode
  sidebar: ReactNode
  main: ReactNode
}

export const AppLayout = ({ header, footer, sidebar, main }: AppLayoutProps) => {
  return (
    <div className="app-shell">
      <header className="app-shell__header">
        {header ?? (
          <div className="app-shell__header-content">
            <div className="app-shell__brand">
              <h1 className="app-shell__title">ERD Generator</h1>
              <p className="app-shell__subtitle">AI-powered database schema designer</p>
            </div>
            <button className="app-shell__cta" type="button">
              <span className="app-shell__cta-icon" aria-hidden="true">DB</span>
              Connect to Supabase
            </button>
          </div>
        )}
      </header>
      <div className="app-shell__body">
        <aside className="app-shell__sidebar">{sidebar}</aside>
        <main className="app-shell__main">{main}</main>
      </div>
    </div>
  )
}

