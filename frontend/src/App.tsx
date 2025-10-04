import { AppLayout } from './components/layout'
import { ChatPanel } from './components/chat'
import { StoreProvider } from './state'

const App = () => {
  return (
    <StoreProvider>
      <AppLayout sidebar={<ChatPanel />} main={<div>Stepper Area</div>} />
    </StoreProvider>
  )
}

export default App
