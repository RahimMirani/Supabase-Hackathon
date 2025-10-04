# ERD Generator Backend

AI-powered backend API for generating database schemas from natural language descriptions.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and add your API keys:

```bash
cp .env.example .env
```

Required environment variables:
- `OPENAI_API_KEY` - Your OpenAI API key
- `PORT` - Server port (default: 3001)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:5173)

### 3. Run Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

## API Endpoints

### Generate Schema
```
POST /api/schema/generate
Content-Type: application/json

{
  "prompt": "Build a social media app with users, posts, and comments"
}

Response:
{
  "success": true,
  "schema": { ... },
  "message": "Schema generated successfully"
}
```

### Health Check
```
GET /api/schema/health

Response:
{
  "success": true,
  "message": "Schema API is healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Project Structure

```
backend/
├── src/
│   ├── index.ts              # Express app entry point
│   ├── routes/
│   │   └── schema.ts         # Schema generation routes
│   ├── services/
│   │   └── llmService.ts     # OpenAI integration
│   └── types/
│       └── schema.ts         # TypeScript types & Zod schemas
├── .env                      # Environment variables (git-ignored)
├── .env.example             # Environment template
├── package.json
└── tsconfig.json
```

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production build

## Technologies

- **Express** - Web framework
- **TypeScript** - Type safety
- **OpenAI** - AI schema generation
- **Zod** - Runtime validation
- **CORS** - Cross-origin requests

