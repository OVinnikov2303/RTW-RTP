"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { slugify } from "@/lib/utils"
import { z } from "zod"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") throw new Error("Доступ заборонено")
  return session
}

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  categoryId: z.string(),
  brand: z.string().optional(),
  sku: z.string().optional(),
  featured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  images: z.array(z.object({ url: z.string(), publicId: z.string().optional(), isPrimary: z.boolean() })).optional(),
  specs: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
})

export async function createProduct(data: z.infer<typeof productSchema>) {
  await requireAdmin()
  const { images, specs, ...productData } = data

  const slug = slugify(productData.name)

  const product = await prisma.product.create({
    data: {
      ...productData,
      slug,
      images: images ? { create: images } : undefined,
      specs: specs ? { create: specs } : undefined,
    },
  })

  revalidatePath("/admin/products")
  revalidatePath("/products")
  return { success: true, id: product.id }
}

export async function updateProduct(id: string, data: Partial<z.infer<typeof productSchema>>) {
  await requireAdmin()
  const { images, specs, name, ...rest } = data

  const updateData: Record<string, unknown> = { ...rest }
  if (name) {
    updateData.name = name
    updateData.slug = slugify(name)
  }

  await prisma.product.update({
    where: { id },
    data: {
      ...updateData,
      ...(images !== undefined && {
        images: {
          deleteMany: {},
          create: images,
        },
      }),
      ...(specs !== undefined && {
        specs: {
          deleteMany: {},
          create: specs,
        },
      }),
    },
  })

  revalidatePath("/admin/products")
  revalidatePath("/products")
  return { success: true }
}

export async function deleteProduct(id: string) {
  await requireAdmin()
  await prisma.product.update({ where: { id }, data: { isActive: false } })
  revalidatePath("/admin/products")
  revalidatePath("/products")
  return { success: true }
}

export async function getAdminStats() {
  await requireAdmin()

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const [totalRevenue, totalOrders, totalProducts, totalUsers, newUsersThisWeek] = await Promise.all([
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.order.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
  ])

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: {
        include: { product: { include: { images: { where: { isPrimary: true }, take: 1 }, category: true } } },
      },
    },
  })

  const topProductsData = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  })

  const topProducts = await Promise.all(
    topProductsData.map(async (tp) => {
      const product = await prisma.product.findUnique({
        where: { id: tp.productId },
        include: { images: { where: { isPrimary: true }, take: 1 }, category: true },
      })
      return { product, totalSold: tp._sum.quantity ?? 0 }
    })
  )

  return {
    totalRevenue: totalRevenue._sum.total ?? 0,
    totalOrders,
    totalProducts,
    totalUsers,
    newUsersThisWeek,
    recentOrders,
    topProducts: topProducts.filter((p) => p.product),
  }
}

export async function getAdminProducts(page = 1, limit = 20) {
  await requireAdmin()
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: true,
        _count: { select: { reviews: true, orderItems: true } },
      },
    }),
    prisma.product.count(),
  ])
  return { products, total, totalPages: Math.ceil(total / limit) }
}

export async function getAdminOrders(page = 1, limit = 20) {
  await requireAdmin()
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    }),
    prisma.order.count(),
  ])
  return { orders, total, totalPages: Math.ceil(total / limit) }
}

export async function createDiscount(data: {
  code: string
  description?: string
  type: "PERCENTAGE" | "FIXED"
  value: number
  minOrder?: number
  maxUses?: number
  expiresAt?: Date
}) {
  await requireAdmin()
  await prisma.discount.create({ data: data as never })
  revalidatePath("/admin/discounts")
  return { success: true }
}
