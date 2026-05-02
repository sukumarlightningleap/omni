import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
// @ts-ignore - pg is needed for driver adapter but frequently has resolution issues
import { Pool } from 'pg'

const connectionString = `${process.env.DATABASE_URL}`

const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // 10s timeout to avoid getting stuck
})

const adapter = new PrismaPg(pool)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

// --- THE IMMORTALITY PROTOCOL ---
// For Prisma 7, when using an adapter, the connection is managed by the Pool.
// We remove the explicit datasourceUrl here to fix the "not assignable to type never" error.
const basePrisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

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
}) as unknown as PrismaClient

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = basePrisma
