"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function updateMarketingSettings(data: { 
  flashSaleActive?: boolean, 
  flashSaleEndsAt?: Date, 
  flashSaleMessage?: string,
  welcomeActive?: boolean,
  welcomeTitle?: string,
  welcomeSubtitle?: string,
  welcomeDescription?: string
}) {
  const session = await auth()
  
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized. Only admins can modify the engine protocol.")
  }

  await prisma.storeConfig.upsert({
    where: { id: "global" },
    update: {
      flashSaleActive: data.flashSaleActive,
      flashSaleEndsAt: data.flashSaleEndsAt,
      flashSaleMessage: data.flashSaleMessage,
      welcomeActive: data.welcomeActive,
      welcomeTitle: data.welcomeTitle,
      welcomeSubtitle: data.welcomeSubtitle,
      welcomeDescription: data.welcomeDescription,
    },
    create: {
      id: "global",
      flashSaleActive: data.flashSaleActive ?? false,
      flashSaleEndsAt: data.flashSaleEndsAt ?? new Date(),
      flashSaleMessage: data.flashSaleMessage ?? "LIMITED DROP ENDING SOON",
      welcomeActive: data.welcomeActive ?? true,
      welcomeTitle: data.welcomeTitle ?? "10%",
      welcomeSubtitle: data.welcomeSubtitle ?? "OFF YOUR FIRST ORDER",
      welcomeDescription: data.welcomeDescription ?? "JOIN THE CLUB FOR EXCLUSIVE ACCESS.",
    }
  })

  revalidatePath("/", "layout")
  return { success: true }
}

// Keep a wrapper for compatibility if needed, but we'll update the components
export async function updateFlashSale(data: { active: boolean, endsAt: Date, message: string }) {
  return updateMarketingSettings({
    flashSaleActive: data.active,
    flashSaleEndsAt: data.endsAt,
    flashSaleMessage: data.message
  })
}
