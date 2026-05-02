"use server"

import { prisma } from "@/lib/prisma"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { Role } from "@prisma/client"

/**
 * Gatekeeper: Ensures only the Master Admin defined in Vercel
 * can access these customer management functions.
 */
const requireAdmin = async () => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  const masterEmail = process.env.MASTER_ADMIN_EMAIL?.toLowerCase().trim();

  if (!user || user.email?.toLowerCase().trim() !== masterEmail) {
    throw new Error("Unauthorized. CRM priority clearance required.");
  }
}

export async function updateUserRole(userId: string, role: Role) {
  await requireAdmin()

  await prisma.user.update({
    where: { id: userId },
    data: { role }
  })

  revalidatePath("/admin/customers")
  return { success: true }
}

export async function saveInternalNotes(userId: string, notes: string) {
  await requireAdmin()

  await prisma.user.update({
    where: { id: userId },
    data: { internalNotes: notes }
  })

  revalidatePath("/admin/customers")
  return { success: true }
}

export async function getCustomerProfile(userId: string) {
  await requireAdmin()

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: { product: true }
          }
        }
      }
    }
  })

  return user
}
