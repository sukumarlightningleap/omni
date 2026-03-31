import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Truck, ShieldCheck, Headphones, RotateCcw, ArrowRight } from 'lucide-react';
import TrendingCarousel from "@/components/TrendingCarousel";
import UGCFeed from "@/components/UGCFeed";
import { prisma } from "@/lib/prisma";

// ISR: Revalidate every 60 seconds instead of force-dynamic
async function getHomepageData() {
  // Collections are still hardcoded until Sanity CMS Phase 6
  const dummyCollections = [
    { id: '1', handle: 'apparel', title: 'Apparel', image: { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2070&auto=format&fit=crop' } },
    { id: '2', handle: 'accessories', title: 'Accessories', image: { url: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=2070&auto=format&fit=crop' } },
    { id: '3', handle: 'drinkware', title: 'Drinkware', image: { url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=2070&auto=format&fit=crop' } }
  ];

  try {
    // Fetch locally authorized ACTIVE items
    const dbProducts = await prisma.product.findMany({
      where: { isPublished: true, isVaulted: false },
      take: 8,
      orderBy: { createdAt: 'desc' }
    });

    const mappedProducts = dbProducts.map(p => ({
      _id: p.id,
      name: p.name,
      slug: String(p.id),
      price: `$${(p.price || 0).toFixed(2)}`,
      rawPrice: p.price || 0,
      image: p.imageUrl || "https://via.placeholder.com/400x500",
      description: p.description || "",
      category: "Apparel"
    }));

    return {
      collections: dummyCollections,
      bestSellers: mappedProducts,
    };
  } catch (error) {
    console.error("Failed to load products:", error);
    return { collections: dummyCollections, bestSellers: [] };
  }
}

export default async function Home() {
  const { collections, bestSellers } = await getHomepageData();

  return (
    <div className="flex flex-col min-h-screen pt-20">
      {/* Section 1: Dynamic Hero Banner */}
      <section className="relative h-[85vh] w-full overflow-hidden bg-gray-100">
        <Image
          src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop"
          alt="Lifestyle Banner"
          fill
          priority
          className="object-cover object-center brightness-95"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent" />
        <div className="absolute inset-0 flex items-center px-6 md:px-12 lg:px-24">
          <div className="max-w-2xl space-y-8">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter uppercase leading-[0.9]">
              Discover Your <br /> Next Favorite <br /> Thing
            </h1>
            <p className="text-xl text-white/90 font-medium uppercase tracking-widest max-w-lg">
              CURATED ESSENTIALS FOR THE MODERN LIFESTYLE. DESIGNED TO STAND THE TEST OF TIME.
            </p>
            <div className="flex pt-4">
              <Link
                href="/collections"
                className="bg-white text-black px-10 py-5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all duration-300 rounded-sm shadow-2xl flex items-center gap-3 group"
              >
                Shop Now <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Value Proposition Bar */}
      <section className="py-12 bg-white border-b border-gray-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                <Truck size={20} />
              </div>
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-900">Free Shipping</h4>
                <p className="text-[10px] text-gray-400 uppercase tracking-tighter">On orders over $150</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-pink-50 text-pink-600 rounded-full">
                <Headphones size={20} />
              </div>
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-900">24/7 Support</h4>
                <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Ready to help anytime</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-full">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-900">Secure Checkout</h4>
                <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Verified payments</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-full">
                <RotateCcw size={20} />
              </div>
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-900">30-Day Returns</h4>
                <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Easy and stress-free</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Shop by Category */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col items-center text-center mb-16 space-y-4">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.4em]">Browse</span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {collections.slice(0, 3).map((col: any) => (
              <Link
                key={col.id}
                href={`/collections/${col.handle}`}
                className="relative aspect-[3/4] group overflow-hidden bg-gray-100 rounded-sm"
              >
                <Image
                  src={col.image?.url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop"}
                  alt={col.title}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110 brightness-90 group-hover:brightness-100"
                />
                <div className="absolute inset-x-0 bottom-0 p-8 pt-20 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-2xl font-bold text-white uppercase tracking-tight">{col.title}</h3>
                  <div className="flex items-center gap-2 text-white/70 text-[10px] font-bold uppercase tracking-widest mt-2 overflow-hidden">
                    <span className="translate-y-0 group-hover:-translate-y-full transition-transform duration-300">Explore Collection</span>
                    <span className="absolute translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-1 text-white">
                      Shop Now <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Trending / Best Sellers Carousel */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-end justify-between mb-12">
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.4em]">Current Favorites</span>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase">Trending Now</h2>
            </div>
            <Link href="/collections" className="text-xs font-bold text-gray-900 uppercase tracking-widest hover:text-blue-600 transition-colors hidden md:block border-b-2 border-gray-900 hover:border-blue-600 pb-1">
              View All Products
            </Link>
          </div>
          {/* LIVE PRINTIFY DATA FED HERE */}
          <TrendingCarousel products={bestSellers} />
        </div>
      </section>

      {/* Section 5: Social Proof / UGC */}
      <UGCFeed />

      {/* Section 6: Newsletter Call-Out */}
      <section className="py-24 bg-blue-600">
        <div className="max-w-3xl mx-auto px-6 text-center text-white">
          <span className="text-[10px] font-bold text-blue-100 uppercase tracking-[0.4em] mb-4 block">Newsletter</span>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-6 leading-none">
            Get 10% Off <br /> Your Next Order
          </h2>
          <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">
            Join our community and be the first to know about new drops, exclusive offers, and the latest trends.
          </p>
          <form className="flex flex-col md:flex-row gap-4">
            <input
              type="email"
              placeholder="ENTER YOUR EMAIL"
              className="flex-grow bg-white/10 border border-white/20 px-6 py-5 text-white placeholder:text-blue-200 focus:outline-none focus:bg-white/20 transition-all uppercase tracking-widest rounded-sm backdrop-blur-md"
            />
            <button className="bg-white text-blue-600 px-10 py-5 text-sm font-bold uppercase tracking-widest hover:bg-gray-100 transition-all rounded-sm shadow-xl">
              Subscribe
            </button>
          </form>
          <p className="text-[10px] text-blue-200 mt-6 uppercase tracking-widest">
            By subscribing, you agree to our Terms of Service & Privacy Policy.
          </p>
        </div>
      </section>
    </div>
  );
}
