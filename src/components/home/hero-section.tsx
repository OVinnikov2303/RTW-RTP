import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Zap } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-secondary/20 pt-16 pb-24">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-blue/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <Badge variant="blue" className="mb-6 inline-flex gap-1.5 px-3 py-1">
          <Zap className="h-3 w-3" />
          Нові надходження вже тут
        </Badge>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-balance leading-[1.1] mb-6">
          Готовий до роботи.
          <br />
          <span className="text-blue">Готовий до гри.</span>
        </h1>

        <p className="mx-auto max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10">
          Преміальна комп'ютерна техніка та ігрове обладнання для професіоналів і ентузіастів. Зберіть ідеальне налаштування з RTW-RTP.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button size="xl" variant="blue" asChild>
            <Link href="/products">
              Купити зараз <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button size="xl" variant="outline" asChild>
            <Link href="/products?featured=true">Рекомендовані</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { value: "2,000+", label: "Товарів" },
            { value: "50K+", label: "Задоволених клієнтів" },
            { value: "4.9★", label: "Середній рейтинг" },
            { value: "24/7", label: "Підтримка" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-semibold">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
