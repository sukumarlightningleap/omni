import { NextResponse } from 'next/server';

export async function GET() {
  const shopId = process.env.PRINTIFY_SHOP_ID;
  const token = process.env.PRINTIFY_API_TOKEN;

  if (!shopId || !token) {
    return NextResponse.json(
      { error: 'Printify credentials are not configured in the environment.' },
      { status: 500 }
    );
  }

  try {
    // Ping the Printify REST API
    const response = await fetch(`https://api.printify.com/v1/shops/${shopId}/products.json`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      // Cache the response for 60 seconds so you don't hit Printify's rate limits
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      throw new Error(`Printify API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Send the raw Printify data back to our frontend
    return NextResponse.json({ products: data.data });

  } catch (error) {
    console.error('Error fetching Printify products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products from Printify' },
      { status: 500 }
    );
  }
}
