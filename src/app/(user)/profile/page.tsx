export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ProfileForm } from "@/components/auth/profile-form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = { title: "My Profile" }

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/sign-in")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true, role: true, phone: true, address: true, city: true, country: true, createdAt: true },
  })

  if (!user) redirect("/sign-in")

  const initials = user.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-semibold tracking-tight mb-8">Мій профіль</h1>

      <div className="flex items-center gap-5 p-6 rounded-2xl border border-border bg-card mb-8">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.image ?? ""} />
          <AvatarFallback className="text-lg">{initials ?? "U"}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-lg">{user.name ?? "User"}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <div className="mt-1.5 flex gap-2">
            <Badge variant={user.role === "ADMIN" ? "blue" : "secondary"} className="text-xs">
              {user.role}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Учасник з {new Date(user.createdAt).getFullYear()}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold mb-6">Особиста інформація</h2>
        <ProfileForm user={user} />
      </div>
    </div>
  )
}
