# Monorepo integration

Extract this folder as:

apps/
  operations-api/

Recommended repository layout:

apps/
  shell/
  orders-mfe/
  inventory-mfe/
  live-operations-mfe/
  admin-mfe/
  operations-api/
packages/
  ui/
  shared-types/
  api-client/

## Vercel project

Create a dedicated Vercel project connected to the same Git repository.

Set the Vercel Root Directory to:

apps/operations-api

Every push to the repository is detected by Vercel. Changes affecting this project can trigger a new API deployment.

## Hosted PostgreSQL

Create a managed PostgreSQL database and add its pooled connection string as DATABASE_URL in Vercel.

Run database migrations from a CI workflow or one-time cloud shell:

npm run db:deploy
npm run db:seed

Do not automatically seed production on every deployment.

## Environment variables

DATABASE_URL
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
ACCESS_TOKEN_TTL
REFRESH_TOKEN_TTL_DAYS
CORS_ORIGIN
COOKIE_SECURE=true
LIVE_EVENT_INTERVAL_MS

CORS_ORIGIN accepts comma-separated frontend origins.

## Frontend

Configure the frontend with the deployed API base URL, for example:

VITE_API_BASE_URL=https://your-api-project.vercel.app/api/v1

For refresh-token cookies, frontend requests must include credentials.
