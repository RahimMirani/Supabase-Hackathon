import type { SchemaData } from '../state/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export class ApiError extends Error {
  statusCode?: number
  details?: any
  
  constructor(message: string, statusCode?: number, details?: any) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.details = details
  }
}

/**
 * Generate database schema from natural language prompt
 */
export async function generateSchema(prompt: string): Promise<SchemaData> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/schema/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(
        data.error || 'Failed to generate schema',
        response.status,
        data.details
      )
    }

    if (!data.success || !data.schema) {
      throw new ApiError('Invalid response from server')
    }

    return data.schema
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError('Cannot connect to backend. Make sure the server is running on http://localhost:3001')
    }

    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error occurred'
    )
  }
}

/**
 * Apply schema to Supabase project
 */
export async function applyToSupabase(
  supabaseUrl: string,
  supabaseKey: string,
  sql: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/supabase/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        supabaseUrl,
        supabaseKey,
        sql,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(
        data.error || 'Failed to apply schema to Supabase',
        response.status,
        data.details
      )
    }

    return {
      success: data.success,
      message: data.message || 'Schema applied successfully!',
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError('Cannot connect to backend. Make sure the server is running.')
    }

    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error occurred'
    )
  }
}

/**
 * Health check endpoint
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/schema/health`)
    return response.ok
  } catch {
    return false
  }
}

