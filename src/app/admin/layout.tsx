import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Validate session with Supabase
  const { data: { user } } = await supabase.auth.getUser();

  const masterEmail = process.env.MASTER_ADMIN_EMAIL?.toLowerCase().trim();
  const currentUserEmail = user?.email?.toLowerCase().trim();

  // STAGE 6: Silent Gate Protocol
  // If no user exists or email doesn't match the Vercel Master Admin, block access.
  if (!user || currentUserEmail !== masterEmail) {
    redirect("/auth");
  }

  return (
    <div className="flex min-h-screen bg-black">
      <AdminSidebar user={user} />
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
