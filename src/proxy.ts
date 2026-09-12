import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// DIAGNOSTIC: Completely passive middleware - just passes all requests through.
// This isolates whether the 500 error is in the middleware or the page itself.
export function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
