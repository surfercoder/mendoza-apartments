import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // Run i18n middleware first to produce the base response
  const intlResult = intlMiddleware(request);
  const baseResponse = intlResult instanceof Promise ? await intlResult : intlResult;

  // Pass the existing response into Supabase session updater to avoid losing headers/cookies
  const responseWithSession = await updateSession(request, baseResponse as NextResponse);

  return responseWithSession as NextResponse;
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
