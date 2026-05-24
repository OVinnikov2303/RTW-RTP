"use client"

import Link from "next/link"
import Image from "next/image"
import { X, BarChart2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RatingStars } from "@/components/product/rating-stars"
import { AddToCartButton } from "@/components/product/add-to-cart-button"
import { useComparisonStore } from "@/store/comparison-store"
import { formatPrice } from "@/lib/utils"

export default function ComparePage() {
  const { items, removeItem, clearComparison } = useComparisonStore()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <BarChart2 className="h-16 w-16 text-muted-foreground/30 mb-6" />
        <h1 className="text-2xl font-semibold mb-2">Нічого порівнювати</h1>
        <p className="text-muted-foreground mb-8">Додайте до 4 товарів для порівняння.</p>
        <Button asChild><Link href="/products">Переглянути товари</Link></Button>
      </div>
    )
  }

  const allSpecKeys = [...new Set(items.flatMap((p) => (p as { specs?: { key: string }[] }).specs?.map((s) => s.key) ?? []))]

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 overflow-x-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Порівняння товарів</h1>
        <Button variant="ghost" size="sm" onClick={clearComparison} className="text-muted-foreground">
          <X className="h-4 w-4 mr-1.5" />Очистити все
        </Button>
      </div>

      <div className="min-w-[640px]">
        {/* Product headers */}
        <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `200px repeat(${items.length}, 1fr)` }}>
          <div />
          {items.map((product) => {
            const image = product.images?.[0]?.url ?? `https://picsum.photos/seed/${product.id}/300/300`
            return (
              <div key={product.id} className="relative rounded-2xl border border-border bg-card p-4 text-center">
                <button
                  onClick={() => removeItem(product.id)}
                  className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <div className="relative aspect-square w-24 mx-auto rounded-xl overflow-hidden bg-muted mb-3">
                  <Image src={image} alt={product.name} fill className="object-cover" sizes="96px" />
                </div>
                <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
                <Link href={`/products/${product.slug}`} className="font-medium text-sm hover:underline line-clamp-2">
                  {product.name}
                </Link>
                <p className="font-semibold text-base mt-2">{formatPrice(product.price)}</p>
                {product.isNew && <Badge variant="new" className="mt-2">New</Badge>}
                <div className="mt-3">
                  <AddToCartButton product={product} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Comparison rows */}
        {[
          {
            label: "Категорія",
            getValue: (p: typeof items[0]) => p.category.name,
          },
          {
            label: "Бренд",
            getValue: (p: typeof items[0]) => p.brand ?? "—",
          },
          {
            label: "Ціна",
            getValue: (p: typeof items[0]) => formatPrice(p.price),
          },
          {
            label: "Наявність",
            getValue: (p: typeof items[0]) => p.stock > 0 ? `${p.stock} шт.` : "Немає в наявності",
          },
          {
            label: "Рейтинг",
            getValue: (p: typeof items[0]) => <RatingStars rating={(p as { averageRating?: number }).averageRating ?? 0} showValue />,
          },
        ].map((row) => (
          <div
            key={row.label}
            className="grid gap-4 py-4 border-t border-border items-center"
            style={{ gridTemplateColumns: `200px repeat(${items.length}, 1fr)` }}
          >
            <span className="text-sm text-muted-foreground font-medium">{row.label}</span>
            {items.map((product) => (
              <div key={product.id} className="text-sm text-center">
                {row.getValue(product)}
              </div>
            ))}
          </div>
        ))}

        {/* Spec rows */}
        {allSpecKeys.map((key) => (
          <div
            key={key}
            className="grid gap-4 py-4 border-t border-border items-center"
            style={{ gridTemplateColumns: `200px repeat(${items.length}, 1fr)` }}
          >
            <span className="text-sm text-muted-foreground font-medium">{key}</span>
            {items.map((product) => {
              const spec = (product as { specs?: { key: string; value: string }[] }).specs?.find((s) => s.key === key)
              return (
                <div key={product.id} className="text-sm text-center">
                  {spec?.value ?? <span className="text-muted-foreground">—</span>}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
