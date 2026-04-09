import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    
    // Auth Check
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true }
        },
        items: {
          include: { product: true }
        }
      }
    });

    // Format data for client boundary safely (matching safeOrders in page.tsx)
    const formattedOrders = orders.map(o => ({
      id: o.id,
      createdAt: o.createdAt,
      user: o.user,
      status: o.status,
      totalAmount: Number(o.totalAmount),
      totalPaid: o.totalPaid ? Number(o.totalPaid) : null,
      printifyOrderId: o.printifyOrderId,
      trackingNumber: o.trackingNumber,
      shippingAddress: o.shippingAddress,
      items: o.items.map(item => ({
        id: item.id,
        name: item.product.name,
        price: Number(item.price),
        quantity: item.quantity,
        variantId: item.variantId
      }))
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("Order Sync Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
