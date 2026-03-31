"use client"

import React, { Suspense } from "react"
import { usePathname } from "next/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import NewsletterModal from "@/components/NewsletterModal"
import GlobalCountdown from "@/components/GlobalCountdown"

type LayoutProps = {
  children: React.ReactNode
  config: any
}

export default function ConditionalStorefrontLayout({ children, config }: LayoutProps) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith("/admin")

  // If we are deep inside the secure Admin network, aggressively detach the storefront visual tree.
  if (isAdminRoute) {
    return <main className="flex-grow bg-black min-h-screen">{children}</main>
  }

  return (
    <>
      {/* PILLAR 1: Marketing & FOMO Engine */}
      <GlobalCountdown
        isActive={config?.flashSaleActive ?? false}
        endsAt={config?.flashSaleEndsAt ?? null}
        message={config?.flashSaleMessage ?? "LIMITED DROP"}
      />

      <Suspense fallback={<div className="h-20 bg-black" />}>
        <Navbar />
      </Suspense>

      <main className="flex-grow">
        {children}
      </main>

      <Footer />
      <NewsletterModal />
    </>
  )
}
