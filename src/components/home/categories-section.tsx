import Link from "next/link"
import { Monitor, Gamepad2, Cpu, Keyboard } from "lucide-react"

const categories = [
  {
    label: "Ноутбуки",
    slug: "laptops",
    icon: Monitor,
    description: "Ультрабуки, ігрові ноутбуки, робочі станції",
    color: "from-blue-500/10 to-blue-600/5",
  },
  {
    label: "Ігрові ПК",
    slug: "gaming-pcs",
    icon: Gamepad2,
    description: "Готові та кастомні ігрові системи",
    color: "from-purple-500/10 to-purple-600/5",
  },
  {
    label: "Комплектуючі",
    slug: "components",
    icon: Cpu,
    description: "Процесори, відеокарти, оперативна пам'ять та більше",
    color: "from-orange-500/10 to-orange-600/5",
  },
  {
    label: "Периферія",
    slug: "peripherals",
    icon: Keyboard,
    description: "Клавіатури, миші, монітори, гарнітури",
    color: "from-green-500/10 to-green-600/5",
  },
]

export function CategoriesSection() {
  return (
    <section className="py-16 bg-secondary/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold tracking-tight mb-3">Купуйте за категорією</h2>
          <p className="text-muted-foreground">Знайдіть саме те, що потрібно</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:border-border/60 hover:-translate-y-0.5"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted group-hover:bg-background transition-colors">
                  <cat.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-1">{cat.label}</h3>
                <p className="text-sm text-muted-foreground leading-snug">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
