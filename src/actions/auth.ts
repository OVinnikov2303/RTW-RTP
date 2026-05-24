"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

export async function registerUser(data: z.infer<typeof registerSchema>) {
  const parsed = registerSchema.safeParse(data)
  if (!parsed.success) return { error: "Невірні дані" }

  const { name, email, password } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return { error: "Ця електронна пошта вже використовується" }

  const hashed = await bcrypt.hash(password, 12)

  await prisma.user.create({
    data: { name, email, password: hashed },
  })

  return { success: true }
}

export async function updateProfile(userId: string, data: {
  name?: string
  phone?: string
  address?: string
  city?: string
  country?: string
}) {
  await prisma.user.update({
    where: { id: userId },
    data,
  })
  return { success: true }
}
