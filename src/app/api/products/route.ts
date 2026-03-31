import { NextResponse } from 'next/server';

// 1. Tell Next.js to NEVER cache this API route
export const dynamic = 'force-dynamic';

export async function GET() {
  const shopId = process.env.PRINTIFY_SHOP_ID;
  const token = process.env.PRINTIFY_API_TOKEN;

  if (!shopId || !token) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 500 });
  }

  try {
    const response = await fetch(`https://api.printify.com/v1/shops/${shopId}/products.json`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      // 2. Tell the fetch request to bypass the cache completely
      cache: 'no-store'
    });

    if (!response.ok) throw new Error(`Printify API status: ${response.status}`);

    const data = await response.json();
    return NextResponse.json({ products: data.data });

  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
