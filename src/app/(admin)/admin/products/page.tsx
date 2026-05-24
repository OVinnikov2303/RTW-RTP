export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Plus, Pencil, Eye } from "lucide-react"
import { getAdminProducts } from "@/actions/admin"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DeleteProductButton } from "@/components/admin/delete-product-button"
import { formatPrice } from "@/lib/utils"

export const metadata: Metadata = { title: "Products – Admin" }

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const { page: pageStr } = await searchParams
  const page = Number(pageStr ?? 1)
  const { products, total, totalPages } = await getAdminProducts(page)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Товари</h1>
          <p className="text-sm text-muted-foreground mt-1">{total} товарів всього</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new"><Plus className="h-4 w-4 mr-2" />Додати товар</Link>
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/30">
            <tr>
              <th className="text-left font-medium text-muted-foreground px-4 py-3">Товар</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Категорія</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Ціна</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Запас</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden xl:table-cell">Статус</th>
              <th className="text-right font-medium text-muted-foreground px-4 py-3">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((product) => {
              const image = product.images?.[0]?.url
              return (
                <tr key={product.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
                        {image ? (
                          <Image src={image} alt={product.name} fill className="object-cover" sizes="40px" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">IMG</div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium line-clamp-1">{product.name}</p>
                        {product.brand && <p className="text-xs text-muted-foreground">{product.brand}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{product.category.name}</td>
                  <td className="px-4 py-3 font-medium hidden sm:table-cell">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={product.stock === 0 ? "text-destructive" : product.stock < 5 ? "text-yellow-600 dark:text-yellow-400" : "text-foreground"}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <Badge variant={product.isActive ? "success" : "secondary"}>
                      {product.isActive ? "Активний" : "Неактивний"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link href={`/products/${product.slug}`}><Eye className="h-3.5 w-3.5" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link href={`/admin/products/${product.id}/edit`}><Pencil className="h-3.5 w-3.5" /></Link>
                      </Button>
                      <DeleteProductButton productId={product.id} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/products?page=${p}`}
              className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                p === page ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
