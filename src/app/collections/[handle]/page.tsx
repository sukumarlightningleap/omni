import React from 'react';
import { notFound } from 'next/navigation';
import CollectionClient from '@/components/CollectionClient';
import { fetchPrintifyProducts } from '@/lib/printify';

interface CollectionPageProps {
  params: Promise<{ handle: string }>;
}

/**
 * INDIVIDUAL COLLECTION PAGE (SERVER COMPONENT)
 * Fetches products and filters them by category handle server-side.
 */
export default async function IndividualCollectionPage({ params }: CollectionPageProps) {
  const { handle } = await params;
  const allProducts = await fetchPrintifyProducts(60);
  
  // Filter products by category handle (tags in Printify)
  const filteredProducts = allProducts.filter(
    p => p.category.toLowerCase() === handle.toLowerCase()
  );

  if (filteredProducts.length === 0 && handle !== 'all') {
    // We only 404 if it's not a valid category found in our products
    const validHandles = allProducts.map(p => p.category.toLowerCase());
    if (!validHandles.includes(handle.toLowerCase())) {
        return notFound();
    }
  }

  const categories = Array.from(new Set(allProducts.map(p => p.category)));

  return (
    <CollectionClient 
      initialProducts={filteredProducts} 
      categories={categories}
      title={handle.charAt(0).toUpperCase() + handle.slice(1)}
    />
  );
}
