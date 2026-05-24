"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"
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
  categoryId: z.string().min(1, "Select a category"),
  brand: z.string().optional(),
  sku: z.string().optional(),
  featured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  specs: z.array(z.object({ key: z.string().min(1), value: z.string().min(1) })).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
})

type FormData = z.infer<typeof formSchema>

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
    images: { url: string; isPrimary: boolean }[]
  }
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isEdit = !!product

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
      imageUrl: product?.images?.[0]?.url ?? "",
    },
  })

  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
    control,
    name: "specs",
  })

  const featured = watch("featured")
  const isNew = watch("isNew")

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      const payload = {
        ...data,
        images: data.imageUrl ? [{ url: data.imageUrl, isPrimary: true }] : undefined,
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
            <Input id="name" {...register("name")} placeholder="напр. MacBook Pro 16" />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="description" className="text-sm mb-1.5 block">Опис *</Label>
            <Textarea id="description" {...register("description")} rows={5} placeholder="Опис товару…" />
            {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price" className="text-sm mb-1.5 block">Ціна (USD) *</Label>
              <Input id="price" type="number" step="0.01" {...register("price")} />
              {errors.price && <p className="text-xs text-destructive mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <Label htmlFor="stock" className="text-sm mb-1.5 block">Кількість *</Label>
              <Input id="stock" type="number" {...register("stock")} />
              {errors.stock && <p className="text-xs text-destructive mt-1">{errors.stock.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="imageUrl" className="text-sm mb-1.5 block">URL зображення</Label>
            <Input id="imageUrl" {...register("imageUrl")} placeholder="https://example.com/image.jpg" />
            {errors.imageUrl && <p className="text-xs text-destructive mt-1">{errors.imageUrl.message}</p>}
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
                  <Input {...register(`specs.${i}.key`)} placeholder="Ключ (напр. ОЗП)" />
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
              <Input id="brand" {...register("brand")} placeholder="напр. Apple" />
            </div>

            <div>
              <Label htmlFor="sku" className="text-sm mb-1.5 block">Артикул</Label>
              <Input id="sku" {...register("sku")} placeholder="напр. MBP-16-2024" />
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
