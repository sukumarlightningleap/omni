"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { createPrintifyOrder, registerPrintifyWebhook } from "@/lib/printify"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16" as any
})

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
            trackingNumber: tracking,
            carrier: carrier,
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

  await prisma.order.update({
    where: { id: orderId },
    data: {
      internalNotes: "[OVERRIDE]: Manual propagation trigger detected. Syncing...\n"
    }
  });

  const result = await createPrintifyOrder(orderId);
  revalidatePath("/admin/orders")
  return result;
}

export async function repairOrder(orderId: string) {
  await requireAdmin()

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { stripeSessionId: true, status: true, internalNotes: true, userId: true, totalAmount: true }
  })

  if (!order || !order.stripeSessionId) {
    return { error: "No Stripe Session ID associated with this order record." }
  }

  if (order.status !== "PENDING") {
    return { error: "Order is already processed beyond the pending state." }
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId, {
      expand: ["line_items", "customer"]
    }) as any

    if (session.payment_status === "paid" || session.status === "complete") {
      const addressDetails = session.shipping_details?.address || session.shipping?.address;
      const customerName = session.shipping_details?.name || session.shipping?.name || session.customer_details?.name;
      const customerEmail = session.customer_details?.email || session.receipt_email;
      
      const formattedAddress = addressDetails ? 
        `${customerName} | ${customerEmail} | ${addressDetails.line1}, ${addressDetails.line2 ? addressDetails.line2 + ', ' : ''}${addressDetails.city}, ${addressDetails.state} ${addressDetails.postal_code}, ${addressDetails.country}` 
        : "No address recorded";

      const orderWithItems = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: true } } }
      });

      if (!orderWithItems) return { error: "Order items not found." };

      const totalCost = orderWithItems.items.reduce((sum: number, item: any) => sum + (item.product.cost || 0) * item.quantity, 0);
      const profit = orderWithItems.totalAmount - totalCost;
      const amountPaid = (session.amount_total || 0) / 100;

      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          profit: profit,
          totalPaid: amountPaid,
          shippingAddress: formattedAddress,
          ...(order.userId && {
            user: {
              update: { totalSpent: { increment: amountPaid } }
            }
          }),
          internalNotes: (order.internalNotes || "") + "\n[RECOVERY]: Manual administrative sync successful. Payment verified via Stripe. Fulfillment triggered."
        }
      });

      await createPrintifyOrder(orderId, session);
      
      revalidatePath("/admin/orders")
      return { success: true }
    } else {
      return { error: `Stripe reports payment status: ${session.payment_status}. Verification failed.` }
    }
  } catch (err: any) {
    return { error: `Repair Failed: ${err.message}` }
  }
}

export async function syncPrintifyOrder(orderId: string) {
  return fetchPrintifyTracking(orderId);
}

export async function setupLogisticsWebhook() {
  await requireAdmin()
  
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL;
  if (!appUrl) {
    return { error: "Production URL not detected in environment. Setup failed." }
  }

  const protocol = appUrl.startsWith('http') ? '' : 'https://';
  const targetUrl = `${protocol}${appUrl}/api/webhooks/printify`;

  console.log(`[ADMIN] Initiating Logistics Registration for: ${targetUrl}`);
  const result = await registerPrintifyWebhook(targetUrl);

  if (result.success) {
    revalidatePath("/admin/orders")
    return { success: true, message: "Logistics Bridge established successfully." }
  } else {
    return { error: `Registration Failure: ${result.error}` }
  }
}

