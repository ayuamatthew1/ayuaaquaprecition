import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = globalThis as unknown as { prisma: any };

function getPrismaClient() {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  if (typeof process === "undefined" || !process.versions?.node) {
    throw new Error("Prisma can only be used in a Node.js server runtime.");
  }

  const { PrismaClient } = require("../../prisma/generated/prisma/client") as typeof import("../../prisma/generated/prisma/client");

  const prisma = new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL!,
    log: ["error"],
  }).$extends(withAccelerate());

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }

  return prisma;
}

export const prisma = new Proxy({} as any, {
  get(_target, prop) {
    return getPrismaClient()[prop as keyof typeof globalForPrisma.prisma];
  },
});
