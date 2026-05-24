import type { Metadata } from "next"
import { getCategories } from "@/actions/products"
import { ProductForm } from "@/components/admin/product-form"

export const metadata: Metadata = { title: "New Product – Admin" }

export default async function NewProductPage() {
  const categories = await getCategories()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-8">Додати новий товар</h1>
      <ProductForm categories={categories} />
    </div>
  )
}
