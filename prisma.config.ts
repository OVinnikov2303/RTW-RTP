import { defineConfig } from "prisma/config"
import { PrismaPg } from "@prisma/adapter-pg"

// Load local .env when present (e.g. dev). On Vercel there is no .env file —
// env vars come from the platform — so ignore ENOENT instead of crashing the build.
try {
  process.loadEnvFile?.(".env")
} catch {
  // no .env file — rely on process.env from the environment
}

export default defineConfig({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  earlyAccess: true,
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrate: {
    adapter: () =>
      new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  },
})
