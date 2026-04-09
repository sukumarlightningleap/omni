import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, Heart } from 'lucide-react';
import TrendingCarousel from "@/components/TrendingCarousel";
import CategoryBudgetCarousel from "@/components/CategoryBudgetCarousel";
import CollectionSquareCarousel from "@/components/CollectionSquareCarousel";
import CollectionStaticGrid from "@/components/CollectionStaticGrid";
import { prisma } from "@/lib/prisma";
import HeroSequencer from "@/components/HeroSequencer";

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;

async function getHomepageData() {
  try {
    const [budgetItems, omgItems, trendingItems, categoryItems, dbCollections, dbProducts, config] = await Promise.all([
      prisma.discoveryItem.findMany({
        where: { section: "BUDGET" },
        include: { collection: true },
        orderBy: { order: "asc" }
      }),
      prisma.discoveryItem.findMany({
        where: { section: "OMG" },
        include: { collection: true },
        orderBy: { order: "asc" }
      }),
      prisma.discoveryItem.findMany({
        where: { section: "TRENDING" },
        include: { collection: true },
        orderBy: { order: "asc" }
      }),
      prisma.discoveryItem.findMany({
        where: { section: "CATEGORY" },
        include: { collection: true },
        orderBy: { order: "asc" }
      }),
      prisma.collection.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.product.findMany({
        where: { status: 'LIVE' },
        take: 20,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.storeConfig.findUnique({ where: { id: "global" } })
    ]);

    const mappedProducts = dbProducts.map((p: any) => ({
      _id: p.id,
      name: p.name,
      slug: String(p.printifyId),
      price: `$${(p.price || 0).toFixed(2)}`,
      rawPrice: p.price || 0,
      image: p.imageUrl || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      description: p.description || "",
      category: "UNRWLY",
    }));

    // Map curated category items, fallback to recent collections if none curated
    const categoryCollections = categoryItems.length > 0
      ? categoryItems.map((item: any) => ({
          ...item.collection,
          name: item.collection.name, // Can be overridden by customDescription if needed, but per-request name is usually standard
          imageUrl: item.customImageUrl || item.collection.imageUrl
        }))
      : dbCollections.slice(0, 18);

    return {
      budgetItems,
      omgItems,
      trendingItems,
      categoryCollections,
      bestSellers: mappedProducts,
      config,
      allCollections: dbCollections
    };
  } catch (error) {
    console.error("Failed to load homepage data:", error);
    return {
      budgetItems: [],
      omgItems: [],
      trendingItems: [],
      categoryCollections: [],
      bestSellers: [],
      config: null,
      allCollections: []
    };
  }
}

export default async function Home() {
  const {
    budgetItems,
    omgItems,
    trendingItems,
    categoryCollections,
    bestSellers,
    config,
    allCollections
  } = await getHomepageData();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {config?.promoAnnouncement && (
        <div className="bg-indigo-600 text-white py-2 text-center text-[10px] font-black uppercase tracking-[0.3em] sticky top-0 z-[60]">
          {config.promoAnnouncement}
        </div>
      )}

      {/* ── SPATIAL HIERARCHY: HERO ────────────────────────── */}
      {config?.heroImageUrl && (
        <section className="relative h-[92vh] w-full overflow-hidden bg-[#0F172A]">
          <Image 
            src={config.heroImageUrl}
            alt="UNRWLY Static Base"
            fill
            priority
            className="object-cover object-center opacity-70"
          />
          {/* Peach-Tinted Cinematic Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/90 via-[#FFF5F2]/10 to-transparent pointer-events-none" />
          
          <div className="absolute inset-0 flex items-end pb-20 px-4 md:px-12 lg:px-24">
            <div className="max-w-2xl space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-[#D97757] text-[9px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full">
                New Season Drop
              </div>
              <h1 className="text-4xl md:text-8xl lg:text-9xl font-black text-[#1A1A1A] tracking-tighter uppercase leading-[0.85] break-words">
                UNRWLY<br />
                <span className="text-slate-400">2026</span>
              </h1>
              <p className="text-lg text-white/80 font-medium max-w-md">
                Curated essentials built for the unruly generation.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── ANIMATION SLIDER SECTION ──────────────────────── */}
      {(config?.heroVideoUrls && config.heroVideoUrls.length > 0) && (
        <section className={`relative w-full overflow-hidden md:h-[110vh] h-[85vh]`}>
          <HeroSequencer urls={config.heroVideoUrls} poster={config.heroImageUrl} />
          
          {!config.heroImageUrl && (
            <div className="absolute inset-0 flex items-end pb-20 px-4 md:px-12 lg:px-24">
              <div className="max-w-2xl space-y-6">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-[#D97757] text-[9px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full">
                  Motion Edit
                </div>
                <h1 className="text-4xl md:text-8xl lg:text-9xl font-black text-[#1A1A1A] tracking-tighter uppercase leading-[0.85] break-words">
                  UNRWLY<br />
                  <span className="text-slate-400">2026</span>
                </h1>
              </div>
            </div>
          )}
        </section>
      )}


      {/* ── BUDGET-FRIENDLY PICKS ( DEAL-CAROUSEL) ── */}
      <section className="bg-brand-peach overflow-hidden pb-16 border-y border-[#FCE8E2]">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          {/* Tri-color Vertical Header - Width aligned to carousel */}
          <div
            className="h-24 md:h-32 flex items-center justify-center text-center"
            style={{
              background: 'linear-gradient(to bottom, #ffffff 0%, rgba(255,255,255,1) 40%, rgba(255,223,0,0.3) 75%, rgba(255,165,0,0.4) 100%)'
            }}
          >
            <h2 className="text-3xl md:text-7xl font-light text-[#7dd3fc] tracking-tighter px-4">Budget-Friendly Picks</h2>
          </div>

          {/* Sleek Space */}
          <div className="h-10 bg-transparent" />

          <CategoryBudgetCarousel items={budgetItems} />

          {/* Sleek Space */}
          <div className="h-10 bg-transparent" />

          {/* OMG! Deals Header - Lower Section */}
          <div
            className="h-24 md:h-32 flex items-center justify-center text-center"
            style={{
              background: 'linear-gradient(to bottom, #ffffff 0%, rgba(255,255,255,1) 40%, rgba(255,223,0,0.3) 75%, rgba(255,165,0,0.4) 100%)'
            }}
          >
            <h2 className="text-3xl md:text-7xl font-light text-[#7dd3fc] tracking-tighter px-4">OMG! Deals</h2>
          </div>

          {/* Sleek Gap */}
          <div className="h-8 bg-transparent" />

          {/* OMG! Square Grid (3x6) */}
          <CollectionSquareCarousel items={omgItems} />

          {/* Sleek Space */}
          <div className="h-10 bg-transparent" />

        </div>
      </section>

      {/* ── SHOP BY CATEGORY (FINAL SECTION) ── */}
      {allCollections.length > 0 && (
        <section className="bg-white overflow-hidden pb-16">
          <div className="max-w-7xl mx-auto px-4 md:px-12">
            {/* Tri-color Vertical Header */}
            <div
              className="h-24 md:h-32 flex items-center justify-center text-center"
              style={{
                background: 'linear-gradient(to bottom, #ffffff 0%, rgba(255,255,255,1) 40%, rgba(255,223,0,0.3) 75%, rgba(255,165,0,0.4) 100%)'
              }}
            >
              <h2 className="text-3xl md:text-7xl font-light text-[#7dd3fc] tracking-tighter px-4">Shop By Category</h2>
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
        <section className="bg-brand-peach overflow-hidden pb-16 border-y border-[#FCE8E2]">
          <div className="max-w-7xl mx-auto px-4 md:px-12">
            {/* Tri-color Vertical Header */}
            <div
              className="h-24 md:h-32 flex items-center justify-center text-center"
              style={{
                background: 'linear-gradient(to bottom, #ffffff 0%, rgba(255,255,255,1) 40%, rgba(255,223,0,0.3) 75%, rgba(255,165,0,0.4) 100%)'
              }}
            >
              <h2 className="text-3xl md:text-7xl font-light text-[#7dd3fc] tracking-tighter px-4">Trending Now</h2>
            </div>

            {/* Space */}
            <div className="h-10 bg-transparent" />

            {/* Curated Trending Collections */}
            {trendingItems.length > 0 && (
              <>
                <CollectionSquareCarousel items={trendingItems} />
                <div className="h-16 bg-transparent" />
              </>
            )}

            <TrendingCarousel products={bestSellers} />
          </div>
        </section>
      )}

      {/* ── EMPTY STATE (no collections, no products) ─────── */}
      {allCollections.length === 0 && bestSellers.length === 0 && (
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
              className="inline-flex items-center gap-2 mt-6 bg-[#121212] text-white text-xs font-black uppercase tracking-widest px-8 py-4 hover:bg-[#3730A3] transition-colors"
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
            <button className="bg-[#121212] text-white px-8 py-4 text-xs font-black uppercase tracking-[0.2em] hover:bg-[#3730A3] transition-colors shrink-0">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
