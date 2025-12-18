import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth(async (req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Admin routes protection
  if (pathname.startsWith("/admin")) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/admin-login", req.url))
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/welcome", req.url))
    }
  }

  // Tournament route protection (für normale User)
  if (pathname.startsWith("/tournament")) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
    // Admin wird zum Admin Dashboard redirected
    if (session.user.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*", "/tournament/:path*"],
}

