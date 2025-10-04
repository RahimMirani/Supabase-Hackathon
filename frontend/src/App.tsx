import { useState } from 'react'
import './App.css'

function App() {
  const [count, useCount] = useState(2)

  const handleClick = () => {
    useCount(count + 1)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold underline">Hello World</h1>
      <button onClick={handleClick}>
        {count}
      </button>
    </div>
  )
}

export default App
