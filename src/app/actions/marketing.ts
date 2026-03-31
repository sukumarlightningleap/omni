"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function updateFlashSale(data: { active: boolean, endsAt: Date, message: string }) {
  const session = await auth()
  
  // Require ADMIN role
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized. Only admins can modify the engine protocol.")
  }

  await prisma.storeConfig.upsert({
    where: { id: "global" },
    update: {
      flashSaleActive: data.active,
      flashSaleEndsAt: data.endsAt,
      flashSaleMessage: data.message,
    },
    create: {
      id: "global",
      flashSaleActive: data.active,
      flashSaleEndsAt: data.endsAt,
      flashSaleMessage: data.message,
    }
  })

  // Revalidate the entire site to update the global countdown instantaneously
  revalidatePath("/", "layout")
  
  return { success: true }
}
