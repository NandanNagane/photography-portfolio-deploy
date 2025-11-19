# Photography Studio Portfolio

A modern photography portfolio website with an AI-powered chatbot for lead generation and user feedback system.

## Tech Stack

- **Frontend**: React 19 + Vite + TailwindCSS 4 + Framer Motion + React Router v7
- **Backend**: Node.js/Express + MongoDB
- **AI**: Google Gemini AI for conversational chatbot
- **UI Components**: shadcn/ui with CVA (class-variance-authority)

## Project Structure

```
/                       # Root directory
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── pages/     # Home, About, Portfolio, Contact
│   │   ├── components/ # ChatWidget, FeedbackForm, UI components
│   │   ├── context/   # ChatContext, NavContext
│   │   └── services/  # API communication layer (chatApi.js)
│   ├── vercel.json    # Frontend Vercel config
│   └── package.json   # Frontend dependencies
│
└── backend/           # Express API server
    ├── routes/        # API endpoints (chat, leads, feedback, portfolio, packages)
    ├── utils/         # Utilities (connect-to-DB.js for serverless)
    ├── data/          # Seed data files
    ├── seedDatabase.js # Database seeding script
    ├── seedFeedback.js # Feedback seeding script
    ├── vercel.json    # Backend Vercel config
    └── server.js      # Main Express app (exports for serverless)
```

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB running locally or remotely

### Installation

1. **Install dependencies**

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

2. **Configure environment variables**

Create `backend/.env`:

```bash
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URL=mongodb://localhost:27017
DB_NAME=photography_chatbot

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Google Gemini AI
GOOGLE_API_KEY=your_google_api_key_here

# For Production (Vercel)
UI_URL=https://your-frontend.vercel.app
FRONTEND_URL=https://your-frontend.vercel.app
SERVER_URL=https://your-backend.vercel.app
```

Optional frontend `.env`:

```bash
# Development
VITE_CHATBOT_API_URL=http://localhost:5000/api

# Production (add to Vercel)
VITE_SERVER_URL=https://your-backend.vercel.app/api
```

3. **Seed the database**

```bash
cd backend
npm run seed
npm run seed:feedback  # Optional: seed feedback data
```

### Running the Application

Run in **separate terminals**:

```bash
# Terminal 1: Frontend (port 5173)
cd frontend
npm run dev

# Terminal 2: Backend (port 5000)
cd backend
npm run dev
```

Visit `http://localhost:5173`

## Features

### 1. AI-Powered Chatbot
- Google Gemini AI integration for natural conversations
- Automatic lead extraction from conversations
- Session persistence across page reloads
- Real-time chat interface

### 2. Feedback System
- User feedback form on Contact page
- Star rating (1-5 stars)
- Optional name and email fields
- Admin endpoints to view and manage feedback
- Toast notifications on submission

### 3. Portfolio Management
- Dynamic portfolio display
- Photography packages
- Contact form

## API Endpoints

### Chat
- `POST /api/chat` - Send message to AI chatbot
- `GET /api/messages/:session_id` - Get chat history

### Leads
- `POST /api/leads` - Create lead
- `GET /api/leads` - List all leads

### Feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/admin/feedback` - List all feedback (paginated)
- `PATCH /api/admin/feedback/:id/status` - Update feedback status
- `DELETE /api/admin/feedback/:id` - Delete feedback

### Portfolio & Packages
- `GET /api/portfolio` - Get portfolio items
- `GET /api/packages` - Get photography packages
- `GET /api/packages/:id` - Get specific package

## Database Collections

- `messages` - Chat history
- `leads` - Captured leads from conversations
- `feedback` - User feedback submissions
- `portfolio` - Portfolio items
- `packages` - Service packages

## Testing Feedback Feature

### Submit Feedback (UI)
1. Navigate to Contact page
2. Scroll to "Share Your Feedback" section
3. Fill in the form and submit

