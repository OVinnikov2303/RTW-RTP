"use client"

import { Heart } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useWishlistStore } from "@/store/wishlist-store"
import { cn } from "@/lib/utils"
import type { ProductWithCategory } from "@/types"

export function WishlistButton({ product }: { product: ProductWithCategory }) {
  const { toggleItem, hasItem } = useWishlistStore()
  const isWishlisted = hasItem(product.id)

  const handleToggle = () => {
    toggleItem(product)
    toast.success(isWishlisted ? "Видалено зі списку бажань" : "Додано до списку бажань")
  }

  return (
    <Button variant="outline" size="lg" onClick={handleToggle} aria-label="Toggle wishlist">
      <Heart className={cn("h-4 w-4", isWishlisted && "fill-red-500 text-red-500")} />
    </Button>
  )
}
