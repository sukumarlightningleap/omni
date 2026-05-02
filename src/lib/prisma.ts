import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
// @ts-ignore - pg is needed for driver adapter but frequently has resolution issues in Vercel build environments
import { Pool } from 'pg'

const connectionString = `${process.env.DATABASE_URL}`

// Prisma 7 Connection Pool Configuration
const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // 10s timeout to avoid Vercel build hangs
})

const adapter = new PrismaPg(pool)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

// --- THE IMMORTALITY PROTOCOL ---
// Initialize the base client with the driver adapter for Prisma 7
const basePrisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter,
  // Ensure the datasourceUrl is explicitly passed for Prisma 7 compatibility
  datasourceUrl: connectionString
})

// Extend the client with production guardrails (The Immortality Protocol)
export const prisma = basePrisma.$extends({
  query: {
    product: {
      async deleteMany({ args, query }) {
        if (process.env.NODE_ENV === "production" && (!args || !args.where)) {
           throw new Error("DANGER: Unauthorized attempt to wipe the 'Product' table in production.")
        }
        return query(args)
      }
    },
    order: {
      async deleteMany({ args, query }) {
        if (process.env.NODE_ENV === "production" && (!args || !args.where)) {
           throw new Error("DANGER: Unauthorized attempt to wipe the 'Order' table in production.")
        }
        return query(args)
      }
    },
    user: {
      async deleteMany({ args, query }) {
        if (process.env.NODE_ENV === "production" && (!args || !args.where)) {
           throw new Error("DANGER: Unauthorized attempt to wipe the 'User' table in production.")
        }
        return query(args)
      }
    }
  }
}) as unknown as PrismaClient // Type-cast for standard usage across the app

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = basePrisma
