import type { AppState, StepKey } from './types'

// Keeping mock data for reference - currently unused
/* eslint-disable @typescript-eslint/no-unused-vars */
/*
const mockMessages = [
  {
    id: 'msg-1',
    role: 'user',
    content:
      'I need an app where users can create projects, add tasks, and track progress with statuses.',
    createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  },
  {
    id: 'msg-2',
    role: 'ai',
    content:
      "Got it! We'll design tables for users, projects, tasks, and task updates. Ready when you want the schema!",
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
]

const mockSchema = {
  tables: [
    {
      id: 'tbl-users',
      name: 'users',
      label: 'Users',
      description: 'Registered people who can create projects and tasks.',
      columns: [
        {
          id: 'col-users-id',
          name: 'id',
          type: 'uuid',
          isPrimaryKey: true,
          isNullable: false,
          defaultValue: 'gen_random_uuid()'
        },
        {
          id: 'col-users-email',
          name: 'email',
          type: 'text',
          isUnique: true,
          isNullable: false,
        },
        {
          id: 'col-users-name',
          name: 'full_name',
          type: 'text',
          isNullable: false,
        },
        {
          id: 'col-users-created',
          name: 'created_at',
          type: 'timestamp with time zone',
          defaultValue: 'now()',
        },
      ],
    },
    {
      id: 'tbl-projects',
      name: 'projects',
      description: 'Projects owned by users.',
      columns: [
        {
          id: 'col-projects-id',
          name: 'id',
          type: 'uuid',
          isPrimaryKey: true,
          defaultValue: 'gen_random_uuid()',
        },
        {
          id: 'col-projects-owner',
          name: 'owner_id',
          type: 'uuid',
          isNullable: false,
          isForeignKey: true,
          references: { tableId: 'tbl-users', columnId: 'col-users-id' },
        },
        {
          id: 'col-projects-name',
          name: 'name',
          type: 'text',
          isNullable: false,
        },
        {
          id: 'col-projects-status',
          name: 'status',
          type: "text",
          description: 'draft | active | archived',
        },
        {
          id: 'col-projects-created',
          name: 'created_at',
          type: 'timestamp with time zone',
          defaultValue: 'now()',
        },
      ],
    },
    {
      id: 'tbl-tasks',
      name: 'tasks',
      description: 'Tasks assigned within projects.',
      columns: [
        {
          id: 'col-tasks-id',
          name: 'id',
          type: 'uuid',
          isPrimaryKey: true,
          defaultValue: 'gen_random_uuid()',
        },
        {
          id: 'col-tasks-project',
          name: 'project_id',
          type: 'uuid',
          isNullable: false,
          isForeignKey: true,
          references: { tableId: 'tbl-projects', columnId: 'col-projects-id' },
        },
        {
          id: 'col-tasks-owner',
          name: 'assignee_id',
          type: 'uuid',
          isForeignKey: true,
          references: { tableId: 'tbl-users', columnId: 'col-users-id' },
        },
        {
          id: 'col-tasks-title',
          name: 'title',
          type: 'text',
          isNullable: false,
        },
        {
          id: 'col-tasks-status',
          name: 'status',
          type: 'text',
          description: 'todo | in_progress | done',
        },
        {
          id: 'col-tasks-due',
          name: 'due_date',
          type: 'date',
        },
      ],
    },
  ],
  relations: [
    {
      id: 'rel-projects-owner',
      fromTableId: 'tbl-projects',
      toTableId: 'tbl-users',
      fromColumnId: 'col-projects-owner',
      toColumnId: 'col-users-id',
      relationship: 'many-to-one',
    },
    {
      id: 'rel-tasks-project',
      fromTableId: 'tbl-tasks',
      toTableId: 'tbl-projects',
      fromColumnId: 'col-tasks-project',
      toColumnId: 'col-projects-id',
      relationship: 'many-to-one',
    },
    {
      id: 'rel-tasks-assignee',
      fromTableId: 'tbl-tasks',
      toTableId: 'tbl-users',
      fromColumnId: 'col-tasks-owner',
      toColumnId: 'col-users-id',
      relationship: 'many-to-one',
    },
  ],
}

const mockSql = `-- Projects app schema...`
*/
/* eslint-enable @typescript-eslint/no-unused-vars */

const defaultSequence: StepKey[] = ['prompt', 'schema', 'sql', 'apply']

export const buildInitialState = (): AppState => ({
  chat: {
    messages: [],
    isLoading: false,
    error: null,
  },
  prompt: {
    current: '',
    lastSubmitted: null,
    isDirty: false,
  },
  schema: {
    data: null,
    hasEdits: false,
    updatedAt: null,
  },
  sql: {
    text: '',
    filename: 'schema.sql',
    hasEdits: false,
  },
  stepper: {
    active: 'prompt',
    sequence: defaultSequence,
    completed: [],
  },
  async: {
    isGeneratingSchema: false,
    isGeneratingSql: false,
    isApplyingChanges: false,
  },
  ui: {
    theme: 'system',
    isChatCollapsed: false,
    showSupabaseModal: false,
    showSqlModal: false,
    showSupabaseConnectModal: false,
  },
  error: null,
})

