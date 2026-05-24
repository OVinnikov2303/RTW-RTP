import Link from "next/link"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-xs font-bold text-primary-foreground">RTW</span>
          </div>
          <span className="font-semibold text-sm">RTW-RTP</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
    </div>
  )
}
