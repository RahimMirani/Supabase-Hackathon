import { AppLayout } from './components/layout'
import { StoreProvider } from './state'

const App = () => {
  return (
    <StoreProvider>
      <AppLayout sidebar={<div>Chat Sidebar</div>} main={<div>Stepper Area</div>} />
    </StoreProvider>
  )
}

export default App
