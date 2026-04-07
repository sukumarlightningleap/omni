"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { Role } from "@prisma/client"

const requireAdmin = async () => {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized. Clearance required.")
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
