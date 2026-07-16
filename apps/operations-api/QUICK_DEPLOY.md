# Quick Vercel Deployment Guide

This guide helps you deploy the Operations API to Vercel without running it locally.

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- PostgreSQL database (Neon, Supabase, or other managed provider)

## Step-by-Step Deployment

### Step 1: Set Up PostgreSQL Database

1. Go to [Neon](https://neon.tech) or [Supabase](https://supabase.com)
2. Create a free account
3. Create a new project/database
4. Copy the connection string (it will look like: `postgresql://user:password@host/database?sslmode=require`)

### Step 2: Push Code to GitHub

1. Initialize git repository in the project root (if not already done):
```bash
cd c:/Users/sande/Desktop/Sangeetha/Project/opsHub
git init
git add .
git commit -m "Initial backend setup"
```

2. Create a new repository on GitHub
3. Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Root Directory**: `apps/operations-api`
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click "Deploy"

### Step 4: Configure Environment Variables

After the initial deployment (which will fail), add environment variables:

1. Go to your Vercel project → Settings → Environment Variables
2. Add the following variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | Your PostgreSQL connection string | From Step 1 |
| `JWT_ACCESS_SECRET` | Generate a random string | Use: `openssl rand -base64 32` |
| `JWT_REFRESH_SECRET` | Generate a random string | Use: `openssl rand -base64 32` |
| `NODE_ENV` | `production` | Required |
| `CORS_ORIGIN` | `*` (for testing) | Change to your frontend URL later |
| `COOKIE_SECURE` | `true` | Required for production |
| `ACCESS_TOKEN_TTL` | `15m` | Optional |
| `REFRESH_TOKEN_TTL_DAYS` | `7` | Optional |
| `LIVE_EVENT_INTERVAL_MS` | `5000` | Optional |

3. Click "Save" and then "Redeploy"

### Step 5: Run Database Migrations

After successful deployment, run migrations:

1. Install Vercel CLI (if not installed):
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Navigate to the operations-api directory:
```bash
cd apps/operations-api
```

4. Pull environment variables:
```bash
vercel env pull .env
```

5. Run migrations:
```bash
npm run db:deploy
```

### Step 6: Seed Database (Optional)

For demo data:

```bash
npm run db:seed
```

**Note**: Only run this for testing, not in production.

### Step 7: Test Your Deployment

1. Get your Vercel deployment URL from the dashboard
2. Test the health endpoint:
```bash
curl https://your-app.vercel.app/health
```

3. Test the API documentation:
   - Open `https://your-app.vercel.app/docs` in your browser
   - You should see Swagger UI

4. Test authentication:
```bash
# First, you need to seed the database to have a user
# Then test login with Postman or curl
```

## Postman Testing

1. Import the Postman collection:
   - `postman/Operations-API.postman_collection.json`
   - `postman/Operations-API.production.postman_environment.json`

2. Update the environment variable in Postman:
   - Set `base_url` to your Vercel URL

3. Run the `Auth > Login` request
   - Email: `admin@opshub.dev` (if seeded)
   - Password: `Password@123` (if seeded)

## Troubleshooting

### Build Fails

- Check that `DATABASE_URL` is set in environment variables
- Verify the connection string format
- Check Vercel build logs

### Runtime Errors

- Ensure all environment variables are set
- Check that migrations have been run
- Verify JWT secrets are set

### Database Connection Issues

- Test your DATABASE_URL locally first
- Ensure SSL is enabled (`sslmode=require`)
- Check database provider status

## Next Steps

After successful deployment:

1. Update `CORS_ORIGIN` to your actual frontend URL
2. Set up monitoring in Vercel
3. Configure custom domain (optional)
4. Set up CI/CD with GitHub Actions (see `.github/workflows/deploy.yml`)

## Security Notes

- Never commit `.env` files
- Use strong, randomly generated JWT secrets
- Restrict CORS origins to your frontend domains
- Enable HTTPS (Vercel does this automatically)
- Consider using Vercel's environment variable protection

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review environment variables
3. Ensure database is accessible
4. Check this guide's troubleshooting section
