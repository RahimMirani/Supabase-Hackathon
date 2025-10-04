import { AppLayout } from './components/layout'
import { ChatPanel } from './components/chat'
import { SchemaView } from './components/schema'
import { SqlModal } from './components/sql'
import { StoreProvider, useStore } from './state'
import './App.css'

const AppContent = () => {
  const schema = useStore((state) => state.schema.data)
  const showSqlModal = useStore((state) => state.ui.showSupabaseModal)
  const patchUiState = useStore((state) => state.patchUiState)

  const handleViewSql = () => {
    patchUiState({ showSupabaseModal: true })
  }

  const handleCloseSql = () => {
    patchUiState({ showSupabaseModal: false })
  }

  return (
    <>
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
      {schema && (
        <SqlModal schema={schema} isOpen={showSqlModal} onClose={handleCloseSql} />
      )}
    </>
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
