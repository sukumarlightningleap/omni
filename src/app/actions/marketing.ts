"use server"

import { prisma } from "@/lib/prisma"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

const requireAdmin = async () => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  const masterEmail = process.env.MASTER_ADMIN_EMAIL?.toLowerCase().trim();

  if (!user || user.email?.toLowerCase().trim() !== masterEmail) {
    throw new Error("Unauthorized. Gatekeeper clearance required.");
  }
}

export async function updateMarketingSettings(data: {
  flashSaleActive?: boolean,
  flashSaleEndsAt?: Date,
  flashSaleMessage?: string,
  welcomeActive?: boolean,
  welcomeTitle?: string,
  welcomeSubtitle?: string,
  welcomeDescription?: string
}) {
  await requireAdmin();

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

export async function updateFlashSale(data: { active: boolean, endsAt: Date, message: string }) {
  return updateMarketingSettings({
    flashSaleActive: data.active,
    flashSaleEndsAt: data.endsAt,
    flashSaleMessage: data.message
  })
}
