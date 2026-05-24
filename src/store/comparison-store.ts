import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ProductWithCategory } from "@/types"

const MAX_COMPARE = 4

interface ComparisonStore {
  items: ProductWithCategory[]
  addItem: (product: ProductWithCategory) => boolean
  removeItem: (productId: string) => void
  toggleItem: (product: ProductWithCategory) => void
  hasItem: (productId: string) => boolean
  clearComparison: () => void
  isFull: () => boolean
}

export const useComparisonStore = create<ComparisonStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        if (get().isFull()) return false
        if (!get().hasItem(product.id)) {
          set((state) => ({ items: [...state.items, product] }))
        }
        return true
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

      clearComparison: () => set({ items: [] }),

      isFull: () => get().items.length >= MAX_COMPARE,
    }),
    { name: "rtw-rtp-comparison" }
  )
)
