import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AccountClient from "./AccountClient";
import { prisma } from "@/lib/prisma";

export default async function AccountPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // Fetch the user data from Prisma to maintain consistency with your existing UI
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: { items: { include: { product: true } } }
      }
    }
  });

  return <AccountClient user={dbUser} />;
}
