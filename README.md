# NBA Predictor

Next.js app for NBA regular-season/team-winner predictions, playoff predictions, Yes/No prop bets, leaderboards, admin sync, and user profiles.

## Stack

- Next.js App Router
- Prisma
- PostgreSQL for production
- JWT auth
- Nodemailer SMTP email verification
- External cron or manual admin sync for NBA schedule/live-score sync

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and set at least:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
JWT_SECRET="replace-with-a-long-random-secret"
CRON_SECRET="replace-with-a-long-random-cron-secret"
ADMIN_PASSWORD="replace-with-a-strong-admin-password"
```

3. Generate Prisma client and apply migrations:

```bash
npm run db:generate
npm run db:migrate:deploy
npm run db:seed
```

4. Start development server:

```bash
npm run dev
```

## Production Deploy: Vercel + Managed Postgres

Use a managed Postgres database such as Supabase, Neon, Railway, Render, or Vercel Postgres.

### Required Environment Variables

Set these in Vercel Project Settings:

```bash
DATABASE_URL
JWT_SECRET
CRON_SECRET
SMTP_HOST
SMTP_PORT
SMTP_SECURE
SMTP_USER
SMTP_PASS
SMTP_FROM
ADMIN_USERNAME
ADMIN_PASSWORD
ADMIN_EMAIL
LOCAL_AVATAR_UPLOADS_ENABLED=false
```

### Deploy Steps

1. Push this repo to GitHub.
2. Import the repo in Vercel.
3. Add environment variables from `.env.example`.
4. Deploy.
5. Run database setup once against production:

```bash
npm run db:migrate:deploy
npm run db:seed
```

You can run those locally with the production `DATABASE_URL`, or from a trusted CI/admin shell.

### Schedule Sync

Vercel Hobby only allows daily cron jobs, so this repo does not register Vercel Cron by default.

For frequent sync, use an external cron service to call:

```text
https://YOUR_VERCEL_DOMAIN/api/cron/live-sync
```

with this header:

```text
Authorization: Bearer YOUR_CRON_SECRET
```

The endpoint also accepts an authenticated admin session, so admins can still trigger sync from the app.

If you upgrade to Vercel Pro later, you can add a `vercel.json` cron schedule for this endpoint.

## Manual Work Still Needed

Avatar uploads currently use local filesystem storage for development. That is not durable on Vercel, so production upload is disabled unless `LOCAL_AVATAR_UPLOADS_ENABLED=true`.

For real production avatars, wire one of:

- Supabase Storage
- Cloudflare R2
- AWS S3

Recommended next step: Supabase Storage if you also use Supabase Postgres.

## Notes

- SQLite migrations were replaced with a PostgreSQL baseline migration for production deploy.
- If you still want SQLite local development, keep it on a separate branch or maintain a separate Prisma schema.
- Do not use the default admin password in production. Set `ADMIN_PASSWORD` before running `npm run db:seed`.
