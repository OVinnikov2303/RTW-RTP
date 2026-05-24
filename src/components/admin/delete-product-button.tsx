"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { deleteProduct } from "@/actions/admin"

export function DeleteProductButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Ви впевнені, що хочете видалити цей товар?")) return
    setLoading(true)
    const result = await deleteProduct(productId)
    setLoading(false)
    if (result.success) toast.success("Товар видалено")
    else toast.error("Не вдалося видалити товар")
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={handleDelete}
      disabled={loading}
      className="text-muted-foreground hover:text-destructive"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  )
}
