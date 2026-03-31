import React from 'react';
import CollectionClient from '@/components/CollectionClient';
import { fetchPrintifyProducts } from '@/lib/printify';

/**
 * ALL COLLECTIONS PAGE (SERVER COMPONENT)
 * Fetches real Printify products and renders them via the filtering client.
 */
export default async function CollectionsPage() {
  const products = await fetchPrintifyProducts(60);
  
  // Extract unique categories from actual products
  const categories = Array.from(new Set(products.map(p => p.category)));

  return (
    <CollectionClient 
      initialProducts={products} 
      categories={categories}
      title="The Archive"
    />
  );
}
