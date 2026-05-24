"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import type { CartItem } from "@/store/cart-store"

const checkoutSchema = z.object({
  shippingName: z.string().min(2),
  shippingEmail: z.string().email(),
  shippingPhone: z.string().optional(),
  shippingAddress: z.string().min(5),
  shippingCity: z.string().min(2),
  shippingCountry: z.string().min(2),
  notes: z.string().optional(),
  discountCode: z.string().optional(),
})

export async function createOrder(
  items: CartItem[],
  formData: z.infer<typeof checkoutSchema>
) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Не авторизовано" }

  const parsed = checkoutSchema.safeParse(formData)
  if (!parsed.success) return { error: "Невірна інформація про доставку" }

  if (items.length === 0) return { error: "Кошик порожній" }

  let discountAmount = 0
  let discountId: string | undefined

  if (parsed.data.discountCode) {
    const discount = await prisma.discount.findFirst({
      where: {
        code: parsed.data.discountCode,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    })
    if (discount) {
      const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0)
      if (!discount.minOrder || subtotal >= discount.minOrder) {
        if (!discount.maxUses || discount.usedCount < discount.maxUses) {
          discountAmount =
            discount.type === "PERCENTAGE"
              ? (subtotal * discount.value) / 100
              : Math.min(discount.value, subtotal)
          discountId = discount.id
        }
      }
    }
  }

  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0)
  const total = Math.max(0, subtotal - discountAmount)

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      subtotal,
      discountAmount,
      total,
      discountId,
      ...parsed.data,
      items: {
        create: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
          price: i.product.price,
        })),
      },
    },
  })

  if (discountId) {
    await prisma.discount.update({
      where: { id: discountId },
      data: { usedCount: { increment: 1 } },
    })
  }

  for (const item of items) {
    await prisma.product.update({
      where: { id: item.product.id },
      data: { stock: { decrement: item.quantity } },
    })
  }

  revalidatePath("/orders")
  return { success: true, orderId: order.id }
}

export async function getUserOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: {
            include: { images: { where: { isPrimary: true }, take: 1 }, category: true },
          },
        },
      },
    },
  })
}

export async function getOrderById(orderId: string) {
  const session = await auth()
  if (!session?.user?.id) return null

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            include: { images: { where: { isPrimary: true }, take: 1 }, category: true },
          },
        },
      },
    },
  })

  if (!order) return null
  if (order.userId !== session.user.id && session.user.role !== "ADMIN") return null

  return order
}

export async function updateOrderStatus(orderId: string, status: string) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") return { error: "Forbidden" }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: status as never },
  })

  revalidatePath("/admin/orders")
  return { success: true }
}
