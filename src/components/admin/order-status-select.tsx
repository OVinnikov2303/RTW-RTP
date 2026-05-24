"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateOrderStatus } from "@/actions/orders"

const statusOptions = [
  { value: "PENDING", label: "Очікує" },
  { value: "PROCESSING", label: "Обробляється" },
  { value: "SHIPPED", label: "Відправлено" },
  { value: "DELIVERED", label: "Доставлено" },
  { value: "CANCELLED", label: "Скасовано" },
]

interface OrderStatusSelectProps {
  orderId: string
  currentStatus: string
}

export function OrderStatusSelect({ orderId, currentStatus }: OrderStatusSelectProps) {
  const [isPending, startTransition] = useTransition()

  const handleChange = (value: string) => {
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, value)
      if (result.success) toast.success("Статус замовлення оновлено")
      else toast.error("Не вдалося оновити статус")
    })
  }

  return (
    <Select defaultValue={currentStatus} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="h-8 w-36 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} className="text-xs">
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
