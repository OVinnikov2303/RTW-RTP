import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCategories } from "@/actions/products"
import { ProductForm } from "@/components/admin/product-form"

export const metadata: Metadata = { title: "Edit Product – Admin" }

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        specs: true,
        images: { orderBy: { isPrimary: "desc" } },
      },
    }),
    getCategories(),
  ])

  if (!product) notFound()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-8">Редагувати товар</h1>
      <ProductForm categories={categories} product={product} />
    </div>
  )
}
