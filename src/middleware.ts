import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/*
 * Kept as `middleware.ts` (edge runtime) rather than Next 16's `proxy.ts`:
 * Node.js proxy support on Cloudflare Workers is still experimental in
 * @opennextjs/cloudflare, while edge middleware is fully supported.
 */
export default createMiddleware(routing);

export const config = {
  // Everything except API routes, the back-office, Next internals and files.
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
