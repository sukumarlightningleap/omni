import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AccountClient from "./AccountClient";
import { prisma } from "@/lib/prisma";

export default async function AccountPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth?message=Please sign in to access your account.");
  }

  // Fetch real orders
  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return <AccountClient orders={orders} />;
}
