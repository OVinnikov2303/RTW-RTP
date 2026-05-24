"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { XCircle, RotateCcw, ShoppingCart, HelpCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

function FailureContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const reason = searchParams.get("reason")

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="flex justify-center mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <XCircle className="h-10 w-10 text-red-600" />
        </div>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight mb-3">Платіж не вдався</h1>

      <p className="text-muted-foreground mb-4 text-base leading-relaxed">
        На жаль, ваш платіж не було оброблено. Будь ласка, спробуйте ще раз або скористайтеся
        іншим способом оплати.
      </p>

      {reason && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive mb-6">
          {reason}
        </div>
      )}

      {orderId && (
        <div className="rounded-2xl border border-border bg-card p-4 text-left mb-8">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Номер замовлення</span>
            <span className="font-mono font-medium">#{orderId.slice(-8).toUpperCase()}</span>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-muted/30 p-5 text-left mb-8">
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
          Що могло піти не так?
        </h3>
        <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
          <li>Недостатньо коштів на картці</li>
          <li>Картка заблокована або прострочена</li>
          <li>Банк відхилив транзакцію</li>
          <li>Перевищено ліміт на картці</li>
          <li>Тимчасова технічна помилка</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild size="lg" className="flex-1">
          <Link href="/cart">
            <RotateCcw className="h-4 w-4 mr-2" />
            Спробувати ще раз
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="flex-1">
          <Link href="/products">
            <ShoppingCart className="h-4 w-4 mr-2" />
            До магазину
          </Link>
        </Button>
      </div>

      {orderId && (
        <p className="text-xs text-muted-foreground mt-6">
          Замовлення #{orderId.slice(-8).toUpperCase()} збережено.{" "}
          <Link href={`/orders/${orderId}`} className="underline hover:text-foreground">
            Переглянути замовлення
          </Link>
        </p>
      )}
    </div>
  )
}

export default function PaymentFailurePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <FailureContent />
    </Suspense>
  )
}
