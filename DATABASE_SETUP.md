# Database
DATABASE_SETUP.md

## Prerequisites for Prompt 2 Completion

To fully initialize the Arc backend database, you need a PostgreSQL instance running.

### Option 1: Using Docker (Recommended)
```bash
docker run --name arc-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=arc_db \
  -p 5432:5432 \
  -d postgres:15
```

### Option 2: Local PostgreSQL Installation
1. Install PostgreSQL locally
2. Create a database: `createdb arc_db`
3. Update `.env` with your connection string

### Initialize Prisma Migrations
Once your database is running:
```bash
cd server
npm run prisma:migrate
```

This will create the User and Session tables as defined in schema.prisma and ARC_SPEC.md.

### Verify Installation
```bash
npm run prisma:studio  # Opens Prisma Studio UI at http://localhost:5555
```
