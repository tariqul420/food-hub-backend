# Food Hub — Backend

This repository contains the backend API for the Food Hub application. It provides endpoints for managing meals, providers, orders, reviews, and user accounts.

## Requirements

- Node.js 18+ (LTS recommended)
- pnpm or npm

## Quick Start

Install dependencies and start the development server:

```bash
# using pnpm (recommended)
pnpm install
pnpm dev

# or using npm
npm install
npm run dev
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm start` - Start production server

## Database & Prisma

This project uses Prisma with PostgreSQL. Run migrations or push the schema and generate the client:

```bash
npx prisma generate
npx prisma migrate dev
```

## Environment

Create a `.env` with the database URL and other keys. See `.env.example` for available variables.

### Trust proxy

If you run the app behind a proxy or a service that sets `X-Forwarded-For`, set `TRUST_PROXY=1` in your environment (or run in `NODE_ENV=production`) so rate limiting and IP detection work correctly.

## API

The API is versioned under `/api/v1`. Key modules include:

- `/api/v1/meals` — meals listing and management
- `/api/v1/providers` — provider profiles
- `/api/v1/orders` — order creation and tracking
- `/api/v1/reviews` — meal reviews

## Contributing

Open issues or create PRs against this repo. For local testing, run the dev server and use the API routes described above.