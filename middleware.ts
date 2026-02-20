import { auth } from "./auth";

export default auth((req) => {
  const publicRoutes = ["/", "/auth/sign-in"];
  if (
    !req.auth &&
    !publicRoutes.includes(req.nextUrl.pathname) &&
    !req.nextUrl.pathname.startsWith("/api/auth")
  ) {
    const newUrl = new URL("/auth/sign-in", req.nextUrl.origin);
    newUrl.searchParams.set("callbackUrl", req.nextUrl.href);
    return Response.redirect(newUrl);
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
