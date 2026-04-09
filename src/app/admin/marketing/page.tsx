import { prisma } from "@/lib/prisma"
import FlashSaleForm from "@/components/admin/FlashSaleForm"

export default async function MarketingPage() {
  const config = await prisma.storeConfig.findUnique({
    where: { id: "global" },
  })

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-12 px-6">
      <header className="flex justify-between items-end mb-10">
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tighter uppercase italic text-slate-900">Marketing Protocol</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Campaign Management & Global Triggers</p>
        </div>
        <div className="bg-white border border-slate-200 px-4 py-2 rounded-full flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">Engine Online</span>
        </div>
      </header>
      
      <div className="bg-slate-50 border border-slate-100 rounded-3xl p-2">
        <FlashSaleForm initialData={config as any} />
      </div>
    </div>
  )
}
