import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "next-themes"
import { Providers } from "@/components/layout/providers"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: {
    default: "RTW-RTP | Ready to Work – Ready to Play",
    template: "%s | RTW-RTP",
  },
  description:
    "Premium computer hardware and gaming equipment. Laptops, Gaming PCs, Components, and Peripherals for professionals and enthusiasts.",
  keywords: ["computer hardware", "gaming equipment", "laptops", "gaming pc", "components", "peripherals"],
  openGraph: {
    title: "RTW-RTP | Ready to Work – Ready to Play",
    description: "Premium computer hardware and gaming equipment.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk" suppressHydrationWarning className={inter.variable}>
      <body suppressHydrationWarning className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
