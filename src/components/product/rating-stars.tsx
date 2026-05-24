import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface RatingStarsProps {
  rating: number
  max?: number
  size?: "sm" | "md" | "lg"
  showValue?: boolean
  count?: number
}

export function RatingStars({ rating, max = 5, size = "sm", showValue, count }: RatingStarsProps) {
  const sizes = { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-5 w-5" }
  const textSizes = { sm: "text-xs", md: "text-sm", lg: "text-base" }

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < Math.floor(rating)
          const partial = !filled && i < rating
          return (
            <div key={i} className="relative">
              <Star className={cn(sizes[size], "text-muted/40 fill-muted/20")} />
              {(filled || partial) && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: filled ? "100%" : `${(rating % 1) * 100}%` }}
                >
                  <Star className={cn(sizes[size], "text-yellow-400 fill-yellow-400")} />
                </div>
              )}
            </div>
          )
        })}
      </div>
      {showValue && (
        <span className={cn(textSizes[size], "text-muted-foreground")}>
          {rating.toFixed(1)}
          {count !== undefined && <span className="ml-1">({count})</span>}
        </span>
      )}
    </div>
  )
}
