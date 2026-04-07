import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Providers";
import ConditionalStorefrontLayout from "@/components/ConditionalStorefrontLayout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Unrwly",
    template: "%s | Unrwly",
  },
  description: "Crafted with quality, designed for you.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch Global Marketing Config from Prisma
  const config = await prisma.storeConfig.findUnique({
    where: { id: "global" },
  });

  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased selection:bg-blue-100 selection:text-blue-900 flex flex-col min-h-screen font-sans`}>
        <Providers>
          <ConditionalStorefrontLayout 
            config={config}
            navbar={
              <Suspense fallback={<div className="h-20 bg-white border-b border-neutral-100" />}>
                <Navbar />
              </Suspense>
            }
            footer={<Footer />}
          >
            {children}
          </ConditionalStorefrontLayout>
        </Providers>
        <div id="adk-agent-root"></div>
      </body>
    </html>
  );
}
