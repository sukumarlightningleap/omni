"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

const requireAdmin = async () => {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized. Missing priority clearance.")
  }
}

export async function updateMerchSettings(data: { heroVideoUrl: string, promoAnnouncement: string }) {
  await requireAdmin()

  await prisma.storeConfig.upsert({
    where: { id: "global" },
    update: {
      heroVideoUrl: data.heroVideoUrl,
      promoAnnouncement: data.promoAnnouncement,
    },
    create: {
      id: "global",
      heroVideoUrl: data.heroVideoUrl,
      promoAnnouncement: data.promoAnnouncement,
    }
  })

  // Revalidate homepage to immediately display new hero/promo
  revalidatePath("/")
  return { success: true }
}

export async function addLookbookImage(url: string, alt: string) {
  await requireAdmin()

  await prisma.lookbookImage.create({
    data: { url, alt }
  })

  revalidatePath("/admin/merch")
  revalidatePath("/lookbook")
  return { success: true }
}

export async function deleteLookbookImage(id: string) {
  await requireAdmin()

  await prisma.lookbookImage.delete({
    where: { id }
  })

  revalidatePath("/admin/merch")
  revalidatePath("/lookbook")
  return { success: true }
}
