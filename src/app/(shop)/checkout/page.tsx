"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import { CreditCard, Shield, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useCartStore } from "@/store/cart-store"
import { formatPrice } from "@/lib/utils"

const checkoutSchema = z.object({
  shippingName: z.string().min(2, "Ім'я обов'язкове"),
  shippingEmail: z.string().email("Введіть дійсну пошту"),
  shippingPhone: z.string().optional(),
  shippingAddress: z.string().min(5, "Адреса обов'язкова"),
  shippingCity: z.string().min(2, "Місто обов'язкове"),
  shippingCountry: z.string().min(2, "Країна обов'язкова"),
  notes: z.string().optional(),
  discountCode: z.string().optional(),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

const FREE_SHIPPING_THRESHOLD = 0 // UAH — безкоштовна доставка завжди
const SHIPPING_COST = 0

export default function CheckoutPage() {
  const { data: session } = useSession()
  const { items, totalPrice, clearCart } = useCartStore()
  const [placing, setPlacing] = useState(false)

  const subtotal = totalPrice()
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingName: session?.user?.name ?? "",
      shippingEmail: session?.user?.email ?? "",
      shippingCountry: "Україна",
    },
  })

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="text-2xl font-semibold mb-2">Нема що оформляти</h1>
        <p className="text-muted-foreground mb-6">Ваш кошик порожній.</p>
        <Button asChild><Link href="/products">Переглянути товари</Link></Button>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="text-2xl font-semibold mb-2">Увійдіть для оформлення</h1>
        <p className="text-muted-foreground mb-6">Для оформлення замовлення потрібен акаунт.</p>
        <Button asChild><Link href="/sign-in?callbackUrl=/checkout">Увійти</Link></Button>
      </div>
    )
  }

  const onSubmit = async (data: CheckoutFormData) => {
    setPlacing(true)
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, items }),
      })

      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error ?? "Помилка під час оформлення замовлення")
        setPlacing(false)
        return
      }

      clearCart()
      toast.success("Замовлення створено! Перенаправляємо на оплату…")

      // Hard redirect to Monobank payment page
      window.location.href = result.paymentUrl
    } catch {
      toast.error("Помилка мережі. Спробуйте ще раз.")
      setPlacing(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-semibold tracking-tight mb-8">Оформлення замовлення</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Shipping form */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-5">Інформація про доставку</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name" className="mb-1.5 block text-sm">Повне ім'я *</Label>
                    <Input id="name" {...register("shippingName")} placeholder="Іван Іваненко" />
                    {errors.shippingName && (
                      <p className="text-xs text-destructive mt-1">{errors.shippingName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email" className="mb-1.5 block text-sm">Електронна пошта *</Label>
                    <Input id="email" type="email" {...register("shippingEmail")} placeholder="ivan@example.com" />
                    {errors.shippingEmail && (
                      <p className="text-xs text-destructive mt-1">{errors.shippingEmail.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone" className="mb-1.5 block text-sm">Телефон</Label>
                    <Input id="phone" {...register("shippingPhone")} placeholder="+380 (50) 000-0000" />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="address" className="mb-1.5 block text-sm">Адреса *</Label>
                    <Input id="address" {...register("shippingAddress")} placeholder="вул. Хрещатик, 1" />
                    {errors.shippingAddress && (
                      <p className="text-xs text-destructive mt-1">{errors.shippingAddress.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="city" className="mb-1.5 block text-sm">Місто *</Label>
                    <Input id="city" {...register("shippingCity")} placeholder="Київ" />
                    {errors.shippingCity && (
                      <p className="text-xs text-destructive mt-1">{errors.shippingCity.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="country" className="mb-1.5 block text-sm">Країна *</Label>
                    <Input id="country" {...register("shippingCountry")} placeholder="Україна" />
                    {errors.shippingCountry && (
                      <p className="text-xs text-destructive mt-1">{errors.shippingCountry.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-lg font-semibold mb-4">Промокод</h2>
              <Input {...register("discountCode")} placeholder="Введіть код знижки" />
            </div>

            <div>
              <Label htmlFor="notes" className="mb-1.5 block text-sm">Примітки до замовлення</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Будь-які особливі побажання…"
                rows={3}
              />
            </div>

            {/* Payment info banner */}
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2.5">
              <div className="flex items-center gap-2.5 text-sm">
                <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>Оплата через захищену платіжну систему Monobank</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 shrink-0" />
                <span>Дані картки не зберігаються на нашому сайті</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Truck className="h-4 w-4 shrink-0" />
                <span>Безкоштовна доставка від {formatPrice(FREE_SHIPPING_THRESHOLD)}</span>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div>
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold mb-5">Підсумок замовлення</h2>

              <div className="space-y-3 mb-5 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3 text-sm">
                    {item.product.images?.[0] && (
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border">
                        <Image
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                    )}
                    <span className="text-muted-foreground line-clamp-1 flex-1">
                      {item.product.name}
                      <span className="ml-1 text-foreground/60">× {item.quantity}</span>
                    </span>
                    <span className="shrink-0 font-medium">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2 mt-4 mb-5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Підсумок</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Доставка</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600">Безкоштовно</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-semibold text-base mt-4 mb-6">
                <span>Разом</span>
                <span>{formatPrice(subtotal + shipping)}</span>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full gap-2 bg-[#1a1a2e] hover:bg-[#16213e] text-white dark:bg-white dark:text-black dark:hover:bg-zinc-100"
                disabled={placing}
              >
                {placing ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Обробка…
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Оплатити через Monobank
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 mt-3">
                <Badge variant="secondary" className="text-xs gap-1">
                  <Shield className="h-3 w-3" />
                  Захищений платіж
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-2">
                Оформлюючи замовлення, ви погоджуєтесь з умовами обслуговування.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
