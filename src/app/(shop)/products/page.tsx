export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { Suspense } from "react"
import { ProductGrid } from "@/components/product/product-grid"
import { ProductFilters } from "@/components/product/product-filters"
import { ProductSort } from "@/components/product/product-sort"
import { ProductSearch } from "@/components/product/product-search"
import { getProducts, getBrands } from "@/actions/products"
import { Skeleton } from "@/components/ui/skeleton"
import type { FilterParams } from "@/types"

export const metadata: Metadata = { title: "Products" }

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string
    minPrice?: string
    maxPrice?: string
    brand?: string
    inStock?: string
    isNew?: string
    featured?: string
    search?: string
    sort?: string
    page?: string
  }>
}

async function ProductResults({ searchParams }: { searchParams: Awaited<ProductsPageProps["searchParams"]> }) {
  const params: FilterParams = {
    category: searchParams.category,
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    brand: searchParams.brand,
    inStock: searchParams.inStock === "true",
    isNew: searchParams.isNew === "true",
    featured: searchParams.featured === "true",
    search: searchParams.search,
    sort: searchParams.sort as FilterParams["sort"],
    page: searchParams.page ? Number(searchParams.page) : 1,
    limit: 12,
  }

  const { products, total, totalPages, page } = await getProducts(params)

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          {total} {total === 1 ? "товар" : total < 5 ? "товари" : "товарів"}
        </p>
      </div>
      <ProductGrid products={products} />
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`?${new URLSearchParams({ ...searchParams, page: String(p) }).toString()}`}
              className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                p === page
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </>
  )
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const brands = await getBrands()

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">
          {params.category
            ? params.category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
            : "Всі товари"}
        </h1>
        <p className="text-muted-foreground text-sm">Відкрийте для себе весь асортимент техніки та ігрового обладнання</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-5">
            <ProductFilters brands={brands} maxPrice={10000} />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Suspense fallback={<Skeleton className="h-9 w-full max-w-sm" />}>
              <ProductSearch />
            </Suspense>
            <div className="ml-auto">
              <Suspense fallback={<Skeleton className="h-9 w-44" />}>
                <ProductSort />
              </Suspense>
            </div>
          </div>
          <Suspense fallback={<ProductGrid products={[]} loading />}>
            <ProductResults searchParams={params} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
