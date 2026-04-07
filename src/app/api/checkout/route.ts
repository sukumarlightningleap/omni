import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Initialize the Stripe SDK with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items } = body;

    if (!items || items.length === 0) {
      return new NextResponse("Cart is empty", { status: 400 });
    }

    // 1. Format your Zustand cart items into the exact format Stripe requires
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: [item.image],
          metadata: {
            variantId: item.variantId, // We save this so Printify knows which size they bought later
          }
        },
        // Stripe requires prices to be in cents (e.g., $25.00 must be 2500)
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await auth();
    const userId = (session?.user as any)?.id;

    // 1.5 Resolve real database IDs for all items (handling Printify vs Database IDs)
    const resolvedItems = await Promise.all(items.map(async (item: any) => {
      // Try to find the product in DB by ID (CUID) OR printifyId
      const dbProduct = await prisma.product.findFirst({
        where: {
          OR: [
            { id: item.productId },
            { printifyId: String(item.productId) },
            { printifyId: String(item.id).split('-')[0] } // Handles compound IDs like "id-default"
          ]
        },
        select: { id: true }
      });

      return {
        ...item,
        dbId: dbProduct?.id || item.productId // Fallback to original if not found
      };
    }));

    // 2. Create a PENDING order in your database FIRST
    const order = await prisma.order.create({
      data: {
        userId,
        status: 'PENDING',
        totalAmount: items.reduce((total: number, item: any) => total + (item.price * item.quantity), 0),
        items: {
          create: resolvedItems.map((item: any) => ({
            productId: item.dbId,
            quantity: item.quantity,
          })),
        },
      },
    });

    // 3. Create the Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(items.reduce((total: number, item: any) => total + (item.price * item.quantity), 0) * 100),
      currency: 'usd',
      metadata: {
        orderId: order.id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // 4. Update order with payment intent ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: paymentIntent.id } // Re-using this field for PI id
    });

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      orderId: order.id 
    });

  } catch (error) {
    console.error("STRIPE ERROR:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
