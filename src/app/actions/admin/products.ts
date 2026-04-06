"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

const requireAdmin = async () => {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized. Gatekeeper clearance required.")
  }
}

export async function updateProductGatekeeper(
  productId: string,
  price: number,
  collectionId: string, // Changed to single ID for 1-to-many
) {
  await requireAdmin()

  await prisma.product.update({
    where: { id: productId },
    data: {
      price,
      collectionId: collectionId === "none" ? null : collectionId,
    }
  })

  revalidatePath("/admin/products")
  revalidatePath("/collections")
  revalidatePath("/") // Clear home cache for featured products
  return { success: true }
}

export async function bulkPublishToCollection(
  productIds: string[],
  collectionId: string | null
) {
  await requireAdmin()

  for (const id of productIds) {
    await prisma.product.update({
      where: { id },
      data: {
        collectionId: collectionId && collectionId !== "none" 
          ? collectionId 
          : null
      }
    })
  }

  revalidatePath("/admin/products")
  revalidatePath("/collections")
  revalidatePath("/")
  return { success: true }
}

import { fetchPrintifyProducts } from "@/lib/printify"

export async function syncPrintifyManual() {
  await requireAdmin()

  try {
    const liveProducts = await fetchPrintifyProducts(0) 
    
    if (liveProducts === null) {
      return { success: false, message: "Authentication failed." }
    }

    for (const p of liveProducts) {
      await prisma.product.upsert({
        where: { printifyId: p._id },
        update: {
          name: p.name,
          description: p.descriptionHtml || p.description,
          imageUrl: p.image || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80", 
          cost: p.rawPrice,
        },
        create: {
          printifyId: p._id,
          name: p.name,
          description: p.descriptionHtml || p.description,
          price: p.rawPrice * 2,
          cost: p.rawPrice,
          imageUrl: p.image || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
        }
      })
    }

    revalidatePath("/admin/products")
    revalidatePath("/")
    revalidatePath("/", "layout")
    return { success: true }
  } catch (err) {
    console.error("Printify Sync Failed:", err)
    return { success: false, message: "Internal Server Error during sync." }
  }
}

export async function createCollection(name: string, description: string) {
  await requireAdmin()

  const handle = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  
  await prisma.collection.create({
    data: {
      name,
      description,
      handle,
    }
  })

  revalidatePath("/admin/products/collections")
  revalidatePath("/collections")
  revalidatePath("/")
  revalidatePath("/", "layout")
  return { success: true }
}

export async function deleteCollection(id: string) {
  await requireAdmin()

  await prisma.collection.delete({
    where: { id }
  })

  revalidatePath("/admin/products/collections")
  revalidatePath("/collections")
  revalidatePath("/")
  revalidatePath("/", "layout")
  return { success: true }
}
