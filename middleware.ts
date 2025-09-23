import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // First ensure Supabase session cookies are in sync
  const supaResponse = await updateSession(request);
  // Then run i18n middleware to handle locale detection/routing
  const intlResponse = intlMiddleware(request);
  const response = intlResponse instanceof Promise ? await intlResponse : intlResponse;
  // Merge cookies from Supabase into the i18n response
  const supaCookies = supaResponse.cookies.getAll();

  for (const c of supaCookies) {
    // getAll() returns objects with name and value (options may not be included),
    // so we set them individually to the outgoing response.
    response.cookies.set(c.name, c.value);
  }
  // Ensure default locale is Spanish for first-time visitors
  if (!request.cookies.get('NEXT_LOCALE')) {
    response.cookies.set('NEXT_LOCALE', 'es', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365 // 1 year
    });
  }

  return response as NextResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/", // Ensure root path is matched
    "/((?!api|trpc|_next|_vercel|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
