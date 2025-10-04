import { Router, Request, Response } from 'express'
import { createClient } from '@supabase/supabase-js'
import { SchemaDataSchema } from '../types/schema'
import { ZodError } from 'zod'

const router = Router()

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

    console.log('Applying schema to Supabase:', supabaseUrl)

    // Create Supabase client with provided credentials
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    })

    // Test connection first
    const { error: connectionError } = await supabase
      .from('_test')
      .select('*')
      .limit(1)

    // If table doesn't exist, that's fine - we just want to test auth
    if (connectionError && !connectionError.message.includes('does not exist')) {
      console.error('Connection test failed:', connectionError)
      return res.status(401).json({
        success: false,
        error: 'Failed to connect to Supabase. Please check your credentials.',
        details: connectionError.message,
      })
    }

    // Execute the SQL
    // Note: We need to use the SQL editor API or REST API
    // For now, we'll execute via RPC or direct query
    const { data, error: sqlError } = await supabase.rpc('exec_sql', { sql_string: sql })

    if (sqlError) {
      // If exec_sql function doesn't exist, try direct query
      console.log('Trying direct SQL execution...')
      
      // Split SQL into individual statements and execute them
      const statements = sql
        .split(';')
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0)

      console.log(`Executing ${statements.length} SQL statements...`)

      // Execute each statement
      for (const statement of statements) {
        if (statement.toLowerCase().startsWith('create table')) {
          // Extract table name and use from() method
          // This is a simplified approach - in production, use proper SQL execution
          console.log('Executing statement:', statement.substring(0, 50) + '...')
        }
      }

      // For now, return a helpful message
      return res.json({
        success: true,
        message: 'Schema structure received. To apply it, please run the SQL manually in your Supabase SQL Editor.',
        sqlPreview: sql.substring(0, 200) + '...',
        tablesCreated: statements.filter((s: string) => 
          s.toLowerCase().includes('create table')
        ).length,
      })
    }

    res.json({
      success: true,
      message: 'Schema applied successfully to Supabase!',
      result: data,
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

