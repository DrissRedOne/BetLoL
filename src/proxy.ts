import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

const PROTECTED_ROUTES = ["/mes-paris", "/portefeuille"];
const ADMIN_ROUTES = ["/admin"];
const AUTH_ROUTES = ["/auth/login", "/auth/register"];

export async function proxy(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    const { user, supabaseResponse, supabase } = await updateSession(request);

    // Already authenticated users trying to access auth pages → redirect home
    if (user && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    // Protected routes — require authentication
    const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
    if (isProtected && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // Admin routes — require admin role
    const isAdmin = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
    if (isAdmin) {
      if (!user) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/login";
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    }

    return supabaseResponse;
  } catch (error) {
    // If proxy fails, let the request through rather than blocking the whole site
    console.error("[proxy] Error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
