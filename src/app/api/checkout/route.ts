import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items } = body;

    if (!items || items.length === 0) {
      return new NextResponse("Cart is empty", { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    // ==========================================
    // GA4 CLIENT ID EXTRACTION
    // Google stores the ID in a cookie named '_ga'.
    // Format is usually "GA1.1.123456789.1600000000"
    // We slice the last two parts to get the true client_id.
    // ==========================================
    const gaCookie = cookieStore.get('_ga')?.value;
    let gaClientId = '';
    if (gaCookie) {
      const parts = gaCookie.split('.');
      if (parts.length >= 2) {
        gaClientId = parts.slice(-2).join('.');
      }
    }
    // ==========================================

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: [item.image],
          metadata: { variantId: item.variantId },
        },
        unit_amount: Math.round((item.price || 0) * 100),
      },
      quantity: item.quantity,
    }));

    // Find the user ID in Prisma based on Supabase email
    const dbUser = user ? await prisma.user.findUnique({ where: { email: user.email } }) : null;

    const totalAmount = items.reduce((total: number, item: any) => total + ((item.price || 0) * item.quantity), 0);
    const orderNumber = `UNR-${Math.random().toString(36).toUpperCase().substring(2, 10)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: dbUser?.id || null,
        status: 'PENDING',
        totalAmount,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId || item.id,
            quantity: item.quantity,
            price: Number(item.price || 0),
            variantId: item.variantId || null
          })),
        },
      },
    });

    const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?canceled=1`,
      customer_email: user?.email || undefined,
      shipping_address_collection: { allowed_countries: ['US', 'CA', 'IN', 'GB'] },
      metadata: {
        orderId: order.id,
        ga_client_id: gaClientId // Send the GA4 ID to Stripe!
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: stripeSession.id }
    });

    return NextResponse.json({ url: stripeSession.url });

  } catch (error) {
    console.error("STRIPE ERROR:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
