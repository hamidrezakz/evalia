cd packages/database/evalia
npx prisma studio --schema=prisma/schema.prisma
npx prisma migrate dev --name your_migration_name --schema=prisma/schema.prisma