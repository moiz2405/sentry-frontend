import { auth } from "./auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Routes that are always public — no auth check needed
  const publicPrefixes = ["/", "/auth", "/api/auth"];
  const isPublic =
    pathname === "/" ||
    publicPrefixes.some((p) => p !== "/" && pathname.startsWith(p));

  if (!req.auth && !isPublic) {
    // Send unauthenticated visitors to the landing page.
    // The landing page shows the "Sign in with Google" CTA.
    return Response.redirect(new URL("/", req.nextUrl.origin));
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
