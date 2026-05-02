import { prisma } from "@/lib/prisma";
import NavbarClient from "./NavbarClient";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function getVisibleCollections() {
  try {
    const collections = await prisma.collection.findMany({
      select: {
        id: true,
        name: true,
        handle: true,
        imageUrl: true,
      },
    });
    return collections;
  } catch (error) {
    console.error("Error fetching collections:", error);
    return [];
  }
}

export default async function Navbar({ user: propUser }: { user?: any }) {
  let user = propUser;

  // Fallback fetch if not provided (safety)
  if (!user) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user: fetchedUser } } = await supabase.auth.getUser();
    user = fetchedUser;
  }

  const collections = await getVisibleCollections();

  const formattedCollections = collections.map((c) => ({
    id: c.id,
    handle: c.handle,
    title: c.name,
    imageUrl: c.imageUrl,
  }));

  // Determine if user is admin based on environment variable
  const masterEmail = process.env.MASTER_ADMIN_EMAIL?.toLowerCase().trim();
  const isAdmin = user?.role === 'ADMIN' || user?.email?.toLowerCase().trim() === masterEmail;

  const safeUser = user ? {
    id: user.id || (user as any).id,
    email: user.email,
    role: isAdmin ? 'ADMIN' : 'CUSTOMER'
  } : null;

  return <NavbarClient initialCollections={formattedCollections} user={safeUser} />;
}
