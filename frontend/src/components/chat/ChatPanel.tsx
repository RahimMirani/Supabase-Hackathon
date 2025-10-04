import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { generateSchema, ApiError } from '../../services/apiService'
import { useStore } from '../../state'
import type { ChatMessage } from '../../state'

const scrollToBottom = (container: HTMLDivElement | null) => {
  if (!container) return
  container.scrollTo({
    top: container.scrollHeight,
    behavior: 'smooth',
  })
}

export const ChatPanel = () => {
  const messages = useStore((state) => state.chat.messages)
  const isLoading = useStore((state) => state.chat.isLoading)
  const addChatMessage = useStore((state) => state.addChatMessage)
  const patchChat = useStore((state) => state.patchChat)
  const patchPrompt = useStore((state) => state.patchPrompt)
  const setSchemaData = useStore((state) => state.setSchemaData)
  const patchAsyncState = useStore((state) => state.patchAsyncState)

  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const canSend = input.trim().length > 0 && !isLoading

  useEffect(() => {
    scrollToBottom(containerRef.current)
  }, [messages.length, isLoading])

  const handleSend = useCallback(async () => {
    if (!canSend) return
    const content = input.trim()
    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    }

    patchChat({ isLoading: true, error: null })
    patchAsyncState({ isGeneratingSchema: true })
    addChatMessage(userMessage)
    setInput('')
    setError(null)

    try {
      // Call real backend API to generate schema
      const schema = await generateSchema(content)
      
      // Update schema state
      setSchemaData(schema)
      
      // Add success AI message
      const aiMessage: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'ai',
        content: `I've generated a database schema with ${schema.tables.length} tables and ${schema.relations.length} relationships. Check out the ERD on the right! You can view the SQL or connect to Supabase when ready.`,
        createdAt: new Date().toISOString(),
      }
      addChatMessage(aiMessage)
      patchPrompt({ current: content, lastSubmitted: content, isDirty: false })
    } catch (err) {
      console.error('Error generating schema:', err)
      
      let errorMessage = 'Failed to generate schema. Please try again.'
      if (err instanceof ApiError) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      patchChat({ error: errorMessage })
      
      // Add error AI message
      const errorAiMessage: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'ai',
        content: `Sorry, I encountered an error: ${errorMessage}`,
        createdAt: new Date().toISOString(),
      }
      addChatMessage(errorAiMessage)
    } finally {
      patchChat({ isLoading: false })
      patchAsyncState({ isGeneratingSchema: false })
    }
  }, [addChatMessage, canSend, input, patchChat, patchPrompt, setSchemaData, patchAsyncState])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  const placeholder = useMemo(
    () =>
      isLoading
        ? 'Thinking...'
        : 'Describe your app in plain English. Mention entities, fields, and permissions.',
    [isLoading],
  )

  return (
    <div className="chat-panel">
      <header className="chat-panel__header">
        <div className="chat-panel__header-meta">
          <div className="chat-panel__badge">Chat</div>
          <p className="chat-panel__title">ERD Chat Assistant</p>
          <p className="chat-panel__subtitle">Describe your app to generate a database schema</p>
        </div>
      </header>

      <div ref={containerRef} className="chat-panel__scroll">
        <div className="chat-panel__messages">
          {messages.map((message) => (
            <article
              key={message.id}
              className={`chat-bubble chat-bubble--${message.role}`}
              aria-label={`${message.role} message`}
            >
              <div className="chat-bubble__meta">
                <span className="chat-bubble__role">{message.role === 'user' ? 'You' : 'Assistant'}</span>
                <time dateTime={message.createdAt}>
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </time>
              </div>
              <p className="chat-bubble__content">{message.content}</p>
            </article>
          ))}
          {isLoading ? <div className="chat-panel__typing">Assistant is thinking…</div> : null}
        </div>
      </div>

      <footer className="chat-panel__composer">
        <label className="chat-panel__label" htmlFor="chat-input">
          Describe your app
        </label>
        <textarea
          id="chat-input"
          className="chat-panel__textarea"
          placeholder={placeholder}
          value={input}
          onChange={(event) => {
            setError(null)
            setInput(event.target.value)
          }}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          rows={3}
        />
        {error ? <p className="chat-panel__error" role="alert">{error}</p> : null}
        <div className="chat-panel__actions">
          <button type="button" className="btn" onClick={handleSend} disabled={!canSend}>
            Send
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              setInput('')
              setError(null)
            }}
            disabled={isLoading}
          >
            Clear
          </button>
        </div>
      </footer>
    </div>
  )
}

