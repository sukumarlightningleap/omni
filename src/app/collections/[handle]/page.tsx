import React from 'react';
import { notFound } from 'next/navigation';
import CollectionClient from '@/components/CollectionClient';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';

export const revalidate = 3600; // ISR: 1 hour

interface CollectionPageProps {
  params: Promise<{ handle: string }>;
}

export default async function IndividualCollectionPage({ params }: CollectionPageProps) {
  const { handle } = await params;

  // Fetch the collection by handle with visibility check
  const collection = await prisma.collection.findUnique({
    where: { 
      handle
    },
    include: {
      products: true
    }
  });

  // "Coming Soon" state for non-existent or hidden handles
  if (!collection && handle !== 'all') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-8 border border-neutral-100">
          <Sparkles size={32} className="text-neutral-300 animate-pulse" />
        </div>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic mb-4">Collection Coming Soon</h1>
        <p className="text-neutral-400 text-sm font-bold uppercase tracking-widest max-w-sm">
          We are currently curating the next archive drop. Stay tuned for the release.
        </p>
        <Link href="/" className="mt-12 flex items-center gap-2 text-black text-xs font-black uppercase tracking-widest hover:translate-x-2 transition-transform">
          <ArrowLeft size={16} /> Return to Home
        </Link>
      </div>
    );
  }

  const products = collection?.products || [];

  // Map database products
  const formattedProducts = products.map(p => ({
    _id: p.id,
    variantId: '',
    name: p.name,
    slug: p.printifyId,
    image: p.imageUrl,
    secondaryImage: p.imageUrl,
    price: `$${p.price.toFixed(2)}`,
    rawPrice: p.price,
    category: collection?.name || 'Uncategorized'
  }));

  // Fetch collections for filter
  const allCollections = await prisma.collection.findMany({
    select: { name: true }
  });
  const categories = ['All', ...allCollections.map(c => c.name)];

  return (
    <CollectionClient 
      initialProducts={formattedProducts} 
      categories={categories}
      title={collection?.name || "New Arrivals"}
    />
  );
}
