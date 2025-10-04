import { AppLayout } from './components/layout'
import { ChatPanel } from './components/chat'
import { SchemaView } from './components/schema'
import { StoreProvider, useStore } from './state'
import './App.css'

const AppContent = () => {
  const schema = useStore((state) => state.schema.data)
  const patchUiState = useStore((state) => state.patchUiState)

  const handleViewSql = () => {
    patchUiState({ showSupabaseModal: true })
  }

  return (
    <AppLayout
      sidebar={<ChatPanel />}
      main={
        schema ? (
          <SchemaView schema={schema} onViewSql={handleViewSql} />
        ) : (
          <div className="workspace-placeholder">No schema generated yet</div>
        )
      }
    />
  )
}

const App = () => {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  )
}

export default App
