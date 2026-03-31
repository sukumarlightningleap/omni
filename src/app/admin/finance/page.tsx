import { getUnitEconomics } from "@/app/actions/admin/analytics"
import FinanceClient from "@/components/admin/FinanceClient"

export default async function FinancePage() {
  const data = await getUnitEconomics()

  return (
    <div className="space-y-8 font-mono max-w-[1400px] mx-auto w-full">
      <FinanceClient items={data.unitEconomics} />
    </div>
  )
}
