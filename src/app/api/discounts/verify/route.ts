import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json()

    const discount = await prisma.discount.findFirst({
      where: {
        code,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    })

    if (!discount) return NextResponse.json({ valid: false, message: "Invalid or expired code" })
    if (discount.minOrder && subtotal < discount.minOrder) {
      return NextResponse.json({ valid: false, message: `Minimum order $${discount.minOrder} required` })
    }
    if (discount.maxUses && discount.usedCount >= discount.maxUses) {
      return NextResponse.json({ valid: false, message: "This code has reached its usage limit" })
    }

    const amount =
      discount.type === "PERCENTAGE"
        ? (subtotal * discount.value) / 100
        : Math.min(discount.value, subtotal)

    return NextResponse.json({ valid: true, discount: { ...discount, calculatedAmount: amount } })
  } catch {
    return NextResponse.json({ error: "Failed to verify discount" }, { status: 500 })
  }
}
