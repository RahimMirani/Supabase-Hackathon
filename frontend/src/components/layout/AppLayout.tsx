import type { ReactNode } from 'react'

type AppLayoutProps = {
  footer?: ReactNode
  sidebar: ReactNode
  main: ReactNode
}

export const AppLayout = ({ footer, sidebar, main }: AppLayoutProps) => {
  return (
    <div className="app-shell">
      <div className="app-shell__body">
        <aside className="app-shell__sidebar">{sidebar}</aside>
        <main className="app-shell__main">{main}</main>
      </div>
      <footer className="app-shell__footer">
        {footer ?? <span>Hackathon prototype · Powered by Supabase</span>}
      </footer>
    </div>
  )
}

