# Operations API — Monorepo Ready

Place this directory at `apps/operations-api` in the Enterprise Operations Platform monorepo.

## Included

- Fastify + TypeScript
- Prisma + PostgreSQL
- Access-token JWT authentication
- Rotating HttpOnly refresh-token cookies
- RBAC
- Dashboard, Orders, Inventory, Refund and Admin APIs
- Simulated live-event endpoint
- Swagger UI
- Seed data
- Postman collection with local and production environments
- Vercel configuration
- Monorepo integration guide

## No local Node/Docker/PostgreSQL required for cloud deployment

You can upload the monorepo to GitHub, connect `apps/operations-api` as a dedicated Vercel project, and use a managed PostgreSQL provider.

## Vercel setup

1. Push the monorepo to GitHub.
2. Import the repository into Vercel as a new project.
3. Set Root Directory to `apps/operations-api`.
4. Add environment variables from `.env.example`.
5. Set `DATABASE_URL` to the hosted PostgreSQL connection string.
6. Deploy.
7. Run `npm run db:deploy` once for migrations.
8. Run `npm run db:seed` once for demo data.

Do not run the seed command automatically on every production deployment.

## Postman

Import:

- `postman/Operations-API.postman_collection.json`
- `postman/Operations-API.local.postman_environment.json`
- `postman/Operations-API.production.postman_environment.json`

Select an environment and run `Auth > Login`. The collection stores the returned access token automatically.

Demo administrator after seeding:

- Email: `admin@opshub.dev`
- Password: `Password@123`

## Important deployment note

The simulated live-event implementation is useful for local/portfolio demonstration. Long-lived real-time connections have platform-specific constraints. For a production-grade live stream, deploy the real-time service separately or use a managed realtime provider.

See `MONOREPO-INTEGRATION.md` for the recommended repository and deployment layout.
