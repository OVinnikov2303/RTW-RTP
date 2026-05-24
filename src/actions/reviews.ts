"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().min(10),
})

export async function createReview(data: z.infer<typeof reviewSchema>) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Не авторизовано" }

  const parsed = reviewSchema.safeParse(data)
  if (!parsed.success) return { error: "Невірні дані" }

  const { productId, rating, title, comment } = parsed.data

  const existing = await prisma.review.findUnique({
    where: { userId_productId: { userId: session.user.id, productId } },
  })
  if (existing) return { error: "Ви вже залишили відгук на цей товар" }

  await prisma.review.create({
    data: { userId: session.user.id, productId, rating, title, comment },
  })

  revalidatePath(`/products/${productId}`)
  return { success: true }
}

export async function deleteReview(reviewId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Не авторизовано" }

  const review = await prisma.review.findUnique({ where: { id: reviewId } })
  if (!review) return { error: "Не знайдено" }

  if (review.userId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "Доступ заборонено" }
  }

  await prisma.review.delete({ where: { id: reviewId } })
  revalidatePath(`/products/${review.productId}`)
  return { success: true }
}
