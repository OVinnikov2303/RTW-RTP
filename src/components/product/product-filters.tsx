"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback, useState, useTransition } from "react"
import { SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"

interface ProductFiltersProps {
  brands: string[]
  maxPrice: number
}

const categories = [
  { label: "Ноутбуки", value: "laptops" },
  { label: "Ігрові ПК", value: "gaming-pcs" },
  { label: "Комплектуючі", value: "components" },
  { label: "Периферія", value: "peripherals" },
]

export function ProductFilters({ brands, maxPrice }: ProductFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get("minPrice") ?? 0),
    Number(searchParams.get("maxPrice") ?? maxPrice),
  ])

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === null) params.delete(key)
        else params.set(key, value)
      }
      params.delete("page")
      return params.toString()
    },
    [searchParams]
  )

  const updateFilter = (key: string, value: string | null) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString({ [key]: value })}`)
    })
  }

  const toggleCheckbox = (key: string, value: string) => {
    const current = searchParams.get(key)
    updateFilter(key, current === value ? null : value)
  }

  const applyPrice = () => {
    startTransition(() => {
      router.push(
        `${pathname}?${createQueryString({
          minPrice: priceRange[0] > 0 ? String(priceRange[0]) : null,
          maxPrice: priceRange[1] < maxPrice ? String(priceRange[1]) : null,
        })}`
      )
    })
  }

  const clearAll = () => {
    setPriceRange([0, maxPrice])
    startTransition(() => {
      router.push(pathname)
    })
  }

  const activeCategory = searchParams.get("category")
  const activeBrand = searchParams.get("brand")
  const inStock = searchParams.get("inStock")
  const isNew = searchParams.get("isNew")
  const activeFiltersCount = [activeCategory, activeBrand, inStock, isNew].filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="font-medium text-sm">Фільтри</span>
          {activeFiltersCount > 0 && (
            <Badge variant="blue">{activeFiltersCount}</Badge>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 px-2 text-xs">
            <X className="h-3 w-3 mr-1" />Скинути
          </Button>
        )}
      </div>

      {/* Categories */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Категорія</p>
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.value} className="flex items-center gap-2">
              <Checkbox
                id={`cat-${cat.value}`}
                checked={activeCategory === cat.value}
                onCheckedChange={() => toggleCheckbox("category", cat.value)}
                disabled={isPending}
              />
              <Label htmlFor={`cat-${cat.value}`} className="text-sm cursor-pointer font-normal">
                {cat.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Ціна</p>
        <Slider
          min={0}
          max={maxPrice}
          step={50}
          value={priceRange}
          onValueChange={(v) => setPriceRange(v as [number, number])}
          className="mb-4"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <span>{formatPrice(priceRange[0])}</span>
          <span>{formatPrice(priceRange[1])}</span>
        </div>
        <Button size="sm" variant="outline" className="w-full" onClick={applyPrice} disabled={isPending}>
          Застосувати
        </Button>
      </div>

      <Separator />

      {/* Brands */}
      {brands.length > 0 && (
        <>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Бренд</p>
            <div className="space-y-2">
              {brands.map((brand) => (
                <div key={brand} className="flex items-center gap-2">
                  <Checkbox
                    id={`brand-${brand}`}
                    checked={activeBrand === brand}
                    onCheckedChange={() => toggleCheckbox("brand", brand)}
                    disabled={isPending}
                  />
                  <Label htmlFor={`brand-${brand}`} className="text-sm cursor-pointer font-normal">
                    {brand}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Availability */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Наявність</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="in-stock"
              checked={inStock === "true"}
              onCheckedChange={(checked) => updateFilter("inStock", checked ? "true" : null)}
              disabled={isPending}
            />
            <Label htmlFor="in-stock" className="text-sm cursor-pointer font-normal">В наявності</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="is-new"
              checked={isNew === "true"}
              onCheckedChange={(checked) => updateFilter("isNew", checked ? "true" : null)}
              disabled={isPending}
            />
            <Label htmlFor="is-new" className="text-sm cursor-pointer font-normal">Нові надходження</Label>
          </div>
        </div>
      </div>
    </div>
  )
}
