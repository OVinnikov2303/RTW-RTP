"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { ShoppingCart, Heart, BarChart2, Search, Menu, X, User, LogOut, Settings, Package } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useCartStore } from "@/store/cart-store"
import { useWishlistStore } from "@/store/wishlist-store"
import { useComparisonStore } from "@/store/comparison-store"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/products", label: "Товари" },
  { href: "/products?category=laptops", label: "Ноутбуки" },
  { href: "/products?category=gaming-pcs", label: "Ігрові ПК" },
  { href: "/products?category=components", label: "Комплектуючі" },
  { href: "/products?category=peripherals", label: "Периферія" },
]

export function Header() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const cartCount = useCartStore((s) => s.totalItems())
  const wishlistCount = useWishlistStore((s) => s.items.length)
  const compareCount = useComparisonStore((s) => s.items.length)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handler)
    return () => window.removeEventListener("scroll", handler)
  }, [])

  useEffect(() => setMobileOpen(false), [pathname])

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-background/60 backdrop-blur-md"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-xs font-bold text-primary-foreground">RTW</span>
            </div>
            <span className="hidden font-semibold text-sm sm:block">RTW-RTP</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm transition-colors",
                  pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href.split("?")[0]) && !link.href.includes("?"))
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/about" className="px-3 py-1.5 rounded-full text-sm text-muted-foreground hover:text-foreground transition-colors">
              Про нас
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" asChild>
              <Link href="/products?search=1" aria-label="Пошук">
                <Search className="h-4 w-4" />
              </Link>
            </Button>

            <ThemeToggle />

            {compareCount > 0 && (
              <Button variant="ghost" size="icon-sm" className="relative" asChild>
                <Link href="/compare" aria-label="Порівняння">
                  <BarChart2 className="h-4 w-4" />
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {compareCount}
                  </span>
                </Link>
              </Button>
            )}

            <Button variant="ghost" size="icon-sm" className="relative" asChild>
              <Link href="/wishlist" aria-label="Список бажань">
                <Heart className="h-4 w-4" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            </Button>

            <Button variant="ghost" size="icon-sm" className="relative" asChild>
              <Link href="/cart" aria-label="Кошик">
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {cartCount}
                  </span>
                )}
              </Link>
            </Button>

            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="rounded-full ml-1">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={session.user.image ?? ""} />
                      <AvatarFallback className="text-xs">{initials ?? "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-medium">{session.user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile"><User className="h-4 w-4" />Профіль</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders"><Package className="h-4 w-4" />Мої замовлення</Link>
                  </DropdownMenuItem>
                  {(session.user as { role?: string }).role === "ADMIN" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin"><Settings className="h-4 w-4" />Адмін панель</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="h-4 w-4" />Вийти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="default" size="sm" className="ml-1 hidden sm:flex" asChild>
                <Link href="/sign-in">Увійти</Link>
              </Button>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon-sm"
              className="lg:hidden ml-1"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-border py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/about" className="block px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              Про нас
            </Link>
            <Link href="/contacts" className="block px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              Контакти
            </Link>
            {!session?.user && (
              <div className="pt-2 flex gap-2">
                <Button asChild className="flex-1">
                  <Link href="/sign-in">Увійти</Link>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link href="/sign-up">Реєстрація</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
