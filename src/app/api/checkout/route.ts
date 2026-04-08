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
    const orderNumber = `UNR-${Math.random().toString(36).toUpperCase().substring(2, 10)}`;
    
    const order = await prisma.order.create({
      data: {
        orderNumber,
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

    // 3. Create the Stripe Checkout Session (Frictionless Redirect Flow)
    const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    let stripeSession;
    try {
      stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout?canceled=1`,
        customer_email: session?.user?.email || undefined, // AUTO-RECOVERY: Pre-fill email
        shipping_address_collection: {
          allowed_countries: ['US', 'CA', 'IN', 'GB'],
        },
        // DYNAMIC SHIPPING: Managed in Stripe Dashboard
        shipping_options: [
          { shipping_rate: 'shr_1QscyS2N7M9Z5v5z5z5z5z5z' }, // Standard placeholder
          { shipping_rate: 'shr_1QscyP2N7M9Z5v5z5z5z5z5z' }, // Priority placeholder
        ],
        metadata: {
          orderId: order.id,
        },
      });
    } catch (stripeErr: any) {
      console.error("STRIPE SESSION CREATION FAILED:", stripeErr);
      throw new Error(`Stripe Initialization Failed: ${stripeErr.message}`);
    }

    // 4. Update order with session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: stripeSession.id } 
    });

    return NextResponse.json({ 
      url: stripeSession.url,
      orderId: order.id 
    });

  } catch (error) {
    console.error("STRIPE ERROR:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
