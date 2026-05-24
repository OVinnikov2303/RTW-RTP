"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useTransition, useState, useEffect } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ProductSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [value, setValue] = useState(searchParams.get("search") ?? "")

  useEffect(() => {
    setValue(searchParams.get("search") ?? "")
  }, [searchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (value.trim()) params.set("search", value.trim())
    else params.delete("search")
    params.delete("page")
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  const handleClear = () => {
    setValue("")
    const params = new URLSearchParams(searchParams.toString())
    params.delete("search")
    params.delete("page")
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex-1 max-w-sm">
      <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none")} />
      <Input
        placeholder="Пошук товарів…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-9 pr-9 h-9"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          onClick={handleClear}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </form>
  )
}
