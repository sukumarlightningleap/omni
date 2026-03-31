import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { hash } from 'bcryptjs';
import 'dotenv/config';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // --- CONFIGURATION ---
  const BOSS_EMAIL = 'sukumar@lightningleap.org'; // REPLACE WITH REAL BOSS EMAIL
  const TEMP_PASSWORD = 'sukumar1234@A'; // CHANGE THIS AFTER FIRST LOGIN
  // ---------------------

  console.log('🌱 Starting Admin Promotion Seeding...');

  const hashedPassword = await hash(TEMP_PASSWORD, 12);

  const admin = await prisma.user.upsert({
    where: { email: BOSS_EMAIL },
    update: {
      role: 'ADMIN',
    },
    create: {
      email: BOSS_EMAIL,
      name: 'Omnidrop Admin',
      role: 'ADMIN',
      password: hashedPassword,
    } as any,
  });

  console.log(`✅ Admin account ${admin.email} promoted/created.`);
  console.log('🚀 Seeding complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
