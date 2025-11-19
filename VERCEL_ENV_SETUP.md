# Vercel Environment Variables Setup

## 📋 Copy-Paste Ready Values

### Frontend Environment Variables
```
Variable Name: VITE_SERVER_URL
Value: https://photography-portfolio-deploy-o272.vercel.app/api
```

### Backend Environment Variables

```
Variable Name: NODE_ENV
Value: production
```

```
Variable Name: UI_URL
Value: https://photography-portfolio-deploy.vercel.app
```

```
Variable Name: FRONTEND_URL
Value: https://photography-portfolio-deploy.vercel.app
```

```
Variable Name: CORS_ORIGINS
Value: https://photography-portfolio-deploy.vercel.app
```

```
Variable Name: MONGO_URL
Value: mongodb+srv://NadanNagane:4OaAsL2Ku3fZ0bAG@cluster0.qqghs.mongodb.net
```

```
Variable Name: DB_NAME
Value: photography-chatbot
```

```
Variable Name: GOOGLE_API_KEY
Value: AIzaSyDRScJKfgJO11zbxuq68VyvkFaeB5z0mpM
```

---

## 🎯 Step-by-Step

### Frontend (photography-portfolio-deploy.vercel.app)

1. Go to: https://vercel.com/dashboard
2. Click on `photography-portfolio-deploy` (frontend)
3. Click **Settings** tab
4. Click **Environment Variables** in left sidebar
5. Add the variable from "Frontend Environment Variables" section above
6. Select: ✅ Production ✅ Preview ✅ Development
7. Click **Save**

### Backend (photography-portfolio-deploy-o272)

1. Go to: https://vercel.com/dashboard
2. Click on `photography-portfolio-deploy-o272` (backend)
3. Click **Settings** tab
4. Click **Environment Variables** in left sidebar
5. Add ALL 8 variables from "Backend Environment Variables" section above
6. For each variable:
   - Select: ✅ Production ✅ Preview ✅ Development
   - Click **Save**

### Redeploy

After adding all variables:

**Frontend:**
1. Go to **Deployments** tab
2. Click **"..."** on the latest deployment
3. Click **Redeploy**

**Backend:**
1. Go to **Deployments** tab
2. Click **"..."** on the latest deployment
3. Click **Redeploy**

---

## ✅ Verification

After redeployment (wait 1-2 minutes):

1. Visit: https://photography-portfolio-deploy.vercel.app/contact
2. Open the chat widget
3. Send a test message
4. Open DevTools (F12) → Network tab
5. Check API calls go to: `https://photography-portfolio-deploy-o272.vercel.app/api/chat`
6. No CORS errors in Console ✅

### Backend Health Check
Visit: https://photography-portfolio-deploy-o272.vercel.app/health

Should return:
```json
{
  "status": "ok",
  "timestamp": "...",
  "service": "photography-chatbot-backend"
}
```

---

## 🚨 Troubleshooting

**Still seeing localhost:5001?**
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear browser cache
- Try incognito/private window

**CORS error persists?**
- Double-check all backend variables are saved
- Verify no trailing slashes in URLs
- Wait 2-3 minutes for redeployment to complete

**Database connection errors?**
- Verify MONGO_URL is correct
- Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`
