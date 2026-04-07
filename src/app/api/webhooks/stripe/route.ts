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

  // --- SHARED ORDER FULFILLMENT LOGIC ---
  async function fulfillOrder(orderId: string, stripeObject: any) {
    // 1. Extract Details
    const addressDetails = stripeObject.shipping?.address || stripeObject.shipping_details?.address;
    const customerName = stripeObject.shipping?.name || stripeObject.shipping_details?.name || stripeObject.customer_details?.name;
    const customerEmail = stripeObject.receipt_email || stripeObject.customer_details?.email;
    
    const formattedAddress = addressDetails ? 
      `${addressDetails.line1}, ${addressDetails.line2 ? addressDetails.line2 + ', ' : ''}${addressDetails.city}, ${addressDetails.state} ${addressDetails.postal_code}, ${addressDetails.country}` 
      : "No address provided";

    // 2. Update Database to PAID
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        shippingAddress: `${customerName} | ${customerEmail} | ${formattedAddress}`,
        user: {
          update: {
            totalSpent: {
              increment: stripeObject.amount_received ? stripeObject.amount_received / 100 : 
                        (stripeObject.amount_total ? stripeObject.amount_total / 100 : 0)
            }
          }
        }
      },
      include: {
        items: { include: { product: true } }
      }
    });

    // 3. Printify Handoff
    const shopId = process.env.PRINTIFY_SHOP_ID;
    const token = process.env.PRINTIFY_API_TOKEN || process.env.PRINTIFY_TOKEN;

    if (shopId && token) {
      try {
        const printifyLineItems = await Promise.all(order.items.map(async item => {
          const pRes = await fetch(`https://api.printify.com/v1/shops/${shopId}/products/${item.product.printifyId}.json`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          const pData = pRes.ok ? await pRes.json() : null;
          return {
            product_id: item.product.printifyId,
            variant_id: pData?.variants?.[0]?.id || 1,
            quantity: item.quantity
          };
        }));

        const printifyPayload = {
          external_id: order.id,
          label: `UNRWLY-${order.id.substring(0,6)}`,
          line_items: printifyLineItems,
          shipping_method: 1,
          address_to: {
            first_name: customerName?.split(' ')[0] || "Customer",
            last_name: customerName?.split(' ').slice(1).join(' ') || "",
            email: customerEmail,
            country: addressDetails?.country,
            region: addressDetails?.state,
            address1: addressDetails?.line1,
            address2: addressDetails?.line2 || "",
            city: addressDetails?.city,
            zip: addressDetails?.postal_code
          }
        };

        const printifyRes = await fetch(`https://api.printify.com/v1/shops/${shopId}/orders.json`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(printifyPayload)
        });

        if (printifyRes.ok) {
          const printifyOrder = await printifyRes.json();
          await prisma.order.update({
            where: { id: order.id },
            data: { printifyOrderId: printifyOrder.id, internalNotes: "Auto-synced to Printify.\n" }
          });
        }
      } catch (err) { console.error("Printify Sync Error:", err); }
    }
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
