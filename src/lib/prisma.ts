import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
// @ts-ignore - pg is needed for driver adapter but frequently has resolution issues in Vercel build environments
import { Pool } from 'pg'

const connectionString = `${process.env.DATABASE_URL}`

// Prisma 7 requires a connection pool and adapter
const pool = new Pool({ 
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // 10s timeout to avoid getting stuck for 40s
})
const adapter = new PrismaPg(pool)

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

// --- THE IMMORTALITY PROTOCOL ---
// Block accidental bulk deletions in production
const basePrisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

export const prisma = basePrisma.$extends({
  query: {
    product: {
      async deleteMany({ args, query }) {
        if (process.env.NODE_ENV === "production" && !args.where) {
           throw new Error("DANGER: Unauthorized attempt to wipe the 'Product' table in production.")
        }
        return query(args)
      }
    },
    order: {
      async deleteMany({ args, query }) {
        if (process.env.NODE_ENV === "production" && !args.where) {
           throw new Error("DANGER: Unauthorized attempt to wipe the 'Order' table in production.")
        }
        return query(args)
      }
    },
    user: {
      async deleteMany({ args, query }) {
        if (process.env.NODE_ENV === "production" && !args.where) {
           throw new Error("DANGER: Unauthorized attempt to wipe the 'User' table in production.")
        }
        return query(args)
      }
    }
  }
}) as unknown as PrismaClient // Cast back for standard usage across the app

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = basePrisma
