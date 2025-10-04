import { AppLayout } from './components/layout'
import { ChatPanel } from './components/chat'
import { SchemaView } from './components/schema'
import { SqlModal } from './components/sql'
import { SupabaseModal } from './components/supabase'
import { StoreProvider, useStore } from './state'
import { verifySupabaseConnection, applySchemaToSupabase } from './services/apiService'
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

    // Verify connection first
    const result = await verifySupabaseConnection(credentials.url, credentials.serviceKey, sql)

    // Return data for success modal (including credentials for auto-apply)
    return {
      sql: result.sql,
      tablesCreated: result.tablesCreated,
      instructions: result.message,
      credentials, // Pass credentials for "Apply Now" button
    }
  }

  const handleApplyNow = async (credentials: { url: string; serviceKey: string }, sql: string) => {
    // Execute SQL automatically
    const result = await applySchemaToSupabase(credentials.url, credentials.serviceKey, sql)
    return result
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
            onApplyNow={handleApplyNow}
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
