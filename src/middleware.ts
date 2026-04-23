import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Refreshes the Supabase auth cookies on every request so server
// components + route handlers see a current session. Do not add any other
// logic here — auth gating is enforced per-route (via the (app) layout,
// API handlers, and the /signin redirect).
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(toSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
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
  // than in downstream handlers. We ignore the result — any handler that
  // needs the user calls getUser() itself.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    // Match every request path EXCEPT:
    //   - Next.js static files (_next/static, _next/image)
    //   - Image/favicon assets
    //   - The auth callback (handles its own cookies)
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
