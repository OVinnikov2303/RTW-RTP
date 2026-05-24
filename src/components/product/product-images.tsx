"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"
import type { ProductImage } from "@prisma/client"

interface ProductImagesProps {
  images: ProductImage[]
  productName: string
}

export function ProductImages({ images, productName }: ProductImagesProps) {
  const [selected, setSelected] = useState(0)

  const displayImages = images.length > 0
    ? images
    : [{ id: "placeholder", url: "https://picsum.photos/seed/product/600/600", isPrimary: true, productId: "", publicId: null, createdAt: new Date() }]

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted/30 border border-border">
        <Image
          src={displayImages[selected]?.url ?? displayImages[0].url}
          alt={productName}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {displayImages.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setSelected(i)}
              className={cn(
                "relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all",
                i === selected ? "border-primary" : "border-transparent hover:border-border"
              )}
            >
              <Image src={img.url} alt={`${productName} ${i + 1}`} fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
