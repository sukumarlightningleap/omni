import NextAuth from "next-auth"
import authConfig from "@/lib/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { nextUrl } = req
  const userRole = req.auth?.user?.role

  const isAdminPage = nextUrl.pathname.startsWith("/admin")
  const isAccountPage = nextUrl.pathname.startsWith("/account")
  const isVipPage = nextUrl.pathname.startsWith("/collections/vip-only")

  // Redirect if not logged in
  if ((isAdminPage || isAccountPage || isVipPage) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  // Redirect if not an admin trying to access /admin
  // Temporarily disabled for development preview
  // if (isAdminPage && userRole !== "ADMIN") {
  //   return NextResponse.redirect(new URL("/", nextUrl))
  // }

  // Secret VIP Drop Guard
  if (isVipPage && userRole !== "VIP" && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/request-invite", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/collections/vip-only"],
}
