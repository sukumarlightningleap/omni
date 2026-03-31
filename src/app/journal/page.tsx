import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';

// STATIC HARDCODED ARTICLES (CMS REMOVED)
const ARTICLES = [
  {
    id: '1',
    title: 'The Art of Minimalist Living',
    excerpt: 'Exploring how stripping away the excess can lead to a more focused and intentional lifestyle in the modern age.',
    date: 'MARCH 15, 2026',
    category: 'Lifestyle',
    image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=2067&auto=format&fit=crop',
    featured: true
  },
  {
    id: '2',
    title: 'Archive No. 04: Industrial Textures',
    excerpt: 'A deep dive into the raw materials and brutalist aesthetics that inspired our latest collection.',
    date: 'MARCH 10, 2026',
    category: 'Design',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=2070&auto=format&fit=crop',
    featured: false
  },
  {
    id: '3',
    title: 'Sustainability in Modern Apparel',
    excerpt: 'How we are navigating the complex intersection of high-fashion production and environmental responsibility.',
    date: 'MARCH 05, 2026',
    category: 'Culture',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop',
    featured: false
  }
];

export default function JournalPage() {
  const featuredArticle = ARTICLES.find(a => a.featured) || ARTICLES[0];
  const regularArticles = ARTICLES.filter(a => a.id !== featuredArticle.id);

  return (
    <div className="min-h-screen bg-white pt-32 pb-24 selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        {/* Header */}
        <div className="mb-20 text-center max-w-2xl mx-auto space-y-4">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.4em]">Editorial</span>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter uppercase leading-none">
            The Journal
          </h1>
          <p className="text-gray-500 text-lg uppercase tracking-widest font-medium pt-2">
            STORIES, TRENDS, AND INSIGHTS FROM THE OMNIDROP COLLECTIVE.
          </p>
        </div>

        {/* Featured Article */}
        <div className="mb-24 group">
          <Link href={`/journal/${featuredArticle.id}`} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 rounded-sm">
              <Image 
                src={featuredArticle.image}
                alt={featuredArticle.title}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                <span>{featuredArticle.category}</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                <span className="text-gray-400 flex items-center gap-1">
                  <Calendar size={12} /> {featuredArticle.date}
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none group-hover:text-blue-600 transition-colors italic">
                {featuredArticle.title}
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed">
                {featuredArticle.excerpt}
              </p>
              <div className="flex pt-2">
                <span className="text-xs font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2 border-b-2 border-gray-900 pb-1 group-hover:border-blue-600 group-hover:text-blue-600 transition-all">
                  Read Featured Story <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {regularArticles.map((article) => (
            <Link key={article.id} href={`/journal/${article.id}`} className="group space-y-6">
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 rounded-sm">
                <Image 
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                  <span>{article.category}</span>
                  <span className="text-gray-400">{article.date}</span>
                </div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase leading-tight group-hover:text-blue-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-3">
                  {article.excerpt}
                </p>
                <div className="flex pt-1">
                  <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2 border-b border-gray-900 pb-1 group-hover:border-blue-600 group-hover:text-blue-600 transition-all">
                    Read More <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
