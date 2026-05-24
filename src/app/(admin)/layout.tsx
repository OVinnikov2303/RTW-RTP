import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/sidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/")

  return (
    <div className="flex min-h-screen bg-secondary/30">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
