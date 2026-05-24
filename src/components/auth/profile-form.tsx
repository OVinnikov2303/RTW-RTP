"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateProfile } from "@/actions/auth"

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
})

interface ProfileFormProps {
  user: {
    id: string
    name: string | null
    phone: string | null
    address: string | null
    city: string | null
    country: string | null
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name ?? "",
      phone: user.phone ?? "",
      address: user.address ?? "",
      city: user.city ?? "",
      country: user.country ?? "",
    },
  })

  const onSubmit = (data: z.infer<typeof schema>) => {
    startTransition(async () => {
      const result = await updateProfile(user.id, data)
      if (result.success) toast.success("Профіль оновлено!")
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="text-sm mb-1.5 block">Повне ім'я</Label>
          <Input id="name" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="phone" className="text-sm mb-1.5 block">Телефон</Label>
          <Input id="phone" {...register("phone")} placeholder="+380 (50) 000-0000" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="address" className="text-sm mb-1.5 block">Адреса</Label>
          <Input id="address" {...register("address")} placeholder="вул. Хрещатик, 1" />
        </div>
        <div>
          <Label htmlFor="city" className="text-sm mb-1.5 block">Місто</Label>
          <Input id="city" {...register("city")} placeholder="Київ" />
        </div>
        <div>
          <Label htmlFor="country" className="text-sm mb-1.5 block">Країна</Label>
          <Input id="country" {...register("country")} placeholder="Україна" />
        </div>
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Збереження…" : "Зберегти зміни"}
      </Button>
    </form>
  )
}
