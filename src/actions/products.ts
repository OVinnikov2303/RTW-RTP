"use server"

import { prisma } from "@/lib/prisma"
import type { FilterParams, PaginatedProducts, ProductWithCategory, ProductWithRelations } from "@/types"

export async function getProducts(params: FilterParams = {}): Promise<PaginatedProducts> {
  const {
    category, minPrice, maxPrice, brand, inStock,
    isNew, featured, search, sort = "newest",
    page = 1, limit = 12,
  } = params

  const where: Record<string, unknown> = { isActive: true }

  if (category) {
    where.category = { slug: category }
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {}
    if (minPrice !== undefined) (where.price as Record<string, number>).gte = minPrice
    if (maxPrice !== undefined) (where.price as Record<string, number>).lte = maxPrice
  }
  if (brand) where.brand = { contains: brand, mode: "insensitive" }
  if (inStock) where.stock = { gt: 0 }
  if (isNew) where.isNew = true
  if (featured) where.featured = true
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
    ]
  }

  const orderBy: Record<string, unknown> =
    sort === "price-asc" ? { price: "asc" }
    : sort === "price-desc" ? { price: "desc" }
    : sort === "name" ? { name: "asc" }
    : { createdAt: "desc" }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        images: { orderBy: { isPrimary: "desc" } },
        category: true,
        _count: { select: { reviews: true } },
      },
    }),
    prisma.product.count({ where }),
  ])

  const productsWithRating = await Promise.all(
    products.map(async (p) => {
      const avg = await prisma.review.aggregate({
        where: { productId: p.id },
        _avg: { rating: true },
      })
      return { ...p, averageRating: avg._avg.rating ?? 0 }
    })
  )

  return {
    products: productsWithRating as ProductWithCategory[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export async function getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  return prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { isPrimary: "desc" } },
      specs: true,
      category: true,
      reviews: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true, image: true } } },
      },
      _count: { select: { reviews: true } },
    },
  }) as Promise<ProductWithRelations | null>
}

export async function getFeaturedProducts(): Promise<ProductWithCategory[]> {
  const products = await prisma.product.findMany({
    where: { featured: true, isActive: true },
    take: 8,
    include: {
      images: { orderBy: { isPrimary: "desc" }, take: 1 },
      category: true,
      _count: { select: { reviews: true } },
    },
  })
  const withRating = await Promise.all(
    products.map(async (p) => {
      const avg = await prisma.review.aggregate({ where: { productId: p.id }, _avg: { rating: true } })
      return { ...p, averageRating: avg._avg.rating ?? 0 }
    })
  )
  return withRating as ProductWithCategory[]
}

export async function getNewProducts(): Promise<ProductWithCategory[]> {
  const products = await prisma.product.findMany({
    where: { isNew: true, isActive: true },
    take: 4,
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { isPrimary: "desc" }, take: 1 },
      category: true,
      _count: { select: { reviews: true } },
    },
  })
  const withRating = await Promise.all(
    products.map(async (p) => {
      const avg = await prisma.review.aggregate({ where: { productId: p.id }, _avg: { rating: true } })
      return { ...p, averageRating: avg._avg.rating ?? 0 }
    })
  )
  return withRating as ProductWithCategory[]
}

export async function getCategories() {
  return prisma.category.findMany({
    include: { _count: { select: { products: true } } },
  })
}

export async function getBrands(): Promise<string[]> {
  const brands = await prisma.product.findMany({
    where: { isActive: true, brand: { not: null } },
    select: { brand: true },
    distinct: ["brand"],
  })
  return brands.map((b) => b.brand!).filter(Boolean).sort()
}

export async function getRelatedProducts(productId: string, categoryId: string): Promise<ProductWithCategory[]> {
  const products = await prisma.product.findMany({
    where: { categoryId, id: { not: productId }, isActive: true },
    take: 4,
    include: {
      images: { orderBy: { isPrimary: "desc" }, take: 1 },
      category: true,
      _count: { select: { reviews: true } },
    },
  })
  const withRating = await Promise.all(
    products.map(async (p) => {
      const avg = await prisma.review.aggregate({ where: { productId: p.id }, _avg: { rating: true } })
      return { ...p, averageRating: avg._avg.rating ?? 0 }
    })
  )
  return withRating as ProductWithCategory[]
}
