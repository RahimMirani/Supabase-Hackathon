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
        {header ?? <h1 className="app-shell__title">Schema Studio</h1>}
      </header>
      <div className="app-shell__body">
        <aside className="app-shell__sidebar">{sidebar}</aside>
        <main className="app-shell__main">{main}</main>
      </div>
      <footer className="app-shell__footer">
        {footer ?? <span>Hackathon prototype · Phase 1</span>}
      </footer>
    </div>
  )
}

