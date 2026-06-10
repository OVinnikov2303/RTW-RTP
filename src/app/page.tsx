export const dynamic = "force-dynamic"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/home/hero-section"
import { CategoriesSection } from "@/components/home/categories-section"
import { FeaturedProducts } from "@/components/home/featured-products"
import { getFeaturedProducts, getNewProducts } from "@/actions/products"

export default async function HomePage() {
  const [featured, newProducts] = await Promise.all([
    getFeaturedProducts(),
    getNewProducts(),
  ])

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <CategoriesSection />
        {featured.length > 0 && (
          <FeaturedProducts products={featured} title="Рекомендовані товари" />
        )}
        {newProducts.length > 0 && (
          <FeaturedProducts
            products={newProducts}
            title="Нові надходження"
            viewAllHref="/products?isNew=true"
          />
        )}
      </main>
      <Footer />
    </div>
  )
}
