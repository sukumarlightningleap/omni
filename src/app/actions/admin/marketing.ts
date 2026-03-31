"use server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function updateFlashSale(data: { active: boolean, endsAt: Date, message: string }) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized")

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

  revalidatePath("/") // Refresh the storefront
  return { success: true }
}
