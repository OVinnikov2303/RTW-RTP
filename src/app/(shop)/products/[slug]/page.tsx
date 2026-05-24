import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Package, BarChart2 } from "lucide-react"
import { getProductBySlug, getRelatedProducts } from "@/actions/products"
import { ProductImages } from "@/components/product/product-images"
import { ProductReviews } from "@/components/product/product-reviews"
import { AddToCartButton } from "@/components/product/add-to-cart-button"
import { WishlistButton } from "@/components/product/wishlist-button"
import { FeaturedProducts } from "@/components/home/featured-products"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RatingStars } from "@/components/product/rating-stars"
import { formatPrice } from "@/lib/utils"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: "Товар не знайдено" }
  return {
    title: product.name,
    description: product.description.slice(0, 160),
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const related = await getRelatedProducts(product.id, product.categoryId)
  const avgRating = product.reviews.length > 0
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : 0

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">Головна</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/products" className="hover:text-foreground transition-colors">Товари</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-foreground transition-colors capitalize">
          {product.category.name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground line-clamp-1">{product.name}</span>
      </nav>

      {/* Product layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <ProductImages images={product.images} productName={product.name} />

        {/* Info */}
        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {product.brand && (
                <Badge variant="secondary">{product.brand}</Badge>
              )}
              {product.isNew && <Badge variant="new">Новинка</Badge>}
              {product.stock === 0 && <Badge variant="destructive">Немає в наявності</Badge>}
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-3">{product.name}</h1>
            <div className="flex items-center gap-3">
              <RatingStars rating={avgRating} size="md" showValue count={product.reviews.length} />
            </div>
          </div>

          <div>
            <p className="text-3xl font-semibold">{formatPrice(product.price)}</p>
            {product.sku && (
              <p className="text-xs text-muted-foreground mt-1">SKU: {product.sku}</p>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          {/* Stock indicator */}
          <div className="flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-muted-foreground" />
            {product.stock > 0 ? (
              <span className="text-green-600 dark:text-green-400 font-medium">
                {product.stock > 10 ? "В наявності" : `Залишилось лише ${product.stock}`}
              </span>
            ) : (
              <span className="text-destructive font-medium">Немає в наявності</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <AddToCartButton product={product as never} size="lg" />
            <WishlistButton product={product as never} />
            <Link
              href="/compare"
              className="flex items-center justify-center h-12 w-12 rounded-full border border-border hover:bg-muted transition-colors shrink-0"
              aria-label="Додати до порівняння"
            >
              <BarChart2 className="h-4 w-4" />
            </Link>
          </div>

          <Separator />

          {/* Quick specs preview */}
          {product.specs.length > 0 && (
            <div className="space-y-2">
              {product.specs.slice(0, 4).map((spec) => (
                <div key={spec.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{spec.key}</span>
                  <span className="font-medium text-right ml-4">{spec.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="specs" className="mb-20">
        <TabsList className="mb-8">
          <TabsTrigger value="specs">Характеристики</TabsTrigger>
          <TabsTrigger value="reviews">Відгуки ({product.reviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="specs">
          {product.specs.length === 0 ? (
            <p className="text-muted-foreground">Характеристики недоступні.</p>
          ) : (
            <div className="rounded-2xl border border-border overflow-hidden">
              {product.specs.map((spec, i) => (
                <div
                  key={spec.id}
                  className={`flex items-start gap-8 px-6 py-4 text-sm ${
                    i % 2 === 0 ? "bg-secondary/30" : ""
                  }`}
                >
                  <span className="text-muted-foreground w-40 shrink-0">{spec.key}</span>
                  <span className="font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviews">
          <ProductReviews product={product} />
        </TabsContent>
      </Tabs>

      {/* Related products */}
      {related.length > 0 && (
        <FeaturedProducts
          products={related}
          title="Вам також може сподобатись"
          viewAllHref={`/products?category=${product.category.slug}`}
        />
      )}
    </div>
  )
}
