# Comprehensive Deployment Guide

## Deployment Architecture

```
┌──────────────────────────────────────────────────┐
│         Vercel/Netlify (Frontend)                │
│          React TypeScript App                     │
│         (Static Site Hosting)                     │
└──────────────┬───────────────────────────────────┘
               │ HTTPS
┌──────────────▼───────────────────────────────────┐
│    Render/Railway/Fly.io (Backend API)           │
│         FastAPI Python Server                     │
│      (Serverless/Container Platform)             │
└──────────────┬───────────────────────────────────┘
               │ TCP 5432
┌──────────────▼───────────────────────────────────┐
│        PostgreSQL Database (Cloud)                │
│   Render/Railway/AWS RDS/Supabase                 │
│        (Managed PostgreSQL)                       │
└──────────────────────────────────────────────────┘
```

---

## Backend Deployment (Render.com - Recommended for Free Tier)

### Prerequisites
- Render account (https://render.com)
- GitHub repository with your code
- PostgreSQL connection string

### Step 1: Deploy PostgreSQL Database

1. Go to Render Dashboard
2. Click "New +" → "PostgreSQL"
3. Choose name: `inventory-db`
4. Version: PostgreSQL 15
5. Region: Choose closest to you
6. Pricing: Free tier available
7. Click "Create Database"
8. Copy the connection string for later

### Step 2: Deploy Backend Service

1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `inventory-api`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Runtime**: `Python 3.11`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`

5. Add Environment Variables:
   ```
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   DEBUG=False
   CORS_ORIGINS=["https://your-frontend-url.vercel.app"]
   ```

6. Click "Create Web Service"
7. Wait for deployment to complete
8. Copy the backend URL (e.g., `https://inventory-api.onrender.com`)

---

## Frontend Deployment (Vercel - Recommended)

### Prerequisites
- Vercel account (https://vercel.com)
- GitHub repository with your code
- Backend API URL from Render

### Step 1: Deploy Frontend

1. Go to Vercel Dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Project Name**: `inventory-frontend`
   - **Framework Preset**: `React`
   - **Root Directory**: `frontend`

5. Add Environment Variables:
   ```
   REACT_APP_API_URL=https://inventory-api.onrender.com
   ```

6. Click "Deploy"
7. Wait for deployment to complete
8. Copy the frontend URL (e.g., `https://inventory-frontend.vercel.app`)

### Step 2: Update Backend CORS

1. Go to Render Dashboard
2. Select your backend service
3. Go to "Environment" section
4. Update `CORS_ORIGINS`:
   ```
   ["https://inventory-frontend.vercel.app"]
   ```
5. Click "Save" (service will redeploy)

---

## Alternative: Railway.com Deployment

### Backend Deployment

1. Create Railway account
2. Create new project
3. Connect GitHub repository
4. Add PostgreSQL database
5. Configure environment:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   DEBUG=False
   CORS_ORIGINS=["https://your-frontend.vercel.app"]
   ```
6. Set start command: `cd backend && uvicorn app.main:app --host 0.0.0.0`

### Frontend Deployment (Netlify)

1. Create Netlify account
2. Connect GitHub repository
3. Configure:
   - Build command: `npm run build` (in frontend folder)
   - Publish directory: `frontend/build`
4. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-railway-backend.railway.app
   ```

---

## Alternative: Fly.io Deployment

### Backend Deployment

1. Install Fly CLI: `brew install flyctl`
2. Login: `flyctl auth login`
3. Create app: `flyctl launch` in backend folder
4. Configure:
   ```bash
   flyctl secrets set DATABASE_URL="postgresql://..."
   flyctl secrets set DEBUG="False"
   ```
5. Deploy: `flyctl deploy`

---

## Troubleshooting

### Backend Connection Issues

```bash
# Test backend health
curl https://your-backend-url/health

# Check logs
flyctl logs  # For Fly.io
# Or check Render/Railway dashboard logs
```

### Frontend API Errors

1. Check CORS settings on backend
2. Verify API URL in frontend environment variables
3. Check browser console for exact error messages

### Database Connection Issues

```bash
# Test database connection
psql postgresql://user:password@host:5432/dbname

# Check backend logs for connection errors
```

---

## Monitoring & Maintenance

### Set Up Monitoring

- **Render**: Built-in monitoring in dashboard
- **Railway**: Built-in monitoring available
- **Fly.io**: Use `flyctl monitor`

### Enable Auto-Redeploy

- GitHub: Enable automatic deployments on push
- Both Vercel and Render support this by default

### Database Backups

- Render: Automatic daily backups (paid tier)
- Railway: Configure backup settings
- AWS RDS: Automatic backups available

---

## Production Checklist

- [ ] Environment variables configured correctly
- [ ] Database backups enabled
- [ ] CORS properly configured
- [ ] API URLs point to production endpoints
- [ ] Frontend connects to backend successfully
- [ ] SSL/HTTPS enabled
- [ ] Monitoring set up
- [ ] Error logging configured
- [ ] Rate limiting configured (optional)
- [ ] Auto-scaling enabled (for high traffic)

---

## Scaling Considerations

### For Increased Traffic

1. **Backend**:
   - Upgrade to paid tier for more resources
   - Enable horizontal scaling
   - Add caching layer (Redis)

2. **Database**:
   - Upgrade to dedicated tier
   - Enable read replicas
   - Implement connection pooling

3. **Frontend**:
   - Already scalable via CDN
   - Consider edge functions for API calls

---

## Cost Estimation

### Free Tier Stack (Monthly)
- Frontend (Vercel): Free
- Backend (Render): Free
- Database (Render): Free
- **Total: $0/month**

### Starter Stack (Monthly)
- Frontend (Vercel): $20
- Backend (Render): $7
- Database (Render): $15
- **Total: ~$42/month**

### Production Stack (Monthly)
- Frontend (Vercel): $20+
- Backend (Render): $50+
- Database (AWS RDS): $100+
- **Total: $170+/month**

---

## Next Steps

1. Choose hosting providers
2. Create accounts and connect repositories
3. Deploy database first
4. Deploy backend
5. Update CORS settings
6. Deploy frontend
7. Test end-to-end connectivity
8. Set up monitoring
9. Configure backups
10. Document your setup

