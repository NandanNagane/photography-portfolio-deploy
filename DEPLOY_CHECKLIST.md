# Quick Deployment Checklist

## ✅ Pre-Deployment Verification

Your project structure is correctly configured with `/frontend` and `/backend` folders.

### Before Deploying

- [ ] Both folders have `package.json` and `node_modules`
- [ ] Both folders have `vercel.json` configured
- [ ] MongoDB Atlas connection string ready
- [ ] Google Gemini API key ready
- [ ] Code pushed to GitHub/GitLab/Bitbucket

### Deploy Backend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your repository
4. ⚠️ **IMPORTANT:** Set "Root Directory" to `backend`
5. Add Environment Variables:
   ```
   NODE_ENV=production
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net
   DB_NAME=photography_chatbot
   GOOGLE_API_KEY=your_google_gemini_api_key
   UI_URL=https://your-frontend.vercel.app
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
6. Click "Deploy"
7. ✅ Copy your backend URL (e.g., `https://your-backend.vercel.app`)

### Deploy Frontend to Vercel

1. In Vercel, click "Add New Project"
2. Import the **same repository**
3. ⚠️ **IMPORTANT:** Set "Root Directory" to `frontend`
4. Add Environment Variable:
   ```
   VITE_SERVER_URL=https://your-backend.vercel.app/api
   ```
   (Use the URL you copied from step 7 above)
5. Click "Deploy"
6. ✅ Copy your frontend URL

### Post-Deployment

1. Update backend environment variables:
   - Go to backend project → Settings → Environment Variables
   - Update `UI_URL` and `FRONTEND_URL` with your actual frontend URL
   - Click "Redeploy" (Deployments tab → overflow menu → Redeploy)

2. Test your deployment:
   - Visit `https://your-backend.vercel.app/health` (should return JSON)
   - Visit `https://your-backend.vercel.app/api` (should show endpoints)
   - Visit your frontend URL
   - Test the chat functionality

### Common Issues

**Issue:** "Cannot find module" or build errors
**Fix:** Ensure root directory is set correctly (`backend` or `frontend`)

**Issue:** CORS errors in browser console
**Fix:** Verify `UI_URL` in backend matches your frontend URL exactly (no trailing slash)

**Issue:** Database connection errors
**Fix:** 
- Check MongoDB Atlas connection string is correct
- Verify IP whitelist includes `0.0.0.0/0` in Atlas
- Ensure database user has read/write permissions

**Issue:** Frontend shows "Failed to fetch"
**Fix:** Verify `VITE_SERVER_URL` points to correct backend URL with `/api` suffix

## 🎉 That's It!

Your photography portfolio will be live with:
- ✅ Serverless backend with MongoDB connection pooling
- ✅ React frontend with SPA routing
- ✅ AI-powered chatbot
- ✅ Feedback system
- ✅ Portfolio and packages display

Need help? Check:
- `README.md` - Full documentation
- `DEPLOYMENT.md` - Environment variables reference
- `VERCEL_SETUP_COMPLETE.md` - Detailed setup guide
