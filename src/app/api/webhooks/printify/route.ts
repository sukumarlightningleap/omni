import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Used by Printify to validate the webhook endpoint presence
export async function GET() {
  return NextResponse.json({ status: "ok" })
}


export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get("x-pfy-signature") || req.headers.get("x-printify-signature")
    
    console.log(`\n\x1b[45m\x1b[37m INCOMING PRINTIFY REQUEST \x1b[0m URL: ${req.url}`);
    
    // Parse body safely
    let body;
    try {
      body = rawBody ? JSON.parse(rawBody) : null
    } catch (e) {
      console.warn("Incoming request is not JSON (might be a validation ping):", rawBody)
      return new Response("OK", { status: 200 }) // Return 200 to satisfy pings
    }

    if (!body) {
      return new Response("OK", { status: 200 })
    }

    // In production: verify HMAC SHA256 signature using PRINTIFY_WEBHOOK_SECRET
    // if (!verifySignature(rawBody, signature, process.env.PRINTIFY_WEBHOOK_SECRET)) ...

    // Gatekeeper: Only parse product publishes.
    if (body.type === "product:publish:finished" || body.type === "product:published" || body.type === "product:updated") {
      console.log(`\n\x1b[44m\x1b[37m INCOMING WEBHOOK \x1b[0m \x1b[36mEVENT: ${body.type}\x1b[0m`);
      const product = body.resource
      
      const printifyId = product.id
      const name = product.title || "UNKNOWN PRODUCT"
      const description = product.description || ""
      
      // Extract the primary image URL
      const imageUrl = product.images && product.images.length > 0 
        ? product.images[0].src 
        : "https://via.placeholder.com/400x500"
      
      // Extract baseline cost from the first variant and convert from cents
      const baseCost = product.variants && product.variants.length > 0 
        ? product.variants[0].cost / 100 
        : 0

      // Secure Upsert: Defaults to DRAFT mode per architectural specs
      await prisma.product.upsert({
        where: { printifyId },
        update: {
          name,
          description,
          imageUrl,
          cost: baseCost,
        },
        create: {
          printifyId,
          name,
          description,
          price: baseCost * 2, // Arbitrary markup fallback
          cost: baseCost,
          imageUrl,
          status: "DRAFT",
          isPublished: false,
          isVaulted: false
        }
      })

      console.log(`\x1b[42m\x1b[30m SUCCESS \x1b[0m \x1b[32mPRODUCT UPSERTED TO DATABASE:\x1b[0m ${name}`);
      console.log(`         ID: ${printifyId} | SET TO: DRAFT\n`);

      return NextResponse.json({ acknowledged: true })
    }

    if (body.type === "order:shipped") {
      const orderData = body.resource
      const tracking = orderData.shipments?.[0]?.number || "UNKNOWN"
      const carrier = orderData.shipments?.[0]?.carrier || "UNKNOWN"

      await prisma.order.update({
        where: { printifyOrderId: orderData.id },
        data: {
          status: "SHIPPED",
          internalNotes: `[SYSTEM]: Order dispatched via ${carrier}. Tracking: ${tracking}\n`
        }
      })
      
      return NextResponse.json({ acknowledged: true })
    }

    return NextResponse.json({ ignored: true })
    
  } catch (error) {
    console.error("Printify Webhook Error:", error)
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 })
  }
}
