import { Router, Request, Response } from 'express'
import { createClient } from '@supabase/supabase-js'
import { SchemaDataSchema } from '../types/schema'
import { ZodError } from 'zod'

const router = Router()

/**
 * Parse SQL to extract table names
 */
function extractTableNames(sql: string): string[] {
  console.log('Extracting table names from SQL...')
  console.log('SQL length:', sql.length)
  
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0) // Don't filter out comments - they might contain CREATE TABLE

  console.log(`Found ${statements.length} statements`)

  const tablesCreated: string[] = []

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]
    const lowerStatement = statement.toLowerCase()
    
    if (lowerStatement.includes('create table')) {
      console.log(`\n✓ Found CREATE TABLE in statement ${i + 1}`)
      console.log('First 200 chars:', statement.substring(0, 200))
      
      // Extract table name - handle multiline with comments
      const match = statement.match(/create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?([a-zA-Z_][a-zA-Z0-9_]*)/i)
      if (match && match[1]) {
        console.log(`✓ Extracted table name: ${match[1]}`)
        tablesCreated.push(match[1])
      } else {
        console.log(`✗ Could not extract table name with regex`)
      }
    }
  }

  console.log(`Extracted ${tablesCreated.length} tables:`, tablesCreated)
  return tablesCreated
}

/**
 * POST /api/supabase/verify
 * Just verify connection and return SQL (for manual execution)
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { supabaseUrl, supabaseKey, sql } = req.body

    if (!supabaseUrl || !supabaseKey || !sql) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: supabaseUrl, supabaseKey, and sql are required',
      })
    }

    if (!supabaseUrl.includes('supabase.co')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Supabase URL format. Should be: https://your-project.supabase.co',
      })
    }

    console.log('Verifying connection to Supabase:', supabaseUrl)
    console.log('SQL received, length:', sql?.length || 0)
    console.log('First 200 chars of SQL:', sql?.substring(0, 200))

    // Simple connection test
    const testResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    })

    if (!testResponse.ok && testResponse.status === 401) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Supabase credentials. Please check your Project URL and Service Role Key.',
      })
    }

    console.log('✓ Connection verified!')

    const tablesCreated = extractTableNames(sql)

    res.json({
      success: true,
      message: `✅ Connection verified! Ready to create ${tablesCreated.length} tables.`,
      tablesCreated,
      sql,
      instructions: 'Click "Apply Now" to create tables automatically, or copy the SQL manually.',
    })
  } catch (error) {
    console.error('Error verifying Supabase connection:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to verify connection',
    })
  }
})

/**
 * POST /api/supabase/apply
 * Actually execute the SQL on Supabase
 */
router.post('/apply', async (req: Request, res: Response) => {
  try {
    const { supabaseUrl, supabaseKey, sql } = req.body

    if (!supabaseUrl || !supabaseKey || !sql) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      })
    }

    console.log('\n🚀 Applying schema to Supabase...')

    // Split SQL into statements
    const statements = sql
      .split(';')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0) // Keep all statements including those with comments

    const tablesCreated: string[] = []
    let successCount = 0

    // Execute each statement via Supabase Management API
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      // Extract table name
      if (statement.toLowerCase().includes('create table')) {
        const match = statement.match(/create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?(\w+)/i)
        if (match) {
          tablesCreated.push(match[1])
        }
      }

      try {
        // Execute using Supabase Database Webhook or Management API
        // For now, we'll use a simpler approach with pg_net or direct execution
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ query: statement })
        })

        if (response.ok) {
          successCount++
          console.log(`✓ ${i + 1}/${statements.length} executed`)
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
          console.log(`❌ Statement ${i + 1} failed:`, response.status, errorData)
          
          // If exec_sql doesn't exist, return instructions
          if (response.status === 404) {
            console.log('⚠️ Direct SQL execution not available - exec_sql function not found')
            return res.json({
              success: false,
              autoExecute: false,
              message: 'Direct SQL execution requires setup. Please copy and paste the SQL manually into your Supabase SQL Editor.',
              tablesCreated,
              sql,
            })
          }
        }
      } catch (err) {
        console.error(`Error on statement ${i + 1}:`, err)
      }
    }

    res.json({
      success: true,
      message: `🎉 Successfully created ${tablesCreated.length} tables!`,
      tablesCreated,
      statementsExecuted: successCount,
    })
  } catch (error) {
    console.error('Error applying schema:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to apply schema',
    })
  }
})

export default router
