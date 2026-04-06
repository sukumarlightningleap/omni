/**
 * SHARED PRINTIFY UTILITY
 * Logic for fetching and normalizing product data from the Printify API.
 */

export interface NormalizedProduct {
  _id: string;
  name: string;
  slug: string;
  price: string;
  rawPrice: number;
  image: string;
  description: string;
  descriptionHtml?: string;
  category: string;
  variantId: string;
  variants?: any[];
  allImages?: string[];
  colors?: string[];
  sizes?: string[];
}

export async function fetchPrintifyProducts(revalidate: number = 60): Promise<NormalizedProduct[] | null> {
  const shopId = process.env.PRINTIFY_SHOP_ID;
  const token = process.env.PRINTIFY_API_TOKEN || process.env.PRINTIFY_TOKEN;

  if (!shopId || !token) {
    console.error("Missing Printify credentials");
    return null;
  }

  try {
    const response = await fetch(`https://api.printify.com/v1/shops/${shopId}/products.json`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      next: { revalidate },
    });

    if (response.status === 401) {
      console.error("Printify Authentication Failed: 401 Unauthorized");
      return null;
    }

    if (!response.ok) {
      throw new Error(`Printify API error: ${response.statusText}`);
    }

    const data = await response.json();
    const products = data.data || [];

    return products.map((p: any) => {
      const firstVariant = p.variants?.[0];
      const price = firstVariant ? (firstVariant.price / 100).toFixed(2) : "0.00";
      
      // Extract unique colors and sizes for the UI
      const colors = Array.from(new Set(p.variants?.map((v: any) => v.options?.color).filter(Boolean))) as string[];
      const sizes = Array.from(new Set(p.variants?.map((v: any) => v.options?.size).filter(Boolean))) as string[];

      return {
        _id: String(p.id),
        name: p.title,
        slug: String(p.id),
        price: `$${price}`,
        rawPrice: parseFloat(price),
        image: p.images?.[0]?.src || '',
        description: p.description?.replace(/<[^>]*>?/gm, '') || '',
        descriptionHtml: p.description || '',
        category: p.tags?.[0] || 'Apparel',
        variantId: String(firstVariant?.id || ''),
        variants: p.variants || [],
        allImages: p.images?.map((img: any) => img.src) || [],
        colors,
        sizes
      };
    });
  } catch (error) {
    console.error("Failed to fetch Printify products:", error);
    return [];
  }
}

/**
 * FETCH SINGLE PRODUCT FROM PRINTIFY
 * Used to get deep details (variants, all images) for the PDP.
 */
export async function fetchPrintifyProductById(productId: string): Promise<NormalizedProduct | null> {
  const shopId = process.env.PRINTIFY_SHOP_ID;
  const token = process.env.PRINTIFY_API_TOKEN || process.env.PRINTIFY_TOKEN;

  if (!shopId || !token) return null;

  try {
    const response = await fetch(`https://api.printify.com/v1/shops/${shopId}/products/${productId}.json`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) return null;

    const p = await response.json();
    const firstVariant = p.variants?.[0];
    const price = firstVariant ? (firstVariant.price / 100).toFixed(2) : "0.00";
    
    const colors = Array.from(new Set(p.variants?.map((v: any) => v.options?.color).filter(Boolean))) as string[];
    const sizes = Array.from(new Set(p.variants?.map((v: any) => v.options?.size).filter(Boolean))) as string[];

    return {
      _id: String(p.id),
      name: p.title,
      slug: String(p.id),
      price: `$${price}`,
      rawPrice: parseFloat(price),
      image: p.images?.[0]?.src || '',
      description: p.description?.replace(/<[^>]*>?/gm, '') || '',
      descriptionHtml: p.description || '',
      category: p.tags?.[0] || 'Apparel',
      variantId: String(firstVariant?.id || ''),
      variants: p.variants || [],
      allImages: p.images?.map((img: any) => img.src) || [],
      colors,
      sizes
    };
  } catch (error) {
    console.error(`Failed to fetch product ${productId}:`, error);
    return null;
  }
}
