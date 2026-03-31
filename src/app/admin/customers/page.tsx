import { prisma } from "@/lib/prisma"
import CustomersClient from "@/components/admin/CustomersClient"

export default async function CustomersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      totalSpent: true,
      role: true,
      _count: {
        select: { orders: true }
      }
    }
  })

  // Format data for client boundary
  const safeCustomers = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    totalSpent: u.totalSpent,
    ordersCount: u._count.orders,
    role: u.role
  }))

  return (
    <div className="space-y-8 font-mono max-w-[1400px] mx-auto w-full">
      <CustomersClient initialCustomers={safeCustomers} />
    </div>
  )
}
