import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session?.user

  const isAdminRoute = nextUrl.pathname.startsWith("/admin")
  const isUserRoute =
    nextUrl.pathname.startsWith("/profile") ||
    nextUrl.pathname.startsWith("/orders")
  const isAuthRoute =
    nextUrl.pathname.startsWith("/sign-in") ||
    nextUrl.pathname.startsWith("/sign-up")

  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/sign-in", nextUrl))
    }
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl))
    }
  }

  if (isUserRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/sign-in", nextUrl))
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
