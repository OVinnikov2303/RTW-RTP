"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function getPaymentTransaction(orderId: string) {
  const session = await auth()
  if (!session?.user?.id) return null

  const tx = await prisma.paymentTransaction.findUnique({
    where: { orderId },
    include: {
      statusHistory: { orderBy: { createdAt: "asc" } },
      order: { select: { userId: true } },
    },
  })

  if (!tx) return null
  if (tx.order.userId !== session.user.id && session.user.role !== "ADMIN") return null

  return tx
}

export async function getAdminPayments(page = 1, limit = 20) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") return null

  const skip = (page - 1) * limit
  const [transactions, total] = await Promise.all([
    prisma.paymentTransaction.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          select: {
            id: true,
            total: true,
            shippingName: true,
            shippingEmail: true,
            status: true,
            paymentStatus: true,
            createdAt: true,
            user: { select: { name: true, email: true } },
          },
        },
      },
    }),
    prisma.paymentTransaction.count(),
  ])

  return { transactions, total, totalPages: Math.ceil(total / limit) }
}

export async function getPaymentStats() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") return null

  const [totalPaid, totalFailed, totalPending, recentWebhooks] = await Promise.all([
    prisma.paymentTransaction.count({ where: { status: "success" } }),
    prisma.paymentTransaction.count({ where: { status: "failure" } }),
    prisma.paymentTransaction.count({ where: { status: { in: ["created", "processing", "hold"] } } }),
    prisma.webhookLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
  ])

  const paidAmountResult = await prisma.paymentTransaction.aggregate({
    _sum: { amount: true },
    where: { status: "success" },
  })

  return {
    totalPaid,
    totalFailed,
    totalPending,
    totalRevenue: paidAmountResult._sum.amount ?? 0,
    recentWebhooks,
  }
}

export async function getWebhookLogs(page = 1, limit = 20) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") return null

  const skip = (page - 1) * limit
  const [logs, total] = await Promise.all([
    prisma.webhookLog.findMany({ skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.webhookLog.count(),
  ])

  return { logs, total, totalPages: Math.ceil(total / limit) }
}
