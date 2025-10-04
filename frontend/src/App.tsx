import { AppLayout } from './components/layout'
import { ChatPanel } from './components/chat'
import { SchemaView } from './components/schema'
import { SqlModal } from './components/sql'
import { SupabaseModal } from './components/supabase'
import { StoreProvider, useStore } from './state'
import { applyToSupabase } from './services/apiService'
import { generateSqlFromSchema } from './utils/sqlGenerator'
import './App.css'

const AppContent = () => {
  const schema = useStore((state) => state.schema.data)
  const showSqlModal = useStore((state) => state.ui.showSqlModal)
  const showSupabaseConnectModal = useStore((state) => state.ui.showSupabaseConnectModal)
  const patchUiState = useStore((state) => state.patchUiState)

  const handleViewSql = () => {
    patchUiState({ showSqlModal: true })
  }

  const handleCloseSql = () => {
    patchUiState({ showSqlModal: false })
  }

  const handleConnectSupabase = () => {
    patchUiState({ showSupabaseConnectModal: true })
  }

  const handleCloseSupabaseModal = () => {
    patchUiState({ showSupabaseConnectModal: false })
  }

  const handleSupabaseConnect = async (credentials: { url: string; serviceKey: string }) => {
    if (!schema) {
      throw new Error('No schema to apply')
    }

    // Generate SQL from schema
    const sql = generateSqlFromSchema(schema)

    // Apply to Supabase (verifies connection and returns SQL)
    const result = await applyToSupabase(credentials.url, credentials.serviceKey, sql)

    // Return data for success modal
    return {
      sql,
      tablesCreated: schema.tables.map((t) => t.name),
      instructions: result.message,
    }
  }

  return (
    <>
      <AppLayout
        sidebar={<ChatPanel />}
        main={
          schema ? (
            <SchemaView 
              schema={schema} 
              onViewSql={handleViewSql}
              onConnectSupabase={handleConnectSupabase}
            />
          ) : (
            <div className="workspace-placeholder">No schema generated yet</div>
          )
        }
      />
      {schema && (
        <>
          <SqlModal schema={schema} isOpen={showSqlModal} onClose={handleCloseSql} />
          <SupabaseModal 
            isOpen={showSupabaseConnectModal} 
            onClose={handleCloseSupabaseModal}
            onConnect={handleSupabaseConnect}
          />
        </>
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
