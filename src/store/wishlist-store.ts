import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ProductWithCategory } from "@/types"

interface WishlistStore {
  items: ProductWithCategory[]
  addItem: (product: ProductWithCategory) => void
  removeItem: (productId: string) => void
  toggleItem: (product: ProductWithCategory) => void
  hasItem: (productId: string) => boolean
  clearWishlist: () => void
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        if (!get().hasItem(product.id)) {
          set((state) => ({ items: [...state.items, product] }))
        }
      },

      removeItem: (productId) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== productId) }))
      },

      toggleItem: (product) => {
        if (get().hasItem(product.id)) {
          get().removeItem(product.id)
        } else {
          get().addItem(product)
        }
      },

      hasItem: (productId) => get().items.some((i) => i.id === productId),

      clearWishlist: () => set({ items: [] }),
    }),
    { name: "rtw-rtp-wishlist" }
  )
)
