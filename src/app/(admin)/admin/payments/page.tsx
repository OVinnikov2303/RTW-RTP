export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import Link from "next/link"
import { getAdminPayments, getPaymentStats } from "@/actions/payments"
import { formatPrice } from "@/lib/utils"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { CreditCard, CheckCircle, XCircle, Clock, TrendingUp, AlertCircle } from "lucide-react"
import { redirect } from "next/navigation"
import { auth } from "@/auth"

export const metadata: Metadata = { title: "Платежі – Admin" }

interface Props {
  searchParams: Promise<{ page?: string }>
}

const statusLabel: Record<string, string> = {
  created: "Створено",
  processing: "Обробляється",
  hold: "Утримання",
  success: "Успішно",
  failure: "Помилка",
  reversed: "Повернено",
  expired: "Прострочено",
}

const statusVariant: Record<
  string,
  "success" | "warning" | "blue" | "destructive" | "secondary"
> = {
  success: "success",
  failure: "destructive",
  reversed: "warning",
  expired: "destructive",
  processing: "blue",
  hold: "blue",
  created: "secondary",
}

const paymentStatusVariant: Record<
  string,
  "success" | "warning" | "blue" | "destructive" | "secondary"
> = {
  PAID: "success",
  FAILED: "destructive",
  REFUNDED: "warning",
  CANCELLED: "destructive",
  PENDING: "secondary",
}

export default async function AdminPaymentsPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/sign-in")

  const { page: pageStr } = await searchParams
  const page = Number(pageStr ?? 1)

  const [paymentsData, stats] = await Promise.all([
    getAdminPayments(page, 20),
    getPaymentStats(),
  ])

  if (!paymentsData || !stats) redirect("/admin")

  const { transactions, total, totalPages } = paymentsData

  const statCards = [
    {
      label: "Успішні платежі",
      value: stats.totalPaid.toString(),
      sub: formatPrice(stats.totalRevenue),
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-100 dark:bg-green-900/30",
    },
    {
      label: "Помилки оплати",
      value: stats.totalFailed.toString(),
      sub: "Не оброблено",
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-100 dark:bg-red-900/30",
    },
    {
      label: "Очікують",
      value: stats.totalPending.toString(),
      sub: "В процесі",
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      label: "Загальний дохід",
      value: formatPrice(stats.totalRevenue),
      sub: "Підтверджені платежі",
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <CreditCard className="h-6 w-6" />
          Платежі Monobank
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{total} транзакцій всього</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
            <p className="text-2xl font-semibold">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Transactions table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden mb-6">
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold">Транзакції</h2>
        </div>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <AlertCircle className="h-8 w-8" />
            <p>Транзакцій ще немає</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/30">
                <tr>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Інвойс</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Замовлення</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Клієнт</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Сума</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Mono статус</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Статус оплати</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden xl:table-cell">Дата</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs text-muted-foreground">{tx.invoiceId}</p>
                      {tx.pageUrl && (
                        <a
                          href={tx.pageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          Посилання
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Link
                        href={`/orders/${tx.orderId}`}
                        className="font-mono text-xs hover:underline"
                      >
                        #{tx.orderId.slice(-8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="font-medium">{tx.order.user?.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{tx.order.shippingEmail}</p>
                    </td>
                    <td className="px-4 py-3 font-medium">{formatPrice(tx.amount)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[tx.status] ?? "secondary"} className="text-xs">
                        {statusLabel[tx.status] ?? tx.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Badge
                        variant={paymentStatusVariant[tx.order.paymentStatus] ?? "secondary"}
                        className="text-xs"
                      >
                        {tx.order.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden xl:table-cell text-xs">
                      {format(new Date(tx.createdAt), "d MMM yyyy HH:mm")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/payments?page=${p}`}
              className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                p === page
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}

      {/* Recent webhooks */}
      {stats.recentWebhooks.length > 0 && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden mt-8">
          <div className="p-5 border-b border-border">
            <h2 className="font-semibold">Останні вебхуки</h2>
          </div>
          <div className="divide-y divide-border">
            {stats.recentWebhooks.map((log) => (
              <div key={log.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs text-muted-foreground">{log.invoiceId ?? "—"}</p>
                  {log.error && <p className="text-xs text-destructive mt-0.5">{log.error}</p>}
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <Badge
                    variant={statusVariant[log.status ?? ""] ?? "secondary"}
                    className="text-xs"
                  >
                    {statusLabel[log.status ?? ""] ?? log.status ?? "—"}
                  </Badge>
                  <span className={`text-xs ${log.processed ? "text-green-600" : "text-amber-600"}`}>
                    {log.processed ? "Оброблено" : "Не оброблено"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(log.createdAt), "HH:mm:ss")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
