"use client"

import { SessionProvider } from "next-auth/react"
import { Toaster } from "sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          classNames: {
            toast: "bg-card border border-border text-foreground",
            title: "text-foreground",
            description: "text-muted-foreground",
          },
        }}
      />
    </SessionProvider>
  )
}
