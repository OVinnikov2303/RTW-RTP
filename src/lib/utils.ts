import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency = "UAH"): string {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trimEnd() + "…"
}

export function getDiscountedPrice(price: number, discountPercent: number): number {
  return price * (1 - discountPercent / 100)
}

export function calculateRatingAverage(ratings: number[]): number {
  if (ratings.length === 0) return 0
  return ratings.reduce((sum, r) => sum + r, 0) / ratings.length
}
