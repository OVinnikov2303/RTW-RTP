import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductGrid } from "@/components/product/product-grid"
import type { ProductWithCategory } from "@/types"

interface FeaturedProductsProps {
  products: ProductWithCategory[]
  title?: string
  viewAllHref?: string
}

export function FeaturedProducts({
  products,
  title = "Featured Products",
  viewAllHref = "/products?featured=true",
}: FeaturedProductsProps) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
          <Button variant="ghost" asChild>
            <Link href={viewAllHref}>
              Переглянути всі <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <ProductGrid products={products} />
      </div>
    </section>
  )
}
