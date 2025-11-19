# 🚨 CORS Fix - Quick Guide

## Problem
Frontend (https://photography-portfolio-deploy.vercel.app/) is calling `localhost:5001` instead of production backend.

## Solution

### ✅ Step 1: Created `.env.production` file
This file tells the frontend to use production backend URL when deployed.

### ✅ Step 2: Add Environment Variables in Vercel

#### Frontend Project (https://photography-portfolio-deploy.vercel.app)
1. Go to Vercel Dashboard → Your Frontend Project
2. Settings → Environment Variables
3. Add:
   ```
   VITE_SERVER_URL = https://photography-portfolio-deploy-o272.vercel.app/api
   ```
4. Select: Production, Preview, Development
5. Click **Save**

#### Backend Project (https://photography-portfolio-deploy-o272.vercel.app)
1. Go to Vercel Dashboard → Your Backend Project
2. Settings → Environment Variables
3. Add these THREE variables:
   ```
   UI_URL = https://photography-portfolio-deploy.vercel.app
   FRONTEND_URL = https://photography-portfolio-deploy.vercel.app
   CORS_ORIGINS = https://photography-portfolio-deploy.vercel.app
   NODE_ENV = production
   ```
   
   Also make sure you have:
   ```
   MONGO_URL = mongodb+srv://NadanNagane:4OaAsL2Ku3fZ0bAG@cluster0.qqghs.mongodb.net
   DB_NAME = photography-chatbot
   GOOGLE_API_KEY = AIzaSyDRScJKfgJO11zbxuq68VyvkFaeB5z0mpM
   ```

4. Click **Save**

### ✅ Step 3: Commit and Push

```bash
git add frontend/.env.production
git commit -m "fix: add production environment configuration"
git push origin main
```

### ✅ Step 4: Redeploy (Automatic or Manual)

**Option A: Automatic**
- Vercel will auto-deploy when you push to main

**Option B: Manual**
- Frontend: Deployments → Latest → "..." → Redeploy
- Backend: Deployments → Latest → "..." → Redeploy

### ✅ Step 5: Test

1. Visit: https://photography-portfolio-deploy.vercel.app/contact
2. Open browser DevTools (F12) → Network tab
3. Test the chat widget
4. Check the API calls go to: `https://photography-portfolio-deploy-o272.vercel.app/api/chat`
5. No CORS errors should appear ✅

## Why This Works

1. **Frontend**: `.env.production` tells Vite to use production backend URL during build
2. **Backend**: CORS configuration allows requests from your frontend domain
3. **Vercel**: Environment variables override local `.env` files

## Debug

If still not working:
1. Check Vercel → Settings → Environment Variables are saved
2. Verify URLs don't have trailing slashes
3. Check browser console for exact error message
4. Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

---

**Expected Result:** Chat widget calls `https://photography-portfolio-deploy-o272.vercel.app/api/chat` ✅