### Submit Feedback (API)
```bash
curl -X POST http://localhost:5000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "rating": 5,
    "message": "Great website and amazing photography!"
  }'
```

### View Feedback (Admin)
```bash
# List all feedback
curl http://localhost:5000/api/admin/feedback

# With pagination and filters
curl "http://localhost:5000/api/admin/feedback?page=1&limit=10&status=new"

# Update feedback status
curl -X PATCH http://localhost:5000/api/admin/feedback/<id>/status \
  -H "Content-Type: application/json" \
  -d '{"status": "reviewed"}'

# Delete feedback
curl -X DELETE http://localhost:5000/api/admin/feedback/<id>
```

## Development Notes

- Frontend uses `@/` path alias pointing to `src/`
- All backend routes use `app.locals.db` for MongoDB access
- Session IDs: `session_${browserInfo}_${timestamp}_${randomId}`
- No TypeScript - plain JavaScript with ES modules
- TailwindCSS 4 with Vite plugin (no separate config)

## Scripts

### Frontend
```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Lint code
```

### Backend
```bash
npm run dev       # Start dev server with nodemon
npm run start     # Start production server
npm run seed      # Seed portfolio, packages, and leads
npm run seed:feedback  # Seed feedback data
```

## Deployment to Vercel

This application is configured for serverless deployment on Vercel with optimized MongoDB connection handling.

### Architecture

- **Frontend**: Static SPA with client-side routing
- **Backend**: Serverless functions with connection pooling
- **Database**: MongoDB Atlas (required for production)

### Prerequisites

1. MongoDB Atlas account with a cluster
2. Vercel account
3. Google Gemini API key

### Backend Deployment

1. **Push backend to Git repository**

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your repository
   - Set root directory to `backend`

3. **Configure Environment Variables** (in Vercel dashboard):
   ```bash
   NODE_ENV=production
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net
   DB_NAME=photography_chatbot
   GOOGLE_API_KEY=your_google_gemini_api_key
   UI_URL=https://your-frontend.vercel.app
   FRONTEND_URL=https://your-frontend.vercel.app
   CORS_ORIGINS=https://your-frontend.vercel.app
   ```

4. **Deploy**: Vercel will automatically deploy using `vercel.json` configuration

### Frontend Deployment

1. **Import frontend to Vercel**:
   - Create a new project
   - Import the same repository
   - Set root directory to `/` (or leave as default)

2. **Configure Environment Variables**:
   ```bash
   VITE_SERVER_URL=https://your-backend.vercel.app/api
   ```

3. **Build Settings** (auto-detected from `vercel.json`):
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Deploy**: Frontend will be built and deployed

### Post-Deployment

1. **Update CORS origins**: Add your production frontend URL to backend environment variables
2. **Test endpoints**: Visit `https://your-backend.vercel.app/health`
3. **Seed production database** (optional):
   ```bash
   # Connect to your production MongoDB Atlas cluster
   MONGO_URL=your_atlas_url npm run seed
   ```

### Important Notes

- **MongoDB Atlas**: Local MongoDB won't work in production. Use MongoDB Atlas.
- **Connection Pooling**: The app automatically reuses connections (`maxPoolSize: 1` for serverless)
- **Cold Starts**: First request may be slower (~2-3s) due to serverless cold starts
- **CORS**: Ensure all production URLs are added to `allowedOrigins` in `server.js`
- **Environment Variables**: Never commit `.env` files. Always set them in Vercel dashboard.

### Troubleshooting

**CORS errors**:
- Verify `UI_URL` is set in backend environment
- Check `VITE_SERVER_URL` in frontend environment
- Ensure URLs don't have trailing slashes

**Database connection errors**:
- Verify `MONGO_URL` is a valid Atlas connection string
- Check IP whitelist in MongoDB Atlas (allow all: `0.0.0.0/0` for Vercel)
- Ensure database user has read/write permissions

**Cold start timeouts**:
- Increase `timeout` in axios config (already set to 30s)
- Consider using Vercel Pro for faster cold starts

## License

MIT
