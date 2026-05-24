import { NextRequest, NextResponse } from "next/server"
import { getProducts } from "@/actions/products"
import type { FilterParams } from "@/types"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const params: FilterParams = {
    category: searchParams.get("category") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    sort: (searchParams.get("sort") as FilterParams["sort"]) ?? "newest",
    page: Number(searchParams.get("page") ?? 1),
    limit: Number(searchParams.get("limit") ?? 12),
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    brand: searchParams.get("brand") ?? undefined,
    inStock: searchParams.get("inStock") === "true",
    isNew: searchParams.get("isNew") === "true",
    featured: searchParams.get("featured") === "true",
  }

  try {
    const result = await getProducts(params)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
