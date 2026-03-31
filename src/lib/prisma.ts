import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
// @ts-ignore - pg is needed for driver adapter but frequently has resolution issues in Vercel build environments
import { Pool } from 'pg'

const connectionString = `${process.env.DATABASE_URL}`

// Prisma 7 requires a connection pool and adapter
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

// This ensures we don't crash the database during Next.js hot-reloads
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
