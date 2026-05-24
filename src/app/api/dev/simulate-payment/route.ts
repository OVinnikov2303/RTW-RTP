import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { mapMonobankStatus } from "@/lib/monobank"

// Only available in development
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 })
  }

  const { orderId, status = "success" } = await req.json()
  if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 })

  const tx = await prisma.paymentTransaction.findUnique({ where: { orderId } })
  if (!tx) return NextResponse.json({ error: "Transaction not found" }, { status: 404 })

  const monoStatus = status as "success" | "failure" | "reversed" | "expired"
  const dbStatus = mapMonobankStatus(monoStatus)

  await prisma.paymentTransaction.update({
    where: { id: tx.id },
    data: {
      status: monoStatus,
      statusHistory: {
        create: { status: monoStatus, rawPayload: { simulated: true, status: monoStatus } },
      },
    },
  })

  await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: dbStatus as never,
      ...(monoStatus === "success" ? { status: "PROCESSING" } : {}),
    },
  })

  if (monoStatus === "success") {
    const items = await prisma.orderItem.findMany({ where: { orderId } })
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity }, purchaseCount: { increment: item.quantity } },
      })
    }
  }

  await prisma.webhookLog.create({
    data: {
      source: "monobank-simulated",
      invoiceId: tx.invoiceId,
      status: monoStatus,
      payload: { simulated: true, orderId, status: monoStatus },
      processed: true,
    },
  })

  return NextResponse.json({ ok: true, paymentStatus: dbStatus })
}
