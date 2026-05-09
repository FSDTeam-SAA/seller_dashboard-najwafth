import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

const publicRoutes = ["/auth/signin"];

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  if (token && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const isProtectedRoute =
    pathname === "/" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/user-management") ||
    pathname.startsWith("/books") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/driver") ||
    pathname.startsWith("/review") ||
    pathname.startsWith("/sales-overview") ||
    pathname.startsWith("/store-profile") ||
    pathname.startsWith("/payment-option") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/logout");

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  if (token && token.role !== "seller" && isProtectedRoute) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/auth/signin",
    "/dashboard/:path*",
    "/user-management/:path*",
    "/books/:path*",
    "/orders/:path*",
    "/driver/:path*",
    "/review/:path*",
    "/sales-overview/:path*",
    "/store-profile/:path*",
    "/payment-option/:path*",
    "/settings/:path*",
    "/logout/:path*",
  ],
};
