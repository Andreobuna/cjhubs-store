import { PrismaClient } from "@prisma/client";

// Prevent creating a new PrismaClient on every hot-reload in dev.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getRuntimeDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return databaseUrl;

  try {
    const url = new URL(databaseUrl);
    // Prisma's Node driver cannot establish a connection to this Neon endpoint
    // when channel binding is required, even though TLS and PostgreSQL are available.
    url.searchParams.delete("channel_binding");
    return url.toString();
  } catch {
    return databaseUrl;
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: getRuntimeDatabaseUrl() } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
