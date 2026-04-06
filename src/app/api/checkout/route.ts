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

    // 2. Create a PENDING order in your database FIRST
    const order = await prisma.order.create({
      data: {
        userId, // Optional field now
        status: 'PENDING',
        totalAmount: items.reduce((total: number, item: any) => total + (item.price * item.quantity), 0),
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
    });

    // 3. Create the Stripe Checkout Session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      metadata: {
        orderId: order.id,
      },
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'IN'],
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/?canceled=1`,
    });

    return NextResponse.json({ url: stripeSession.url });

  } catch (error) {
    console.error("STRIPE ERROR:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
