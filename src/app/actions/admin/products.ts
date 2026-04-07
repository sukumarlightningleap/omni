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
  collectionId: string,
) {
  await requireAdmin()

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { cost: true }
  })

  if (product && product.cost && price < product.cost) {
    throw new Error(`Loss Prevention: Retail price ($${price}) cannot be lower than base cost ($${product.cost.toFixed(2)}).`)
  }

  await prisma.product.update({
    where: { id: productId },
    data: {
      price,
      collectionId: collectionId === "none" ? null : collectionId,
    }
  })

  revalidatePath("/admin/products")
  revalidatePath("/collections")
  revalidatePath("/")
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

    const currentProductCount = await prisma.product.count()
    const isFullRestore = currentProductCount === 0

    if (isFullRestore) {
      console.log("⚠️ IMMORTALITY PROTOCOL: 0 products detected. Initiating Full Restore...")
      
      // Ensure default collections exist
      const defaultCollections = ["New Arrivals", "Best Sellers"]
      for (const name of defaultCollections) {
         const handle = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
         await prisma.collection.upsert({
            where: { handle },
            update: {},
            create: { name, handle }
         })
      }
    }

    let syncCount = 0
    for (const p of liveProducts) {
      const description = p.descriptionHtml || p.description || "";
      // Strip HTML and truncate for meta description
      const metaDescription = description.replace(/<[^>]*>?/gm, '').substring(0, 157).trim() + "...";

      await prisma.product.upsert({
        where: { printifyId: p._id },
        update: {
          name: p.name,
          description: description,
          metaDescription: metaDescription,
          imageUrl: p.image || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80", 
          cost: p.rawPrice,
        },
        create: {
          printifyId: p._id,
          name: p.name,
          description: description,
          metaDescription: metaDescription,
          price: p.rawPrice * 2,
          cost: p.rawPrice,
          imageUrl: p.image || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
        }
      })
      syncCount++
    }

    revalidatePath("/admin/products")
    revalidatePath("/")
    revalidatePath("/", "layout")
    
    if (isFullRestore) {
      return { success: true, message: `Full Restore Active: ${syncCount} products recovered.` }
    }
    return { success: true, message: `Manual Sync: ${syncCount} products processed.` }
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
