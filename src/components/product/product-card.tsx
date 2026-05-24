"use client"

import Link from "next/link"
import Image from "next/image"
import { Heart, BarChart2, ShoppingCart, Check } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RatingStars } from "./rating-stars"
import { useCartStore } from "@/store/cart-store"
import { useWishlistStore } from "@/store/wishlist-store"
import { useComparisonStore } from "@/store/comparison-store"
import { formatPrice, cn } from "@/lib/utils"
import type { ProductWithCategory } from "@/types"

interface ProductCardProps {
  product: ProductWithCategory
}

export function ProductCard({ product }: ProductCardProps) {
  const [addedToCart, setAddedToCart] = useState(false)
  const addToCart = useCartStore((s) => s.addItem)
  const { toggleItem: toggleWishlist, hasItem: inWishlist } = useWishlistStore()
  const { toggleItem: toggleCompare, hasItem: inComparison, isFull } = useComparisonStore()

  const image = product.images?.[0]?.url ?? "https://picsum.photos/seed/" + product.id + "/400/400"
  const isWishlisted = inWishlist(product.id)
  const isCompared = inComparison(product.id)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addToCart(product)
    setAddedToCart(true)
    toast.success(`${product.name} додано до кошика`)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    toggleWishlist(product)
    toast.success(isWishlisted ? "Видалено зі списку бажань" : "Додано до списку бажань")
  }

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isCompared && isFull()) {
      toast.error("Список порівняння повний (макс. 4 товари)")
      return
    }
    toggleCompare(product)
    toast.success(isCompared ? "Видалено з порівняння" : "Додано до порівняння")
  }

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-border/80 hover:-translate-y-0.5">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted/30">
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isNew && <Badge variant="new">Новинка</Badge>}
            {product.stock === 0 && <Badge variant="secondary">Немає в наявності</Badge>}
          </div>

          {/* Quick actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleWishlist}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-sm transition-colors hover:bg-background",
                isWishlisted && "text-red-500"
              )}
              aria-label="Toggle wishlist"
            >
              <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
            </button>
            <button
              onClick={handleCompare}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-sm transition-colors hover:bg-background",
                isCompared && "text-blue"
              )}
              aria-label="Toggle comparison"
            >
              <BarChart2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-xs text-muted-foreground mb-1">{product.brand ?? product.category.name}</p>
          <h3 className="font-medium text-sm leading-snug line-clamp-2 mb-2 group-hover:text-blue transition-colors">
            {product.name}
          </h3>

          {product._count && (
            <RatingStars
              rating={product.averageRating ?? 0}
              showValue
              count={product._count.reviews}
            />
          )}

          <div className="flex items-center justify-between mt-3">
            <p className="font-semibold text-base">{formatPrice(product.price)}</p>
            <Button
              size="icon-sm"
              variant={addedToCart ? "secondary" : "default"}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="rounded-full"
              aria-label="Add to cart"
            >
              {addedToCart ? <Check className="h-3.5 w-3.5" /> : <ShoppingCart className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  )
}
