# Deployment Guide - Operations API

This guide covers deploying the Operations API to production using Vercel.

## Prerequisites

- Node.js 22.x
- PostgreSQL database (Neon, Supabase, or other managed provider)
- Vercel account
- GitHub repository

## Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

```bash
# Server Configuration
PORT=4000
HOST=0.0.0.0
NODE_ENV=production

# Database (use your PostgreSQL connection string)
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require

# JWT Secrets (generate secure random strings >32 characters)
JWT_ACCESS_SECRET=your-long-random-access-secret
JWT_REFRESH_SECRET=your-long-random-refresh-secret
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL_DAYS=7

# CORS (comma-separated allowed origins)
CORS_ORIGIN=https://your-frontend.vercel.app,https://your-domain.com
COOKIE_SECURE=true

# Live Events
LIVE_EVENT_INTERVAL_MS=5000
```

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Generate Prisma client:
```bash
npm run prisma:generate
```

4. Run database migrations:
```bash
npm run prisma:migrate
```

5. Seed database (optional):
```bash
npm run seed
```

6. Start development server:
```bash
npm run dev
```

The API will be available at `http://localhost:4000`

## Vercel Deployment

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Initial deployment setup"
git push origin main
```

### Step 2: Import Project in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Set **Root Directory** to `apps/operations-api`
5. Click **Deploy**

### Step 3: Configure Environment Variables

In Vercel project settings → Environment Variables, add all variables from `.env.example`:

- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_ACCESS_SECRET` - Generate with: `openssl rand -base64 32`
- `JWT_REFRESH_SECRET` - Generate with: `openssl rand -base64 32`
- `NODE_ENV` - Set to `production`
- `CORS_ORIGIN` - Your frontend URL(s)
- `COOKIE_SECURE` - Set to `true`

### Step 4: Deploy Database Migrations

After the initial deployment, run migrations:

```bash
vercel env pull .env
npm run db:deploy
```

### Step 5: Seed Database (Optional)

For demo data:

```bash
npm run db:seed
```

**Note:** Only run seed in development/staging, never in production.

## Health Checks

The API provides three health check endpoints:

- `GET /health` - Basic health check
- `GET /health/ready` - Readiness check (includes database connectivity)
- `GET /health/live` - Liveness check

Configure your monitoring service to use these endpoints.

## API Documentation

Swagger UI is available at `/docs` in development and production.

## Postman Collection

Import the Postman collection for testing:

1. Import `postman/Operations-API.postman_collection.json`
2. Import `postman/Operations-API.production.postman_environment.json`
3. Run `Auth > Login` to authenticate
4. Use the collection to test endpoints

Default admin credentials (after seeding):
- Email: `admin@opshub.dev`
- Password: `Password@123`

## Monitoring

### Vercel Analytics

Enable Vercel Analytics in project settings for:
- Request metrics
- Error tracking
- Performance monitoring

### Logging

Logs are available in Vercel Dashboard → Logs. The API uses structured logging with Fastify.

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **JWT Secrets**: Use strong, randomly generated secrets
3. **Database**: Use SSL connections (`sslmode=require`)
4. **CORS**: Restrict to your frontend domains only
5. **Rate Limiting**: Configured at 100 requests per 15 minutes per IP
6. **HTTPS**: Always use HTTPS in production

## Scaling

The API is stateless and can scale horizontally:

- Vercel automatically handles scaling
- Database connection pooling is managed by Prisma
- Consider read replicas for high-traffic scenarios

## Troubleshooting

### Build Errors

If you encounter build errors:

1. Check Node.js version (should be 22.x)
2. Verify all dependencies are in `package.json`
3. Check Vercel build logs

### Database Connection Issues

1. Verify `DATABASE_URL` is correct
2. Ensure SSL is enabled
3. Check database provider status
4. Test connection locally first

### Runtime Errors

1. Check Vercel function logs
2. Verify environment variables are set
3. Ensure migrations have been run

## Rollback

To rollback to a previous deployment:

1. Go to Vercel Dashboard → Deployments
2. Find the previous successful deployment
3. Click "Promote to Production"

## CI/CD

See `.github/workflows/deploy.yml` for automated deployment configuration.

## Support

For issues or questions:
- Check Vercel logs
- Review this documentation
- Check the project README
