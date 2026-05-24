import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getMonobankInvoiceStatus } from "@/lib/monobank"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизовано" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get("orderId")
  const invoiceId = searchParams.get("invoiceId")

  if (!orderId && !invoiceId) {
    return NextResponse.json({ error: "Потрібен orderId або invoiceId" }, { status: 400 })
  }

  const tx = await prisma.paymentTransaction.findFirst({
    where: orderId ? { orderId } : { invoiceId: invoiceId! },
    include: { order: { select: { userId: true, paymentStatus: true, status: true } } },
  })

  if (!tx) {
    return NextResponse.json({ error: "Транзакцію не знайдено" }, { status: 404 })
  }

  if (tx.order.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Доступ заборонено" }, { status: 403 })
  }

  // Try to get live status from Monobank; fall back to cached
  try {
    const live = await getMonobankInvoiceStatus(tx.invoiceId)
    return NextResponse.json({
      invoiceId: tx.invoiceId,
      orderId: tx.orderId,
      status: live.status,
      paymentStatus: tx.order.paymentStatus,
      orderStatus: tx.order.status,
      amount: live.amount / 100,
      errText: live.errText,
    })
  } catch {
    return NextResponse.json({
      invoiceId: tx.invoiceId,
      orderId: tx.orderId,
      status: tx.status,
      paymentStatus: tx.order.paymentStatus,
      orderStatus: tx.order.status,
      amount: tx.amount,
    })
  }
}
