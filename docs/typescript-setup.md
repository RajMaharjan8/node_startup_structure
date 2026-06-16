# Converting this project from JavaScript to TypeScript

This guide migrates the project to TypeScript using **tsx** — meaning we run
`.ts` files directly, with **no compile/build step**. This is the simplest setup
for development and pairs nicely with Prisma 7, whose client is also generated as
TypeScript.

> Mental model: we are NOT changing how the app *runs* (it's still Node + ESM).
> We're swapping the *runner* from `node` to `tsx`, which understands `.ts` on the
> fly, and renaming files `.js` -> `.ts` so we can add types.

---

## Step 0 — Understand the starting point

Current relevant facts about this repo:

- `package.json` has `"type": "module"` -> the project uses **ESM** (`import`/`export`).
- Entry point is `server.js`, which presumably imports `app.js`.
- Source lives under `src/` (`controllers/`, `routes/`, `db/`, `interfaces/`).
- There is already one `.ts` file: `src/interfaces/index.ts`.
- Prisma generates its client into `generated/prisma/` as `.ts` files.

Because Prisma already emits `.ts`, moving the app to TypeScript actually *removes*
a class of problems (no more "emit .js so plain node can read it").

---

## Step 1 — Install the TypeScript tooling

```bash
npm install --save-dev typescript tsx @types/node @types/express
```

- `typescript` — the type checker (`tsc`), used for checking, not for running.
- `tsx` — runs `.ts`/`.tsx` files directly under Node (esbuild under the hood).
- `@types/node`, `@types/express` — type definitions for Node APIs and Express.

---

## Step 2 — Add a `tsconfig.json`

Create `tsconfig.json` in the project root:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "outDir": "dist",
    "rootDir": ".",
    "types": ["node"]
  },
  "include": ["src", "server.ts", "app.ts", "prisma.config.ts"],
  "exclude": ["node_modules", "generated"]
}
```

Why these matter:

- `"module": "ESNext"` + `"moduleResolution": "Bundler"` — matches your ESM project
  and lets imports resolve without forcing `.js` extensions everywhere.
- `"allowImportingTsExtensions"` + `"noEmit"` — you may import `.ts` files directly;
  we never emit, because **tsx runs the source**. `tsc` is only a checker here.
- `"strict": true` — turns on real type safety. This is the whole point of TS.
  (If migration feels noisy at first, you can temporarily set it to `false`.)
- `"exclude": ["generated"]` — don't type-check Prisma's generated output; it's huge
  and already correct.

---

## Step 3 — Rename your `.js` files to `.ts`

Rename each source file. The files to convert:

```
server.js                         -> server.ts
app.js                            -> app.ts
src/db/db.config.js               -> src/db/db.config.ts
src/controllers/user.controller.js-> src/controllers/user.controller.ts
src/routes/index.js               -> src/routes/index.ts
src/routes/user.routes.js         -> src/routes/user.routes.ts
```

(`src/interfaces/index.ts` is already TypeScript — leave it.)

You can do them one at a time in your editor (right-click -> rename), or in the shell:

```bash
git mv server.js server.ts          # use `git mv` if this is a git repo, else `mv`
mv app.js app.ts
mv src/db/db.config.js src/db/db.config.ts
mv src/controllers/user.controller.js src/controllers/user.controller.ts
mv src/routes/index.js src/routes/index.ts
mv src/routes/user.routes.js src/routes/user.routes.ts
```

### Fix the import extensions

With `moduleResolution: "Bundler"`, you do NOT need to write `.ts` in imports —
extensionless imports work. So an import like:

```ts
import prisma from "../../generated/prisma/client.js";
```

can become:

```ts
import prisma from "../../generated/prisma/client";
```

> If you keep ESM's strict `NodeNext` resolution instead, you'd have to write the
> real extension (`.ts`). The `Bundler` setting above frees you from that — which is
> why we chose it.

---

## Step 4 — Point npm scripts at tsx

Edit the `scripts` block in `package.json`:

```json
"scripts": {
  "start": "node --import tsx server.ts",
  "dev": "tsx watch server.ts",
  "typecheck": "tsc --noEmit"
}
```

- `dev` — `tsx watch` replaces nodemon entirely; it restarts on file changes AND
  understands TypeScript. (You can uninstall nodemon later if you like.)
- `typecheck` — runs the type checker without running the app. Use it to catch type
  errors; `tsx` itself does NOT type-check, it just strips types and runs.

---

## Step 5 — Run it

```bash
npm run dev
```

Then, separately, check types:

```bash
npm run typecheck
```

This two-command split is the key idea of the tsx approach:

| Command            | What it does                          | Catches type errors? |
|--------------------|---------------------------------------|----------------------|
| `npm run dev`      | runs the app (fast, strips types)     | No                   |
| `npm run typecheck`| checks all types, runs nothing        | Yes                  |

So you *run* fast with tsx and *verify* with tsc. Many people also let their editor
(VS Code) show type errors live, then run `typecheck` before committing.

---

## Step 6 — Start adding actual types

Renaming files gets you running TypeScript, but with implicit `any` everywhere.
The real value comes from typing things. Start with Express handlers:

```ts
import type { Request, Response } from "express";

