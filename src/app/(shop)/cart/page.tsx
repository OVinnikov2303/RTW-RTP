"use client"

import Link from "next/link"
import Image from "next/image"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCartStore } from "@/store/cart-store"
import { formatPrice } from "@/lib/utils"

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice, totalItems } = useCartStore()
  const subtotal = totalPrice()
  const total = subtotal

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-6" />
        <h1 className="text-2xl font-semibold mb-2">Ваш кошик порожній</h1>
        <p className="text-muted-foreground mb-8">Починайте купувати, щоб додати товари до кошика.</p>
        <Button asChild size="lg">
          <Link href="/products">Переглянути товари</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-semibold tracking-tight mb-8">
        Кошик <span className="text-muted-foreground text-2xl font-normal">({totalItems()})</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items list */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const image = item.product.images?.[0]?.url ?? `https://picsum.photos/seed/${item.product.id}/200/200`
            return (
              <div key={item.product.id} className="flex gap-4 p-4 rounded-2xl border border-border bg-card">
                <Link href={`/products/${item.product.slug}`} className="shrink-0">
                  <div className="relative h-24 w-24 rounded-xl overflow-hidden bg-muted">
                    <Image src={image} alt={item.product.name} fill className="object-cover" sizes="96px" />
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">{item.product.category.name}</p>
                      <Link href={`/products/${item.product.slug}`} className="font-medium text-sm hover:underline line-clamp-2">
                        {item.product.name}
                      </Link>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeItem(item.product.id)}
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="h-7 w-7 rounded-full"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="h-7 w-7 rounded-full"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="font-semibold">{formatPrice(item.product.price * item.quantity)}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-semibold text-lg">Підсумок замовлення</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Підсумок ({totalItems()} товарів)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Доставка</span>
                <span className="text-green-600 dark:text-green-400">Безкоштовно</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-base">
              <span>Разом</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Button size="lg" className="w-full" asChild>
              <Link href="/checkout">
                Перейти до оформлення <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/products">Продовжити покупки</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
