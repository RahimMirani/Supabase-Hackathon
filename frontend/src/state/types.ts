export type StepKey = 'prompt' | 'schema' | 'sql' | 'apply'

export type ChatRole = 'user' | 'ai'

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  createdAt: string
}

export type ChatState = {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
}

export type PromptState = {
  current: string
  lastSubmitted: string | null
  isDirty: boolean
}

export type SchemaColumn = {
  id: string
  name: string
  type: string
  isPrimaryKey?: boolean
  isForeignKey?: boolean
  references?: {
    tableId: string
    columnId: string
  } | null
  isNullable?: boolean
  isUnique?: boolean
  defaultValue?: string | null
  description?: string | null
}

export type SchemaTable = {
  id: string
  name: string
  label?: string
  description?: string | null
  columns: SchemaColumn[]
}

export type SchemaRelation = {
  id: string
  fromTableId: string
  toTableId: string
  fromColumnId: string
  toColumnId: string
  relationship: 'one-to-one' | 'one-to-many' | 'many-to-many'
  description?: string | null
}

export type SchemaData = {
  tables: SchemaTable[]
  relations: SchemaRelation[]
}

export type SchemaState = {
  data: SchemaData | null
  hasEdits: boolean
  updatedAt: string | null
}

export type SqlState = {
  text: string
  filename: string
  hasEdits: boolean
}

export type StepperState = {
  active: StepKey
  sequence: StepKey[]
  completed: StepKey[]
}

export type AsyncState = {
  isGeneratingSchema: boolean
  isGeneratingSql: boolean
  isApplyingChanges: boolean
}

export type UiState = {
  theme: 'light' | 'dark' | 'system'
  isChatCollapsed: boolean
  showSupabaseModal: boolean
}

export type AppState = {
  chat: ChatState
  prompt: PromptState
  schema: SchemaState
  sql: SqlState
  stepper: StepperState
  async: AsyncState
  ui: UiState
  error: string | null
}

export type AppActions = {
  reset: () => void
  setActiveStep: (step: StepKey) => void
  markStepCompleted: (step: StepKey, complete?: boolean) => void
  addChatMessage: (message: ChatMessage) => void
  setChatMessages: (messages: ChatMessage[]) => void
  patchChat: (patch: Partial<ChatState>) => void
  patchPrompt: (patch: Partial<PromptState>) => void
  setSchemaData: (data: SchemaData | null) => void
  patchSchemaState: (patch: Partial<Omit<SchemaState, 'data'>>) => void
  patchSql: (patch: Partial<SqlState>) => void
  patchAsyncState: (patch: Partial<AsyncState>) => void
  patchUiState: (patch: Partial<UiState>) => void
  setGlobalError: (error: string | null) => void
}

