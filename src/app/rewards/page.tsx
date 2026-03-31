import React from 'react';
import { Star, Gift, UserPlus, Zap, Coffee, Crown, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const WAYS_TO_EARN = [
    {
        id: 1,
        title: "Sign Up",
        subtitle: "Create an account to start your journey.",
        points: "50 POINTS",
        icon: UserPlus,
        color: "bg-blue-50 text-blue-600"
    },
    {
        id: 2,
        title: "Shop & Earn",
        subtitle: "Collect points on every single purchase.",
        points: "1 PT PER $1",
        icon: Zap,
        color: "bg-amber-50 text-amber-600"
    },
    {
        id: 3,
        title: "Refer a Friend",
        subtitle: "Give $20, Get $20 back for yourself.",
        points: "$20 CREDIT",
        icon: Gift,
        color: "bg-rose-50 text-rose-600"
    }
];

const TIERS = [
    {
        name: "Bronze",
        range: "0-500 Points",
        perks: ["EARN 1 PT / $1", "EARLY ACCESS TO SALES", "BIRTHDAY GIFT"],
        icon: Coffee,
        current: true
    },
    {
        name: "Silver",
        range: "501-1500 Points",
        perks: ["EARN 1.5 PT / $1", "FREE STANDARD SHIPPING", "EXCLUSIVE INVITES"],
        icon: Star,
        current: false
    },
    {
        name: "Gold",
        range: "1500+ Points",
        perks: ["EARN 2 PT / $1", "FREE EXPRESS SHIPPING", "VIP CONCIERGE ACCESS"],
        icon: Crown,
        current: false
    }
];

const RewardsPage = () => {
    return (
        <div className="min-h-screen bg-white pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
                {/* Hero Section */}
                <div className="relative p-12 md:p-24 bg-blue-600 rounded-sm overflow-hidden mb-24 text-center text-white shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
                    
                    <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
                        <span className="text-[10px] font-bold text-blue-100 uppercase tracking-[0.4em]">The Club</span>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-tight">
                            Omnidrop <br /> Rewards
                        </h1>
                        <p className="text-blue-100 text-lg uppercase tracking-widest font-medium">
                            EARN WHILE YOU SHOP. JOIN THE ELITE CIRCLE OF OMNIDROP CURATORS.
                        </p>
                        <div className="flex justify-center pt-2">
                            <Link 
                                href="/account/login"
                                className="bg-white text-blue-600 px-12 py-5 text-sm font-bold uppercase tracking-[0.2em] hover:bg-gray-100 transition-all shadow-xl rounded-sm"
                            >
                                Join the Club
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Ways to Earn */}
                <div className="mb-32">
                    <div className="text-center mb-16 space-y-4">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.4em]">Basics</span>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase">How it Works</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {WAYS_TO_EARN.map((way) => (
                            <div key={way.id} className="p-10 bg-gray-50 rounded-sm space-y-6 group hover:bg-white hover:shadow-2xl transition-all duration-300">
                                <div className={`p-4 rounded-full w-fit ${way.color}`}>
                                    <way.icon size={24} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{way.title}</h3>
                                    <p className="text-gray-500 text-sm">{way.subtitle}</p>
                                </div>
                                <div className="text-xl font-black text-gray-900 tracking-widest pt-4 border-t border-gray-100">
                                    {way.points}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tiers */}
                <div className="mb-32">
                    <div className="text-center mb-16 space-y-4">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.4em]">Status</span>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase">Unlock Tiers</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {TIERS.map((tier) => (
                            <div key={tier.name} className={`p-10 border-2 rounded-sm space-y-8 relative overflow-hidden ${tier.current ? 'border-gray-900' : 'border-gray-100'}`}>
                                {tier.current && (
                                    <div className="absolute top-0 right-0 bg-gray-900 text-white text-[8px] font-bold uppercase tracking-widest px-4 py-2">
                                        Starting Point
                                    </div>
                                )}
                                <div className="space-y-4">
                                    <tier.icon size={32} className="text-gray-900" />
                                    <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tight">{tier.name}</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{tier.range}</p>
                                </div>
                                <ul className="space-y-4">
                                    {tier.perks.map((perk, idx) => (
                                        <li key={idx} className="flex items-center gap-3 text-[10px] font-bold text-gray-900 uppercase tracking-widest">
                                            <div className="w-1 h-1 bg-blue-600 rounded-full" />
                                            {perk}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQ Link / Help */}
                <div className="text-center space-y-8 p-20 bg-gray-900 text-white rounded-sm">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
                        Questions? <br /> We've got answers.
                    </h2>
                    <p className="text-gray-400 uppercase tracking-widest text-sm max-w-lg mx-auto">
                        LEARN MORE ABOUT OUR POINTS SYSTEM AND HOW TO REDEEM YOUR REWARDS.
                    </p>
                    <div className="flex justify-center">
                        <Link 
                            href="/faq"
                            className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b-2 border-white pb-1 hover:text-blue-400 hover:border-blue-400 transition-all"
                        >
                            Visit Loyalty FAQ <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RewardsPage;
