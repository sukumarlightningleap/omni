import { prisma } from "@/lib/prisma"
import FlashSaleForm from "@/components/admin/FlashSaleForm"

export default async function MarketingPage() {
  const config = await prisma.storeConfig.findUnique({
    where: { id: "global" },
  })

  return (
    <div className="space-y-8 font-mono max-w-[1400px] mx-auto w-full text-white">
      <header className="flex justify-between items-center mb-8 border-b border-[#1A1A1A] pb-4 bg-black">
        <h1 className="text-sm font-black tracking-[0.2em] uppercase">Marketing Campaigns</h1>
        <button className="text-[10px] bg-white text-black font-black uppercase tracking-widest px-6 py-2 hover:bg-neutral-200 transition-colors">
          Create Campaign
        </button>
      </header>
      
      <div className="bg-black border border-[#1A1A1A] p-6">
        <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 mb-6">Active Flash Sale</h2>
        <FlashSaleForm initialData={config} />
      </div>
    </div>
  )
}
