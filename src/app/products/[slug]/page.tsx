import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductClient from '@/components/ProductClient';
import { fetchPrintifyProducts } from '@/lib/printify';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * DYNAMIC SEO GENARATION
 * Pulls real product data to populate Meta Tags, OpenGraph, and Twitter Cards.
 */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const products = await fetchPrintifyProducts(60) || [];
  const product = products.find(p => p.slug === slug);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const description = product.description.slice(0, 160);

  return {
    title: product.name,
    description: description,
    openGraph: {
      title: `${product.name} | Omnidrop`,
      description: description,
      images: [product.image],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Omnidrop`,
      description: description,
      images: [product.image],
    },
  };
}

/**
 * PRODUCT DETAIL PAGE (SERVER COMPONENT)
 * Fetches real time data from Printify based on the product ID (slug).
 */
export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  
  // Fetch all products (cached by ISR) and find the matching one
  const products = await fetchPrintifyProducts(60) || [];
  const product = products.find(p => p.slug === slug);

  if (!product) {
    return notFound();
  }

  // Get recommendations (excluding current product)
  const recommendations = products
    .filter(p => p.slug !== slug)
    .slice(0, 4);

  return (
    <ProductClient 
      product={product} 
      recommendations={recommendations} 
    />
  );
}
