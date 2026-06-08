"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Plus, Trash2, Upload, X } from "lucide-react"
import { CldUploadWidget, CldImage } from "next-cloudinary"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { createProduct, updateProduct } from "@/actions/admin"
import type { Category } from "@prisma/client"

const formSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().min(0),
  categoryId: z.string().min(1, "Виберіть категорію"),
  brand: z.string().optional(),
  sku: z.string().optional(),
  featured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  specs: z.array(z.object({ key: z.string().min(1), value: z.string().min(1) })).optional(),
})

type FormData = z.infer<typeof formSchema>

interface UploadedImage {
  url: string
  publicId: string
  isPrimary: boolean
}

interface ProductFormProps {
  categories: Category[]
  product?: {
    id: string
    name: string
    description: string
    price: number
    stock: number
    categoryId: string
    brand: string | null
    sku: string | null
    featured: boolean
    isNew: boolean
    specs: { key: string; value: string }[]
    images: { url: string; publicId?: string | null; isPrimary: boolean }[]
  }
}

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
const cloudinaryEnabled = !!(cloudName && cloudName !== "your-cloud-name" && uploadPreset)

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isEdit = !!product

  const [images, setImages] = useState<UploadedImage[]>(
    product?.images?.map((img, i) => ({
      url: img.url,
      publicId: img.publicId ?? "",
      isPrimary: img.isPrimary ?? i === 0,
    })) ?? []
  )

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema) as never,
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product?.price ?? 0,
      stock: product?.stock ?? 0,
      categoryId: product?.categoryId ?? "",
      brand: product?.brand ?? "",
      sku: product?.sku ?? "",
      featured: product?.featured ?? false,
      isNew: product?.isNew ?? false,
      specs: product?.specs ?? [],
    },
  })

  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
    control,
    name: "specs",
  })

  const featured = watch("featured")
  const isNew = watch("isNew")

  const handleUploadSuccess = (result: { info: { secure_url: string; public_id: string } }) => {
    const newImg: UploadedImage = {
      url: result.info.secure_url,
      publicId: result.info.public_id,
      isPrimary: images.length === 0,
    }
    setImages((prev) => [...prev, newImg])
    toast.success("Фото завантажено!")
  }

  const [imageUrlInput, setImageUrlInput] = useState("")

  const addImageByUrl = () => {
    const url = imageUrlInput.trim()
    if (!url) return
    setImages((prev) => [...prev, { url, publicId: "", isPrimary: prev.length === 0 }])
    setImageUrlInput("")
  }

  const removeImage = (idx: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== idx)
      if (prev[idx]?.isPrimary && next.length > 0) {
        next[0].isPrimary = true
      }
      return next
    })
  }

  const setPrimary = (idx: number) => {
    setImages((prev) => prev.map((img, i) => ({ ...img, isPrimary: i === idx })))
  }

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      const payload = {
        ...data,
        images: images.length > 0 ? images : undefined,
        specs: data.specs?.filter((s) => s.key && s.value),
      }

      const result = isEdit
        ? await updateProduct(product.id, payload)
        : await createProduct(payload)

      if (result.success) {
        toast.success(isEdit ? "Товар оновлено!" : "Товар створено!")
        router.push("/admin/products")
        router.refresh()
      } else {
        toast.error("Щось пішло не так")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main fields */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <Label htmlFor="name" className="text-sm mb-1.5 block">Назва товару *</Label>
            <Input id="name" {...register("name")} placeholder="напр. ASUS ROG Strix G16" />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="description" className="text-sm mb-1.5 block">Опис *</Label>
            <Textarea id="description" {...register("description")} rows={5} placeholder="Опис товару…" />
            {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price" className="text-sm mb-1.5 block">Ціна (₴) *</Label>
              <Input id="price" type="number" step="0.01" {...register("price")} />
              {errors.price && <p className="text-xs text-destructive mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <Label htmlFor="stock" className="text-sm mb-1.5 block">Кількість *</Label>
              <Input id="stock" type="number" {...register("stock")} />
              {errors.stock && <p className="text-xs text-destructive mt-1">{errors.stock.message}</p>}
            </div>
          </div>

          {/* Image upload section */}
          <div>
            <Label className="text-sm mb-2 block">Фото товару</Label>

            {/* Uploaded images grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
                {images.map((img, idx) => (
                  <div key={img.publicId || idx} className="relative group rounded-xl overflow-hidden border border-border aspect-square bg-muted">
                    {cloudinaryEnabled && img.publicId ? (
                      <CldImage
                        src={img.publicId}
                        alt="Фото товару"
                        fill
                        className="object-cover"
                        sizes="150px"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img.url} alt="Фото товару" className="w-full h-full object-cover" />
                    )}

                    {/* Primary badge */}
                    {img.isPrimary && (
                      <span className="absolute top-1 left-1 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-medium">
                        Головне
                      </span>
                    )}

                    {/* Hover controls */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!img.isPrimary && (
                        <button
                          type="button"
                          onClick={() => setPrimary(idx)}
                          className="text-[10px] bg-white text-black px-2 py-1 rounded-full font-medium hover:bg-primary hover:text-white transition-colors"
                        >
                          Головне
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="p-1 bg-destructive text-white rounded-full hover:bg-destructive/80 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload button */}
            {cloudinaryEnabled ? (
              <CldUploadWidget
                uploadPreset={uploadPreset}
                options={{
                  multiple: true,
                  maxFiles: 10,
                  resourceType: "image",
                  clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
                  maxFileSize: 10000000,
                  folder: "rtw-rtp/products",
                  language: "uk",
                }}
                onSuccess={(result) => {
                  if (result.info && typeof result.info === "object" && "secure_url" in result.info) {
                    handleUploadSuccess(result as { info: { secure_url: string; public_id: string } })
                  }
                }}
              >
                {({ open }) => (
                  <Button type="button" variant="outline" onClick={() => open()} className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    {images.length === 0 ? "Завантажити фото" : "Додати ще фото"}
                  </Button>
                )}
              </CldUploadWidget>
            ) : (
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="Посилання на зображення (https://...)"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addImageByUrl()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addImageByUrl}>
                  <Plus className="h-4 w-4 mr-2" />
                  Додати
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Specifications */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm">Характеристики</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => appendSpec({ key: "", value: "" })}>
                <Plus className="h-3.5 w-3.5 mr-1" />Додати
              </Button>
            </div>
            <div className="space-y-2">
              {specFields.map((field, i) => (
                <div key={field.id} className="flex gap-2">
                  <Input {...register(`specs.${i}.key`)} placeholder="Параметр (напр. ОЗП)" />
                  <Input {...register(`specs.${i}.value`)} placeholder="Значення (напр. 16 ГБ)" />
                  <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeSpec(i)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
            <div>
              <Label className="text-sm mb-1.5 block">Категорія *</Label>
              <Select
                defaultValue={product?.categoryId}
                onValueChange={(v) => setValue("categoryId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Виберіть категорію" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && <p className="text-xs text-destructive mt-1">{errors.categoryId.message}</p>}
            </div>

            <div>
              <Label htmlFor="brand" className="text-sm mb-1.5 block">Бренд</Label>
              <Input id="brand" {...register("brand")} placeholder="напр. ASUS" />
            </div>

            <div>
              <Label htmlFor="sku" className="text-sm mb-1.5 block">Артикул (SKU)</Label>
              <Input id="sku" {...register("sku")} placeholder="напр. ROG-G16-2024" />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Label className="text-sm">Рекомендований</Label>
              <Switch checked={featured} onCheckedChange={(v) => setValue("featured", v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Новинка</Label>
              <Switch checked={isNew} onCheckedChange={(v) => setValue("isNew", v)} />
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? "Збереження…" : isEdit ? "Оновити товар" : "Створити товар"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Скасувати</Button>
          </div>
        </div>
      </div>
    </form>
  )
}
