import { auth } from "@/auth"
import { NextResponse } from 'next/server'

export default async function middleware(req: any, ctx: any) {
  try {
    const authFn = auth((req) => {
      const isLoggedIn = !!req.auth
      const { pathname } = req.nextUrl

      // Redirect unauthenticated users away from dashboard
      if (pathname.startsWith('/dashboard') && !isLoggedIn) {
        const loginUrl = req.nextUrl.clone()
        loginUrl.pathname = '/login'
        return NextResponse.redirect(loginUrl)
      }

      // Redirect already-logged-in users away from login page
      if (pathname === '/login' && isLoggedIn) {
        const dashUrl = req.nextUrl.clone()
        dashUrl.pathname = '/dashboard'
        return NextResponse.redirect(dashUrl)
      }

      return NextResponse.next()
    });
    return await authFn(req, ctx);
  } catch (error: any) {
    console.error("MIDDLEWARE CRASH:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Middleware Crash", 
        message: error.message || String(error) 
      }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
