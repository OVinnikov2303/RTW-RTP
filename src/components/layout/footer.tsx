import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Monitor, Gamepad2, Cpu, Keyboard } from "lucide-react"

const categories = [
  { href: "/products?category=laptops", label: "Ноутбуки", icon: Monitor },
  { href: "/products?category=gaming-pcs", label: "Ігрові ПК", icon: Gamepad2 },
  { href: "/products?category=components", label: "Комплектуючі", icon: Cpu },
  { href: "/products?category=peripherals", label: "Периферія", icon: Keyboard },
]

const company = [
  { href: "/about", label: "Про нас" },
  { href: "/contacts", label: "Контакти" },
]

const account = [
  { href: "/profile", label: "Мій профіль" },
  { href: "/orders", label: "Мої замовлення" },
  { href: "/wishlist", label: "Список бажань" },
  { href: "/cart", label: "Кошик" },
]

export function Footer() {
  return (
    <footer className="bg-secondary/50 border-t border-border mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-xs font-bold text-primary-foreground">RTW</span>
              </div>
              <span className="font-semibold">RTW-RTP</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Готовий до роботи – Готовий до гри. Преміальна комп'ютерна техніка та ігрове обладнання для професіоналів і ентузіастів.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Категорії</h3>
            <ul className="space-y-2.5">
              {categories.map((c) => (
                <li key={c.href}>
                  <Link href={c.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                    <c.icon className="h-3.5 w-3.5" />
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Компанія</h3>
            <ul className="space-y-2.5">
              {company.map((c) => (
                <li key={c.href}>
                  <Link href={c.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Акаунт</h3>
            <ul className="space-y-2.5">
              {account.map((a) => (
                <li key={a.href}>
                  <Link href={a.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {a.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} RTW-RTP. Усі права захищені.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-foreground transition-colors">Конфіденційність</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Умови</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
