import { Router, Request, Response } from 'express'
import { generateSchemaFromPrompt } from '../services/llmService'
import { GenerateSchemaRequestSchema } from '../types/schema'
import { ZodError } from 'zod'

const router = Router()

/**
 * POST /api/schema/generate
 * Generate database schema from natural language prompt
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const { prompt } = GenerateSchemaRequestSchema.parse(req.body)

    console.log('Generating schema for prompt:', prompt)

    // Call LLM service to generate schema
    const schema = await generateSchemaFromPrompt(prompt)

    res.json({
      success: true,
      schema,
      message: 'Schema generated successfully',
    })
  } catch (error) {
    console.error('Error in /generate:', error)

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
      error: 'Failed to generate schema',
    })
  }
})

/**
 * POST /api/schema/refine
 * Refine existing schema based on user feedback
 */
router.post('/refine', async (req: Request, res: Response) => {
  try {
    const { schema, refinementPrompt } = req.body

    if (!schema || !refinementPrompt) {
      return res.status(400).json({
        success: false,
        error: 'Both schema and refinementPrompt are required',
      })
    }

    // TODO: Implement schema refinement
    res.status(501).json({
      success: false,
      error: 'Schema refinement not yet implemented',
    })
  } catch (error) {
    console.error('Error in /refine:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to refine schema',
    })
  }
})

/**
 * GET /api/schema/health
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Schema API is healthy',
    timestamp: new Date().toISOString(),
  })
})

export default router

