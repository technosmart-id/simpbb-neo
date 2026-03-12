# SimpBB Neo

A high-performance, type-safe Next.js boilerplate built for modern scale. Combining oRPC for contract-first APIs, Better Auth for authentication, Drizzle ORM for database management, and shadcn/ui for beautiful components.

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **API Layer** | [oRPC v1.x](https://orpc.dev/) - Contract-first, fully type-safe RPC |
| **Database** | [Drizzle ORM](https://orm.drizzle.team/) with MySQL |
| **Authentication** | [Better Auth](https://www.better-auth.com/) |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) + Tailwind CSS 4 |
| **State Management** | [TanStack Query v5](https://tanstack.com/query/latest) |
| **Form Handling** | react-hook-form + zod |
| **Language** | TypeScript |

## Getting Started

### 1. Environment Setup

Copy the example environment file and configure your database:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:

```env
DATABASE_URL=mysql://user:password@localhost:3306/simpbb-neo
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

Push the schema to your database:

```bash
npm run db:push
```

Available database commands:
- `npm run db:push` - Push schema changes directly (development)
- `npm run db:generate` - Generate migration files
- `npm run db:migrate` - Apply migrations
- `npm run db:studio` - Open Drizzle Studio (database GUI)

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Documentation Access

### oRPC API Reference (Scalar UI)

Interactive API documentation powered by Scalar:

```
http://localhost:3000/api/reference
```

### oRPC OpenAPI Specification (Raw JSON)

For programmatic access or importing into other tools:

```
GET http://localhost:3000/api/rpc/openapi
```

### Better Auth Endpoints

Better Auth endpoints are available at:

```
http://localhost:3000/api/auth/reference
```

The Better Auth plugin provides built-in OpenAPI documentation. See `lib/auth/index.ts` for configuration.

## Project Structure

```
simpbb-neo/
├── app/
│   ├── (app)/               # Protected app routes
│   │   └── dashboard/       # Dashboard pages
│   ├── (auth)/              # Public auth routes
│   │   ├── login/           # Login page
│   │   └── register/        # Registration page
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...better-auth]/  # Better Auth handler
│   │   ├── reference/       # Scalar API Reference UI
│   │   └── rpc/
│   │       ├── [[...orpc]]/        # oRPC API handler
│   │       └── openapi/            # OpenAPI spec generator
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── components/
│   ├── auth/                # Authentication components
│   ├── books/               # Book CRUD components
│   ├── layouts/             # Layout components (Sidebar, etc.)
│   ├── ui/                  # shadcn/ui components
│   └── orpc-test.tsx        # oRPC connection test component
├── lib/
│   ├── auth/                # Better Auth configuration
│   │   ├── index.ts         # Server auth instance
│   │   └── client.ts        # Client auth utilities
│   ├── db/                  # Database configuration
│   │   ├── index.ts         # Database instance
│   │   ├── schema/          # Drizzle schema files
│   │   └── seed/            # Database seeding scripts
│   └── orpc/                # oRPC configuration
│       ├── server.ts        # API router definition
│       ├── client.ts        # oRPC client
│       └── react.tsx        # React Query integration
├── drizzle/                 # Generated migrations
├── public/                  # Static assets
└── drizzle.config.ts        # Drizzle Kit configuration
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run db:push` | Push schema to database |
| `npm run db:generate` | Generate migrations |
| `npm run db:migrate` | Run migrations |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:seed` | Seed database with sample data |

## Key Features

- **Type-Safe API**: Full end-to-end type safety from server to client with oRPC
- **Authentication Ready**: Better Auth with email/password, extensible to OAuth
- **Database ORM**: Drizzle ORM with schema definitions in `lib/db/schema/`
- **Example CRUD**: Complete Books CRUD with search, sort, and pagination at `/crud-example`
- **Theme Support**: Dark mode toggle with next-themes
- **Responsive UI**: Mobile-friendly sidebar navigation
- **Form Validation**: Integrated react-hook-form with zod schemas

## Adding New API Endpoints

1. Define procedures in `lib/orpc/server.ts`:

```typescript
import { os } from "@orpc/server"
import { z } from "zod"

export const router = os.router({
  myEndpoint: os
    .input(z.object({ name: z.string() }))
    .handler(async ({ input }) => {
      return { message: `Hello ${input.name}` }
    }),
})
```

2. Use in React components:

```typescript
const orpc = useORPC()
const { data } = useQuery(orpc.myEndpoint.queryOptions({ input: { name: 'World' } }))
```

## Adding Database Tables

1. Create schema in `lib/db/schema/`:

```typescript
import { mysqlTable, serial, varchar } from "drizzle-orm/mysql-core"

export const myTable = mysqlTable("my_table", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
})
```

2. Export from `lib/db/schema/index.ts`

3. Run `npm run db:push`

## License

MIT
