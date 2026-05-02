import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
// @ts-ignore
import { Pool } from 'pg'

const connectionString = `${process.env.DATABASE_URL}`

const pool = new Pool({
  connectionString,
  max: 1, // Fixed: Prevents connection hangs in Vercel Serverless
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

const adapter = new PrismaPg(pool)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const basePrisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

export const prisma = basePrisma.$extends({
  query: {
    product: {
      async deleteMany({ args, query }) {
        if (process.env.NODE_ENV === "production" && (!args || !args.where)) {
           throw new Error("DANGER: Unauthorized attempt to wipe the 'Product' table.")
        }
        return query(args)
      }
    },
    order: {
      async deleteMany({ args, query }) {
        if (process.env.NODE_ENV === "production" && (!args || !args.where)) {
           throw new Error("DANGER: Unauthorized attempt to wipe the 'Order' table.")
        }
        return query(args)
      }
    },
    user: {
      async deleteMany({ args, query }) {
        if (process.env.NODE_ENV === "production" && (!args || !args.where)) {
           throw new Error("DANGER: Unauthorized attempt to wipe the 'User' table.")
        }
        return query(args)
      }
    }
  }
}) as unknown as PrismaClient

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = basePrisma
