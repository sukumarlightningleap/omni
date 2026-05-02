import React from 'react';
import WishlistClient from './WishlistClient';
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function WishlistPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  // Determine if user is admin based on environment variable
  const masterEmail = process.env.MASTER_ADMIN_EMAIL?.toLowerCase().trim();
  const isAdmin = user?.email?.toLowerCase().trim() === masterEmail;

  const safeUser = user ? {
    id: user.id,
    email: user.email,
    role: isAdmin ? 'ADMIN' : 'CUSTOMER'
  } : null;

  return <WishlistClient user={safeUser} />;
}
