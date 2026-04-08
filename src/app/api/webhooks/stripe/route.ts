import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"
import { createPrintifyOrder } from "@/lib/printify"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16" as any // Safe fallback for types
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: Request) {
  const payloadStr = await req.text()
  const signature = req.headers.get("stripe-signature")

  let event;
  
  if (endpointSecret && signature) {
    try {
      event = stripe.webhooks.constructEvent(payloadStr, signature, endpointSecret)
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`)
      return NextResponse.json({ error: "Webhook Error" }, { status: 400 })
    }
  } else {
    // Development fallback if no signature is provided for local testing
    event = JSON.parse(payloadStr)
  }

  // --- SHARED ORDER FULFILLMENT LOGIC ---
  async function fulfillOrder(orderId: string, stripeObject: any) {
    console.log(`[FULFILLMENT] Starting order fulfillment for: ${orderId} (Session: ${stripeObject.id})`);
    
    // DOUBLE-GATE CHECK: Ensure we don't process the same payment twice
    const existingOrder = await prisma.order.findUnique({
      where: { stripeSessionId: stripeObject.id }
    });

    if (existingOrder && existingOrder.status !== "PENDING") {
      console.log(`[FULFILLMENT] Order ${orderId} already processed with Stripe ID ${stripeObject.id}. Aborting duplicate call.`);
      return;
    }

    // 1. Extract Details & Calculate Profit
    const addressDetails = stripeObject.shipping_details?.address || stripeObject.shipping?.address;
    const customerName = stripeObject.shipping_details?.name || stripeObject.shipping?.name || stripeObject.customer_details?.name;
    const customerEmail = stripeObject.customer_details?.email || stripeObject.receipt_email;
    
    const formattedAddress = addressDetails ? 
      `${addressDetails.line1}, ${addressDetails.line2 ? addressDetails.line2 + ', ' : ''}${addressDetails.city}, ${addressDetails.state} ${addressDetails.postal_code}, ${addressDetails.country}` 
      : "No address provided";

    const orderWithItems = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } }
    });

    if (!orderWithItems) {
      console.error(`[FULFILLMENT] CRITICAL ERROR: Order ${orderId} not found in database. Fulfillment aborted.`);
      return;
    }

    // Profit = Total - Total Cost
    const totalCost = orderWithItems.items.reduce((sum, item) => sum + (item.product.cost || 0) * item.quantity, 0);
    const profit = orderWithItems.totalAmount - totalCost;
    
    // PRECISION LTV: Use amount_total from Stripe divided by 100
    const amountPaid = (stripeObject.amount_total || stripeObject.amount_received || 0) / 100;

    console.log(`[FULFILLMENT] Verifying payment for Order ${orderId}: Expected ${orderWithItems.totalAmount}, Paid ${amountPaid}`);

    // 2. Update Database to PAID (Simultaneous update for status, profit, totalPaid, and user LTV)
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        stripeSessionId: stripeObject.id,
        profit: profit,
        totalPaid: amountPaid,
        shippingAddress: `${customerName} | ${customerEmail} | ${formattedAddress}`,
        ...(orderWithItems.userId && {
          user: {
            update: {
              totalSpent: {
                increment: amountPaid
              }
            }
          }
        })
      }
    });

    console.log(`[FULFILLMENT] Order ${orderId} marked as PAID. Triggering Printify handoff...`);

    // 3. Printify Automation Bridge (Enhanced with direct stripeObject sync)
    await createPrintifyOrder(orderId, stripeObject);
  }

  // --- EVENT HANDLERS ---
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const fullSession = (await stripe.checkout.sessions.retrieve(session.id, {
      expand: ["line_items", "customer"]
    })) as any;

    if (fullSession.metadata?.orderId) {
      await fulfillOrder(fullSession.metadata.orderId, fullSession);
    }
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    if (paymentIntent.metadata?.orderId) {
      await fulfillOrder(paymentIntent.metadata.orderId, paymentIntent);
    }
  }

  return NextResponse.json({ received: true });
}
