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
  collectionId: string | null,
  status: "DRAFT" | "ACTIVE" | "ARCHIVED"
) {
  await requireAdmin()

  await prisma.product.update({
    where: { id: productId },
    data: {
      price,
      collectionId: collectionId && collectionId !== "none" ? collectionId : null,
      status,
      isPublished: status === "ACTIVE",
      isVaulted: status === "ARCHIVED"
    }
  })

  revalidatePath("/admin/products")
  revalidatePath("/collections")
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
        status: "ACTIVE",
        isPublished: true,
        collectionId: collectionId && collectionId !== "none" ? collectionId : null
      }
    })
  }

  revalidatePath("/admin/products")
  revalidatePath("/collections")
  return { success: true }
}

import { fetchPrintifyProducts } from "@/lib/printify"

export async function syncPrintifyManual() {
  await requireAdmin()

  try {
    const liveProducts = await fetchPrintifyProducts(0) // 0 forces a fresh bypass of cache
    
    if (!liveProducts || liveProducts.length === 0) {
      console.warn("No products retrieved from Printify during sync.")
      return { success: false, message: "No products found on Printify." }
    }

    for (const p of liveProducts) {
      // Upsert physical products dynamically into Prisma
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
          price: p.rawPrice * 2, // Automatic 2x baseline markup logic
          cost: p.rawPrice,
          imageUrl: p.image || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
          status: "DRAFT",
          isPublished: false,
          isVaulted: false
        }
      })
    }

    revalidatePath("/admin/products")
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
  return { success: true }
}

export async function deleteCollection(id: string) {
  await requireAdmin()

  await prisma.collection.delete({
    where: { id }
  })

  revalidatePath("/admin/products/collections")
  return { success: true }
}
