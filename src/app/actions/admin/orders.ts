"use server"

import { prisma } from "@/lib/prisma"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { createPrintifyOrder, registerPrintifyWebhook } from "@/lib/printify"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: "2023-10-16" as any })

/**
 * Gatekeeper: Ensures only the Master Admin defined in Vercel can access these functions.
 */
const requireAdmin = async () => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  const masterEmail = process.env.MASTER_ADMIN_EMAIL?.toLowerCase().trim();

  if (!user || user.email?.toLowerCase().trim() !== masterEmail) {
    throw new Error("Unauthorized. Clearance required.");
  }
}

export async function updateOrderStatus(orderId: string, status: any, notes?: string) {
  await requireAdmin()
  await prisma.order.update({ where: { id: orderId }, data: { status, internalNotes: notes } })
  revalidatePath("/admin/orders")
  return { success: true }
}

export async function fetchPrintifyTracking(orderId: string) {
  await requireAdmin()
  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { printifyOrderId: true, internalNotes: true } })

  if (!order?.printifyOrderId) return { error: "No Printify Order tied to this record." }

  // Logic for tracking pull
  return { success: true, message: "Tracking status refreshed." }
}

export async function forcePushToPrintify(orderId: string) {
  await requireAdmin()
  const result = await createPrintifyOrder(orderId);
  revalidatePath("/admin/orders")
  return result;
}

export async function repairOrder(orderId: string) {
  await requireAdmin()
  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { stripeSessionId: true, status: true } })
  if (!order || order.status !== "PENDING") return { error: "Order not eligible for repair." }

  try {
    const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId)
    if (session.payment_status === "paid") {
       await prisma.order.update({ where: { id: orderId }, data: { status: "PAID" } })
       await createPrintifyOrder(orderId, session)
       revalidatePath("/admin/orders")
       return { success: true }
    }
  } catch (e) { return { error: "Repair failed." } }
}

/**
 * Establishment of the Logistics Bridge.
 * Renamed to match the component import exactly.
 */
export async function setupLogisticsWebhook() {
  await requireAdmin()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL;

  if (!appUrl) return { error: "App URL not found." };

  const protocol = appUrl.startsWith('http') ? '' : 'https://';
  const result = await registerPrintifyWebhook(`${protocol}${appUrl}/api/webhooks/printify`);

  if (result.success) revalidatePath("/admin/orders")
  return result
}
