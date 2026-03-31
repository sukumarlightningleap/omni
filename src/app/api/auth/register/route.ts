import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();
    const hashedPassword = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "CUSTOMER", // New signups are always customers
      },
    });

    return NextResponse.json({ message: "User created" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }
}
