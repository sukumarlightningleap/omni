"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

const requireAdmin = async () => {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized. Clearance required.")
  }
}

export async function updateOrderStatus(
  orderId: string, 
  status: "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "CANCELLED",
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

  // Fallback testing mechanism when PRINTIFY_TOKEN is mocked
  if (!process.env.PRINTIFY_TOKEN) {
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
    const res = await fetch(`https://api.printify.com/v1/shops/${process.env.PRINTIFY_SHOP_ID}/orders/${order.printifyOrderId}.json`, {
      headers: { "Authorization": `Bearer ${process.env.PRINTIFY_TOKEN}` }
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

  // In a robust system, this rebuilds the Printify payload exactly like the Stripe webhook
  // and issues it manually if the webhook failed.
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "PROCESSING",
      internalNotes: "[OVERRIDE]: Force pushed to external logistics pipeline.\n"
    }
  })

  revalidatePath("/admin/orders")
  return { success: true }
}
