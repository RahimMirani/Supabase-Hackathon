import { AppLayout } from './components/layout'
import { ChatPanel } from './components/chat'
import { StoreProvider } from './state'
import './App.css'

const App = () => {
  return (
    <StoreProvider>
      <AppLayout sidebar={<ChatPanel />} main={<div className="workspace-placeholder">No schema generated yet</div>} />
    </StoreProvider>
  )
}

export default App
