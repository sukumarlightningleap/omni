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
  status: "LIVE" | "DRAFT" = "DRAFT"
) {
  await requireAdmin()

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { cost: true }
  })

  if (product && product.cost && price < product.cost) {
    throw new Error(`Loss Prevention: Retail price ($${price}) cannot be lower than base cost ($${product.cost.toFixed(2)}).`)
  }

  if (status === "LIVE" && (collectionId === "none" || !collectionId)) {
    throw new Error("Gatekeeper: Product cannot be LIVE without an assigned collection.")
  }

  await prisma.product.update({
    where: { id: productId },
    data: {
      price,
      collectionId: collectionId === "none" ? null : collectionId,
      status,
    }
  })

  revalidatePath("/admin/products")
  revalidatePath("/collections")
  revalidatePath("/")
  return { success: true }
}

export async function toggleProductStatus(productId: string, isLive: boolean) {
  await requireAdmin()

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { collectionId: true }
  })

  // Enforce the rule: LIVE requires a collection
  if (isLive && !product?.collectionId) {
    throw new Error("Gatekeeper: Cannot publish. Choose a collection first.")
  }

  await prisma.product.update({
    where: { id: productId },
    data: { status: isLive ? 'LIVE' : 'DRAFT' }
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

import { syncStorefrontWithPrintify } from "@/lib/printify"

export async function syncPrintifyManual() {
  await requireAdmin()

  try {
    const result = await syncStorefrontWithPrintify();
    
    if (!result.success) {
      return { success: false, message: result.error || "Sync Failed." }
    }

    revalidatePath("/admin/products")
    revalidatePath("/")
    revalidatePath("/", "layout")
    
    if (result.isFullRestore) {
      return { success: true, message: `Full Restore Active: ${result.count} products recovered.` }
    }
    return { success: true, message: `Manual Sync: ${result.count} products processed.` }
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

export async function deleteManyProducts(productIds: string[]) {
  await requireAdmin()

  await prisma.product.deleteMany({
    where: {
      id: { in: productIds }
    }
  })

  revalidatePath("/admin/products")
  revalidatePath("/collections")
  revalidatePath("/")
  revalidatePath("/", "layout")
  return { success: true }
}
