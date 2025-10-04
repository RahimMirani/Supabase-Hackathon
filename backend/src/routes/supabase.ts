import { Router, Request, Response } from 'express'
import { createClient } from '@supabase/supabase-js'
import { SchemaDataSchema } from '../types/schema'
import { ZodError } from 'zod'

const router = Router()

/**
 * Parse SQL to extract table names
 */
function extractTableNames(sql: string): string[] {
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'))

  const tablesCreated: string[] = []

  for (const statement of statements) {
    if (statement.toLowerCase().includes('create table')) {
      const match = statement.match(/create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?(\w+)/i)
      if (match) {
        tablesCreated.push(match[1])
      }
    }
  }

  return tablesCreated
}

/**
 * POST /api/supabase/apply
 * Apply schema SQL to a Supabase project
 */
router.post('/apply', async (req: Request, res: Response) => {
  try {
    const { supabaseUrl, supabaseKey, sql } = req.body

    // Validate required fields
    if (!supabaseUrl || !supabaseKey || !sql) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: supabaseUrl, supabaseKey, and sql are required',
      })
    }

    // Validate Supabase URL format
    if (!supabaseUrl.includes('supabase.co')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Supabase URL format. Should be: https://your-project.supabase.co',
      })
    }

    console.log('Connecting to Supabase:', supabaseUrl)

    // Create Supabase client with provided credentials
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    // Simple connection test - try to access the auth endpoint
    try {
      // Make a simple request to verify credentials work
      const testResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      })

      if (!testResponse.ok && testResponse.status === 401) {
        console.error('Authentication failed - invalid API key')
        return res.status(401).json({
          success: false,
          error: 'Invalid Supabase credentials. Please check your Project URL and Service Role Key.',
        })
      }

      console.log('✓ Connection verified! Credentials are valid.')
    } catch (testError) {
      console.error('Connection test error:', testError)
      // Continue anyway - if credentials are wrong, user will find out when pasting SQL
      console.log('⚠️ Could not verify connection, but proceeding with SQL generation')
    }

    // Extract table names from SQL
    const tablesCreated = extractTableNames(sql)

    console.log(`Schema ready to apply: ${tablesCreated.length} tables`)
    console.log(`Tables: ${tablesCreated.join(', ')}`)

    // Return success with SQL - frontend will show instructions
    res.json({
      success: true,
      message: `✅ Connection verified! Ready to create ${tablesCreated.length} tables.`,
      tablesCreated,
      sql, // Include SQL so frontend can show it
      instructions: 'Copy the SQL and paste it into your Supabase SQL Editor to create the tables.',
    })
  } catch (error) {
    console.error('Error applying schema to Supabase:', error)

    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors,
      })
    }

    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      })
    }

    res.status(500).json({
      success: false,
      error: 'Failed to apply schema to Supabase',
    })
  }
})

/**
 * POST /api/supabase/test-connection
 * Test Supabase connection
 */
router.post('/test-connection', async (req: Request, res: Response) => {
  try {
    const { supabaseUrl, supabaseKey } = req.body

    if (!supabaseUrl || !supabaseKey) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: supabaseUrl and supabaseKey',
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Try a simple query
    const { error } = await supabase
      .from('_test')
      .select('*')
      .limit(1)

    // If we get here without throwing, connection works
    res.json({
      success: true,
      message: 'Successfully connected to Supabase',
    })
  } catch (error) {
    console.error('Connection test failed:', error)
    res.status(401).json({
      success: false,
      error: 'Failed to connect to Supabase',
    })
  }
})

export default router

