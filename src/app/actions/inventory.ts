"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function toggleProductState(
  productId: string, 
  field: "isVaulted" | "isPreorder" | "isFeatured" | "isPublished",
  value: boolean
) {
  const session = await auth()
  
  // Require ADMIN role
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized. Missing clearance.")
  }

  await prisma.product.update({
    where: { id: productId },
    data: { [field]: value }
  })

  // Revalidate paths to reflect inventory changes immediately
  revalidatePath("/admin/inventory")
  revalidatePath("/")
  revalidatePath("/collections")
  
  return { success: true }
}
