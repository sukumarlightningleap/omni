import { NextResponse } from 'next/server';
import Stripe from 'stripe';

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

    // 2. Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      // Force Stripe to collect the shipping address
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'IN'], // Add or remove country codes as needed
      },
      // Where Stripe sends the user after they pay (or if they click back)
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/?canceled=1`,
    });

    // 3. Send the secure payment URL back to the frontend
    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error("STRIPE ERROR:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
