import type {
  Product, ProductImage, ProductSpec, Category, Review, Rating,
  User, Order, OrderItem, OrderStatus, PaymentStatus, Role,
  ReviewStatus, UserActivity, AdminLog, AdminActionType, ActivityType,
  ProductCompatibility,
} from "@prisma/client"

export type ProductWithRelations = Product & {
  images: ProductImage[]
  specs: ProductSpec[]
  category: Category
  reviews: (Review & { user: Pick<User, "id" | "name" | "image"> })[]
  _count?: { reviews: number }
}

export type ProductWithCategory = Product & {
  images: ProductImage[]
  category: Category
  _count?: { reviews: number }
  averageRating?: number
}

export type CartItemWithProduct = {
  id: string
  productId: string
  quantity: number
  product: ProductWithCategory
}

export type OrderWithItems = Order & {
  items: (OrderItem & {
    product: ProductWithCategory
  })[]
  user?: Pick<User, "id" | "name" | "email">
}

export type AdminStats = {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalUsers: number
  recentOrders: OrderWithItems[]
  topProducts: { product: ProductWithCategory; totalSold: number }[]
  revenueByMonth: { month: string; revenue: number }[]
}

export type FilterParams = {
  category?: string
  minPrice?: number
  maxPrice?: number
  brand?: string
  rating?: number
  inStock?: boolean
  isNew?: boolean
  featured?: boolean
  search?: string
  sort?: "price-asc" | "price-desc" | "rating" | "newest" | "name"
  page?: number
  limit?: number
}

export type PaginatedProducts = {
  products: ProductWithCategory[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type ReviewWithUser = Review & {
  user: Pick<User, "id" | "name" | "image">
  moderatedBy?: Pick<User, "id" | "name"> | null
}

export type ProductWithCompatibility = Product & {
  compatibleWith: (ProductCompatibility & { target: ProductWithCategory })[]
  compatibleProducts: (ProductCompatibility & { source: ProductWithCategory })[]
}

export type AdminLogWithAdmin = AdminLog & {
  admin: Pick<User, "id" | "name" | "email">
}

export type UserActivityWithProduct = UserActivity & {
  product?: ProductWithCategory | null
}

export { OrderStatus, PaymentStatus, Role, ReviewStatus, AdminActionType, ActivityType }
