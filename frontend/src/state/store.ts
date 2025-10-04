import { createContext, useContext, useRef } from 'react'
import type { ReactNode } from 'react'
import { createStore } from 'zustand'
import { devtools } from 'zustand/middleware'

import { buildInitialState } from './mocks'
import type { AppActions, AppState, ChatMessage, StepKey } from './types'

type Store = AppState & AppActions

const createAppStore = () =>
  createStore<Store>()(
    devtools((set) => ({
      ...buildInitialState(),
      reset: () => set(buildInitialState()),
      setActiveStep: (step: StepKey) =>
        set((state) => ({
          stepper: {
            ...state.stepper,
            active: step,
          },
        })),
      markStepCompleted: (step: StepKey, complete = true) =>
        set((state) => {
          const nextCompleted = new Set(state.stepper.completed)
          if (complete) {
            nextCompleted.add(step)
          } else {
            nextCompleted.delete(step)
          }
          return {
            stepper: {
              ...state.stepper,
              completed: Array.from(nextCompleted),
            },
          }
        }),
      addChatMessage: (message: ChatMessage) =>
        set((state) => ({
          chat: {
            ...state.chat,
            messages: [...state.chat.messages, message],
          },
        })),
      setChatMessages: (messages: ChatMessage[]) =>
        set((state) => ({
          chat: {
            ...state.chat,
            messages,
          },
        })),
      patchChat: (patch) =>
        set((state) => ({
          chat: {
            ...state.chat,
            ...patch,
          },
        })),
      patchPrompt: (patch) =>
        set((state) => ({
          prompt: {
            ...state.prompt,
            ...patch,
          },
        })),
      setSchemaData: (data) =>
        set((state) => ({
          schema: {
            ...state.schema,
            data,
            updatedAt: data ? new Date().toISOString() : state.schema.updatedAt,
          },
        })),
      patchSchemaState: (patch) =>
        set((state) => ({
          schema: {
            ...state.schema,
            ...patch,
          },
        })),
      patchSql: (patch) =>
        set((state) => ({
          sql: {
            ...state.sql,
            ...patch,
          },
        })),
      patchAsyncState: (patch) =>
        set((state) => ({
          async: {
            ...state.async,
            ...patch,
          },
        })),
      patchUiState: (patch) =>
        set((state) => ({
          ui: {
            ...state.ui,
            ...patch,
          },
        })),
      setGlobalError: (error) => set({ error }),
    }), { name: 'app-store' }),
  )

const StoreContext = createContext<ReturnType<typeof createAppStore> | null>(null)

type StoreProviderProps = {
  children: ReactNode
}

export const StoreProvider = ({ children }: StoreProviderProps) => {
  const storeRef = useRef<ReturnType<typeof createAppStore>>()
  if (!storeRef.current) {
    storeRef.current = createAppStore()
  }
  return <StoreContext.Provider value={storeRef.current}>{children}</StoreContext.Provider>
}

export const useStore = <T,>(selector: (state: Store) => T): T => {
  const store = useContext(StoreContext)
  if (!store) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return store(selector)
}

export const useStoreApi = () => {
  const store = useContext(StoreContext)
  if (!store) {
    throw new Error('useStoreApi must be used within a StoreProvider')
  }
  return store
}

