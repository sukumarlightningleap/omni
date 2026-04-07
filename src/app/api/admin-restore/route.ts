import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

export async function GET() {
  // 1. SET YOUR CREDENTIALS HERE
  const adminEmail = "sukumar@lightningleap.org"; // REPLACE WITH YOUR EMAIL
  const adminPassword = "sukumar1234@A"; // REPLACE WITH YOUR PASSWORD

  try {
    const hashedPassword = await hash(adminPassword, 12);

    const user = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: "ADMIN" },
      create: {
        email: adminEmail,
        name: "Sukumar Admin",
        password: hashedPassword,
        role: "ADMIN"
      }
    });

    return NextResponse.json({
      success: true,
      message: `ADMIN_ACCOUNT_RESTORED: ${user.email}. PLEASE LOGIN NOW AND DELETE THIS ROUTE.`
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "DATABASE_CONNECTION_ERROR" }, { status: 500 });
  }
}
