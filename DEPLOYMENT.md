# Environment Variables Reference for Vercel Deployment

## Backend Environment Variables (Vercel Dashboard)

Required for production deployment:

```bash
# Node Environment
NODE_ENV=production

# MongoDB Atlas
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=photography_chatbot

# Google Gemini AI
GOOGLE_API_KEY=your_google_gemini_api_key_here

# Frontend URLs (for CORS)
UI_URL=https://your-frontend-app.vercel.app
FRONTEND_URL=https://your-frontend-app.vercel.app
CORS_ORIGINS=https://your-frontend-app.vercel.app

# Backend URL (optional, for reference)
SERVER_URL=https://your-backend-app.vercel.app

# Server Port (optional, not used in Vercel)
PORT=5000
```

## Frontend Environment Variables (Vercel Dashboard)

Required for production deployment:

```bash
# Backend API URL
VITE_SERVER_URL=https://your-backend-app.vercel.app/api
```

## Local Development .env Files

### backend/.env (local)
```bash
PORT=5000
NODE_ENV=development
MONGO_URL=mongodb://localhost:27017
DB_NAME=photography_chatbot
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
GOOGLE_API_KEY=your_google_api_key_here
```

### Root .env (local - optional)
```bash
VITE_CHATBOT_API_URL=http://localhost:5000/api
```

## How to Set Environment Variables in Vercel

1. Go to your project in Vercel dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable with its value
4. Select environments: Production, Preview, Development (usually all three)
5. Click **Save**
6. Redeploy your app for changes to take effect

## Important Notes

- **Never commit .env files to git** - they're in .gitignore
- **MongoDB Atlas**: You must use MongoDB Atlas in production (local MongoDB won't work)
- **CORS URLs**: Must match exactly (no trailing slashes)
- **VITE_ prefix**: Required for Vite environment variables in frontend
- **Update URLs**: Replace placeholder URLs with your actual Vercel deployment URLs
