import { defineConfig } from "prisma/config"
import { PrismaPg } from "@prisma/adapter-pg"

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
