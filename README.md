# Senior Fit

A fitness management web app built with the [T3 Stack](https://create.t3.gg/) — Next.js, tRPC, Prisma, Tailwind CSS, and Better Auth.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) (App Router + Turbopack)
- **API**: [tRPC](https://trpc.io) + [TanStack Query](https://tanstack.com/query)
- **Auth**: [Better Auth](https://better-auth.com) (GitHub OAuth)
- **Database**: PostgreSQL via [Prisma](https://prisma.io)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com)

## Prerequisites

- [Node.js](https://nodejs.org) >= 18
- [pnpm](https://pnpm.io) >= 10 (`npm install -g pnpm`)
- [Docker](https://docker.com) (for the local PostgreSQL container) or a running PostgreSQL instance
- A **GitHub OAuth App** for authentication

## Setup

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd senior-fit
pnpm install
```

### 2. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Better Auth secret — generate with: openssl rand -base64 32
BETTER_AUTH_SECRET="your-secret-here"

# GitHub OAuth — create an app at https://github.com/settings/developers
# Set the callback URL to: http://localhost:3000/api/auth/callback/github
BETTER_AUTH_GITHUB_CLIENT_ID="your-github-client-id"
BETTER_AUTH_GITHUB_CLIENT_SECRET="your-github-client-secret"

# PostgreSQL connection string
DATABASE_URL="postgresql://postgres:password@localhost:5432/senior-fit"
```

### 3. Start the database

If you don't have PostgreSQL running locally, start one with Docker:

```bash
make db-create
```

### 4. Set up the database schema

Apply the schema and seed initial data:

```bash
pnpm db:push     # apply schema to the database (no migration file created)
pnpm db:seed     # seed initial data
```

## Running

### Development

```bash
pnpm dev
```

Opens at [http://localhost:3000](http://localhost:3000) with Turbopack hot reload.

### Production

```bash
pnpm build
pnpm start
```

## Docker Commands

| Command | Description |
|---|---|
| `make db-create` | Create and start the PostgreSQL container |
| `make db-start` | Start an existing stopped container |
| `make db-stop` | Stop the container |
| `make db-rm` | Remove the container entirely |

## Database Commands

| Command | Description |
|---|---|
| `pnpm db:push` | Push schema changes to DB (no migration file) |
| `pnpm db:generate` | Create a new migration file |
| `pnpm db:migrate` | Apply pending migrations (production) |
| `pnpm db:seed` | Seed the database with initial data |
| `pnpm db:studio` | Open Prisma Studio (visual DB browser) |

## Code Quality

```bash
pnpm check          # lint + typecheck
pnpm lint           # ESLint only
pnpm lint:fix       # ESLint with auto-fix
pnpm typecheck      # TypeScript only
pnpm format:check   # Prettier check
pnpm format:write   # Prettier auto-format
```
