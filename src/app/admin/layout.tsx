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
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <AdminSidebar />
      {/* Structural enforcement: Sidebar isolation to prevent overlapping */}
      <main className="ml-64 min-h-screen">
        <div className="max-w-[1600px] mx-auto p-12 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
