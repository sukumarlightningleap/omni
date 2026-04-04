import { NextResponse } from 'next/server';
import { fetchPrintifyProducts } from '@/lib/printify';

// 1. Tell Next.js to NEVER cache this API route
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await fetchPrintifyProducts(0); // 0 ensures fresh fetch

    if (products === null) {
      return NextResponse.json({ error: 'Unauthorized. Check Printify credentials.' }, { status: 401 });
    }

    return NextResponse.json({ products });

  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
