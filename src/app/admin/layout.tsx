import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Root Server Level Security Enforcement
  // Temporarily disabled for development preview
  // if (session?.user?.role !== "ADMIN") {
  //   redirect("/");
  // }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <AdminSidebar />
      {/* Structural enforcement: Sidebar isolation to prevent overlapping */}
      <main className="ml-64 min-h-screen bg-black">
        <div className="max-w-[1600px] mx-auto p-10 pt-16 border-l border-white/5 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
