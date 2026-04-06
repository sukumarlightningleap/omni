import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Truck, ShieldCheck, Headphones, RotateCcw, ArrowRight, Star, Heart } from 'lucide-react';
import TrendingCarousel from "@/components/TrendingCarousel";
import CategoryBudgetCarousel from "@/components/CategoryBudgetCarousel";
import CollectionSquareCarousel from "@/components/CollectionSquareCarousel";
import CollectionStaticGrid from "@/components/CollectionStaticGrid";
import { prisma } from "@/lib/prisma";

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;

async function getHomepageData() {
  try {
    // Fetch REAL collections from database
    const dbCollections = await prisma.collection.findMany({
      orderBy: { createdAt: 'desc' },
      take: 60,
    });

    // Fetch REAL products from database
    const dbProducts = await prisma.product.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    const mappedProducts = dbProducts.map(p => ({
      _id: p.id,
      name: p.name,
      slug: String(p.printifyId),
      price: `$${(p.price || 0).toFixed(2)}`,
      rawPrice: p.price || 0,
      image: p.imageUrl || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      description: p.description || "",
      category: "UNRWLY",
    }));

    return {
      collections: dbCollections,
      bestSellers: mappedProducts,
    };
  } catch (error) {
    console.error("Failed to load homepage data:", error);
    return { collections: [], bestSellers: [] };
  }
}


