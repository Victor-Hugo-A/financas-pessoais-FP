import { NextRequest, NextResponse } from "next/server";
import { isDemoMode } from "@/lib/demo";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/jwt";

const privateRoutes = ["/dashboard", "/assinaturas", "/dividas", "/perfil"];
const authRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  const isPrivateRoute = privateRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isDemoMode() && isPrivateRoute) {
    return NextResponse.next();
  }

  if (isDemoMode() && isAuthRoute) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  if (isPrivateRoute && !session) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && session) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/assinaturas/:path*", "/dividas/:path*", "/perfil/:path*", "/login", "/register"]
};
