"use client"

import { useState } from "react"
import { ShoppingCart, Check } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart-store"
import type { ProductWithCategory } from "@/types"

interface AddToCartButtonProps {
  product: ProductWithCategory
  quantity?: number
  size?: "default" | "lg" | "xl"
}

export function AddToCartButton({ product, quantity = 1, size = "lg" }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  const handleAdd = () => {
    if (product.stock === 0) return
    addItem(product, quantity)
    setAdded(true)
    toast.success(`${product.name} додано до кошика`)
    setTimeout(() => setAdded(false), 2500)
  }

  if (product.stock === 0) {
    return (
      <Button size={size} disabled variant="outline" className="flex-1">
        Немає в наявності
      </Button>
    )
  }

  return (
    <Button size={size} onClick={handleAdd} className="flex-1" variant={added ? "secondary" : "default"}>
      {added ? (
        <><Check className="h-4 w-4 mr-2" />Додано до кошика</>
      ) : (
        <><ShoppingCart className="h-4 w-4 mr-2" />До кошика</>
      )}
    </Button>
  )
}
