"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { Role } from "@prisma/client"

export async function updateUserCRM(userId: string, data: { role?: Role, internalNotes?: string }) {
  const session = await auth()
  
  // Require ADMIN priority clearance
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized. Missing priority clearance.")
  }

  await prisma.user.update({
    where: { id: userId },
    data
  })

  // Sync state
  revalidatePath("/admin/crm")
  
  return { success: true }
}
