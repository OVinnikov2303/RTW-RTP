"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { formatDistanceToNow } from "date-fns"
import { Star, ThumbsUp, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { RatingStars } from "./rating-stars"
import { createReview, deleteReview } from "@/actions/reviews"
import { cn } from "@/lib/utils"
import type { ProductWithRelations } from "@/types"

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().min(10, "Коментар має містити щонайменше 10 символів"),
})

type ReviewFormData = z.infer<typeof reviewSchema>

interface ProductReviewsProps {
  product: ProductWithRelations
}

export function ProductReviews({ product }: ProductReviewsProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [hoverRating, setHoverRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0 },
  })

  const selectedRating = watch("rating")

  const reviews = product.reviews
  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0

  const ratingCounts = [5, 4, 3, 2, 1].map((n) => ({
    value: n,
    count: reviews.filter((r) => r.rating === n).length,
    percent: reviews.length > 0 ? (reviews.filter((r) => r.rating === n).length / reviews.length) * 100 : 0,
  }))

  const alreadyReviewed = session?.user?.id
    ? reviews.some((r) => r.user.id === session.user!.id)
    : false

  const onSubmit = async (data: ReviewFormData) => {
    if (!session?.user?.id) { toast.error("Будь ласка, увійдіть, щоб залишити відгук"); return }
    if (data.rating === 0) { toast.error("Будь ласка, виберіть оцінку"); return }
    setSubmitting(true)
    const result = await createReview({ productId: product.id, ...data })
    setSubmitting(false)
    if (result.error) { toast.error(result.error); return }
    toast.success("Відгук надіслано!")
    reset()
    router.refresh()
  }

  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Видалити цей відгук?")) return
    setDeletingId(reviewId)
    const result = await deleteReview(reviewId)
    setDeletingId(null)
    if (result.error) { toast.error(result.error); return }
    toast.success("Відгук видалено")
    router.refresh()
  }

  return (
    <div className="space-y-10">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="flex flex-col items-center justify-center gap-2">
          <p className="text-6xl font-semibold">{avgRating.toFixed(1)}</p>
          <RatingStars rating={avgRating} size="lg" />
          <p className="text-sm text-muted-foreground">{reviews.length} {reviews.length === 1 ? "відгук" : reviews.length < 5 ? "відгуки" : "відгуків"}</p>
        </div>
        <div className="space-y-2">
          {ratingCounts.map(({ value, count, percent }) => (
            <div key={value} className="flex items-center gap-3">
              <span className="flex items-center gap-0.5 text-sm text-muted-foreground w-6 shrink-0">
                {value}<Star className="h-3 w-3" />
              </span>
              <Progress value={percent} className="h-2 flex-1" />
              <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Write a review */}
      {!session?.user && (
        <div className="rounded-xl border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">
            <Link href="/sign-in" className="text-foreground font-medium underline underline-offset-4">
              Увійдіть до акаунту
            </Link>
            , щоб залишити відгук та оцінку
          </p>
        </div>
      )}

      {session?.user && alreadyReviewed && (
        <p className="text-sm text-muted-foreground">Дякуємо! Ви вже залишили відгук на цей товар.</p>
      )}

      {session?.user && !alreadyReviewed && (
        <>
          <div>
            <h3 className="text-lg font-semibold mb-6">Написати відгук</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Star rating selector */}
              <div>
                <Label className="text-sm mb-2 block">Ваша оцінка *</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onMouseEnter={() => setHoverRating(n)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setValue("rating", n)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={cn(
                          "h-7 w-7 transition-colors",
                          n <= (hoverRating || selectedRating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-muted-foreground/30"
                        )}
                      />
                    </button>
                  ))}
                </div>
                {errors.rating && <p className="text-xs text-destructive mt-1">{errors.rating.message}</p>}
              </div>

              <div>
                <Label htmlFor="review-title" className="text-sm mb-1.5 block">Заголовок</Label>
                <Input id="review-title" placeholder="Коротко опишіть ваш відгук…" {...register("title")} />
              </div>

              <div>
                <Label htmlFor="review-comment" className="text-sm mb-1.5 block">Коментар *</Label>
                <Textarea
                  id="review-comment"
                  placeholder="Поділіться враженнями від цього товару…"
                  rows={4}
                  {...register("comment")}
                />
                {errors.comment && <p className="text-xs text-destructive mt-1">{errors.comment.message}</p>}
              </div>

              <Button type="submit" disabled={submitting}>
                {submitting ? "Надсилання…" : "Надіслати відгук"}
              </Button>
            </form>
          </div>
          <Separator />
        </>
      )}

      {/* Reviews list */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Відгуків ще немає. Будьте першим!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="space-y-3">
              <div className="flex items-start gap-3">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage src={review.user.image ?? ""} />
                  <AvatarFallback className="text-xs">
                    {review.user.name?.[0]?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{review.user.name ?? "Anonymous"}</span>
                    {review.isVerified && (
                      <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                        <ThumbsUp className="h-3 w-3" />Перевірений
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">
                      {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                    </span>
                    {session?.user?.id && (review.user.id === session.user.id || session.user.role === "ADMIN") && (
                      <button
                        type="button"
                        onClick={() => handleDelete(review.id)}
                        disabled={deletingId === review.id}
                        className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                        title="Видалити відгук"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <RatingStars rating={review.rating} />
                  {review.title && <p className="font-medium text-sm mt-2">{review.title}</p>}
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{review.comment}</p>
                </div>
              </div>
              <Separator />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