export const getUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = await prisma.user.findUnique({ where: { id } });
  res.json(user);
};
```

Note `prisma.user.findUnique` is now **fully typed** — the Prisma client gives you
autocomplete on models and fields, which is the biggest payoff of going TS here.

Put shared types in `src/interfaces/index.ts` (you already have it) and import them
where needed.

---

## Common errors & fixes

- **`Cannot find module './foo' or its type declarations`**
  Check the import path. With `Bundler` resolution, extensionless is fine; double-check
  you didn't leave a stray `.js` pointing at a file you renamed to `.ts`.

- **`Parameter 'req' implicitly has an 'any' type`** (from `strict`)
  Add a type: `(req: Request, res: Response)`. This is TS doing its job.

- **tsx not found**
  Re-run the Step 1 install; make sure it landed in `devDependencies`.

- **`sh: ts-node: command not found` / `nodemon failed to start process`**
  Your `dev`/`start` script is still pointing at **nodemon** or **node**, neither of
  which can run `.ts`. When nodemon sees a `.ts` entry it tries to call `ts-node`,
  which we never installed. Fix: switch the scripts to **tsx** (Step 4). You do NOT
  need nodemon or ts-node at all — `tsx watch` both runs TypeScript and restarts on
  change. The correct scripts are:
  ```json
  "scripts": {
    "start": "node --import tsx server.ts",
    "server": "tsx watch server.ts",
    "dev": "tsx watch server.ts",
    "typecheck": "tsc --noEmit"
  }
  ```

- **`Property 'accelerateUrl' is missing`** (Prisma 7 client constructor)
  Prisma 7 no longer auto-reads `DATABASE_URL`; you must pass a driver adapter. Install
  `@prisma/adapter-pg`, add `url = env("DATABASE_URL")` to the datasource, regenerate,
  and construct the client with `new PrismaClient({ adapter })`. See `src/db/db.config.ts`.

- **`Argument of type '{ log: "query"[] }' is not assignable`**
  TypeScript widened the array literal to `string[]`. Add `as const`:
  `log: ["query"] as const`.

- **Prisma types out of date after editing the schema**
  Re-run `npx prisma generate`. The generated `.ts` client is your source of truth
  for model types.

---

## Summary

1. Install `typescript tsx @types/node @types/express`.
2. Add `tsconfig.json`.
3. Rename `.js` -> `.ts`, drop the `.js` from local imports.
4. Scripts: `dev` -> `tsx watch`, add `typecheck` -> `tsc --noEmit`.
5. `npm run dev` to run, `npm run typecheck` to verify types.
6. Add types incrementally, starting with Express handlers and Prisma calls.
