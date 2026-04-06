import React from 'react';
import CollectionClient from '@/components/CollectionClient';
import { prisma } from '@/lib/prisma';

/**
 * ALL COLLECTIONS PAGE (SERVER COMPONENT)
 * Fetches real products from the DATABASE that are marked as ACTIVE.
 */
export default async function CollectionsPage() {
  // Fetch active products from the database
  const products = await prisma.product.findMany({
    // where: { status: 'ACTIVE' },
    include: { collection: true },
    // orderBy: { createdAt: 'desc' }
  });

  // Map database products to the format expected by the client component
  const formattedProducts = products.map(p => ({
    _id: p.id,
    variantId: '', // We'll handle variant selection on the product page
    name: p.name,
    slug: p.printifyId, // Using printifyId as slug for now or we can implement real slugs
    image: p.imageUrl,
    secondaryImage: p.imageUrl, // Fallback to same image if no secondary
    price: `$${p.price.toFixed(2)}`,
    rawPrice: p.price,
    category: (p as any).collection?.name || 'Uncategorized'
  }));
  
  // Extract unique collection names for the filter
  const collections = await prisma.collection.findMany({
    select: { name: true }
  });
  const categories = ['All', ...collections.map(c => c.name)];

  return (
    <CollectionClient 
      initialProducts={formattedProducts} 
      categories={categories}
      title="The Archive"
    />
  );
}
