import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyMonobankWebhook, mapMonobankStatus } from "@/lib/monobank"

interface MonobankWebhookPayload {
  invoiceId: string
  status: "created" | "processing" | "hold" | "success" | "failure" | "reversed" | "expired"
  amount: number
  ccy: number
  reference?: string
  createdDate?: number
  modifiedDate?: number
  errCode?: string
  errText?: string
  paymentInfo?: Record<string, unknown>
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const xSign = req.headers.get("x-sign")

  const valid = await verifyMonobankWebhook(rawBody, xSign)
  if (!valid) {
    console.warn("Monobank webhook: invalid signature")
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  let payload: MonobankWebhookPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  // Log the webhook first (so we always have a record even on failure)
  const log = await prisma.webhookLog.create({
    data: {
      source: "monobank",
      invoiceId: payload.invoiceId,
      status: payload.status,
      payload: payload as never,
    },
  })

  try {
    const tx = await prisma.paymentTransaction.findUnique({
      where: { invoiceId: payload.invoiceId },
    })

    if (!tx) {
      await prisma.webhookLog.update({
        where: { id: log.id },
        data: { error: "Transaction not found for invoiceId: " + payload.invoiceId },
      })
      // Return 200 so Monobank doesn't retry
      return NextResponse.json({ status: "ok" })
    }

    const dbPaymentStatus = mapMonobankStatus(payload.status)

    await prisma.paymentTransaction.update({
      where: { id: tx.id },
      data: {
        status: payload.status,
        failureReason: payload.errText ?? null,
        statusHistory: {
          create: {
            status: payload.status,
            rawPayload: payload as never,
          },
        },
      },
    })

    // Promote order status to PROCESSING on successful payment
    await prisma.order.update({
      where: { id: tx.orderId },
      data: {
        paymentStatus: dbPaymentStatus as never,
        ...(payload.status === "success" ? { status: "PROCESSING" } : {}),
      },
    })

    // Decrement stock and bump purchase counts only on first successful payment
    if (payload.status === "success" && tx.status !== "success") {
      const orderItems = await prisma.orderItem.findMany({ where: { orderId: tx.orderId } })
      for (const item of orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            purchaseCount: { increment: item.quantity },
          },
        })
      }
    }

    await prisma.webhookLog.update({ where: { id: log.id }, data: { processed: true } })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("Monobank webhook processing error:", msg)
    await prisma.webhookLog.update({ where: { id: log.id }, data: { error: msg } }).catch(() => {})
  }

  return NextResponse.json({ status: "ok" })
}
