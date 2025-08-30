pnpm --filter @evalia/api-evalia start:dev
pnpm --filter @evalia/api-evalia prisma:migrate
pnpm --filter @evalia/api-evalia prisma:generate
pnpm --filter @evalia/api-evalia prisma:studio

