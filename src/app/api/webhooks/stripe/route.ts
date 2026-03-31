import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    // Retrieve full session with line items
    const fullSession = (await stripe.checkout.sessions.retrieve(session.id, {
      expand: ["line_items", "customer"]
    })) as any;

    const orderId = fullSession.metadata?.orderId
    if (!orderId) {
      console.error("No internal orderId attached to Stripe Session metadata.")
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 })
    }

    // 1. Extract Address 
    const addressDetails = fullSession.shipping_details?.address
    const customerName = fullSession.shipping_details?.name || fullSession.customer_details?.name
    const customerEmail = fullSession.customer_details?.email
    
    const formattedAddress = addressDetails ? 
      `${addressDetails.line1}, ${addressDetails.line2 ? addressDetails.line2 + ', ' : ''}${addressDetails.city}, ${addressDetails.state} ${addressDetails.postal_code}, ${addressDetails.country}` 
      : "No address provided"

    // 2. Update Database to PAID and Accrue User LTV
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        shippingAddress: `${customerName} | ${customerEmail} | ${formattedAddress}`,
        user: {
          update: {
            totalSpent: {
              increment: fullSession.amount_total ? fullSession.amount_total / 100 : 0
            }
          }
        }
      },
      include: {
        items: {
          include: { product: true }
        }
      }
    })

    // 3. The Hand-off: Push directly to Printify API
    if (process.env.PRINTIFY_SHOP_ID && process.env.PRINTIFY_TOKEN) {
      try {
        const printifyLineItems = order.items.map(item => ({
          product_id: item.product.printifyId,
          variant_id: 1, // In a full implementation, you'd map the specific variant based on size/color
          quantity: item.quantity
        }))

        const printifyPayload = {
          external_id: order.id,
          label: `OMNIDROP-${order.id.substring(0,6)}`,
          line_items: printifyLineItems,
          shipping_method: 1, // Standard Delivery
          is_printify_express: false,
          send_shipping_notification: false,
          address_to: {
            first_name: customerName?.split(' ')[0] || "Customer",
            last_name: customerName?.split(' ').slice(1).join(' ') || "",
            email: customerEmail,
            phone: fullSession.customer_details?.phone || "0000000000",
            country: addressDetails?.country,
            region: addressDetails?.state,
            address1: addressDetails?.line1,
            address2: addressDetails?.line2 || "",
            city: addressDetails?.city,
            zip: addressDetails?.postal_code
          }
        }

        const printifyRes = await fetch(`https://api.printify.com/v1/shops/${process.env.PRINTIFY_SHOP_ID}/orders.json`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.PRINTIFY_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(printifyPayload)
        })

        if (printifyRes.ok) {
          const printifyOrder = await printifyRes.json()
          await prisma.order.update({
            where: { id: order.id },
            data: { 
              printifyOrderId: printifyOrder.id,
              internalNotes: "Auto-synced to Printify Logistics.\n"
            }
          })
          console.log(`Successfully handed off Order ${order.id} to Printify (ID: ${printifyOrder.id})`)
        } else {
           const errBody = await printifyRes.text()
           console.error("Printify Hand-off Failed:", errBody)
           await prisma.order.update({
            where: { id: order.id },
            data: { internalNotes: `PRINTIFY SYNC FAILED: ${errBody}\n` }
          })
        }
      } catch (err) {
        console.error("Error communicating with Printify API:", err)
      }
    } else {
      console.warn("Printify Environment Variables Missing. Skipping logistics hand-off.")
    }

    return NextResponse.json({ received: true })
  }

  return NextResponse.json({ received: true })
}
