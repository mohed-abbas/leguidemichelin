import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma = globalThis.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}

// Re-export generated types (User, Session, Restaurant, etc.) so consumers
// `import { prisma, Restaurant } from "@repo/db"` work from a single symbol source.
export * from "@prisma/client";
