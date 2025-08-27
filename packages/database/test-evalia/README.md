# @evalia/database-evalia

Prisma schema, migrations, and generated client for Evalia database.

## Scripts

- `pnpm run prisma:generate` — Generate Prisma client
- `pnpm run prisma:migrate` — Run migrations (dev)
- `pnpm run prisma:studio` — Open Prisma Studio

## Usage

Import the generated client in your backend service:

```ts
import { PrismaClient } from "@prisma/client";
```

Configure your DATABASE_URL in `prisma/.env`.
