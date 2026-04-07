import { getUnitEconomics, getFinancialSummary } from "@/app/actions/admin/analytics"
import FinanceClient from "@/components/admin/FinanceClient"

export default async function FinancePage() {
  const [unitData, summaryData] = await Promise.all([
    getUnitEconomics(),
    getFinancialSummary()
  ])

  return (
    <div className="space-y-8 font-sans max-w-[1400px] mx-auto w-full">
      <FinanceClient 
        items={unitData.unitEconomics} 
        summary={summaryData}
      />
    </div>
  )
}
