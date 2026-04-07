"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { createPrintifyOrder } from "@/lib/printify"

const requireAdmin = async () => {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized. Clearance required.")
  }
}

export async function updateOrderStatus(
  orderId: string, 
  status: "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "MANUAL_INTERVENTION_REQUIRED",
  notes?: string
) {
  await requireAdmin()

  const dataToUpdate: any = { status }
  if (notes !== undefined) {
    dataToUpdate.internalNotes = notes
  }

  await prisma.order.update({
    where: { id: orderId },
    data: dataToUpdate
  })

  revalidatePath("/admin/orders")
  return { success: true }
}

export async function fetchPrintifyTracking(orderId: string) {
  await requireAdmin()

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { printifyOrderId: true, internalNotes: true }
  })

  if (!order || !order.printifyOrderId) {
    return { error: "No Printify Order ID tied to this record." }
  }

  const token = process.env.PRINTIFY_API_TOKEN || process.env.PRINTIFY_TOKEN;
  const shopId = process.env.PRINTIFY_SHOP_ID;

  // Fallback testing mechanism when PRINTIFY_TOKEN is mocked
  if (!token || !shopId) {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        internalNotes: (order.internalNotes || "") + "\n[SYSTEM]: Mocked tracking pull. Carrier: UPS. Tracking: 1Z9999999999999999"
      }
    })
    revalidatePath("/admin/orders")
    return { success: true, mocked: true }
  }

  try {
    const res = await fetch(`https://api.printify.com/v1/shops/${shopId}/orders/${order.printifyOrderId}.json`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
    
    if (res.ok) {
      const data = await res.json()
      if (data.shipments && data.shipments.length > 0) {
        const tracking = data.shipments[0].number
        const carrier = data.shipments[0].carrier

        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: "SHIPPED",
            internalNotes: (order.internalNotes || "") + `\n[ACTION]: Manual tracking pull. Carrier: ${carrier}. Tracking: ${tracking}`
          }
        })
        revalidatePath("/admin/orders")
        return { success: true, tracking, carrier }
      } else {
        return { error: "Printify indicates order is not yet shipped." }
      }
    } else {
      return { error: "Failed to communicate with Printify API." }
    }
  } catch (e) {
    return { error: "Network Error" }
  }
}

export async function forcePushToPrintify(orderId: string) {
  await requireAdmin()

  // 1. Log the initiation
  await prisma.order.update({
    where: { id: orderId },
    data: {
      internalNotes: "[OVERRIDE]: Manual propagation trigger detected. Syncing...\n"
    }
  });

  // 2. Use the shared bridge
  const result = await createPrintifyOrder(orderId);

  revalidatePath("/admin/orders")
  return result;
}
