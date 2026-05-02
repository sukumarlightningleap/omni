import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Providers";
import ConditionalStorefrontLayout from "@/components/ConditionalStorefrontLayout";
import { GoogleAnalytics } from "@next/third-parties/google";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

// Prevent static prerendering — Prisma requires a live DB connection
export const dynamic = "force-dynamic";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Unrwly",
    template: "%s | Unrwly",
  },
  description: "Crafted with quality, designed for you.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 1. Initialize config as null to provide a fallback if the DB is unreachable
  let config = null;

  try {
    // 2. Fetch Global Marketing Config with a safety net
    config = await prisma.storeConfig.findUnique({
      where: { id: "global" },
    });
  } catch (error) {
    // 3. Log the error to Vercel console without crashing the site
    console.error("PRODUCTION_DATABASE_ERROR: Check if Supabase is paused or credentials are correct.", error);
  }

  // 4. Fetch Supabase Session for the Navbar
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  // Determine if user is admin based on environment variable for consistent prop passing
  const masterEmail = process.env.MASTER_ADMIN_EMAIL?.toLowerCase().trim();
  const isAdmin = user?.email?.toLowerCase().trim() === masterEmail;

  const safeUser = user ? {
    id: user.id,
    email: user.email,
    role: isAdmin ? 'ADMIN' : 'CUSTOMER'
  } : null;

  // Access the Environment Variable for Analytics
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} antialiased selection:bg-blue-100 selection:text-blue-900 flex flex-col min-h-screen font-sans`}>
        <Providers>
          {/* 4. ConditionalStorefrontLayout will now receive null instead of crashing if DB fails */}
          <ConditionalStorefrontLayout
            config={config}
            navbar={
              <Suspense fallback={<div className="h-20 bg-white border-b border-neutral-100" />}>
                <Navbar user={safeUser} />
              </Suspense>
            }
            footer={<Footer />}
          >
            {children}
          </ConditionalStorefrontLayout>
        </Providers>

        <div id="adk-agent-root"></div>

        {/* Google Analytics Integration */}
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}
