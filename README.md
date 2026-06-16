# nodepg

A Node.js + Express REST API backed by PostgreSQL (via Prisma), **converted from JavaScript to TypeScript**.

This README documents how the project was migrated from a plain JS codebase to a fully type-safe TS one — running directly with [`tsx`](https://github.com/privatenumber/tsx) (no separate build step).

## Stack

- **Express 5** — HTTP server and routing
- **TypeScript 6** (ES2022 / ESNext modules)
- **Prisma 7** + `@prisma/adapter-pg` / `pg` — PostgreSQL ORM
- **Zod** — request validation
- **jsonwebtoken** + **bcrypt** — auth
- **tsx** — run/watch TS without compiling

## Project structure

```
app.ts                  # Express app wiring
server.ts               # Entry point — loads env, starts the server
prisma.config.ts        # Prisma datasource/migrations config
tsconfig.json
prisma/
  schema.prisma         # DB schema
  migrations/
src/
  routes/               # index + auth.routes + user.routes
  controllers/          # auth.controller, user.controller
  servers/              # user.service (business logic)
  middlewares/          # auth, validate
  validations/          # Zod schemas (auth, user)
  resources/            # response serializers (user resource/collection)
  helpers/              # jwt, api-response
  db/                   # config
  interfaces/           # shared TS interfaces
  types/express.d.ts    # Express type augmentation
```

## How the JS → TS conversion was done

### 1. Add TypeScript tooling

Installed the compiler, the runner, and type definitions for every runtime dependency:

```bash
npm i -D typescript tsx @types/node @types/express @types/bcrypt @types/jsonwebtoken
```

`tsx` lets the project run `.ts` files directly — no `tsc` build/emit step needed.

### 2. Configure the compiler

`tsconfig.json` is set up for modern ESM + type-checking only:

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,                      // full strictness
    "esModuleInterop": true,
    "allowImportingTsExtensions": true,  // lets us import "./file.ts"
    "noEmit": true,                      // tsx runs the code; tsc only checks types
    "types": ["node"]
  },
  "include": ["src", "server.ts", "app.ts", "prisma.config.ts"],
  "exclude": ["node_modules", "generated"]
}
```

### 3. Switch to ES modules

`package.json` has `"type": "module"`, so imports use explicit `.ts` extensions (allowed by `allowImportingTsExtensions`):

```ts
import routes from "./src/routes/index.ts";
```

### 4. Rename `.js` → `.ts` and add types

Every source file was renamed and annotated:

- Controllers, services, and middlewares got typed `Request`, `Response`, and `NextFunction` parameters.
- Shared shapes moved into `src/interfaces/` and `src/types/`.
- `src/types/express.d.ts` augments Express's `Request` (e.g. attaching the authenticated user) so it's available type-safely across middleware.
- Runtime input validation is handled by **Zod** schemas in `src/validations/`, which also give inferred TS types for free.

### 5. Update the run scripts

Scripts point at `tsx` instead of `node`:

```json
{
  "start":     "node --import tsx server.ts",
  "dev":       "tsx watch server.ts",
  "server":    "tsx watch server.ts",
  "typecheck": "tsc --noEmit"
}
```

`npm run typecheck` runs the compiler purely to surface type errors (no output is emitted).

> A fuller writeup lives in [docs/typescript-setup.md](docs/typescript-setup.md).

## Auth & the typed `req.user` (explained simply)

If you come from **Laravel**, you're used to grabbing the logged-in user anywhere with:

```php
auth()->user();   // Laravel gives you this for free
```

Express does **not** give you that. There's no global `auth()` helper and no `req.user`
out of the box. So we build it ourselves with two pieces: an **auth middleware** (does the
work) and a **type declaration** (tells TypeScript the result exists).

### 1. The middleware — `src/middlewares/auth.ts`

This is the part that actually checks the token, like Laravel's `auth` middleware on a route.

```ts
export const auth = (req, res, next) => {
  const header = req.headers.authorization;        // "Bearer <token>"
  if (!header) return sendResponse(res, "Unauthorized Action.", [], 403);

  const token = header.split(" ")[1];              // strip the "Bearer " part
  try {
    const decode = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
    req.user = decode;                             // <-- attach user to the request
    next();                                        // let the request continue
  } catch (err) {
    return sendResponse(res, "Something Went Wrong", [], 500);
  }
};
```

**What it does, step by step:**

1. Reads the `Authorization` header from the request.
2. If there's no header → reject with `403`.
3. Splits off the token from `"Bearer <token>"`.
4. Verifies the JWT with our secret. If it's fake/expired, `jwt.verify` throws and we reject.
5. If valid, it **attaches the decoded user onto the request** as `req.user`.
6. Calls `next()` so the controller runs.

Now any controller that runs *after* this middleware can read `req.user` — this is our
equivalent of `auth()->user()`. You wire it onto routes like this:

```ts
router.get("/me", auth, userController.me);   // `auth` runs first, like a Laravel route middleware
```

```ts
// inside the controller:
const currentUser = req.user;   // our version of auth()->user()
```

### 2. The type declaration — `src/types/express.d.ts`

Here's the TypeScript-specific catch. The middleware sets `req.user = decode`, but Express's
built-in `Request` type **doesn't know `user` exists**. In plain JavaScript that's fine, but
in TypeScript you'd get a red error: *"Property 'user' does not exist on type 'Request'."*

This file fixes that by **adding `user` to Express's `Request` type** (this is called
"declaration merging" / module augmentation):

```ts
import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload;   // now `req.user` is a known, typed property
    }
  }
}

export {};
```

In plain English: *"Hey TypeScript, every Express request might also have a `.user` on it,
and it's a JWT payload."* After this, `req.user = decode` in the middleware and `req.user`
in controllers both type-check cleanly with autocomplete.

> **The Laravel analogy in one line:** Laravel ships `auth()->user()` built in. In
> Express+TypeScript we recreate it ourselves — the **middleware** (`auth.ts`) fills in
> `req.user`, and the **type file** (`express.d.ts`) makes TypeScript aware that `req.user`
> is allowed to exist.

## Getting started

### Prerequisites

- Node.js (with `npm`)
- A PostgreSQL database

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your .env (see below)
cp .env.example .env   # if present, otherwise create .env

# 3. Generate the Prisma client and run migrations
npx prisma generate
npx prisma migrate dev

# 4. Start the dev server (watch mode)
npm run dev
```

The server starts on `http://localhost:3000` (or `PORT` from your env).

### Environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME"
PORT=3000
JWT_SECRET="your-secret-here"
```

> `.env` and `/generated/prisma` are git-ignored.

## Scripts

| Command             | Description                                  |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Start the server in watch mode (`tsx watch`) |
| `npm run server`    | Same as `dev`                                |
| `npm start`         | Start the server once                        |
| `npm run typecheck` | Type-check the project (`tsc --noEmit`)      |
