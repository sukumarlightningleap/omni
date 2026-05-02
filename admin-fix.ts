import { Client } from 'pg';

const connectionString = "postgresql://postgres:sukumar1234%40A@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";

async function promote() {
  const client = new Client({ connectionString });
  // CHANGED: Matching your actual registration email
  const email = "sukumar@lightningleap.org";

  try {
    await client.connect();
    console.log(`Connected. Promoting ${email}...`);

    const res = await client.query(
      'UPDATE "User" SET role = $1 WHERE email = $2 RETURNING id, email, role',
      ['ADMIN', email]
    );

    if (res.rowCount === 0) {
      console.error(`❌ FAILED: User '${email}' not found in database.`);
    } else {
      console.log("✅ SUCCESS!");
      console.log(res.rows[0]);
    }
  } catch (err: any) {
    console.error("❌ ERROR:", err.message);
  } finally {
    await client.end();
  }
}

promote();
