import { NextResponse, type NextRequest } from "next/server";
import { newsProxy } from "@/lib/news/proxy";
import { studioProxy } from "@/lib/studio/proxy";

/* Status codes App Router pages can't send themselves: 301s to a story's
 * canonical URL and 410 for withdrawn stories. Each area owns its rules;
 * a handler returns undefined to let the page render. */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/news" || pathname.startsWith("/news/")) {
    return (await newsProxy(request)) ?? NextResponse.next();
  }
  if (pathname.startsWith("/news-studio/")) {
    return (await studioProxy(request)) ?? NextResponse.next();
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/news", "/news/:path*", "/news-studio/:path+"],
};
