import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { prisma } from "@/lib/prisma";
import { Providers } from "@/components/Providers";
import ConditionalStorefrontLayout from "@/components/ConditionalStorefrontLayout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Omnidrop | Crafted with quality",
    template: "%s | Omnidrop",
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
          <ConditionalStorefrontLayout config={config}>
            {children}
          </ConditionalStorefrontLayout>
        </Providers>
        <div id="adk-agent-root"></div>
      </body>
    </html>
  );
}
