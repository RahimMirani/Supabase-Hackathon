import type { ChatMessage } from '../state'

const responses = [
  "Here's a draft schema covering users, projects, tasks, and a task history table.",
  'We can normalize tasks and updates while keeping auditing simple.',
  'Ready to generate the ERD and SQL when you are.'
]

const getRandomResponse = () => {
  const index = Math.floor(Math.random() * responses.length)
  return responses[index]
}

export const mockChatResponse = async (userMessage: string): Promise<ChatMessage> => {
  await new Promise((resolve) => setTimeout(resolve, 900))

  return {
    id: `msg-ai-${Date.now()}`,
    role: 'ai',
    content: `${getRandomResponse()} Based on your latest prompt: "${userMessage}"`,
    createdAt: new Date().toISOString(),
  }
}

