# Photography Studio Portfolio - AI Agent Instructions

## Architecture Overview

This is a **dual-stack monorepo** for a photography studio with an AI-powered chatbot for lead generation:

- **Frontend**: React 19 + Vite + TailwindCSS 4 + React Router v7 (SPA in `/src`)
- **Backend**: Node.js/Express + MongoDB (in `/backend`)
- **Alternative Backend**: Python/FastAPI implementation (in `/backend/python`)

The chatbot uses Google Gemini AI for conversational lead capture, automatically extracting contact information and photography needs from natural conversations.

## Project Structure

```
/                           # Root monorepo
├── frontend/              # React 19 + Vite frontend
│   ├── src/
│   │   ├── pages/        # Route components (Home, About, Portfolio, Contact)
│   │   ├── components/   # ChatWidget, ChatPanel, ChatButton + shadcn/ui components
│   │   ├── context/      # ChatContext (session/messages), NavContext (nav visibility)
│   │   └── services/     # chatApi.js - axios wrapper for backend
│   ├── vercel.json       # Frontend Vercel serverless config
│   └── package.json
└── backend/              # Express + MongoDB backend
    ├── server.js         # Express server (exports for serverless)
    ├── routes/           # API route handlers (chat, leads, feedback, portfolio, packages)
    ├── utils/            # Utilities (connect-to-DB.js for serverless MongoDB)
    ├── data/             # Seed data files
    ├── seedDatabase.js   # Database seeding script
    ├── seedFeedback.js   # Feedback seeding script
    ├── vercel.json       # Backend Vercel serverless config
    └── python/           # Alternative FastAPI implementation
```

## Critical Workflows

### Development Servers

Run **concurrently** in separate terminals:

```bash
# Terminal 1: Frontend (port 5173)
cd frontend
npm run dev

# Terminal 2: Backend (port 5000)
cd backend
npm run dev
```

### Database Setup

MongoDB must be running locally or configured via `.env`:

```bash
# Seed the database with sample data
cd backend
npm run seed
```

### Environment Configuration

Backend requires `.env` file (see `backend/.env.example`):
- `GOOGLE_API_KEY` - For Gemini AI chat
- `MONGO_URL` - MongoDB connection string (default: `mongodb://localhost:27017`)
- `DB_NAME` - Database name (default: `photography_chatbot`)
- `CORS_ORIGINS` - Comma-separated allowed origins

Frontend uses `VITE_CHATBOT_API_URL` env var (defaults to `http://localhost:5000/api`).

## Key Patterns & Conventions

### Chatbot Lead Extraction

The chatbot uses a **dual-strategy approach** for capturing leads (`backend/routes/chat.js`):

1. **Primary**: LLM outputs structured JSON in `<LEAD_INFO>` tags within responses
2. **Fallback**: Regex extraction from conversation history (last 10 messages, 30-min window)

Lead requires: `name` + (`email` OR `phone`) + `shoot_type`. The system message instructs Gemini to collect info naturally over multiple turns.

### React Context Architecture

- **ChatContext** (`src/context/ChatContext.jsx`): Manages chat state, session ID (persisted in localStorage), message history
- **NavContext** (`src/context/NavProvider.jsx`): Controls navbar visibility for page transitions
- Both wrap the entire app in `App.jsx`

### API Communication

- All backend routes are prefixed with `/api`
- Frontend uses `src/services/chatApi.js` for API calls
- Session IDs are browser-fingerprint-based: `session_${browserInfo}_${timestamp}_${randomId}`

### Database Collections

MongoDB has 4 collections:
- `messages` - Chat history (session_id, role, content, timestamp)
- `leads` - Captured leads with contact info and preferences
- `portfolio` - Photography portfolio items
- `packages` - Service packages

### Component Styling

Uses **shadcn/ui** patterns:
- Components in `src/components/ui/` use CVA (class-variance-authority) for variants
- Path alias `@/` points to `src/` (configured in `vite.config.js`)
- TailwindCSS 4 with Vite plugin (no separate config file)

### Route Structure

Backend routes are modular:
- `routes/chat.js` - POST `/api/chat`, GET `/api/messages/:session_id`
- `routes/leads.js` - CRUD for leads (POST, GET, DELETE with GDPR endpoint)
- `routes/portfolio.js` - GET `/api/portfolio`
- `routes/packages.js` - GET `/api/packages`, GET `/api/packages/:id`

All routes access MongoDB via `req.app.locals.db`.

## Python Alternative

The `backend/python/` folder contains a FastAPI equivalent using:
- `motor` (async MongoDB driver)
- `emergentintegrations` LLM library
- Pydantic models for validation
- Runs on same API contract as Express version

Use `python/requirements.txt` for dependencies. This is an alternative backend, not used simultaneously with Express.

## Common Gotchas

1. **MongoDB Connection**: Server won't start without MongoDB running. Check `server.js` connection logs.
2. **Session Persistence**: Chat sessions persist across page reloads via localStorage. Clear `photography_chat_session_id` to reset.
3. **Lead Extraction**: Check server logs for "🤖 RAW LLM Response" to debug lead capture issues.
4. **CORS**: Frontend defaults to port 5173. Update `backend/.env` CORS_ORIGINS if using different port.
5. **Node Flags**: Backend scripts use `--env-file=.env` flag (Node 20+) for environment variables.

## Testing Lead Capture

To test the chatbot's lead extraction:
1. Start a conversation mentioning a shoot type (wedding/portrait/event/family)
2. Provide name: "My name is John Doe"
3. Provide contact: "Email: john@example.com" or "Call me at 555-1234"
4. Check backend logs for `✅ Lead extracted` confirmation
5. Verify in MongoDB `leads` collection or via GET `/api/leads`

## Deployment Notes

- Frontend builds to `/dist` via `npm run build`
- Backend uses native Node.js MongoDB driver (no ORM)
- No TypeScript - plain JavaScript with ES modules (`"type": "module"` in both package.json files)
- React Router v7 uses `createBrowserRouter` (data router pattern)
