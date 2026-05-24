"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Clock, Package, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"

interface PaymentStatus {
  invoiceId: string
  orderId: string
  status: string
  paymentStatus: string
  orderStatus: string
  amount: number
  errText?: string
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get("orderId")

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [pollCount, setPollCount] = useState(0)
  const [simulating, setSimulating] = useState(false)
  const isDev = process.env.NODE_ENV === "development"

  useEffect(() => {
    if (!orderId) { router.replace("/"); return }

    const poll = async () => {
      try {
        const res = await fetch(`/api/payments/status?orderId=${orderId}`)
        if (res.ok) {
          const data: PaymentStatus = await res.json()
          setPaymentStatus(data)
          if (
            data.paymentStatus === "PENDING" &&
            data.status !== "failure" &&
            data.status !== "expired"
          ) {
            setPollCount((c) => c + 1)
          }
        }
      } catch {/* ignore */} finally {
        setLoading(false)
      }
    }

    poll()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  // Re-poll every 3 seconds while pending (max 10 attempts)
  useEffect(() => {
    if (!orderId || !paymentStatus || pollCount === 0 || pollCount > 10) return
    if (paymentStatus.paymentStatus !== "PENDING") return

    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/payments/status?orderId=${orderId}`)
        if (res.ok) {
          const data: PaymentStatus = await res.json()
          setPaymentStatus(data)
          if (data.paymentStatus === "PENDING") setPollCount((c) => c + 1)
        }
      } catch {/* ignore */}
    }, 3000)

    return () => clearTimeout(t)
  }, [orderId, paymentStatus, pollCount])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Перевіряємо статус платежу…</p>
      </div>
    )
  }

  const isPaid = paymentStatus?.paymentStatus === "PAID"
  const isFailed =
    paymentStatus?.status === "failure" ||
    paymentStatus?.status === "expired" ||
    paymentStatus?.paymentStatus === "FAILED"
  const isProcessing = !isPaid && !isFailed

  if (isFailed) {
    router.replace(`/payment/failure?orderId=${orderId}`)
    return null
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="flex justify-center mb-6">
        {isPaid ? (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Clock className="h-10 w-10 text-amber-600" />
          </div>
        )}
      </div>

      <h1 className="text-3xl font-semibold tracking-tight mb-3">
        {isPaid ? "Оплата успішна!" : "Платіж обробляється"}
      </h1>

      <p className="text-muted-foreground mb-8 text-base leading-relaxed">
        {isPaid
          ? "Ваше замовлення підтверджено та передано в обробку. Дякуємо за покупку!"
          : isProcessing
          ? "Ваш платіж ще обробляється. Це може зайняти кілька хвилин. Ми надішлемо підтвердження на вашу електронну пошту."
          : "Замовлення отримано. Очікуємо підтвердження платежу від Monobank."}
      </p>

      {paymentStatus && (
        <div className="rounded-2xl border border-border bg-card p-6 text-left mb-8 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Номер замовлення</span>
            <span className="font-mono font-medium">#{orderId?.slice(-8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Сума</span>
            <span className="font-medium">{formatPrice(paymentStatus.amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Статус оплати</span>
            <span className={`font-medium ${isPaid ? "text-green-600" : "text-amber-600"}`}>
              {isPaid ? "Оплачено" : "Обробляється"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">ID транзакції</span>
            <span className="font-mono text-xs text-muted-foreground">
              {paymentStatus.invoiceId}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild className="flex-1" size="lg">
          <Link href={`/orders/${orderId}`}>
            <Package className="h-4 w-4 mr-2" />
            Моє замовлення
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1" size="lg">
          <Link href="/products">
            Продовжити покупки
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>

      {isProcessing && pollCount <= 10 && (
        <p className="text-xs text-muted-foreground mt-6 flex items-center justify-center gap-1.5">
          <Loader2 className="h-3 w-3 animate-spin" />
          Автоматично оновлюємо статус…
        </p>
      )}

      {isDev && isProcessing && orderId && (
        <div className="mt-8 rounded-xl border border-dashed border-amber-400 bg-amber-50 dark:bg-amber-900/10 p-4">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-3">
            🛠 Режим розробки — симулятор вебхука
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-500 mb-3">
            Monobank не може достукатися до localhost, тому вебхук не приходить автоматично.
            Натисни кнопку щоб симулювати успішну оплату.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="border-amber-400 text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/30 w-full"
            disabled={simulating}
            onClick={async () => {
              setSimulating(true)
              try {
                const res = await fetch("/api/dev/simulate-payment", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ orderId, status: "success" }),
                })
                if (res.ok) {
                  const fresh = await fetch(`/api/payments/status?orderId=${orderId}`)
                  if (fresh.ok) setPaymentStatus(await fresh.json())
                }
              } finally {
                setSimulating(false)
              }
            }}
          >
            {simulating ? (
              <><Loader2 className="h-3 w-3 animate-spin mr-2" />Симулюємо…</>
            ) : (
              "✓ Симулювати успішну оплату"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
