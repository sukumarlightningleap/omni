import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ProductEditorClient from "@/components/admin/ProductEditorClient"

export default async function ProductEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = await prisma.product.findUnique({
    where: { id: resolvedParams.id }
  })

  if (!product) {
    notFound()
  }

  const collections = await prisma.collection.findMany({
    orderBy: { createdAt: "desc" }
  })

  // Legacy status normalization removed due to schema purge

  const productData = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price || 0,
    cost: product.cost || 0,
    imageUrl: product.imageUrl || "",
    collectionId: product.collectionId,
    printifyId: product.printifyId,
  }

  return (
    <div className="w-full">
      <ProductEditorClient product={productData} collections={collections} />
    </div>
  )
}
