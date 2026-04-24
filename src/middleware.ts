import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Global routing state machine.
//
// Three states, enforced here so individual pages don't need to duplicate
// the logic:
//   1. Unauthenticated — only the public marketing/auth paths are allowed.
//   2. Authenticated, no profile / onboarding not finished — only /welcome.
//   3. Authenticated, onboarding finished — / , /signin , /welcome all
//      redirect to /archive (the dashboard); everything else is allowed.
//
// /api and /auth routes bypass the redirect logic entirely (they do their
// own auth and need to return JSON / handle OAuth callbacks).

const PUBLIC_PATHS = new Set<string>([
  "/",
  "/about",
  "/how-it-works",
  "/early",
  "/terms",
  "/privacy",
  "/signin",
]);

const DASHBOARD_PATH = "/archive";

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.has(pathname);
}

function shouldBypass(pathname: string): boolean {
  return (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/_og") ||
    pathname.startsWith("/opengraph-image") ||
    pathname.startsWith("/twitter-image") ||
    pathname === "/favicon.ico" ||
    pathname === "/setup"
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        toSet: {
          name: string;
          value: string;
          options?: Record<string, unknown>;
        }[],
      ) {
        for (const { name, value } of toSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of toSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Touch the session so expired access tokens get refreshed here rather
  // than in downstream handlers.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (shouldBypass(pathname)) return response;

  // State 1 — unauthenticated.
  if (!user) {
    if (isPublicPath(pathname)) return response;
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // Authenticated — does the user have a completed profile?
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();
  const hasProfile = profile?.onboarding_completed === true;

  // State 2 — authenticated but onboarding not finished. Both /welcome
  // (the opening screen) and /onboarding (the multi-step flow that
  // /welcome pushes the user into) are allowed; everything else funnels
  // back to /welcome.
  if (!hasProfile) {
    if (pathname === "/welcome" || pathname === "/onboarding") {
      return response;
    }
    return NextResponse.redirect(new URL("/welcome", request.url));
  }

  // State 3 — fully onboarded. Block the three entry points that would
  // otherwise re-onboard or show the unauthenticated landing.
  if (
    pathname === "/" ||
    pathname === "/signin" ||
    pathname === "/welcome"
  ) {
    return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    // Match every request path EXCEPT:
    //   - Next.js static files (_next/static, _next/image)
    //   - Image/favicon assets
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
