export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import Link from "next/link"
import { getAdminOrders } from "@/actions/admin"
import { Badge } from "@/components/ui/badge"
import { OrderStatusSelect } from "@/components/admin/order-status-select"
import { formatPrice } from "@/lib/utils"
import { format } from "date-fns"

export const metadata: Metadata = { title: "Orders – Admin" }

interface Props {
  searchParams: Promise<{ page?: string }>
}

const statusVariant: Record<string, "success" | "warning" | "blue" | "destructive" | "secondary"> = {
  PENDING: "warning",
  PROCESSING: "blue",
  SHIPPED: "blue",
  DELIVERED: "success",
  CANCELLED: "destructive",
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { page: pageStr } = await searchParams
  const page = Number(pageStr ?? 1)
  const { orders, total, totalPages } = await getAdminOrders(page)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Замовлення</h1>
        <p className="text-sm text-muted-foreground mt-1">{total} замовлень всього</p>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/30">
            <tr>
              <th className="text-left font-medium text-muted-foreground px-4 py-3">Замовлення</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Клієнт</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Дата</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Товари</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3">Сума</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3">Статус</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium font-mono">#{order.id.slice(-8).toUpperCase()}</p>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <p className="font-medium">{(order as { user?: { name?: string } }).user?.name ?? "Гість"}</p>
                  <p className="text-xs text-muted-foreground">{order.shippingEmail}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                  {format(new Date(order.createdAt), "d MMM yyyy")}
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                  {order.items.length} {order.items.length === 1 ? "товар" : order.items.length < 5 ? "товари" : "товарів"}
                </td>
                <td className="px-4 py-3 font-medium">{formatPrice(order.total)}</td>
                <td className="px-4 py-3">
                  <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/orders?page=${p}`}
              className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                p === page ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
