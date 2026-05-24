import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Truck, Shield, RefreshCw, Headphones } from "lucide-react"

const perks = [
  { icon: Truck, title: "Безкоштовна доставка", desc: "При замовленні від $100" },
  { icon: Shield, title: "Гарантія 2 роки", desc: "На всі товари" },
  { icon: RefreshCw, title: "Легке повернення", desc: "Політика повернення 30 днів" },
  { icon: Headphones, title: "Підтримка 24/7", desc: "Допомога експертів будь-коли" },
]

export function PromoBanner() {
  return (
    <>
      {/* Perks bar */}
      <section className="border-y border-border bg-secondary/30 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {perks.map((perk) => (
              <div key={perk.title} className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <perk.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">{perk.title}</p>
                  <p className="text-xs text-muted-foreground">{perk.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
            Зберіть налаштування мрії
          </h2>
          <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto">
            Від ультратонких ноутбуків до потужних ігрових систем — знайдіть свою ідеальну машину в RTW-RTP.
          </p>
          <Button size="xl" variant="secondary" asChild>
            <Link href="/products">Переглянути всі товари</Link>
          </Button>
        </div>
      </section>
    </>
  )
}
