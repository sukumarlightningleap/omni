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
    const lineItems = items.map((item: any) => {
      const price = item.price || 0;
      if (!item.price) console.warn(`[CHECKOUT] Item ${item.name} is missing price, defaulting to 0.`);
      
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: [item.image],
            metadata: {
              variantId: item.variantId, 
            }
          },
          unit_amount: Math.round(price * 100),
        },
        quantity: item.quantity,
      };
    });

    const session = await auth();
    const userId = (session?.user as any)?.id;

    // 1.5 Resolve real database IDs for all items (Robust ID Resiliency)
    const resolvedItems = await Promise.all(items.map(async (item: any) => {
      // Try to find the product by ID, then printifyId, then generic split match
      const dbProduct = await prisma.product.findFirst({
        where: {
          OR: [
            { id: item.productId },
            { id: item.id },
            { printifyId: String(item.productId) },
            { printifyId: String(item.id).split('-')[0] }
          ]
        },
        select: { id: true }
      });

      if (!dbProduct) {
        console.warn(`[CHECKOUT] Product not found in DB: ${item.productId}. Falling back to default.`);
      }

      return {
        ...item,
        dbId: dbProduct?.id || item.productId 
      };
    }));

    // 2. Create a PENDING order in your database FIRST
    const totalAmount = items.reduce((total: number, item: any) => total + ((item.price || 0) * item.quantity), 0);
    
    const order = await prisma.order.create({
      data: {
        userId,
        status: 'PENDING',
        totalAmount,
        items: {
          create: resolvedItems.map((item: any) => ({
            productId: item.dbId,
            quantity: item.quantity,
            price: Number(item.price || 0),
            variantId: item.variantId || null
          })),
        },
      },
    });

    // 3. Create the Stripe Payment Intent (Wrapped in specific try/catch)
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100),
        currency: 'usd',
        metadata: {
          orderId: order.id,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });
    } catch (stripeErr: any) {
      console.error("STRIPE PAYMENT INTENT FAILED:", stripeErr);
      // Update order to reflect failure if possible, but mainly throw
      throw new Error(`Stripe Initialization Failed: ${stripeErr.message}`);
    }

    // 4. Update order with payment intent ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: paymentIntent.id } 
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
