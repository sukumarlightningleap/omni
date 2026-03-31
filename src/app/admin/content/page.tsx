import { prisma } from "@/lib/prisma"
import MerchClient from "@/components/admin/MerchClient"

export default async function ContentPage() {
  const config = await prisma.storeConfig.findUnique({ where: { id: "global" } })
  const lookbookImages = await prisma.lookbookImage.findMany({
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="space-y-8 font-mono max-w-[1400px] mx-auto w-full text-white">
      <header className="flex justify-between items-center mb-8 border-b border-[#1A1A1A] pb-4 bg-black">
        <h1 className="text-sm font-black tracking-[0.2em] uppercase">Content Management</h1>
      </header>
      
      <MerchClient initialConfig={config} initialImages={lookbookImages} />
    </div>
  )
}
