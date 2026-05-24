export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import Link from "next/link"
import { getAdminStats } from "@/actions/admin"
import { formatPrice } from "@/lib/utils"
import { DollarSign, ShoppingBag, Package, Users, TrendingUp, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export const metadata: Metadata = { title: "Admin Dashboard" }

const statusVariant: Record<string, "success" | "warning" | "blue" | "destructive" | "secondary"> = {
  PENDING: "warning",
  PROCESSING: "blue",
  SHIPPED: "blue",
  DELIVERED: "success",
  CANCELLED: "destructive",
}

export default async function AdminDashboard() {
  const stats = await getAdminStats()

  const statCards = [
    { label: "Загальний дохід", value: formatPrice(stats.totalRevenue), icon: DollarSign, change: "+12% порівняно з минулим місяцем" },
    { label: "Усього замовлень", value: stats.totalOrders.toLocaleString(), icon: ShoppingBag, change: "+8 сьогодні" },
    { label: "Товари", value: stats.totalProducts.toLocaleString(), icon: Package, change: "Активні оголошення" },
    { label: "Користувачі", value: stats.totalUsers.toLocaleString(), icon: Users, change: "+23 цього тижня" },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Панель управління</h1>
        <p className="text-sm text-muted-foreground mt-1">Ласкаво просимо до адмін панелі RTW-RTP</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-2xl font-semibold">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-semibold">Нещодавні замовлення</h2>
            <Link href="/admin/orders" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              Переглянути всі <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {stats.recentOrders.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">Замовлень ще немає</p>
            ) : stats.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 text-sm">
                <div>
                  <p className="font-medium font-mono">#{order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {(order as { user?: { name?: string } }).user?.name ?? "Гість"} · {format(new Date(order.createdAt), "d MMM")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={statusVariant[order.status] ?? "secondary"} className="text-xs">
                    {order.status}
                  </Badge>
                  <span className="font-medium">{formatPrice(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />Топ товари
            </h2>
            <Link href="/admin/products" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              Переглянути всі <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {stats.topProducts.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">Даних про продажі ще немає</p>
            ) : stats.topProducts.map(({ product, totalSold }) => (
              product && (
                <div key={product!.id} className="flex items-center justify-between p-4 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium line-clamp-1">{product!.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{product!.category.name}</p>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <p className="font-medium">{formatPrice(product!.price)}</p>
                    <p className="text-xs text-muted-foreground">{totalSold} продано</p>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
