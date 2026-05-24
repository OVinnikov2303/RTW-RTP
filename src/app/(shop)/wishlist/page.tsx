"use client"

import Link from "next/link"
import { Heart, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductGrid } from "@/components/product/product-grid"
import { useWishlistStore } from "@/store/wishlist-store"

export default function WishlistPage() {
  const { items, clearWishlist } = useWishlistStore()

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Список бажань{" "}
          <span className="text-muted-foreground text-2xl font-normal">({items.length})</span>
        </h1>
        {items.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearWishlist} className="text-muted-foreground">
            <Trash2 className="h-4 w-4 mr-1.5" />Очистити все
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Heart className="h-16 w-16 text-muted-foreground/30 mb-6" />
          <h2 className="text-xl font-semibold mb-2">Ваш список бажань порожній</h2>
          <p className="text-muted-foreground mb-8">Зберігайте товари, які вам подобаються.</p>
          <Button asChild>
            <Link href="/products">Переглянути товари</Link>
          </Button>
        </div>
      ) : (
        <ProductGrid products={items} />
      )}
    </div>
  )
}
