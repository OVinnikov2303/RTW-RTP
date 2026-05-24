export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Package } from "lucide-react"
import { getUserOrders } from "@/actions/orders"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { format } from "date-fns"

export const metadata: Metadata = { title: "My Orders" }

const statusVariant: Record<string, "success" | "warning" | "destructive" | "blue" | "secondary"> = {
  PENDING: "warning",
  PROCESSING: "blue",
  SHIPPED: "blue",
  DELIVERED: "success",
  CANCELLED: "destructive",
}

export default async function OrdersPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/sign-in")

  const orders = await getUserOrders(session.user.id)

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-semibold tracking-tight mb-8">Мої замовлення</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Package className="h-16 w-16 text-muted-foreground/30 mb-6" />
          <h2 className="text-xl font-semibold mb-2">Поки що немає замовлень</h2>
          <p className="text-muted-foreground mb-8">Ваша історія замовлень з'явиться тут.</p>
          <Button asChild><Link href="/products">Почати покупки</Link></Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-border bg-secondary/20">
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs">Замовлення</span>
                    <p className="font-medium font-mono">#{order.id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Дата</span>
                    <p className="font-medium">{format(new Date(order.createdAt), "d MMM yyyy")}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Сума</span>
                    <p className="font-medium">{formatPrice(order.total)}</p>
                  </div>
                </div>
                <Badge variant={statusVariant[order.status] ?? "secondary"}>
                  {order.status}
                </Badge>
              </div>
              <div className="p-5">
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground line-clamp-1 flex-1 mr-4">
                        {item.product.name} × {item.quantity}
                      </span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
