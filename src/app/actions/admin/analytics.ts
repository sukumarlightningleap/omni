"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

const requireAdmin = async () => {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized. Clearance required.")
  }
}

export async function getFinancialSummary() {
  await requireAdmin()

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // 1. Fetch Paid Orders
  const paidOrders = await prisma.order.findMany({
    where: {
      status: { in: ["PAID", "PROCESSING", "SHIPPED"] },
      createdAt: { gte: thirtyDaysAgo }
    },
    include: {
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: { createdAt: "asc" }
  })

  let grossRevenue = 0
  let productionCost = 0

  // Standardize the graph payload for Recharts
  const dailyData: Record<string, { date: string; revenue: number; orders: number }> = {}

  paidOrders.forEach(order => {
    grossRevenue += order.totalAmount
    
    // Aggregate daily stats
    const dateKey = order.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    if (!dailyData[dateKey]) {
      dailyData[dateKey] = { date: dateKey, revenue: 0, orders: 0 }
    }
    dailyData[dateKey].revenue += order.totalAmount
    dailyData[dateKey].orders += 1

    order.items.forEach((item: any) => {
      // Calculate underlying unit costs
      productionCost += (item.product.cost || 0) * item.quantity
    })
  })

  // 2. Financial Metrics Algorithm (assuming ~2.9% + $0.30 Stripe Fee estimate across gross)
  const stripeFeeEstimator = (grossRevenue * 0.029) + (paidOrders.length * 0.30)
  const netProfit = grossRevenue - productionCost - stripeFeeEstimator
  
  // 3. Overall Ticker LTV (All-time sales)
  const allTimeTotal = await prisma.order.aggregate({
    where: { status: { in: ["PAID", "PROCESSING", "SHIPPED"] } },
    _sum: { totalAmount: true }
  })

  return {
    grossRevenue,
    productionCost,
    stripeFeeEstimate: stripeFeeEstimator,
    netProfit,
    graphData: Object.values(dailyData),
    liveTickerTotal: allTimeTotal._sum.totalAmount || 0
  }
}

export async function getUnitEconomics() {
  await requireAdmin()

  // Find all ACTIVE & DRAFT products to calculate potential or realized margins
  const products = await prisma.product.findMany({
    include: {
      orderItems: {
        where: {
          order: { status: { in: ["PAID", "PROCESSING", "SHIPPED"] } }
        }
      }
    }
  })

  const unitEconomics = products.map(product => {
    const cost = product.cost || 0
    const price = product.price || 0
    const marginAmount = price - cost
    const marginPercent = price > 0 ? (marginAmount / price) * 100 : 0
    
    const unitsSold = product.orderItems.reduce((acc, item) => acc + item.quantity, 0)
    const totalProfitGenerated = unitsSold * marginAmount

    return {
      id: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      price,
      cost,
      marginPercent,
      unitsSold,
      totalProfitGenerated,
      isAssigned: !!product.collectionId
    }
  }).sort((a, b) => b.totalProfitGenerated - a.totalProfitGenerated) // Sort Best-sellers globally

  return { unitEconomics }
}
