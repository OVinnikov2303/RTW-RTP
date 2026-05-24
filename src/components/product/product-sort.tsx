"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useTransition } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const sortOptions = [
  { value: "newest", label: "Найновіші" },
  { value: "price-asc", label: "Ціна: від низької" },
  { value: "price-desc", label: "Ціна: від високої" },
  { value: "rating", label: "Найкраща оцінка" },
  { value: "name", label: "Назва А–Я" },
]

export function ProductSort() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const currentSort = searchParams.get("sort") ?? "newest"

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", value)
    params.delete("page")
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  return (
    <Select value={currentSort} onValueChange={handleSort}>
      <SelectTrigger className="w-44 h-9">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
