# 🚀 IEventory Backend Deployment Guide

## Prerequisites
- GitHub account
- Railway account (free at railway.app)
- PostgreSQL database (Railway provides this)

## Deployment Steps

### Step 1: Push to GitHub
```bash
cd C:\Users\firtu\ieventory-system
git add .
git commit -m "Ready for deployment - all APIs tested and working"
git push origin main
```

### Step 2: Deploy to Railway

1. **Go to Railway.app**
   - Visit https://railway.app
   - Sign up/Login with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `ieventory-system` repository
   - Select the `server` folder as the root directory

3. **Add PostgreSQL Database**
   - In your Railway project dashboard
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will automatically create a PostgreSQL database

4. **Configure Environment Variables**
   - Go to your backend service settings
   - Add these environment variables:
   ```
   NODE_ENV=production
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure
   FRONTEND_URL=https://your-frontend-domain.com
   ```

5. **Database Connection**
   - Railway will automatically set `DATABASE_URL`
   - The app will use this for database connection

### Step 3: Test Deployment

1. **Check Health Endpoint**
   - Visit: `https://your-app-name.railway.app/health`
   - Should return: `{"status":"OK","timestamp":"..."}`

2. **Test API Endpoints**
   - Login: `POST https://your-app-name.railway.app/api/auth/login`
   - Inventory: `GET https://your-app-name.railway.app/api/inventory`

### Step 4: Update Frontend

Update your frontend API URLs to point to the deployed backend:
```typescript
// In client/src/services/api.ts
const api = axios.create({
  baseURL: 'https://your-app-name.railway.app/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `JWT_SECRET` | JWT signing key | `your_super_secret_key` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://your-frontend.com` |
| `DATABASE_URL` | PostgreSQL connection | Auto-set by Railway |

## Troubleshooting

### Common Issues:
1. **Database Connection Failed**
   - Check if PostgreSQL service is running
   - Verify `DATABASE_URL` is set correctly

2. **CORS Errors**
   - Update `FRONTEND_URL` environment variable
   - Check `app.js` CORS configuration

3. **Build Failures**
   - Check `package.json` scripts
   - Verify all dependencies are listed

### Logs:
- View logs in Railway dashboard
- Check "Deployments" tab for build logs

## Production Checklist

- [ ] All APIs tested and working
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] CORS configured for frontend
- [ ] Health check endpoint working
- [ ] Frontend updated with production API URL

## Next Steps

1. Deploy frontend to Vercel/Netlify
2. Set up custom domain (optional)
3. Configure monitoring and alerts
4. Set up automated backups

---

**Your backend is ready for production! 🎉**