export default async function Home() {
  const { collections, bestSellers } = await getHomepageData();

  // Partition collections for dual grids
  let budgetCollections = collections.slice(0, 15);
  let omgCollections = collections.slice(15, 33);
  let categoryCollections = collections.slice(33, 51);

  // Fallback for OMG (18 items)
  if (omgCollections.length < 18 && collections.length > 0) {
    const needed = 18 - omgCollections.length;
    omgCollections = [...omgCollections, ...collections.slice(0, Math.min(needed, collections.length))];
  }

  // Fallback for Category (18 items)
  if (categoryCollections.length < 18 && collections.length > 0) {
    const needed = 18 - categoryCollections.length;
    categoryCollections = [...categoryCollections, ...collections.slice(0, Math.min(needed, collections.length))];
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* ── HERO BANNER ────────────────────────────────── */}
      <section className="relative h-[92vh] w-full overflow-hidden bg-gray-900">
        <Image
          src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop"
          alt="UNRWLY Drop 2026"
          fill
          priority
          className="object-cover object-center opacity-80"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

        <div className="absolute inset-0 flex items-end pb-20 px-6 md:px-16 lg:px-24">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-[9px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full">
              New Season Drop
            </div>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter uppercase leading-[0.85]">
              UNRWLY<br />
              <span className="text-neutral-400">2026</span>
            </h1>
            <p className="text-lg text-white/80 font-medium max-w-md">
              Curated essentials built for the unruly generation.
            </p>
            <div className="flex gap-4 pt-2">
              <Link
                href="/collections"
                className="bg-white text-black px-10 py-4 text-xs font-black uppercase tracking-[0.2em] hover:bg-neutral-100 transition-all duration-300 flex items-center gap-3 group"
              >
                Shop All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              {collections.length > 0 && (
                <Link
                  href={`/collections/${collections[0].handle}`}
                  className="border border-white/40 text-white px-10 py-4 text-xs font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all duration-300"
                >
                  {collections[0].name}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ───────────────────────────────────── */}
      <section className="bg-neutral-950 py-4 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { icon: Truck, label: 'FREE SHIPPING', sub: 'on ₹999+' },
              { icon: ShieldCheck, label: 'SECURE CHECKOUT', sub: '100% verified' },
              { icon: RotateCcw, label: '30-DAY RETURNS', sub: 'easy & free' },
              { icon: Headphones, label: '24/7 SUPPORT', sub: 'always here' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center justify-center gap-3 py-2">
                <Icon size={16} className="text-white/60" />
                <div className="text-left">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white">{label}</p>
                  <p className="text-[9px] text-neutral-500 uppercase tracking-widest">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BUDGET-FRIENDLY PICKS (MYNTRA DEAL-CAROUSEL) ── */}
      <section className="bg-white overflow-hidden pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Tri-color Vertical Header - Width aligned to carousel */}
          <div 
            className="h-32 flex items-center justify-center"
            style={{ 
              background: 'linear-gradient(to bottom, #ffffff 0%, rgba(255,255,255,1) 40%, rgba(255,223,0,0.3) 75%, rgba(255,165,0,0.4) 100%)' 
            }}
          >
            <h2 className="text-6xl font-light text-[#7dd3fc] tracking-tighter">Budget-Friendly Picks</h2>
          </div>

          {/* Sleek White Space */}
          <div className="h-10 bg-white" />

          <CategoryBudgetCarousel collections={budgetCollections} />

          {/* Sleek White Space */}
          <div className="h-10 bg-white" />

          {/* OMG! Deals Header - Lower Section */}
          <div 
            className="h-32 flex items-center justify-center"
            style={{ 
              background: 'linear-gradient(to bottom, #ffffff 0%, rgba(255,255,255,1) 40%, rgba(255,223,0,0.3) 75%, rgba(255,165,0,0.4) 100%)' 
            }}
          >
            <h2 className="text-6xl font-light text-[#7dd3fc] tracking-tighter">OMG! Deals</h2>
          </div>

          {/* Sleek White Gap */}
          <div className="h-8 bg-white" />

          {/* OMG! Square Grid (3x6) */}
          <CollectionSquareCarousel collections={omgCollections} />

          {/* Sleek White Space */}
          <div className="h-10 bg-white" />

        </div>
      </section>

      {/* ── SHOP BY CATEGORY (FINAL SECTION) ── */}
      {collections.length > 0 && (
        <section className="bg-white overflow-hidden pb-16">
          <div className="max-w-7xl mx-auto px-6">
            {/* Tri-color Vertical Header */}
            <div 
              className="h-32 flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(to bottom, #ffffff 0%, rgba(255,255,255,1) 40%, rgba(255,223,0,0.3) 75%, rgba(255,165,0,0.4) 100%)' 
              }}
            >
              <h2 className="text-6xl font-light text-[#7dd3fc] tracking-tighter">Shop By Category</h2>
            </div>

            {/* Sleek White Space */}
            <div className="h-10 bg-white" />

            {/* Shop By Category 3x6 Static Grid */}
            <CollectionStaticGrid collections={categoryCollections} />
          </div>
        </section>
      )}

      {/* ── TRENDING NOW (DENSE GRID) ─────────────────────── */}
      {bestSellers.length > 0 && (
        <section className="bg-[#f0f0f1] overflow-hidden pb-16">
          <div className="max-w-7xl mx-auto px-6">
            {/* Tri-color Vertical Header */}
            <div 
              className="h-32 flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(to bottom, #ffffff 0%, rgba(255,255,255,1) 40%, rgba(255,223,0,0.3) 75%, rgba(255,165,0,0.4) 100%)' 
              }}
            >
              <h2 className="text-6xl font-light text-[#7dd3fc] tracking-tighter">Trending Now</h2>
            </div>

            {/* Sleek White Space */}
            <div className="h-10 bg-white" />

            <TrendingCarousel products={bestSellers} />
          </div>
        </section>
      )}

      {/* ── EMPTY STATE (no collections, no products) ─────── */}
      {collections.length === 0 && bestSellers.length === 0 && (
        <section className="py-40 bg-white flex flex-col items-center justify-center text-center px-6">
          <div className="max-w-md space-y-4">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star size={24} className="text-neutral-400" />
            </div>
            <h2 className="text-4xl font-black tracking-tighter uppercase">Collection Drop Coming Soon</h2>
            <p className="text-neutral-500 text-sm">
              We are curating the next UNRWLY drop. Head to Admin to sync products from Printify.
            </p>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-2 mt-6 bg-black text-white text-xs font-black uppercase tracking-widest px-8 py-4 hover:bg-neutral-800 transition-colors"
            >
              Go to Admin <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      )}

      {/* ── NEWSLETTER ───────────────────────────────────── */}
      <section className="py-20 bg-neutral-950">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] mb-3">Drop Alerts</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-white mb-2">
            Get Early Access
          </h2>
          <p className="text-white/50 text-sm mb-8">Join the UNRWLY list. Be first for drops, sales, and collabs.</p>
          <form className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow bg-white/5 border border-white/10 px-5 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors text-sm"
            />
            <button className="bg-white text-black px-8 py-4 text-xs font-black uppercase tracking-[0.2em] hover:bg-neutral-200 transition-colors shrink-0">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
